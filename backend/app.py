from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import api_bp
# from backend.api.routes import api_bp # Import the API blueprint
from config import config
import logging
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.exceptions import HTTPException
from api.errors import APIError, handle_api_error, handle_http_error, handle_generic_error

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
app.register_blueprint(api_bp, url_prefix='/api') # Register API blueprint with /api prefix

# Configure CORS with timeout
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
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

# Register blueprints
# app.register_blueprint(api_bp, url_prefix='/api')

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