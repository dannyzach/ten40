import json
import logging
import ollama
import pytesseract
from PIL import Image
import cv2
import numpy as np
from config import config

logger = logging.getLogger(__name__)

def preprocess_image(image_path):
    """Preprocess image for better OCR results"""
    try:
        # Read image using opencv
        image = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        gray = cv2.adaptiveThreshold(
            gray, 
            255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 
            11, 
            2
        )
        
        # Denoise the image
        gray = cv2.fastNlMeansDenoising(gray)
        
        # Scale the image (upsampling might help with text recognition)
        scale_factor = 2
        gray = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        
        return gray
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise

def extract_text_with_tesseract(image):
    """Extract text from image using Tesseract"""
    try:
        # Configure Tesseract parameters for better accuracy
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.,()-:/$% "'
        
        # Extract text
        text = pytesseract.image_to_string(
            image,
            config=custom_config,
            lang='eng'  # Explicitly specify English language
        )
        
        # Get detailed OCR data including positions
        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        
        return text, ocr_data
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {str(e)}")
        raise

def clean_json_text(json_text: str) -> str:
    """Clean and format JSON text for parsing"""
    import re
    
    # Find the first complete JSON object
    start = json_text.find('{')
    end = json_text.rfind('}') + 1
    if start >= 0 and end > start:
        json_text = json_text[start:end]
    
    # Clean up currency format - remove $ and ensure USD suffix
    json_text = re.sub(r'\$?(\d+\.\d{2})(?!\s*USD)', r'\1 USD', json_text)
    
    # Fix quoted null values
    json_text = re.sub(r'"null"', r'null', json_text)
    
    # Fix common JSON formatting issues
    json_text = re.sub(r'}\s*{', '},{', json_text)  # Add comma between objects
    json_text = re.sub(r'}\s*"', '},"', json_text)  # Add comma after closing brace
    json_text = re.sub(r']\s*"', '],"', json_text)  # Add comma after closing bracket
    json_text = re.sub(r'\s+', ' ', json_text)      # Normalize whitespace
    
    # Remove any control characters
    json_text = ''.join(char for char in json_text if ord(char) >= 32 or char in '\n\r\t')
    
    # Try to parse and re-serialize to ensure valid JSON
    try:
        parsed = json.loads(json_text)
        return json.dumps(parsed, indent=4)
    except json.JSONDecodeError:
        return json_text.strip()

