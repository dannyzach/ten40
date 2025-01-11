# Ten40 Document Management System

A modern document management system built for handling tax documents, receipts, and financial records with OCR capabilities.

## Project Structure

.
├── backend/
│   ├── api/                 # Flask API routes, error handling, and services
│   │   ├── app.py           # Flask application setup
│   │   ├── errors.py        # Custom API error definitions
│   │   ├── routes.py        # API endpoints for receipts, uploads, etc
│   │   └── services.py      # Generic service definitions
│   ├── migrations/          # Database migration scripts
│   │   ├── add_status_column.py #Migration to add a status column
│   │   ├── migrate_receipt_data.py # Migration script to adjust data
│   │   └── run_migrations.py  # Executes database migrations
│   ├── models/            # Database models and schema definition
│   │   ├── __init__.py      # Makes 'models' a Python package
│   │   ├── create_db.py     # Script to initialize database
│   │   ├── database.py      # SQLAlchemy database setup and models
│   │   └── receipt.py     # SQLAlchemy model for receipts
│   ├── scripts/             # Miscellaneous scripts
│   │   └── recreate_db.py   # Script to drop all tables and recreate them
│   ├── services/          # Business logic services
│   │   ├── categorization_service.py # Service to categorize via OpenAI
│   │   ├── categorization.py # Legacy document categorization
│   │   └── ocr_service.py   # Service to call OpenAI for OCR
│   ├── src/                 # Backend index
│   │   └── index.ts         # Basic Express server for a health check
│   ├── tests/              # Test suite
│   │   ├── __init__.py      # Makes 'tests' a Python package
│   │   ├── base.py          # Test configuration and helper functions
│   │   ├── config.py        # Test configuration class
│   │   ├── conftest_integration.py # Test environment setup for integration tests
│   │   ├── conftest.py        # Test environment setup and fixtures
│   │   ├── test_api_integration.py # Tests for core API routes
│   │   ├── test_api_options.py # Test for the /options endpoint
│   │   ├── test_api.py        # Tests for various API endpoints
│   │   ├── test_categorization.py # Tests for CategorizationService
│   │   ├── test_config.py     # Tests for configuration
│   │   ├── test_models.py     # Tests for database models
│   │   ├── test_receipt_updates.py # Tests for receipt update functionality
│   │   └── test_upload.py       # Tests for file upload functionality
│   ├── utils/             # Utility classes and functions
│   │   └── http_client.py   # Generic HTTP client wrapper
│   ├── __init__.py          # Makes 'backend' a Python package
│   ├── app.py             # Top-level Flask application setup
│   ├── clean_receipts.py  # Script for cleaning receipt paths
│   ├── config.py          # Configuration settings
│   ├── init_db.py          # Initial database creation
│   ├── pytest.ini          # Pytest configuration file
│   ├── requirements.txt   # Python dependencies
│   └── run_tests.py       # Test runner script
├── components/
│   └── Documents/
│       └── EditableCell.tsx # Editable table cell component for use in tables
├── frontend/
│   ├── components/
│   │   ├── common/            # Shared UI components
│   │   │   ├── DialogWrapper.tsx # Dialog wrapper component
│   │   │   ├── ErrorMessage.tsx # Error display component
│   │   │   ├── index.ts     # Exports for common components
│   │   │   └── LoadingSpinner.tsx# Loading spinner component
│   │   ├── Documents/          # Document-specific components
│   │   │   ├── DocumentFilters.tsx  # Filters for document table
│   │   │   ├── DocumentsFilters.tsx # Document filtering component
│   │   │   ├── DocumentsTable.tsx # Document list table component
│   │   │   ├── DocumentsTabs.tsx  # Tabs for different document types
│   │   │   ├── DocumentUploadArea.tsx # Drag & drop for document upload
│   │   │   ├── DocumentUploadFab.tsx  # Floating button for doc uploads
│   │   │   ├── EditableCell.tsx  # Editable cell for table
│   │   │   └── ExpenseFilters.tsx   # Filters for the expense document list
│   │   ├── GlobalHeader/      # Global page header
│   │   │   └── GlobalHeader.tsx   # Header component
│   │   ├── Layout/          # App layout components
│   │   │   └── Layout.tsx     # Layout structure with navigation
│   │   ├── LeftNav/         # Left navigation components
│   │   │   └── LeftNav.tsx    # Left navigation menu
│   │   ├── ErrorBoundary.tsx # React error boundary component
│   │   ├── ImageViewer.tsx  # Image viewer component
│   │   ├── JsonViewer.tsx   # JSON viewer component
│   │   ├── ReceiptDetail.tsx # Receipt detail component
│   │   ├── ReceiptList.tsx   # Listing of receipts with bulk actions
│   │   ├── ReceiptTable.tsx  # Simple receipt table
│   │   ├── ReceiptUploader.tsx# Component for uploading and displaying receipts
│   │   └── UploadArea.tsx     # Upload component with drag & drop
│   ├── config/            # Configuration files
│   │   └── index.ts     # Configuration constants (API URL, etc.)
│   ├── contexts/          # React context setup
│   │   ├── AppContext.tsx   # Main application context
│   │   ├── index.ts     # Export file for contexts
│   │   └── SearchContext.tsx  # Context for search functionality
│   ├── hooks/             # React hooks for app logic
│   │   ├── useClickAway.ts # Hook to detect clicks outside component
│   │   ├── useDocumentManagement.ts # Hook for document management logic
│   │   └── useSearch.ts  # Search hook
│   ├── lib/               # API client and helper functions
│   │   ├── api/              # Contains the API related code
│   │   │   ├── client.ts     # Axios API client setup
│   │   │   └── documents.ts # Document API calls (fetch, upload, etc.)
│   │   ├── api.ts     # Previous version of api calls using fetch
│   │   └── createEmotionCache.ts  # Emotion cache configuration
│   ├── pages/             # Next.js pages (routes)
│   │   ├── receipt/
│   │   │   └── [id].tsx    # Dynamic page for receipt details
│   │   ├── _app.tsx         # Next.js main app component
│   │   ├── 1040.tsx         # Placeholder page for Form 1040
│   │   ├── dashboard.tsx    # Main dashboard page
│   │   ├── documents.tsx    # Main page for documents listing
│   │   ├── index.tsx        # Redirects user to dashboard
│   │   └── profile.tsx     # Placeholder page for user profile
│   ├── services/          # Frontend API client implementations
│   │    └── apiClient.ts     # Used to configure the Axios API client
│   ├── styles/           # Global styles and theme
│   │   ├── globals.css     # Global CSS file
│   │   └── theme.ts        # MUI theme configuration
│   ├── types/             # TypeScript definitions
│   │   ├── documents.ts   # Document type definitions
│   │   ├── filters.ts      # Filters type definitions
│   │   └── index.ts       # Combined export for type definitions
│   ├── .env.development  # Development environment variables
│   ├── .eslintrc.js      # ESLint configuration file
│   ├── .gitignore        # Git ignore file
│   ├── config.ts         # Configuration file
│   ├── next.config.js    # Next.js config
│   ├── package.json      # Frontend dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration
├── .gitignore         # Git ignore file
├── next.config.js    # Next.js config
└── README.md          # Project documentation


