from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import api_bp
from config import config
import logging
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.exceptions import HTTPException
from api.errors import APIError, handle_api_error, handle_http_error, handle_generic_error
from api.auth import auth_bp
from models import User, Receipt
from database import init_db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
init_db()

# Configure CORS to accept requests from frontend domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://frontend-production.up.railway.app",  # Production frontend
            "http://localhost:3000",                       # Local development
            "https://*.railway.app"                        # Other Railway apps
        ],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure upload folder
app.config['UPLOAD_FOLDER'] = config.upload_folder
app.config['UPLOAD_TIMEOUT'] = 120
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['PROPAGATE_EXCEPTIONS'] = True  # Enable full error reporting

# Register error handlers
app.register_error_handler(APIError, handle_api_error)
app.register_error_handler(HTTPException, handle_http_error)
app.register_error_handler(Exception, handle_generic_error)

# Register blueprints - only register each blueprint once
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')  # Add /api prefix

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

@app.errorhandler(Exception)
def handle_exception(e):
    # Log the exception details
    app.logger.error(f"Unhandled Exception: {str(e)}", exc_info=True)
    
    # Return a sanitized error response
    response = {
        "error": "An unexpected error occurred. Please try again later."
    }
    return jsonify(response), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0', 
        port=3456, 
        debug=True,
        threaded=True
    ) 