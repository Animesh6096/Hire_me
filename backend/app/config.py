class Config:
    MONGO_URI = "mongodb+srv://mashed_potato:bhallagena101@hireme.rjrcf.mongodb.net/?retryWrites=true&w=majority&appName=hireme"
    SECRET_KEY = "your-secret-key-here"  # for session management
    DEBUG = True
    # File upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'} 