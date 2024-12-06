# Slim Receipt Organizer

A modern receipt management system that uses OCR to extract and organize receipt data.

## Features

- Upload and process receipt images
- Extract receipt data using OCR (Optical Character Recognition)
- Store and manage receipt information
- View and update receipt details
- Delete receipts and associated images

## Technology Stack

### Backend
- Python 3.9+
- Flask (Web Framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Llama 3.2-vision (OCR)

### Frontend
- Next.js 14+
- React 18+
- Material UI (MUI) 6+
  - @mui/material
  - @mui/icons-material
  - @emotion/react
  - @emotion/styled
- TypeScript 5+
- React Dropzone

## Setup

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn
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

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install flask==3.0.0
pip install flask-cors==4.0.0
pip install sqlalchemy==2.0.23
pip install pillow==10.1.0
pip install python-dotenv==1.0.0
pip install requests==2.31.0
pip install ollama==0.1.4
pip install werkzeug==3.0.1
```

3. Initialize the database:
```bash
cd backend
python models/create_db.py
```

4. Run the server:
```bash
python app.py
```

The server will start at `http://localhost:3456`

### Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Install additional frontend dependencies:
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-dropzone @types/react-dropzone
```

3. Run the development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

## File Storage

Receipt images are stored in:
```
~/Documents/Receipts/uploads/
```

Database file location:
```
~/Documents/Receipts/receipts.db
```

## Development

### Running Tests

From the backend directory:
```bash
python run_tests.py
```

### API Documentation

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