## Technologies Used

### Frontend

*   **React 18:** JavaScript library for building user interfaces.
*   **Next.js:** React framework for server-side rendering (SSR), routing, and API functionalities.
*   **TypeScript:**  Superset of JavaScript that adds static typing, improving code maintainability.
*   **Material-UI (MUI):** React UI component library for consistent and accessible UI elements.
*   **Axios:**  Promise-based HTTP client for making API requests to the backend.
*   **React Context:** For managing application-wide state and data efficiently.
*   **date-fns:**  Date utility library for formatting and manipulating date data.
*   **react-dropzone:** Library to enable file uploads via drag and drop.
*   **Emotion:** CSS-in-JS library for theming and styling components, used via the `sx` prop.
*   **useClickAway** Custom hook to track clicks outside a component.

### Backend

*   **Python 3.x:** Programming language for backend logic and scripting.
*   **Flask:** Python web framework for building the API server.
*   **SQLAlchemy:** Python SQL toolkit and Object-Relational Mapper (ORM) for database interactions.
*   **SQLite:**  A lightweight, serverless database engine, used here for development.
*   **Alembic:** Database migration tool for managing schema changes.
*   **OpenAI API:**  For Optical Character Recognition (OCR) and text categorization using the `gpt-4o-mini` model.
*   **python-dotenv:** For managing environment variables, keeping sensitive information separate from the code.
*   **Pillow:** Python Imaging Library, for image processing.
*  **requests:**  HTTP library to interact with external APIs like OpenAI and for backend testing.
*   **gunicorn:**  WSGI HTTP Server for production deployments.
*    **pydantic:** Data validation with Python type annotations.
*   **python-multipart**: Parsing multipart form data for file uploads.
*  **flask-cors**: Handling Cross Origin Request Sharing.
*   **pytest:** Python testing framework.

