from flask import Flask
from werkzeug.exceptions import HTTPException
from .errors import APIError, handle_api_error, handle_http_error, handle_generic_error

app = Flask(__name__)

# Register error handlers
app.register_error_handler(APIError, handle_api_error)
app.register_error_handler(HTTPException, handle_http_error)
app.register_error_handler(Exception, handle_generic_error)

# ... rest of app configuration 