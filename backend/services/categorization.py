import logging

logger = logging.getLogger(__name__)

def categorize_document(document):
    try:
        # ... existing logic ...
    except KeyError as e:
        logger.error(f"Missing key in document: {str(e)}", exc_info=True)
        return {"error": "Document is missing required fields"}, 400
    except Exception as e:
        logger.error(f"Unexpected error in document categorization: {str(e)}", exc_info=True)
        return {"error": "Document categorization failed"}, 500 