### Testing
*   **Jest** - JavaScript testing framework
*   **React Testing Library** - React component testing
*  **Supertest** - API testing
*   **pytest** - Python test framework.
*   **pytest-mock** - Library for mock objects in pytest.
*   **pytest-cov** - Library to measure code coverage in pytest.

## API Interaction

The frontend communicates with the backend via API calls using `axios`. All requests are sent to the `/api` endpoint, which is proxied to the backend server running at `http://localhost:3456`. The `next.config.js` file in the frontend project handles the proxying.

**Key points:**

*   **API Base URL:** The frontend uses the value in `NEXT_PUBLIC_API_URL` environment variable to determine where to make requests. It defaults to `http://localhost:3456`
*   **Request Type:** Both GET, POST, PATCH and DELETE requests are used to fetch data, upload, modify and delete receipts respectively.
*   **Axios:** This client is used to set default headers like `Content-Type: application/json`. It also provides comprehensive error handling.

## File Descriptions and Functionality

### Backend

*   **`backend/api/`**:
    *   **`app.py`**: Sets up the Flask application, registers blueprints, and configures error handling.
    *   **`errors.py`**: Defines custom API exception classes and error handling functions.
    *   **`routes.py`**: Contains all the API routes and logic for handling requests (receipts, uploads, options, etc.).
    *   **`services.py`**: Defines generic service classes like `OCRServiceError` and `CategorizationError`.

*   **`backend/migrations/`**:
    *   Contains scripts for database schema changes using Alembic.
    *  **`add_status_column.py`**: Adds the `status` column to the `receipts` table.
    *   **`migrate_receipt_data.py`**: Migrates legacy receipt data into a new schema.
     *   **`run_migrations.py`**: Runs all migration scripts in order.

*   **`backend/models/`**:
    *   Contains definitions for the database models and configurations.
    *   `__init__.py`: Makes this directory a package.
    *    `create_db.py`: Sets up the database schema.
    *   `database.py`: Configures the database engine, provides a context manager for sessions, and defines the base model.
    *   `receipt.py`: Defines the SQLAlchemy model for the `receipts` table.

*   **`backend/scripts/`**:
    *   `recreate_db.py`:  A script to drop all database tables and recreate them.

*   **`backend/services/`**:
    *   Contains services that encapsulate the business logic:
        *  **`categorization_service.py`**: Contains logic for using the OpenAI API to categorize receipts.
       *   `categorization.py`: Legacy file for categorizing documents.
       *   `ocr_service.py`: Extracts text and data from receipt images using the OpenAI API.

*   **`backend/src/`**
   * `index.ts`: A simple Express server to serve as a health check for the backend server during tests and development.

