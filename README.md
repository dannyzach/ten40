# Receipt Scanner and Organizer

An intelligent document processing application that extracts, analyzes, and organizes receipt data using OCR technology. Built with a Flask backend and Next.js frontend.

## Overview

This application allows users to upload and manage various tax documents including receipts, W-2s, 1099s, and donation records. It features intelligent data extraction, advanced filtering, and Gmail-style bulk operations.

### For Product Managers
- **Key Features**
  - Seamless document upload via drag-and-drop or file selection
  - Real-time processing status feedback
  - Intelligent data extraction (vendor, amount, date, line items)
  - Advanced filtering and sorting capabilities
  - Gmail-style bulk operations
  - Global search functionality
  - Document type categorization (Receipts, W-2, 1099, Donations)
  - Interactive data visualization
  - Responsive design for all devices
  - Modern, flat design interface

- **User Experience**
  - Modern, intuitive interface
  - Real-time feedback on all operations
  - Advanced filtering system with persistent state
  - Bulk selection and operations
  - Global search across all documents
  - Error handling with clear user messaging
  - Fast response times with asynchronous processing
  - Persistent navigation with mobile responsiveness
  - Unified design language across all pages

### For Engineers
- **Tech Stack**
  - Backend:
    - Python 3.11 (required)
    - Flask web framework
    - SQLite with SQLAlchemy ORM
    - PIL for image processing
    - OpenAI GPT-4 Vision API for OCR
  - Frontend:
    - Next.js 14
    - TypeScript
    - Material-UI (MUI) v5 components
    - Emotion for styling
    - React Context for state management
    - Custom hooks for shared functionality

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
      │   ├── GlobalHeader/   # Application header
      │   ├── LeftNav/        # Navigation drawer
      │   ├── Layout/         # Main layout wrapper
      │   └── ...
      ├── pages/         # Next.js pages
      │   ├─�� dashboard/      # Dashboard views
      │   ├── documents/      # Receipt management
      │   ├── 1040/          # Tax form handling
      │   └── profile/       # User settings
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
- Python 3.11 (required, Python 3.13 is not supported due to package compatibility)
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
   cd backend
   pip install -r requirements.txt
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
- [ ] Dark mode support
- [ ] Customizable layout options
- [ ] Enhanced mobile experience
- [ ] Integration with tax software

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

### Document Management Features
1. **Document Types**
   - Receipts/Expenses
   - W-2 Forms
   - 1099 Forms
   - Donation Records

2. **Advanced Filtering**
   - Filter by document type
   - Filter by date range
   - Filter by amount range
   - Filter by vendor/employer
   - Filter by payment method
   - Filter by status

3. **Bulk Operations**
   - Select multiple documents
   - Bulk delete
   - Gmail-style selection interface
   - Real-time status updates

4. **Search and Sort**
   - Global search across all documents
   - Sort by any column
   - Persistent sort state
   - Smart date handling

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