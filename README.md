# Slim Receipt Organizer

A modern receipt management system that uses OCR to extract and organize receipt data.

## Features

- Upload and process receipt images
- Extract receipt data using OCR (Optical Character Recognition)
- Store and manage receipt information
- View and update receipt details
- Delete receipts and associated images

## Project Structure

```slim-receipt-organizer/
├── backend/                 # Backend server
│   ├── api/                # API endpoints
│   │   └── routes.py       # API route handlers
│   ├── models/             # Database models
│   │   └── database.py     # SQLAlchemy models
│   ├── services/           # Business logic
│   │   └── ocr_service.py  # OCR processing
│   ├── tests/              # Test suite
│   │   ├── base.py         # Base test utilities
│   │   └── test_api.py     # API tests
│   ├── config.py           # Configuration
│   ├── app.py             # Flask application
│   └── run_tests.py       # Test runner
```

## Technology Stack

### Backend
- Python 3.9+
- Flask (Web Framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Llama 3.2-vision (OCR)

## Setup

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### System Dependencies

1. Install Ollama (for OCR):
```bash
# macOS
curl -fsSL https://ollama.com/install.sh | sh

# Linux
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl start ollama

# Windows
# Download from https://ollama.com/download/windows
```

2. Install required model:
```bash
ollama pull llama3.2-vision
```

### Python Dependencies

The following Python packages are required:
```
flask==3.0.0
flask-cors==4.0.0
sqlalchemy==2.0.23
pillow==10.1.0
python-dotenv==1.0.0
requests==2.31.0
ollama==0.1.4
```

Install them using:
```bash
pip install -r requirements.txt
```

### Development Dependencies

For development and testing:
```bash
pip install pytest
pip install black  # Code formatting
pip install flake8  # Linting
```

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create .env file with your OpenAI API key
OPENAI_API_KEY=your_api_key_here
```

4. Run the server:
```bash
python app.py
```

The server will start at `http://localhost:3456`

## API Documentation

### Upload Receipt
```http
POST /api/upload
Content-Type: multipart/form-data

file: <receipt_image>
```

Response:
```json
{
    "id": 1,
    "image_path": "uuid_filename.png",
    "content": {
        "store_name": "TEST STORE",
        "date": "2024-01-20",
        "items": [
            {
                "name": "Item 1",
                "quantity": 1,
                "price": 10.99
            }
        ],
        "subtotal": 42.99,
        "tax": 3.44,
        "total_amount": 46.43
    }
}
```

### Get All Receipts
```http
GET /api/receipts
```

Response:
```json
[
    {
        "id": 1,
        "image_path": "uuid_filename.png",
        "content": { ... }
    }
]
```

### Get Single Receipt
```http
GET /api/receipts/{id}
```

Response:
```json
{
    "id": 1,
    "image_path": "uuid_filename.png",
    "content": { ... }
}
```

### Update Receipt
```http
PUT /api/receipts/{id}
Content-Type: application/json

{
    "content": {
        "store_name": "Updated Store",
        "date": "2024-01-20",
        "items": [...],
        "subtotal": 79.97,
        "tax": 6.40,
        "total_amount": 86.37
    }
}
```

### Delete Receipt
```http
DELETE /api/receipts/{id}
```

Response:
```json
{
    "message": "Receipt deleted successfully"
}
```

## Development

### Running Tests

From the backend directory:
```bash
python run_tests.py
```

The test suite includes:
- API endpoint tests
- Receipt upload and processing
- Data validation
- Error handling

### File Storage

Receipt images are stored in:
```
~/Documents/Receipts/uploads/
```

Database file location:
```
~/Documents/Receipts/receipts.db
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input)
- 404: Not Found
- 500: Server Error

Error responses include a message:
```json
{
    "error": "Error message here"
}
```

## OCR Processing

The system uses Llama 3.2-vision for OCR processing, which:
1. Extracts text from receipt images
2. Identifies key information:
    - Store name
    - Date
    - Individual items and prices
    - Subtotal, tax, and total amount
3. Returns structured JSON data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

