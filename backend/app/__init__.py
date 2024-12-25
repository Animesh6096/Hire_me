from flask import Flask
from .extensions import db
from flask_cors import CORS
from .routes import bp, tasks

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
            "allow_headers": ["Content-Type"]
        }
    })

    # Register Routes
    app.register_blueprint(bp)
    # app.register_blueprint(tasks.bp)

    return app