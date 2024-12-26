from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
from app.config import Config
import base64

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
            "created_at": datetime.utcnow(),
            # New fields with default values
            "profilePhoto": None,  # Will store base64 image data
            "bio": "",
            "education": [],
            "skills": [],
            "experience": [],
            "posts": []  # Initialize empty posts array
        }
        result = User.get_collection().insert_one(user)
        return str(result.inserted_id)

    @staticmethod
    def add_post(user_id, post_id):
        try:
            User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {"posts": str(post_id)}}
            )
            return True
        except Exception as e:
            print(f"Error adding post to user: {e}")
            return False

    @staticmethod
    def find_by_email(email):
        return User.get_collection().find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        try:
            return User.get_collection().find_one({"_id": ObjectId(user_id)})
        except:
            return None

    @staticmethod
    def check_password(stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)

    @staticmethod
    def update_profile(user_id, data):
        try:
            # Fields that can be updated
            allowed_fields = [
                'firstName', 'lastName', 'country', 'bio', 
                'education', 'skills', 'experience'
            ]
            
            # Filter out any fields that aren't in allowed_fields
            update_data = {k: v for k, v in data.items() if k in allowed_fields}
            
            # Add updated_at timestamp
            update_data['updated_at'] = datetime.utcnow()
            
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            return False

    @staticmethod
    def update_profile_photo(user_id, photo_data, mime_type):
        """
        Update user's profile photo with base64 encoded image data
        photo_data: binary image data
        mime_type: image MIME type (e.g., 'image/jpeg', 'image/png')
        """
        try:
            # Convert binary image data to base64
            base64_image = base64.b64encode(photo_data).decode('utf-8')
            # Create data URI
            photo_uri = f"data:{mime_type};base64,{base64_image}"
            
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "profilePhoto": photo_uri,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating profile photo: {str(e)}")
            return False

    @staticmethod
    def add_education(user_id, education_data):
        try:
            education_data['id'] = str(ObjectId())  # Add unique ID for the education entry
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$push": {"education": education_data},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding education: {str(e)}")
            return False

    @staticmethod
    def update_education(user_id, education_id, education_data):
        try:
            result = User.get_collection().update_one(
                {
                    "_id": ObjectId(user_id),
                    "education.id": education_id
                },
                {
                    "$set": {
                        "education.$": {**education_data, "id": education_id},
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating education: {str(e)}")
            return False

    @staticmethod
    def delete_education(user_id, education_id):
        try:
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$pull": {"education": {"id": education_id}},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error deleting education: {str(e)}")
            return False

    @staticmethod
    def update_skills(user_id, skills):
        try:
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "skills": skills,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating skills: {str(e)}")
            return False

    @staticmethod
    def add_experience(user_id, experience_data):
        try:
            experience_data['id'] = str(ObjectId())  # Add unique ID for the experience entry
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$push": {"experience": experience_data},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding experience: {str(e)}")
            return False

    @staticmethod
    def update_experience(user_id, experience_id, experience_data):
        try:
            result = User.get_collection().update_one(
                {
                    "_id": ObjectId(user_id),
                    "experience.id": experience_id
                },
                {
                    "$set": {
                        "experience.$": {**experience_data, "id": experience_id},
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating experience: {str(e)}")
            return False

    @staticmethod
    def delete_experience(user_id, experience_id):
        try:
            result = User.get_collection().update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$pull": {"experience": {"id": experience_id}},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error deleting experience: {str(e)}")
            return False