class Config:
    MONGO_URI = "mongodb+srv://banimesh2002:okay123@cluster0.trtem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    SECRET_KEY = "your-secret-key-here"  # for session management
    DEBUG = True
    # File upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'} 