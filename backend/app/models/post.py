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
users_collection = db['users']

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

    @staticmethod
    def get_other_posts(current_user_id):
        # Find all posts where user_id is not the current user's ID
        posts = list(posts_collection.find({"user_id": {"$ne": current_user_id}}))
        # Convert ObjectId to string for JSON serialization and add user info
        for post in posts:
            post['_id'] = str(post['_id'])
            # Get creator info from users collection directly
            creator = users_collection.find_one({"_id": ObjectId(post['user_id'])})
            if creator:
                post['creator'] = {
                    'firstName': creator.get('firstName', ''),
                    'lastName': creator.get('lastName', ''),
                    'profilePhoto': creator.get('profilePhoto', None)
                }
        # Sort by creation date, newest first
        posts.sort(key=lambda x: x['created_at'], reverse=True)
        return posts 