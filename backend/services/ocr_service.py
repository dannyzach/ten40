import os
import json
import base64
import logging
from openai import OpenAI
from dotenv import load_dotenv
 
# Load environment variables
load_dotenv()

# Initialize the OpenAI client with error handling
try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    if not os.getenv('OPENAI_API_KEY'):
        logger.error("OPENAI_API_KEY not found in environment variables")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    raise

logger = logging.getLogger(__name__)

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
            logger.info(f"Starting OCR process for image: {image_path}")
            
            # Read image file and convert to base64
            try:
                with open(image_path, 'rb') as f:
                    image_bytes = f.read()
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                logger.info(f"Successfully read image file: {len(image_bytes)} bytes")
            except Exception as e:
                logger.error(f"Failed to read image file: {str(e)}")
                raise

            logger.info("Calling gpt-4o-mini API...")
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Extract the text from this image, ensuring all text is captured accurately. Do not include any markdown or code formatting. make sure to format the output as a clean JSON object. Extract and append the following fields at the end of the JSON object: Vendor, Amount, Date, Payment Method. If you cannot find any of the data points, leave it blank."
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
                
                logger.info("Successfully received response from gpt-4o-mini")
                
                content = response.choices[0].message.content
                logger.info(f"Raw content from OCR: {content}\n")

                try:
                    # Clean and format the entire response
                    cleaned_json = clean_json_text(content)
                    logger.debug(f"Attempting to parse JSON: {cleaned_json}\n")
                    
                    data = json.loads(cleaned_json)
                    logger.info(f"Successfully parsed JSON: {data}\n")
                    return {'content': data}
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON: {str(e)}")
                    logger.error(f"Raw content: {content}")
                    logger.error(f"Cleaned content: {cleaned_json}")
                    return {'content': f"Error parsing JSON: {str(e)}", 'raw_content': content, 'cleaned_content': cleaned_json}

            except Exception as e:
                logger.error(f"Failed to call Vision API: {str(e)}")
                return {'content': f"Vision API Error: {str(e)}"}
            
        except Exception as e:
            logger.error(f"OCR process failed: {str(e)}")
            return {'content': f"OCR Error: {str(e)}"} 