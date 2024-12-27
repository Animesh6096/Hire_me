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
            "created_at": datetime.utcnow(),
            "applicants": [],  # Array of user IDs who applied
            "interests": [],   # Array of user IDs who are interested
            "comments": []     # Array of comment objects
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
            # Add flags for current user's interaction with the post
            post['hasApplied'] = current_user_id in post.get('applicants', [])
            post['isInterested'] = current_user_id in post.get('interests', [])
        # Sort by creation date, newest first
        posts.sort(key=lambda x: x['created_at'], reverse=True)
        return posts 

    @staticmethod
    def toggle_application(post_id, user_id):
        """Toggle application status for a post"""
        post = posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            return False, "Post not found"

        # Check if user has already applied
        if user_id in post.get('applicants', []):
            # Remove application
            result = posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$pull": {"applicants": user_id}}
            )
            # Remove from user's applied list
            User.remove_applied_post(user_id, post_id)
            return True, "Application removed"
        else:
            # Add application
            result = posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$addToSet": {"applicants": user_id}}
            )
            # Add to user's applied list
            User.add_applied_post(user_id, post_id)
            return True, "Application submitted"

    @staticmethod
    def toggle_interest(post_id, user_id):
        """Toggle interest status for a post"""
        post = posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            return False, "Post not found"

        # Check if user has already shown interest
        if user_id in post.get('interests', []):
            # Remove interest
            result = posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$pull": {"interests": user_id}}
            )
            # Remove from user's interested list
            User.remove_interested_post(user_id, post_id)
            return True, "Interest removed"
        else:
            # Add interest
            result = posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$addToSet": {"interests": user_id}}
            )
            # Add to user's interested list
            User.add_interested_post(user_id, post_id)
            return True, "Interest added"

    @staticmethod
    def add_comment(post_id, user_id, comment_text):
        """Add a comment to a post"""
        try:
            comment = {
                "user_id": user_id,
                "text": comment_text,
                "created_at": datetime.utcnow()
            }
            result = posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$push": {"comments": comment}}
            )
            return True, "Comment added successfully"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_comments(post_id):
        """Get all comments for a post with user details"""
        try:
            post = posts_collection.find_one({"_id": ObjectId(post_id)})
            if not post:
                return False, "Post not found", None

            comments = post.get('comments', [])
            # Get user details for each comment
            for comment in comments:
                user = users_collection.find_one({"_id": ObjectId(comment['user_id'])})
                if user:
                    comment['user'] = {
                        'firstName': user.get('firstName', ''),
                        'lastName': user.get('lastName', ''),
                        'profilePhoto': user.get('profilePhoto', None)
                    }
            
            # Sort comments by creation date, newest first
            comments.sort(key=lambda x: x['created_at'], reverse=True)
            return True, "Comments retrieved successfully", comments
        except Exception as e:
            return False, str(e), None 

    @staticmethod
    def delete_post(post_id):
        """Delete a post and clean up related data"""
        try:
            # Get the post first to get user interactions
            post = posts_collection.find_one({"_id": ObjectId(post_id)})
            if not post:
                return False, "Post not found"

            # Clean up applicants' data
            for user_id in post.get('applicants', []):
                users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$pull": {"applied": post_id}}
                )

            # Clean up interested users' data
            for user_id in post.get('interests', []):
                users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$pull": {"interested": post_id}}
                )

            # Remove the post from the creator's posts array
            users_collection.update_one(
                {"_id": ObjectId(post['user_id'])},
                {"$pull": {"posts": post_id}}
            )

            # Finally, delete the post
            posts_collection.delete_one({"_id": ObjectId(post_id)})
            
            return True, "Post deleted successfully"
        except Exception as e:
            return False, str(e) 

    @staticmethod
    def update_post(post_id, data):
        """Update a post with new data"""
        try:
            # Fields that can be updated
            update_fields = {
                "jobTitle": data.get('jobTitle'),
                "description": data.get('description'),
                "requiredSkills": data.get('requiredSkills'),
                "requiredTime": data.get('requiredTime'),
                "location": data.get('location'),
                "type": data.get('type'),
                "salary": data.get('salary')
            }
            
            # Remove None values
            update_fields = {k: v for k, v in update_fields.items() if v is not None}
            
            if not update_fields:
                return False, "No fields to update"
                
            result = posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$set": update_fields}
            )
            
            if result.modified_count > 0:
                return True, "Post updated successfully"
            return False, "No changes made to the post"
        except Exception as e:
            return False, str(e) 