*  **`backend/tests/`**: Contains tests for backend functionality:
    *  `__init__.py`: Makes this folder a package
    * `base.py`: Configuration and setup for API tests.
    * `config.py`: Configuration class specifically for backend testing
    *  `conftest_integration.py`: Fixtures for integration tests.
    *   `conftest.py`: Contains shared test fixtures for database and application setup.
    *   `test_api_integration.py`: Integration tests that verify the functionality of API routes.
    *  `test_api_options.py`: Test for the /options route.
    *   `test_api.py`: Unit tests for individual API endpoints.
    *   `test_categorization.py`: Tests specifically for the `CategorizationService`.
    *   `test_config.py`: Unit tests to verify the backend configuration.
    *   `test_models.py`:  Tests for the database model definitions.
     *    `test_receipt_updates.py`: Tests to verify that receipt updates are correctly applied.
    *    `test_upload.py`: Tests to ensure file uploads function correctly.

*   **`backend/utils/`**:
    *   `http_client.py`: A utility class to create HTTP requests.

*   **`backend/app.py`**: The main file for setting up and running the Flask application.
*   **`backend/clean_receipts.py`**:  A utility script to clean up old receipt paths in the database.
*   **`backend/config.py`**:  Configuration settings for the application and the database path.
*   **`backend/init_db.py`**:  A script to initialize the database by creating the schema.
*   **`backend/pytest.ini`**: Pytest configuration
*   **`backend/requirements.txt`**: Python dependencies.
*   **`backend/run_tests.py`**: Script to run the backend tests

### Frontend

*   **`frontend/components/`**:
    *   **`common/`**: Contains reusable UI components.
        *   `DialogWrapper.tsx`: A component to handle dialogs across the frontend.
        *   `ErrorMessage.tsx`:  Reusable error display component.
        *   `LoadingSpinner.tsx`: Reusable loading spinner component.
        *   `index.ts`: Exports components of the `common` folder.
    *   **`Documents/`**: Document-specific components.
        *   `DocumentFilters.tsx`: Component to handle filtering for different document types.
        *   `DocumentsFilters.tsx`: Filter component used in the Documents page.
         *  `DocumentsTable.tsx`: Displays documents in a sortable table.
         *   `DocumentsTabs.tsx`: Tabbed UI component to switch between document types.
        *  `DocumentUploadArea.tsx`: Handles drag-and-drop file uploads in the document pages.
        * `DocumentUploadFab.tsx`: Renders a floating action button to launch the document upload flow.
        *  `EditableCell.tsx`:  Component for making individual cells of a table editable.
       *   `ExpenseFilters.tsx`: Component for filtering expense documents.
    *   **`GlobalHeader/`**:
        *    `GlobalHeader.tsx`: The site header component, including search and navigation controls.
    *   **`Layout/`**:
         *   `Layout.tsx`:  Component that provides the app's structure, navigation, and layout.
    *   **`LeftNav/`**:
         *   `LeftNav.tsx`: Provides the navigation menu for the app.
    *   `ErrorBoundary.tsx`: A component that prevents React from crashing due to unexpected errors.
    *   `ImageViewer.tsx`: Component to display receipt images in a dialog.
     *   `JsonViewer.tsx`: A component to display JSON data in a dialog.
    *   `ReceiptDetail.tsx`:  Displays the details of a single receipt document.
    *   `ReceiptList.tsx`:  Component that displays a list of receipts, with upload functionality.
     *    `ReceiptTable.tsx`:  A component to render a basic table of receipts.
   *    `ReceiptUploader.tsx`: Component to upload and view receipts.
    *    `UploadArea.tsx`: Handles the UI for the file upload area.
*   **`frontend/config/`**:
    *   `index.ts`:  Configuration constants for the API endpoints.

*   **`frontend/contexts/`**:
    *   `AppContext.tsx`: Provides the main application context, combining search and document management states.
    *   `index.ts`: Export all contexts.
    *   `SearchContext.tsx`: Provides state management for search functionality.

