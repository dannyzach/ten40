from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import api_bp
from config import config
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

# Configure CORS with timeout
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "max_age": 120  # 2 minutes
    }
})

# Configure upload folder
app.config['UPLOAD_FOLDER'] = config.upload_folder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['PROPAGATE_EXCEPTIONS'] = True  # Enable full error reporting

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(
        host='0.0.0.0', 
        port=3456, 
        debug=True,
        threaded=True
    ) 