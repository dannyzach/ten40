import os
import json
import base64
import logging
from openai import OpenAI
from dotenv import load_dotenv
 
# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize the OpenAI client with error handling
try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("OPENAI_API_KEY not found in environment variables")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    raise

def clean_json_text(json_text: str) -> str:
    """Clean and format JSON text for parsing"""
    import re
    
    # Remove markdown code block syntax and headers
    json_text = re.sub(r'\*\*.*?\*\*', '', json_text)
    json_text = re.sub(r'Here is the extracted data.*?structure:', '', json_text)
    json_text = re.sub(r'```json\s*', '', json_text)
    json_text = re.sub(r'```\s*', '', json_text)
    json_text = re.sub(r'Note:.*', '', json_text)
    
    # Find the JSON object
    start = json_text.find('{')
    end = json_text.rfind('}') + 1
    if start >= 0 and end > start:
        json_text = json_text[start:end]
    
    # Only clean up currency format if needed
    json_text = re.sub(r'\$(\d+\.\d{2})(?!\s*USD)', r'\1 USD', json_text)
    
    # Remove any control characters
    json_text = ''.join(char for char in json_text if ord(char) >= 32 or char in '\n\r\t')
    
    return json_text.strip()

class OCRService:
    @staticmethod
    def extract_receipt_data(image_path):
        """Extract receipt data using gpt-4o-mini"""
        try:
            logger.info(f"Processing receipt image: {image_path}")
            
            # Read image file and convert to base64
            try:
                with open(image_path, 'rb') as f:
                    image_bytes = f.read()
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
            except Exception as e:
                logger.error(f"Failed to read image file: {str(e)}")
                raise

            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": """Extract the text from this image and format the output as a JSON object with two parts:
1. The main fields at the root level (use exactly these field names):
   - Vendor
   - Amount
   - Date
   - Payment_Method

2. A 'text' array containing all lines of text from the receipt in order, preserving the original formatting and content.

Example format:
{
    "Vendor": "store name",
    "Amount": "total amount",
    "Date": "receipt date",
    "Payment_Method": "payment type",
    "text": [
        "line 1 of receipt",
        "line 2 of receipt",
        ...
    ]
}

Capture every line of text, including store details, items, prices, subtotals, taxes, and any additional information."""
                                },  
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=1000
                )
                
                content = response.choices[0].message.content

                try:
                    # Clean and format the entire response
                    cleaned_json = clean_json_text(content)
                    data = json.loads(cleaned_json)
                    return {'content': data}
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse OCR response: {str(e)}")
                    return {'content': f"Error parsing JSON: {str(e)}"}

            except Exception as e:
                logger.error(f"Failed to process image with Vision API: {str(e)}")
                return {'content': f"Vision API Error: {str(e)}"}
            
        except Exception as e:
            logger.error(f"OCR process failed: {str(e)}")
            return {'content': f"OCR Error: {str(e)}"}