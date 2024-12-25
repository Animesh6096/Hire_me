from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
from app.config import Config

# Connect to MongoDB using connection string from config
client = MongoClient(Config.MONGO_URI)
db = client['hireme']
users_collection = db['users']

class User:
    @staticmethod
    def get_collection():
        return db['users']

    @staticmethod
    def create(data):
        # Hash password before saving
        hashed_password = generate_password_hash(data['password'])
        user = {
            "firstName": data['firstName'],
            "lastName": data['lastName'],
            "email": data['email'],
            "country": data['country'],
            "password_hash": hashed_password,
            "role": data.get('role', 'User'),  # Default role is 'User'
            "created_at": datetime.utcnow()
        }
        result = User.get_collection().insert_one(user)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        return User.get_collection().find_one({"email": email})

    @staticmethod
    def check_password(stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)