*   **`frontend/hooks/`**:
     *    `useClickAway.ts`: A custom hook to track clicks outside a component.
    *    `useDocumentManagement.ts`: A custom hook to handle document-related logic.
    *   `useSearch.ts`: A custom hook that provides state management for the search bar.

*   **`frontend/lib/`**:
    *   **`api/`**:
        *   `client.ts`: Configures the Axios client and handles all responses in a uniform way.
         *   `documents.ts`: Defines API methods for interacting with backend documents.
    *   `api.ts`: Previous version of the API calls
    *   `createEmotionCache.ts`:  Configures the Emotion cache used by MUI.

*   **`frontend/pages/`**:
    *   `_app.tsx`:  Main Next.js application component, wraps all pages with providers and themes.
    *   `index.tsx`: Redirects to dashboard.
     * `receipt/[id].tsx`: The route for the receipt detail page.
    *   `dashboard.tsx`:  The main dashboard component
    *   `documents.tsx`: The main component for the documents page.
    *  `1040.tsx`: Placeholder page for Form 1040.
    *  `profile.tsx`:  Placeholder page for user profiles.

*   **`frontend/services/`**:
   *  `apiClient.ts`: A separate configuration of the Axios API Client.

*   **`frontend/styles/`**:
     *  `globals.css`: Global CSS styles.
     *  `theme.ts`: Configures the MUI theme used in the application.

*  **`frontend/types/`**:
    *  `documents.ts`: Defines typescript interfaces for document types
    *  `filters.ts`: Defines typescript interfaces for filter parameters.
    * `index.ts`: Exports all types.

*  **`frontend/.env.development`**: Contains environment variables for development.
*   **`frontend/.eslintrc.js`**:  ESLint configuration.
*   **`frontend/.gitignore`**:  Git ignore file.
*   **`frontend/config.ts`**: General configuration file with timeouts.
*   **`frontend/next.config.js`**: Next.js configuration settings.
*   **`frontend/package.json`**:  Frontend dependency file and scripts.
*   **`frontend/tsconfig.json`**: TypeScript configuration.

## ERD (Entity Relationship Diagram)

