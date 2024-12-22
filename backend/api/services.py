class OCRServiceError(Exception):
    """Custom exception for OCR service errors"""
    pass

class CategorizationError(Exception):
    """Custom exception for categorization service errors"""
    pass

class OCRService:
    def process(self, file):
        try:
            # OCR processing logic
            pass
        except Exception as e:
            raise OCRServiceError(f"OCR processing failed: {str(e)}")

class CategorizationService:
    def categorize(self, text):
        try:
            # Categorization logic
            pass
        except Exception as e:
            raise CategorizationError(f"Categorization failed: {str(e)}") 