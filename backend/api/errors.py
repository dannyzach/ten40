import logging
from typing import Dict, Any, Optional
from flask import jsonify
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base exception class for API errors"""
    def __init__(self, message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        response = {
            'error': True,
            'message': self.message,
            'status_code': self.status_code
        }
        if self.details:
            response['details'] = self.details
        return response

def handle_api_error(error: APIError):
    """Handler for our custom APIError exceptions"""
    logger.error(f"API Error: {error.message}", extra={
        'status_code': error.status_code,
        'details': error.details
    })
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

def handle_http_error(error: HTTPException):
    """Handler for Werkzeug HTTP exceptions"""
    logger.error(f"HTTP Error: {error.description}", extra={
        'status_code': error.code
    })
    response = jsonify({
        'error': True,
        'message': error.description,
        'status_code': error.code
    })
    response.status_code = error.code
    return response

def handle_generic_error(error: Exception):
    """Handler for unexpected exceptions"""
    logger.exception("Unexpected error occurred")
    response = jsonify({
        'error': True,
        'message': 'An unexpected error occurred',
        'status_code': 500
    })
    response.status_code = 500
    return response 