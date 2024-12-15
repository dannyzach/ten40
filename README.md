# Receipt Scanner and Organizer

An intelligent document processing application that extracts, analyzes, and organizes receipt data using OCR technology. Built with a Flask backend and Next.js frontend.

## Overview

This application allows users to upload receipt images and automatically extracts structured data using OCR technology. The extracted data is presented in a user-friendly interface with advanced sorting, filtering, and bulk operations capabilities.

### For Product Managers
- **Key Features**
  - Seamless receipt upload via drag-and-drop or file selection
  - Real-time processing status feedback
  - Intelligent data extraction (vendor, amount, date, line items)
  - Interactive data visualization
  - Bulk operations support
  - Responsive design for all devices

- **User Experience**
  - Modern, intuitive interface
  - Real-time feedback on all operations
  - Error handling with clear user messaging
  - Fast response times with asynchronous processing

### For Engineers
- **Tech Stack**
  - Backend:
    - Python 3.9+
    - Flask web framework
    - SQLite with SQLAlchemy ORM
    - PIL for image processing
    - OpenAI GPT-4 Vision API for OCR
  - Frontend:
    - Next.js 14
    - TypeScript
    - Material-UI (MUI) v5 components
    - Emotion for styling
    - React-dropzone for file handling

- **Architecture**
  ```
  ├── backend/
  │   ├── api/            # REST API endpoints
  │   ├── models/         # SQLAlchemy models
  │   ├── services/       # Business logic
  │   │   ├── ocr_service.py       # OCR processing
  │   │   └── receipt_service.py   # Receipt handling
  │   └── app.py         # Application entry
  └── frontend/
      ├── components/    # React components
      ├── pages/         # Next.js pages
      └── styles/        # MUI theme configuration
  ```

### For QA Engineers
- **Test Coverage**
  - Unit tests using pytest
  - Component tests for React components
  - API endpoint tests
  - Error handling scenarios

- **Test Scenarios**
  - Image upload validations (format, size)
  - OCR accuracy verification
  - Data persistence checks
  - UI responsiveness
  - Error state handling

## Setup and Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn
- OpenAI API key

### Backend Setup
1. Create and activate Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r services/requirements.txt
   ```

3. Configure environment:
   ```bash
   # Create .env file in backend directory with:
   UPLOAD_FOLDER=uploads
   DB_PATH=db/receipts.db
   OPENAI_API_KEY=your_api_key_here
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install   # or: yarn install
   ```

2. Configure environment:
   ```bash
   # Create .env.development with:
   NEXT_PUBLIC_API_URL=http://localhost:3456
   NEXT_PUBLIC_API_TIMEOUT=120000
   NODE_OPTIONS=--max-http-header-size=81920
   ```

## Development

### Running the Application
1. Start backend server:
   ```bash
   cd backend
   python app.py   # Runs on http://localhost:3456
   ```

2. Start frontend development server:
   ```bash
   cd frontend
   npm run dev   # Runs on http://localhost:3000
   ```

### Testing
- Run backend tests:
  ```bash
  cd backend
  pytest
  ```

### API Endpoints
- `POST /api/upload` - Upload and process receipt
- `GET /api/receipts` - List all receipts
- `GET /api/receipts/{id}` - Get specific receipt
- `DELETE /api/receipts/{id}` - Delete receipt

## Error Handling
- Image validation errors
- OCR processing failures
- OpenAI API communication errors
- JSON parsing errors
- API timeouts
- Database errors

## Known Limitations
- Maximum image size: 15MB
- Supported formats: JPEG, PNG
- Processing time varies with image quality

## Future Improvements
- [ ] Batch upload processing
- [ ] Export functionality
- [ ] Advanced search capabilities
- [ ] Receipt categorization

## Using the Application

Once both servers are running:

1. **Access the Application**
   - Open your web browser
   - Navigate to http://localhost:3000
   - The receipt management interface will load automatically

### Receipt Management
1. **Upload Receipts**
   - Drag and drop receipt images onto the upload area
   - Or click "Upload Receipt" to select files
   - Supported formats: JPEG, PNG
   - Maximum file size: 15MB

2. **View and Manage Receipts**
   - All receipts are displayed in a sortable table
   - Click column headers to sort by filename or date
   - Use checkboxes to select multiple receipts
   - Bulk delete selected receipts

3. **Receipt Actions**
   - View Receipt: Click the eye icon to view the receipt image
   - View Data: Click the document icon to see extracted data
   - Delete: Click the trash icon to remove a receipt

4. **Table Features**
   - Sort by clicking column headers
   - Select individual or all receipts using checkboxes
   - Responsive design adapts to screen size
   - Real-time updates after actions

## Project Structure
```
frontend/
├── components/
│   ├── GlobalHeader/
│   │   ├── GlobalHeader.tsx
│   │   └── types.ts
│   └── ErrorBoundary/
├── pages/
│   ├── _app.tsx
│   └── index.tsx
└── styles/
    └── theme.ts
```

## Technology Choices
- Next.js for the frontend framework
- Material-UI (MUI) for component library and styling
- Emotion for CSS-in-JS styling
- TypeScript for type safety