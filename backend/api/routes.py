from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os
import logging
from models.database import get_db, Receipt
from services.ocr_service import OCRService
import uuid
from PIL import Image

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
def upload_receipt():
    """Handle receipt upload and OCR processing"""
    try:
        logger.info("Processing receipt upload")
        
        # Validate request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400

        # Save file
        filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        if not verify_image(filepath):
            return jsonify({'error': 'Failed to save image'}), 500

        # Process OCR
        ocr_result = OCRService.extract_receipt_data(filepath)
        if not ocr_result or not isinstance(ocr_result, dict):
            return jsonify({'error': 'Invalid OCR result'}), 500

        # Save to database
        db = None
        try:
            with get_db() as db:
                receipt = Receipt(image_path=filename, content=ocr_result.get('content'))
                db.add(receipt)
                db.flush()  # Get the ID without committing
                receipt_dict = receipt.to_dict()
                return jsonify(receipt_dict)
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            return jsonify({'error': 'Database error'}), 500

    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
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
        return jsonify({'error': 'Database error'}), 500

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
                return jsonify({'error': 'Receipt not found'}), 404

            # Delete image file
            try:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], receipt.image_path)
                if os.path.exists(image_path):
                    os.remove(image_path)
            except Exception as e:
                logger.error(f"Failed to delete image: {str(e)}")

            # Delete database record
            db.delete(receipt)
            
            return jsonify({'message': 'Receipt deleted successfully'})
    except Exception as e:
        logger.error(f"Failed to delete receipt {receipt_id}: {str(e)}")
        return jsonify({'error': 'Database error'}), 500

@api_bp.route('/images/<path:filename>')
def get_image(filename):
    """Serve receipt images"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)