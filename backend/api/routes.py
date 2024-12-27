from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
import logging
from models.database import get_db, Receipt, ReceiptChangeHistory
from services.ocr_service import OCRService
from services.categorization_service import CategorizationService
import uuid
from PIL import Image
from datetime import datetime
from config import config
from functools import wraps
from http import HTTPStatus
from decimal import Decimal, InvalidOperation
import time
from .errors import APIError

# Configure logging
logger = logging.getLogger('api.routes')

api_bp = Blueprint('api', __name__)

def verify_image(filepath):
    """Verify image was saved correctly"""
    try:
        with Image.open(filepath) as img:
            logger.info(f"Image verified: {filepath} ({img.size}, {img.mode})")
            return True
    except Exception as e:
        logger.error(f"Image verification failed: {str(e)}")
        return False

def validate_request(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            raise APIError(
                "Request must be JSON",
                status_code=400,
                details={'content_type': request.content_type}
            )
        return f(*args, **kwargs)
    return decorated_function

def validate_field_values(data, receipt_id):
    errors = {}
    
    # Validate vendor
    if 'vendor' in data:
        if not isinstance(data['vendor'], str) or len(data['vendor']) > 100:
            errors['vendor'] = "Vendor must be a string of max 100 characters"
    
    # Validate amount
    if 'amount' in data:
        try:
            amount = Decimal(data['amount'])
            if amount <= 0 or amount > Decimal('999999.99'):
                errors['amount'] = "Amount must be between 0.01 and 999999.99"
        except InvalidOperation:
            errors['amount'] = "Amount must be a valid decimal number"
    
    # Validate date
    if 'date' in data:
        try:
            logger.info(f"Validating date field. Raw value: {data['date']!r}, Type: {type(data['date'])}")
            
            if not data['date']:
                logger.info("Empty date value received")
                return {'date': "Date cannot be empty"}
                
            date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            logger.info(f"Successfully parsed date: {date}")
            
            if date > datetime.now().date():
                logger.error(f"Future date not allowed: {date}")
                return {'date': "Date cannot be in the future"}
                
            logger.info(f"Date validation successful: {date}")
            
        except ValueError as e:
            logger.error(f"Date validation error: {str(e)}, received value: {data['date']!r}, type: {type(data['date'])}")
            return {'date': "Date must be in YYYY-MM-DD format"}
        except Exception as e:
            logger.error(f"Unexpected error validating date: {str(e)}, received value: {data['date']!r}, type: {type(data['date'])}")
            return {'date': "Invalid date format"}
    
    # Validate payment_method - case insensitive
    valid_payment_methods = ["credit_card", "debit_card", "cash", "check", "wire_transfer", "other"]
    if 'payment_method' in data:
        payment_method = data['payment_method'].lower()
        if payment_method not in valid_payment_methods:
            errors['payment_method'] = f"Payment method must be one of: {', '.join(valid_payment_methods)}"
    
    # Validate category - case insensitive
    valid_categories = ["office_supplies", "travel", "meals", "utilities", "software", "hardware", "other"]
    if 'category' in data:
        category = data['category'].lower()
        if category not in valid_categories:
            errors['category'] = f"Category must be one of: {', '.join(valid_categories)}"
    
    # Validate status - case insensitive and transitions
    valid_statuses = ["pending", "approved", "rejected"]
    if 'status' in data:
        new_status = data['status'].lower()
        if new_status not in valid_statuses:
            errors['status'] = f"Status must be one of: {', '.join(valid_statuses)}"
        else:
            # Get current status if updating an existing receipt
            try:
                with get_db() as db:
                    receipt = db.query(Receipt).get(receipt_id)
                    if receipt:
                        current_status = receipt.status.lower()
                        valid_transition = False
                        
                        if current_status == 'pending':
                            valid_transition = new_status in ['approved', 'rejected']
                        elif current_status == 'approved':
                            valid_transition = new_status in ['pending', 'rejected']
                        elif current_status == 'rejected':
                            valid_transition = new_status in ['approved', 'pending']
                            
                        if not valid_transition:
                            errors['status'] = f"Invalid status transition from {current_status} to {new_status}"
            except Exception as e:
                logger.error(f"Error checking status transition: {str(e)}")
    
    return errors

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    logger.info("Received upload request")
    try:
        if 'file' not in request.files:
            raise APIError("No file part in request", status_code=400)
        
        file = request.files['file']
        if file.filename == '':
            raise APIError("No selected file", status_code=400)
        
        logger.info(f"Processing file: {file.filename}")
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        saved_filename = f"{uuid.uuid4()}_{original_filename}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], saved_filename)
        
        # Save file
        file.save(filepath)
        logger.info(f"File saved to: {filepath}")
        
        # Verify image
        if not verify_image(filepath):
            raise APIError("Failed to verify saved image", status_code=400)
        
        try:
            # Process with OCR
            ocr_result = OCRService.extract_receipt_data(filepath)
            receipt_data = ocr_result['content']
            logger.info(f"Receipt data: {receipt_data}")
            
            # Add categorization step
            try:
                category = CategorizationService.categorize_receipt(receipt_data)
                logger.info(f"Categorized as: {category}")
            except Exception as e:
                logger.error(f"Categorization error: {str(e)}")
                category = "Other expenses"
            
            # Save to database
            with get_db() as db:
                receipt = Receipt(
                    image_path=saved_filename,
                    content=receipt_data,
                    category=category,
                    vendor=receipt_data.get('Vendor', ''),
                    amount=receipt_data.get('Amount', '0.00'),
                    date=receipt_data.get('Date', ''),
                    payment_method=receipt_data.get('Payment_Method', ''),
                    status='pending'
                )
                db.add(receipt)
                db.commit()
                
                return jsonify(receipt.to_dict())
                
        except Exception as e:
            # Clean up file if processing failed
            try:
                os.remove(filepath)
            except:
                pass
            logger.error(f"Processing error: {str(e)}")
            raise APIError("Failed to process receipt", status_code=500, details={'error': str(e)})
        
    except APIError:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise APIError("Failed to upload receipt", status_code=500, details={'error': str(e)})

@api_bp.route('/receipts', methods=['GET'])
def get_receipts():
    start_time = time.time()
    try:
        with get_db() as db:
            receipts = db.query(Receipt).all()
            return jsonify([r.to_dict() for r in receipts])
    except Exception as e:
        logger.error(f"Failed to get receipts: {str(e)}")
        raise APIError("Failed to fetch receipts", status_code=500, details={'error': str(e)})
    finally:
        execution_time = time.time() - start_time
        logger.info(f"Execution time for get_receipts: {execution_time:.2f} seconds")

@api_bp.route('/receipts/<int:receipt_id>', methods=['GET'])
def get_receipt(receipt_id):
    """Get a single receipt by ID"""
    try:
        with get_db() as db:
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                raise APIError("Receipt not found", status_code=404)
            return jsonify(receipt.to_dict())
    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to get receipt {receipt_id}: {str(e)}")
        raise APIError("Failed to fetch receipt", status_code=500)

@api_bp.route('/receipts/<int:receipt_id>/update', methods=['PATCH'])
@validate_request
def update_receipt_fields(receipt_id):
    data = request.get_json()

    # Validate input data
    validation_errors = validate_field_values(data, receipt_id)
    if validation_errors:
        raise APIError(
            "Invalid field values",
            status_code=400,
            details=validation_errors
        )

    try:
        with get_db() as db:
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                raise APIError("Receipt not found", status_code=404)

            # Track changes and update fields
            updated_fields = {}
            for field in ['vendor', 'amount', 'date', 'payment_method', 'category', 'status']:
                # Only update fields present in the request data
                if field in data:
                    old_value = getattr(receipt, field)
                    new_value = data[field].lower() if field == 'status' else data[field]

                    if old_value != new_value:
                        # Create change history record
                        change = ReceiptChangeHistory(
                            receipt_id=receipt_id,
                            field_name=field,
                            new_value=new_value,
                            changed_at=datetime.utcnow(),
                            changed_by="system"  # Replace with actual user ID when auth is implemented
                        )
                        db.add(change)

                        # Update receipt field
                        setattr(receipt, field, new_value)
                        updated_fields[field] = new_value

            # Commit the changes
            db.commit()

            # Return the full receipt data, preserving all fields
            receipt_data = {
                "id": receipt.id,
                "image_path": receipt.image_path,
                "vendor": receipt.vendor,
                "amount": receipt.amount,
                "date": receipt.date,
                "payment_method": receipt.payment_method,
                "category": receipt.category,
                "status": receipt.status,
                "content": receipt.content,
            }

            return jsonify({
                "success": True,
                "receipt_id": receipt_id,
                "updated_fields": updated_fields,
                "updated_at": datetime.utcnow().isoformat(),
                "receipt": receipt_data,
            }), HTTPStatus.OK

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to update receipt {receipt_id}: {str(e)}")
        raise APIError(
            "Failed to update receipt",
            status_code=500,
            details={'error': str(e)}
        )

@api_bp.route('/receipts/<int:receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    """Delete a receipt"""
    try:
        with get_db() as db:
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                raise APIError("Receipt not found", status_code=404)

            # Delete image file
            try:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], receipt.image_path)
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logger.info(f"Deleted image file: {image_path}")
            except Exception as e:
                logger.error(f"Failed to delete image: {str(e)}")
                raise APIError("Failed to delete image file", status_code=500)

            # Delete database record
            db.delete(receipt)
            logger.info(f"Deleted receipt: {receipt_id}")
            
            return jsonify({'message': 'Receipt deleted successfully'})
            
    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to delete receipt {receipt_id}: {str(e)}")
        raise APIError("Failed to delete receipt", status_code=500)

