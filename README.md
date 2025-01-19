# Project Name

## Railway Deployment Guide

### Prerequisites

1. **Install Node.js and npm**
   - Download from: https://nodejs.org/
   - Or using Homebrew: `brew install node`
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway --version
   ```

3. **Login to Railway**
   ```bash
   railway login
   ```

4. **Setup Python Virtual Environment**
   ```bash
   # From project root
   source venv/bin/activate  # On Unix/MacOS
   # or
   .\venv\Scripts\activate   # On Windows
   ```

### Directory Structure

This project is set up as a monorepo with separate frontend and backend services.

### Deployment Steps

1. **Initialize Railway Project** (from root directory):
   ```bash
   railway init
   ```

2. **Create Services**:
   ```bash
   # Create backend service
   railway add
   # Select "Empty Service" and name it "backend"
   
   # Create frontend service
   railway add
   # Select "Empty Service" and name it "frontend"
   ```

3. **Verify Services**:
   ```bash
   railway service list
   ```

4. **Link Services**:
   ```bash
   # Link backend service
   cd backend
   railway link
   # Select the backend service when prompted
   
   # Link frontend service
   cd ../frontend
   railway link
   # Select the frontend service when prompted
   ```

4. **Deploy Services**:
   ```bash
   # Deploy backend (from backend directory)
   railway up
   
   # Deploy frontend (from frontend directory)
   railway up
   ```

Required environment variables:
- Backend:
  - DATABASE_URL
  - JWT_SECRET
  - ...

- Frontend:
  - NEXT_PUBLIC_API_URL
  - ...