erDiagram
    receipts {
        INTEGER id PK
        STRING image_path
        STRING vendor
        STRING amount
        STRING date
        STRING payment_method
        STRING expenseType
        JSON content
        STRING status
    }
    receipt_change_history {
        INTEGER id PK
        INTEGER receipt_id FK
        STRING field_name
        STRING new_value
        DATETIME changed_at
         STRING changed_by
    }
  receipts ||--o{ receipt_change_history : has


## Architectural Diagram

graph LR
    A[Frontend - Next.js] --> B(API Gateway - Next.js Rewrites);
    B --> C[Backend - Flask];
    C --> D[SQLite];
    C --> E[OpenAI API];
    A --> F(Browser);
    F --> B
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
     style B fill:#aaf,stroke:#333,stroke-width:2px
     style D fill:#aaf,stroke:#333,stroke-width:2px
     style E fill:#aaf,stroke:#333,stroke-width:2px
        style F fill:#fff,stroke:#333,stroke-width:2px



## Design Decisions

*   **Frontend:**
    *   **MUI (Material-UI):** Chosen for its comprehensive component library, themeability, and accessibility support. Provides a consistent and professional look with out-of-the-box components.
    *   **Axios:**  Selected for its simple API, interceptors, and better error handling than the native fetch API. Provides a better developer experience and control over requests.
    *   **React Context API:** Used for its simplicity and better performance when compared to other state management libraries. Chosen as it is sufficient for the complexity of this app.
     * **NextJS**: Used for it's server side rendering, and other quality of life improvements.
   *   **react-dropzone:** Used for ease of integration and its accessibility features when handling drag and drop actions.
   *    **Emotion:** For flexibility when styling, while still keeping most of it's style configurations tied to MUI
*   **Backend:**
    *   **Flask:** Lightweight web framework that's easy to learn and use, ideal for small to medium-sized API servers.
    *   **SQLAlchemy:** Powerful ORM that provides flexibility and control over database interactions.
    *   **SQLite:**  Database engine ideal for development environments. It's zero-configuration, making setup and testing straightforward.
    * **OpenAI API**: For cost-effective and efficient OCR and document categorization, using cutting edge tech.
    * **python-multipart**: Easy to use way of handling files being uploaded through HTML forms.
* **Design Patterns:**
 * **Context API**: used to help centralize state and data management across the application without prop drilling.
 * **Component based Architecture**: UI is divided into composable and reusable components that each handle specific functionality and display logic.

## React Contexts

The application uses React Context to manage states:

*   **`SearchContext` (`frontend/contexts/SearchContext.tsx`)**:
    *   Responsible for managing the global search query.
    *   Provides the `searchQuery` state and the `setSearchQuery` function.
    *   Allows any component to access the current search query and trigger updates.

*   **`AppContext` (`frontend/contexts/AppContext.tsx`)**:
    * Combines search functionality and document management features.
    *  Provides the `searchQuery`, `setSearchQuery` functions as well as various functions related to document retrieval, upload, deletion, and fetching of document details.
   * Provides a single entry point for components to interact with essential business logic of the app.

## Styling

*   **MUI Theme:**  The application uses a custom MUI theme (`frontend/styles/theme.ts`) to define colors, fonts, and spacing. You can modify this file to adjust the overall look of the app.
*   **Global CSS:** Additional global styles like typography and padding are defined in `frontend/styles/globals.css`.
*  **Sx prop**: Components use the `sx` prop for component specific styling that adheres to the current MUI theme.
*   **Adding Theme Overrides:**
    *   To adjust MUI components, add overrides in the `components` section of the `theme.ts` file.
    *   The global styles (`globals.css`) should be used for cross-cutting styles and custom animations.

## API Endpoints

### Receipts API Endpoints:

*   **`GET /api/receipts`**: Retrieves a list of all receipts.
*   **`POST /api/upload`**:  Uploads a new receipt document (image). Accepts `multipart/form-data`.
*   **`GET /api/receipts/<int:receipt_id>`**: Retrieves the details of a single receipt, specified by its `id`.
*   **`PATCH /api/receipts/<int:receipt_id>/update`**: Updates fields of a receipt given a receipt `id`
*    **`DELETE /api/receipts/<int:receipt_id>`**: Deletes a receipt specified by the `id`.
*  **`GET /api/options`**: Retrieves dropdown filter options for the frontend components
*  **`GET /api/images/<path:filename>`**: Retrieves an image associated with a receipt.

### Document Endpoints
*  **`POST /api/process`**: Takes in an image and attempts to extract data and return it.
*  **`POST /api/categorize`**: Takes in a string of text and returns a list of categories.

## Testing

### Frontend Tests

*   **Unit and Component Tests:** The frontend should use a combination of Jest and React Testing Library. Test files should be located in a `__tests__` directory alongside components.
*  **E2E tests** Cypress should be used for tests that are end to end which cover integration of different components
*   **Mock API Calls:** Axios API calls should be mocked in tests to create a predictable test environment.
*  **Focus on Functionality:** UI tests should focus on what is displayed to the user and should not be dependent on internal implementations.
*   **Automated Testing:** Integration with CI/CD should be set up to automatically run tests.

### Backend Tests

*   **Unit Tests:** Individual methods or API routes should be tested using `pytest` files in the `backend/tests` folder.
*  **Integration Tests:** Integration tests should test full API calls using `requests` and verify data transfer, database interaction, etc.
*   **Test Fixtures:** Shared test data and setup should be handled through Pytest fixtures.
*  **Test Coverage:**  Code coverage metrics should be tracked and improved.
*   **Test Database:** An in-memory SQLite database (via `:memory:` engine path) is used to avoid polluting the development database and speed up testing.

### Running Tests

# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest
```