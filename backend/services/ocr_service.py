import json
import logging
import ollama
from config import config

logger = logging.getLogger(__name__)

class OCRService:
    @staticmethod
    def extract_receipt_data(image_path):
        """Extract receipt data using Llama 3.2-vision"""
        try:
            logger.info(f"Starting OCR process for image: {image_path}")
            
            # Read image file
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            
            # Call Vision API with strict JSON prompt
            response = ollama.chat(
                model='llama3.2-vision',
                messages=[{
                    'role': 'user',
                    'content': """Extract the following information from this receipt image and return ONLY a valid JSON object:
                    {
                        "store_name": "store name at the top",
                        "date": "date in YYYY-MM-DD format",
                        "items": [
                            {"name": "item name", "quantity": number, "price": number}
                        ],
                        "subtotal": number,
                        "tax": number,
                        "total_amount": number
                    }
                    Do not include any additional text or explanation.""",
                    'images': [image_bytes]
                }],
                stream=False
            )
            
            # Parse response
            content = response['message']['content']
            logger.debug(f"Raw response: {content}")
            
            # Clean and parse JSON
            try:
                # Find JSON object
                start = content.find('{')
                end = content.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = content[start:end]
                    # Clean up any trailing commas and escaped characters
                    json_str = json_str.replace('\\"', '"').replace('\\', '')
                    json_str = json_str.replace(',}', '}').replace(',]', ']')
                    data = json.loads(json_str)
                    
                    # Validate required fields
                    required_fields = ['store_name', 'date', 'items', 'subtotal', 'tax', 'total_amount']
                    if all(field in data for field in required_fields):
                        return {'content': data}
                    else:
                        missing = [f for f in required_fields if f not in data]
                        logger.error(f"Missing required fields: {missing}")
                        return {'content': f"Error: Missing required fields: {missing}"}
                else:
                    logger.error("No JSON object found in response")
                    return {'content': "Error: No JSON object found in response"}
                    
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON: {str(e)}")
                logger.error(f"Problematic JSON: {json_str}")
                return {'content': f"Error parsing JSON: {str(e)}"}
                    
        except Exception as e:
            logger.error(f"OCR process failed: {str(e)}")
            return {'content': f"OCR Error: {str(e)}"}