@api_bp.route('/images/<path:filename>')
def get_image(filename):
    """Serve receipt images"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@api_bp.route('/receipts/<int:receipt_id>/history', methods=['GET'])
def get_receipt_history(receipt_id):
    try:
        with get_db() as db:
            # Verify receipt exists
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                raise APIError("Receipt not found", status_code=404)

            # Get changes ordered by timestamp
            changes = db.query(ReceiptChangeHistory)\
                       .filter(ReceiptChangeHistory.receipt_id == receipt_id)\
                       .order_by(ReceiptChangeHistory.changed_at.desc())\
                       .all()

            return jsonify([{
                'field': change.field_name,
                'new_value': change.new_value,
                'changed_at': change.changed_at.isoformat(),
                'changed_by': change.changed_by
            } for change in changes])

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to get history for receipt {receipt_id}: {str(e)}")
        raise APIError("Failed to fetch receipt history", status_code=500, details={'error': str(e)})

@api_bp.route('/process', methods=['POST'])
def process_document():
    try:
        if not request.files:
            raise APIError("No file provided", status_code=400)

        file = request.files.get('file')
        if not file:
            raise APIError("File field is required", status_code=400)

        # Validate file type
        if not allowed_file(file.filename):
            raise APIError(
                "Invalid file type", 
                status_code=400, 
                details={'allowed_types': ALLOWED_EXTENSIONS}
            )

        # Process the document
        result = ocr_service.process(file)
        
        logger.info("Document processed successfully", extra={
            'filename': file.filename,
            'result_length': len(result)
        })
        
        return jsonify({
            'success': True,
            'data': result
        })

    except OCRServiceError as e:
        raise APIError(
            "OCR processing failed",
            status_code=422,
            details={'ocr_error': str(e)}
        )

@api_bp.route('/categorize', methods=['POST'])
def categorize_text():
    try:
        data = request.get_json()
        if not data:
            raise APIError("No JSON data provided", status_code=400)

        text = data.get('text')
        if not text:
            raise APIError("Text field is required", status_code=400)

        # Categorize the text
        categories = categorization_service.categorize(text)
        
        logger.info("Text categorized successfully", extra={
            'text_length': len(text),
            'categories_count': len(categories)
        })
        
        return jsonify({
            'success': True,
            'categories': categories
        })

    except CategorizationError as e:
        raise APIError(
            "Categorization failed",
            status_code=422,
            details={'categorization_error': str(e)}
        )