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
            "posts": [],  # Initialize empty posts array
            "applied": [],  # Array of post IDs user has applied to
            "interested": [],  # Array of post IDs user is interested in
            "followers": [],  # Array of user IDs who follow this user
            "following": []   # Array of user IDs this user follows
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

    @staticmethod
    def get_basic_info(user_id):
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return {
                "firstName": user.get('firstName', ''),
                "lastName": user.get('lastName', ''),
                "profilePhoto": user.get('profilePhoto', None)
            }
        return None

    @staticmethod
    def add_applied_post(user_id, post_id):
        """Add a post to user's applied list"""
        try:
            result = users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"applied": post_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding applied post: {str(e)}")
            return False

    @staticmethod
    def remove_applied_post(user_id, post_id):
        """Remove a post from user's applied list"""
        try:
            result = users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"applied": post_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error removing applied post: {str(e)}")
            return False

    @staticmethod
    def add_interested_post(user_id, post_id):
        """Add a post to user's interested list"""
        try:
            result = users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"interested": post_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error adding interested post: {str(e)}")
            return False

    @staticmethod
    def remove_interested_post(user_id, post_id):
        """Remove a post from user's interested list"""
        try:
            result = users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"interested": post_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error removing interested post: {str(e)}")
            return False

    @staticmethod
    def has_posts(user_id):
        """Check if user has created any posts"""
        user = User.get_collection().find_one({"_id": ObjectId(user_id)})
        return user and len(user.get('posts', [])) > 0

    @staticmethod
    def follow_user(follower_id, user_to_follow_id):
        """Add follower to user's followers and add user to follower's following"""
        try:
            # Add follower to user's followers list
            User.get_collection().update_one(
                {"_id": ObjectId(user_to_follow_id)},
                {"$addToSet": {"followers": str(follower_id)}}
            )
            # Add user to follower's following list
            User.get_collection().update_one(
                {"_id": ObjectId(follower_id)},
                {"$addToSet": {"following": str(user_to_follow_id)}}
            )
            return True
        except Exception as e:
            print(f"Error following user: {str(e)}")
            return False

    @staticmethod
    def unfollow_user(follower_id, user_to_unfollow_id):
        """Remove follower from user's followers and remove user from follower's following"""
        try:
            # Remove follower from user's followers list
            User.get_collection().update_one(
                {"_id": ObjectId(user_to_unfollow_id)},
                {"$pull": {"followers": str(follower_id)}}
            )
            # Remove user from follower's following list
            User.get_collection().update_one(
                {"_id": ObjectId(follower_id)},
                {"$pull": {"following": str(user_to_unfollow_id)}}
            )
            return True
        except Exception as e:
            print(f"Error unfollowing user: {str(e)}")
            return False

    @staticmethod
    def is_following(follower_id, user_id):
        """Check if follower_id is following user_id"""
        try:
            user = User.get_collection().find_one(
                {"_id": ObjectId(follower_id), "following": str(user_id)}
            )
            return bool(user)
        except Exception as e:
            print(f"Error checking follow status: {str(e)}")
            return False