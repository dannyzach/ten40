import json
import logging
import ollama
from config import config

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
                # Call Vision API with structured prompt
                response = ollama.chat(
                    model='llama3.2-vision',
                    messages=[{
                        'role': 'user',
                        'content': """Return ONLY a valid JSON object without any markdown formatting or additional text. Do not include ```json or ``` markers or any control characters. The response should start with { and end with }. Use "XX.XX USD" format for currency values (not $XX.XX).

You are an advanced AI model tasked with extracting structured data from a receipt, invoice, or order confirmation image. Please follow these instructions:

1. Extract all readable information from the image.
2. Format the extracted data into a JSON object with the following structure:
    - "purchased_by": Information about the buyer or customer:
        - "name": The name of the buyer or customer.
        - "email": The buyer's or customer's email address.
        - "order_id": The unique order or receipt ID.
        - "order_time": The order date and time (e.g., "MM/DD/YYYY HH:MM AM/PM").
        - "order_type": The type of order (e.g., "Web-Online", "In-Person").
    - "vendor": Information about the vendor, store, organization, or service provider:
        - "name": The name of the vendor or organization.
        - "address": The address of the vendor, including:
            - "street": The street address.
            - "city_state_zip": The city, state, and ZIP code.
        - "contact": 
            - "phone": The vendor's phone number.
            - "fax": The vendor's fax number, if available.
            - "email": The vendor's email address, if available.
            - "website": The vendor's website, if available.
    - "order_summary": An array of items, tickets, or services purchased, where each entry includes:
        - "description": A description of the item, ticket, or service.
        - "date_time": The date and time associated with the item.
        - "price": The original price of the item in plain numbers with currency unit.
        - "discount_amount": Any discount applied to the item.
        - "service_charge": Any additional service charge for the item.
        - "tax": The tax applied to the specific item.
        - "quantity": The quantity of the item purchased.
        - "subtotal": The subtotal price for the item.
    - "billed_to": Information about the billing or payment:
        - "name": The name of the person billed.
        - "payment_method": The payment method used.
        - "last_digits": The last 4 digits of the payment card, if applicable.
    - "totals": Information about the total cost of the transaction:
        - "subtotal": The sum of all item prices before discounts and taxes.
        - "tax": The total tax applied to the purchase.
        - "service_fees": Any additional service fees applied.
        - "discounts": Total discounts applied.
        - "total": The total amount due, including taxes and fees.
        - "amount_paid": The total amount paid by the customer.
        - "balance_due": Any remaining balance due after payment.
    - "comments": Any additional comments or policies provided in the receipt.

3. Exclude any unnecessary text or formatting. Ensure the JSON object starts with "{" and ends with "}".
4. Numbers must include their respective units:
    - Use "USD" for currency-related fields.
    - Use "%" for tax rates.
5. If information is missing or unavailable, use null or an empty string ("") in the corresponding field.
6. Make a best effort to extract as much data as possible while maintaining the specified structure.

Example JSON:
{
    "purchased_by": {
        "name": "Buyer Name",
        "email": "buyer@example.com",
        "order_id": "Order ID",
        "order_time": "MM/DD/YYYY HH:MM AM/PM",
        "order_type": "Order Type"
    },
    "vendor": {
        "name": "Vendor Name",
        "address": {
            "street": "123 Vendor Street",
            "city_state_zip": "City, State, ZIP"
        },
        "contact": {
            "phone": "(123)456-7890",
            "fax": "(123)456-7891",
            "email": "vendor@example.com",
            "website": "www.vendor.com"
        }
    },
    "order_summary": [
        {
            "description": "Item Description",
            "date_time": "MM/DD/YYYY HH:MM AM/PM",
            "price": "11.95 USD",
            "discount_amount": "2.00 USD",
            "service_charge": "1.50 USD",
            "tax": "7.5%",
            "quantity": 1,
            "subtotal": "11.45 USD"
        }
    ],
    "billed_to": {
        "name": "Billed Person Name",
        "payment_method": "Payment Method",
        "last_digits": "Card Last 4 Digits"
    },
    "totals": {
        "subtotal": "100.00 USD",
        "tax": "7.50 USD",
        "service_fees": "2.00 USD",
        "discounts": "5.00 USD",
        "total": "120.00 USD",
        "amount_paid": "120.00 USD",
        "balance_due": "0.00 USD"
    },
    "comments": "Additional comments or policies"
}""",
                        'images': [image_bytes]
                    }],
                    stream=False
                )
                logger.info("Successfully received response from Llama")

                content = response['message']['content']
                logger.info(f"Raw content from OCR: {content}")

                # Find the JSON object in the response
                try:
                    # Clean and format the entire response
                    cleaned_json = clean_json_text(content)
                    logger.debug(f"Attempting to parse JSON: {cleaned_json}")
                    
                    data = json.loads(cleaned_json)
                    logger.info(f"Successfully parsed JSON: {data}")
                    return {'content': data}
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON: {str(e)}")
                    logger.error(f"Raw content: {content}")
                    logger.error(f"Cleaned content: {cleaned_json}")
                    return {'content': f"Error parsing JSON: {str(e)}", 'raw_content': content, 'cleaned_content': cleaned_json}

            except Exception as e:
                logger.error(f"Failed to parse JSON: {str(e)}")
                logger.error(f"Problematic content: {content}")
                return {'content': f"Error parsing JSON: {str(e)}"}
            
        except Exception as e:
            logger.error(f"OCR process failed: {str(e)}")
            return {'content': f"OCR Error: {str(e)}"}