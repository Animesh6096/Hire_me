from flask import Flask, send_from_directory
from .extensions import db
from flask_cors import CORS
from .routes import bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize Extensions
    db.init_app(app)
    
    # Configure CORS to allow requests from frontend
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register Routes
    app.register_blueprint(bp, url_prefix='/users')

    # Create upload directory if it doesn't exist
    import os
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app