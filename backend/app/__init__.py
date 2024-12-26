from flask import Flask, send_from_directory
from .extensions import db, cors
from flask_cors import CORS
from .routes import bp
from .routes.posts import posts

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize Extensions
    db.init_app(app)
    
    # Configure CORS properly
    CORS(app, 
         resources={
             r"/*": {
                 "origins": ["http://localhost:3000"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True
             }
         })

    # Register blueprints with correct prefixes
    app.register_blueprint(bp, url_prefix='/users')
    app.register_blueprint(posts, url_prefix='/posts')

    # Create upload directory if it doesn't exist
    import os
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app