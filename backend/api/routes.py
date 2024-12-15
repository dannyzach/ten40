from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
import logging
from models.database import get_db, Receipt
from services.ocr_service import OCRService
from services.categorization_service import CategorizationService
import uuid
from PIL import Image
from datetime import datetime

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

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    logger.info("Received upload request")
    try:
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
        
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
            logger.error("Failed to verify saved image")
            return jsonify({'error': 'Failed to save image'}), 500
        
        # Process with OCR
        ocr_result = OCRService.extract_receipt_data(filepath)
        logger.info(f"OCR result: {ocr_result}")
        
        # Add categorization step
        try:
            category = CategorizationService.categorize_receipt(ocr_result['content'])
            logger.info(f"Categorized as: {category}")
        except Exception as e:
            logger.error(f"Categorization error: {str(e)}")
            category = "Other expenses"
        
        # Save to database
        try:
            with get_db() as db:
                receipt = Receipt(
                    image_path=saved_filename,
                    content=ocr_result['content'],
                    category=category
                )
                db.add(receipt)
                db.commit()
                
                # Return the created receipt
                return jsonify(receipt.to_dict())
                
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            return jsonify({'error': 'Failed to save receipt to database'}), 500
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api_bp.route('/receipts', methods=['GET'])
def get_receipts():
    """Get all receipts"""
    try:
        with get_db() as db:
            receipts = db.query(Receipt).all()
            return jsonify([r.to_dict() for r in receipts])
    except Exception as e:
        logger.error(f"Failed to get receipts: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch receipts',
            'details': str(e)
        }), 500

@api_bp.route('/receipts/<int:receipt_id>', methods=['GET'])
def get_receipt(receipt_id):
    """Get single receipt"""
    try:
        with get_db() as db:
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                return jsonify({'error': 'Receipt not found'}), 404
            return jsonify(receipt.to_dict())
    except Exception as e:
        logger.error(f"Failed to get receipt {receipt_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@api_bp.route('/receipts/<int:receipt_id>', methods=['PUT'])
def update_receipt(receipt_id):
    """Update receipt content"""
    try:
        with get_db() as db:
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                return jsonify({'error': 'Receipt not found'}), 404
                
            data = request.json
            if 'content' in data:
                receipt.content = data['content']
                
            return jsonify(receipt.to_dict())
    except Exception as e:
        logger.error(f"Failed to update receipt {receipt_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@api_bp.route('/receipts/<int:receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    """Delete receipt and associated image"""
    try:
        with get_db() as db:
            receipt = db.query(Receipt).get(receipt_id)
            if not receipt:
                logger.warning(f"Receipt not found: {receipt_id}")
                return jsonify({'error': 'Receipt not found'}), 404

            # Delete image file
            try:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], receipt.image_path)
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logger.info(f"Deleted image file: {image_path}")
            except Exception as e:
                logger.error(f"Failed to delete image: {str(e)}")

            # Delete database record
            db.delete(receipt)
            logger.info(f"Deleted receipt: {receipt_id}")
            
            return jsonify({'message': 'Receipt deleted successfully'})
    except Exception as e:
        logger.error(f"Failed to delete receipt {receipt_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@api_bp.route('/images/<path:filename>')
def get_image(filename):
    """Serve receipt images"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@api_bp.route('/debug/receipts', methods=['GET'])
def debug_receipts():
    """Debug endpoint to check database content"""
    try:
        with get_db() as db:
            receipts = db.query(Receipt).all()
            return jsonify({
                'count': len(receipts),
                'receipts': [
                    {
                        'id': r.id,
                        'image_path': r.image_path,
                        'original_filename': r.original_filename,
                        'uploaded_at': r.uploaded_at.isoformat() if r.uploaded_at else None,
                        'content_keys': list(r.content.keys()) if r.content else None
                    } 
                    for r in receipts
                ]
            })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'db_path': config.db_path
        }), 500