class OCRService:
    @staticmethod
    def extract_receipt_data(image_path):
        """Extract receipt data using hybrid approach: Tesseract + Llama"""
        try:
            logger.info(f"Starting OCR process for image: {image_path}")
            
            # Step 1: Preprocess the image
            preprocessed_image = preprocess_image(image_path)
            
            # Step 2: Extract text using Tesseract
            raw_text, ocr_data = extract_text_with_tesseract(preprocessed_image)
            if not raw_text.strip():
                logger.error("No text extracted from the image. Check preprocessing or OCR steps.\n")
                # raise ValueError("OCR failed to extract text.")
            else:
                # Log the extracted text    
                logger.info("=" * 50)
                logger.info("TESSERACT OCR OUTPUT:")
                logger.info("=" * 50)
                logger.info(f"{raw_text}")
                logger.info("=" * 50)

            # Read original image for Llama
            with open(image_path, 'rb') as f:
                image_bytes = f.read()

            # Step 3: Use Llama to interpret the extracted text and image
            logger.info("Calling Llama for contextual understanding...")
            try:
                # Prepare the prompt template
                prompt_template = """IMPORTANT: Return ONLY a JSON object with EXACTLY these field names and structure. No explanations, no markdown, no analysis - just the JSON.

You are an advanced AI tasked with interpreting raw text extracted from a receipt or invoice, along with their image, and organizing it into a clean JSON format. Follow the instructions carefully to ensure accurate and structured data extraction based solely on the image and the raw text.

### Input ###
You will receive raw text extracted from a receipt or invoice using Tesseract. The text may include details about the buyer, vendor, items purchased, and totals. You will also receive the image of the receipt or invoice.

### Instructions ###
1. **Extract Only Visible Information:**
   - Do not make assumptions or add information not explicitly provided in the text.
   - Ignore fields that are missing or unclear. Use `null` for such fields in the JSON.

2. **Organize Data into a JSON Structure: as a minimum include the following fields, but if there are other fields that are present in the text/image, include them as well:**
    - `"purchased_by"`: Information about the buyer or customer.
    - `"vendor"`: Information about the vendor, store, or service provider.
    - `"order_summary"`: An array of items or services purchased, each including:
        - `"description"`: Description of the item or service.
        - `"price"`: The price per unit (formatted as a plain number with "USD").
        - `"quantity"`: The quantity of the item purchased.
        - `"subtotal"`: The calculated subtotal for the item (price × quantity).
        - `"tax"`: The tax rate applied to the item (if available).
    - `"totals"`: Information about the total cost of the transaction, including:
        - `"subtotal"`: The sum of all item subtotals (before taxes and discounts).
        - `"tax"`: The total tax applied to the purchase.
        - `"total"`: The total amount due, including taxes and discounts.
        - `"amount_paid"`: The amount paid by the customer.
        - `"balance_due"`: Any remaining balance due after payment.
    - `"comments"`: Any additional terms, policies, or notes provided in the receipt.

3. **Use Standardized Formatting:**
   - Use "USD" for currency values and "%" for percentages in tax rates.
   - Ensure the JSON is clean and free of special characters, non-standard formatting, or unnecessary explanations.

4. **DO NOT INVENT OR ASSUME:**
   - Avoid adding text, policies, or terms unless explicitly stated.
   - If subtotal, tax, or total fields are unclear or inconsistent, report them as `null`.

### Example Output. ONLY use it as an example to structure your response. ###
{
    "purchased_by": {
        "name": null,
        "email": null,
        "order_id": "US-001",
        "order_time": "11/02/2019",
        "order_type": "In-Person"
    },
    "vendor": {
        "name": "East Repair Inc.",
        "address": {
            "street": "1912 Harvest Lane",
            "city_state_zip": "New York, NY 12210"
        },
        "contact": {
            "phone": null,
            "fax": null,
            "email": null,
            "website": null
        }
    },
    "order_summary": [
        {
            "description": "Front and rear brake cables",
            "price": "100.00 USD",
            "quantity": 1,
            "subtotal": "100.00 USD",
            "tax": null
        },
        {
            "description": "New set of pedal arms",
            "price": "15.00 USD",
            "quantity": 2,
            "subtotal": "30.00 USD",
            "tax": null
        },
        {
            "description": "Labor 3hrs",
            "price": "5.00 USD",
            "quantity": 3,
            "subtotal": "15.00 USD",
            "tax": null
        }
    ],
    "totals": {
        "subtotal": "145.00 USD",
        "tax": "9.06 USD",
        "total": "154.06 USD",
        "amount_paid": null,
        "balance_due": "0.00 USD"
    },
    "comments": "string or null"
}

### Task ###
Analyze the raw text and the image below to extract the data, and return the structured JSON in the format described above. Ensure accuracy by only using the visible text from the input. IMPORTANT: Your response must be a single, valid JSON object only. No markdown, no explanations, no code blocks - just the JSON starting with { and ending with }. 

Raw OCR Text:
"""
                # Combine the prompt template with the raw text
                full_prompt = prompt_template + raw_text

                response = ollama.chat(
                    model='llama3.2-vision',
                    messages=[{
                        'role': 'user',
                        'content': full_prompt,
                        'images': [image_bytes]
                    }],
                    stream=False
                )
                logger.info("Successfully received response from Llama")

                content = response['message']['content']
                logger.info(f"Raw content from Llama: {content}")

                # Clean and parse the JSON
                try:
                    cleaned_json = clean_json_text(content)
                    data = json.loads(cleaned_json)
                    
                    # Post-process the data
                    if isinstance(data, dict):
                        # Ensure all currency values have USD
                        for key in data.get('totals', {}):
                            if data['totals'][key] and isinstance(data['totals'][key], str):
                                if data['totals'][key].replace('.', '').isdigit():
                                    data['totals'][key] = f"{float(data['totals'][key]):.2f} USD"
                        
                        # Ensure all items in order_summary have proper currency format
                        for item in data.get('order_summary', []):
                            for key in ['price', 'discount_amount', 'service_charge', 'subtotal']:
                                if item.get(key) and isinstance(item[key], str):
                                    if item[key].replace('.', '').isdigit():
                                        item[key] = f"{float(item[key]):.2f} USD"
                    
                    logger.info(f"Successfully parsed and processed JSON: {data}")
                    return {'content': data}
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON: {str(e)}")
                    logger.error(f"Raw content: {content}")
                    logger.error(f"Cleaned content: {cleaned_json}")
                    return {'content': f"Error parsing JSON: {str(e)}", 'raw_content': content, 'cleaned_content': cleaned_json}

            except Exception as e:
                logger.error(f"Failed to process with Llama: {str(e)}")
                return {'content': f"Processing Error: {str(e)}"}
            
        except Exception as e:
            logger.error(f"OCR process failed: {str(e)}")
            return {'content': f"OCR Error: {str(e)}"}