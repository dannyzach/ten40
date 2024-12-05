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
            try:
                with open(image_path, 'rb') as f:
                    image_bytes = f.read()
                logger.info(f"Successfully read image file: {len(image_bytes)} bytes")
            except Exception as e:
                logger.error(f"Failed to read image file: {str(e)}")
                raise
            
            logger.info("Calling Llama vision API...")
            try:
                # Call Vision API
                response = ollama.chat(
                    model='llama3.2-vision',
                    messages=[{
                        'role': 'user',
                        'content': """Return ONLY a JSON object representing this receipt. No markdown, no explanations.
                                     The response must start with '{' and end with '}'.
                                     IMPORTANT: Use plain numbers without currency symbols (e.g., 11.95 not $11.95).
                                     Example:
                                     {
                                         "order": {
                                             "store": "Store Name",
                                             "date": "Date",
                                             "buyer": {
                                                 "name": "Name",
                                                 "email": "Email"
                                             }
                                         },
                                         "items": [
                                             {
                                                 "type": "Item type",
                                                 "quantity": 1,
                                                 "price": 11.95
                                             }
                                         ],
                                         "payment": {
                                             "subtotal": 11.95,
                                             "tax": 0.00,
                                             "total": 11.95,
                                             "method": "Payment method"
                                         }
                                     }""",
                        'images': [image_bytes]
                    }],
                    stream=False
                )
                logger.info("Successfully received response from Llama")
                
                # Extract content from response
                content = response['message']['content']
                logger.info(f"Raw content: {content}")
                
                # Find and clean JSON
                try:
                    # Find JSON object
                    start = content.find('{')
                    end = content.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = content[start:end]
                        # Remove any non-JSON text
                        json_str = json_str.strip()
                        # Parse JSON
                        data = json.loads(json_str)
                        logger.info(f"Successfully parsed JSON: {data}")
                        return {'content': data}
                    else:
                        logger.error("No JSON object found in response")
                        return {'content': "Error: No JSON object found in response"}
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON: {str(e)}")
                    logger.error(f"Problematic JSON string: {json_str}")
                    return {'content': f"Error parsing JSON: {str(e)}"}
                    
            except Exception as e:
                logger.error(f"Failed to call Llama API: {str(e)}")
                raise
            
        except Exception as e:
            logger.error(f"OCR process failed: {str(e)}")
            return {'content': f"OCR Error: {str(e)}"}