from flask import Blueprint, request, jsonify, current_app, send_from_directory, g
from werkzeug.utils import secure_filename
import os
import logging
from database import get_db
from models.receipt import Receipt, ReceiptChangeHistory
from services.ocr_service import OCRService, OCRServiceError
from services.categorization_service import CategorizationService, CategorizationError
import uuid
from PIL import Image
from datetime import datetime
from config import config
from functools import wraps
from http import HTTPStatus
from decimal import Decimal, InvalidOperation
import time
from .errors import APIError
from auth.decorators import require_auth
import json

# Configure logging
logger = logging.getLogger('api.routes')

# Initialize services
ocr_service = OCRService()
categorization_service = CategorizationService()

# Configure allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    
    # Validate category/expense type - case insensitive
    if 'category' in data:
        category = data['category']
        if category not in config.expense_categories:
            errors['category'] = f"Category must be one of: {', '.join(config.expense_categories)}"
    
    # Validate payment_method - case insensitive
    if 'payment_method' in data:
        payment_method = data['payment_method']
        if payment_method not in config.payment_methods:
            errors['payment_method'] = f"Payment method must be one of: {', '.join(config.payment_methods)}"
    
    # Validate status - case insensitive
    if 'status' in data:
        status = data['status']
        if status not in config.receipt_statuses:
            errors['status'] = f"Status must be one of: {', '.join(config.receipt_statuses)}"
    
    return errors

@api_bp.route('/upload', methods=['POST'])
@require_auth
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
            
            # Add validation for OCR failure
            if isinstance(receipt_data, str):  # It's an error message
                raise APIError("OCR processing failed", 
                              status_code=500, 
                              details={'error': receipt_data})
            
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
                    content=json.dumps(receipt_data),  # Serialize dict to JSON string
                    user_id=g.user.id,
                    category=category,
                    vendor=receipt_data.get('Vendor', ''),
                    amount=receipt_data.get('Amount', '0.00'),
                    date=receipt_data.get('Date', ''),
                    payment_method=receipt_data.get('Payment_Method', ''),
                    status='Pending'
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
@require_auth
def get_receipts():
    start_time = time.time()
    logger.info("API: Received GET /receipts request")
    try:
        with get_db() as db:
            # Log the query we're about to make
            logger.info(f"Database: Getting receipts for user_id: {g.user.id}")
            
            # Get all receipts and log their IDs
            receipts = db.query(Receipt).filter(Receipt.user_id == g.user.id).all()
            receipt_ids = [r.id for r in receipts]
            logger.info(f"Database: Found receipts with IDs: {receipt_ids}")
            
            response = [r.to_dict() for r in receipts]
            logger.info(f"API: Sending response with {len(response)} receipts")
            return jsonify(response)
    except Exception as e:
        logger.error(f"Failed to get receipts: {str(e)}")
        raise APIError("Failed to fetch receipts", status_code=500)
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
                    new_value = data[field]

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
            logger.info(f"Starting delete operation for receipt_id: {receipt_id}")
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                logger.warning(f"Attempted to delete non-existent receipt: {receipt_id}")
                raise APIError("Receipt not found", status_code=404)

            logger.info(f"Found receipt to delete: ID={receipt_id}, user_id={receipt.user_id}")

            # Delete image file
            try:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], receipt.image_path)
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logger.info(f"Successfully deleted image file: {image_path}")
            except Exception as e:
                logger.error(f"Failed to delete image for receipt {receipt_id}: {str(e)}")
                raise APIError("Failed to delete image file", status_code=500)

            # Delete database record
            db.delete(receipt)
            db.commit()
            logger.info(f"Successfully deleted receipt {receipt_id} from database")
            
            return jsonify({'message': 'Receipt deleted successfully'})
            
    except APIError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting receipt {receipt_id}: {str(e)}")
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

@api_bp.route('/options', methods=['GET'])
def get_options():
    """Get all available options for filters"""
    try:
        with get_db() as db:
            # Get unique vendors from database
            vendors = [r[0] for r in db.query(Receipt.vendor).distinct().all() if r[0] != 'Missing']
            
            return jsonify({
                'categories': config.expense_categories,
                'payment_methods': config.payment_methods,
                'statuses': config.receipt_statuses,
                'vendors': sorted(vendors)
            })
    except Exception as e:
        logger.error(f"Failed to get options: {str(e)}")
        raise APIError("Failed to fetch options", status_code=500, details={'error': str(e)})