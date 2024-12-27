from app.extensions import db
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
from app.config import Config
from app.models.user import User

# Connect to MongoDB
client = MongoClient(Config.MONGO_URI)
db = client['hireme']
posts_collection = db['posts']

class Post:
    @staticmethod
    def get_collection():
        return db['posts']

    @staticmethod
    def create(data, user_id):
        post = {
            "user_id": user_id,
            "jobTitle": data['jobTitle'],
            "description": data['description'],
            "requiredSkills": data['requiredSkills'],
            "requiredTime": data['requiredTime'],
            "location": data['location'],
            "type": data['type'],
            "salary": data['salary'],
            "created_at": datetime.utcnow()
        }
        
        # Insert post
        result = posts_collection.insert_one(post)
        post_id = str(result.inserted_id)
        
        # Update user's posts array using the new method
        User.add_post(user_id, post_id)
        
        return post_id

    @staticmethod
    def get_user_posts(user_id):
        posts = list(posts_collection.find({"user_id": user_id}))
        # Convert ObjectId to string for JSON serialization
        for post in posts:
            post['_id'] = str(post['_id'])
        return posts 