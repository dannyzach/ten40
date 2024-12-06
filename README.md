# Receipt Scanner and Organizer

A modern web application for scanning, organizing, and managing receipts with OCR capabilities.

## Features

- Upload receipts via drag-and-drop or file selection
- Automatic text extraction using OCR
- Responsive design for mobile and desktop
- View receipt images and extracted data
- Delete receipts with confirmation
- Debug panel for monitoring processing status

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Material-UI (MUI) v5
- React Dropzone for file uploads
- Lucide React for icons

### Backend
- Flask 3.0.0
- SQLAlchemy 2.0.23
- Python 3.8+
- Ollama for OCR processing

## Prerequisites

- Node.js 16+
- Python 3.8+
- npm
- pip

## Installation

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python app.py
```

The backend API will be available at `http://localhost:3456`

## Environment Variables

Create a `.env` file in the backend directory with:
```env
FLASK_ENV=development
DATABASE_URL=sqlite:///receipts.db
UPLOAD_FOLDER=uploads
```

## API Endpoints

- `POST /api/upload` - Upload a receipt image
- `GET /api/receipts` - List all receipts
- `GET /api/receipts/<id>` - Get receipt details
- `DELETE /api/receipts/<id>` - Delete a receipt
- `GET /api/images/<filename>` - Get receipt image

## Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.15.3",
    "lucide-react": "^0.294.0",
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3"
  }
}
```

### Backend Dependencies
```python
flask==3.0.0
flask-cors==4.0.0
sqlalchemy==2.0.23
pillow==10.1.0
python-dotenv==1.0.0
requests==2.31.0
ollama==0.1.4
werkzeug==3.0.1
pytest==7.4.3
black==23.11.0
flake8==6.1.0
```

## Development

- Frontend development server runs on port 3000
- Backend API server runs on port 3456
- API requests are proxied through Next.js to avoid CORS issues
- Debug panel available for monitoring upload and processing status
- Supports drag-and-drop and click-to-upload functionality
- Responsive design works on mobile and desktop devices

## File Support

- Supported image formats: JPEG, PNG
- Maximum file size: 15MB

## License

MIT
