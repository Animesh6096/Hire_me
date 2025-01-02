from flask import Blueprint, request, jsonify
from app.models.user import User
from bson import ObjectId
import jwt
from functools import wraps
from app.config import Config
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity

users = Blueprint('users', __name__)

# Login route
@users.route('/login', methods=['POST'])
def login():
    data = request.json
    print("Login attempt with email:", data.get('email'))  # Debug log
    
    user = User.find_by_email(data['email'])
    print("User found:", bool(user))  # Debug log
    
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
        
    password_check = User.check_password(user['password_hash'], data['password'])
    print("Password check result:", password_check)  # Debug log
    
    if not password_check:
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': str(user['_id']),
        'email': user['email'],
        'exp': datetime.utcnow() + timedelta(days=1)  # Token expires in 1 day
    }, Config.SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user_id": str(user['_id']),
        "role": user.get('role', 'User')
    }), 200

# Register route
@users.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.find_by_email(data['email']):
        return jsonify({"error": "User already exists"}), 400
    user_id = User.create(data)
    return jsonify({"message": "User registered successfully", "user_id": user_id}), 201

# Middleware to verify JWT token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = User.find_by_id(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Get user profile
@users.route('/<user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Convert ObjectId to string for JSON serialization
    user['_id'] = str(user['_id'])
    # Remove sensitive information
    user.pop('password_hash', None)
    
    return jsonify(user), 200

# Update basic profile information
@users.route('/<user_id>/profile', methods=['PUT'])
@token_required
def update_profile(current_user, user_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if User.update_profile(user_id, data):
        return jsonify({'message': 'Profile updated successfully'}), 200
    return jsonify({'message': 'Error updating profile'}), 400

# Handle profile photo upload
@users.route('/<user_id>/photo', methods=['POST'])
@token_required
def upload_photo(current_user, user_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    if 'photo' not in request.files:
        return jsonify({'message': 'No photo provided'}), 400
    
    photo = request.files['photo']
    if photo.filename == '':
        return jsonify({'message': 'No photo selected'}), 400
    
    if photo:
        try:
            # Read the image file
            photo_data = photo.read()
            mime_type = photo.content_type
            
            # Update user's profile with the image data
            if User.update_profile_photo(user_id, photo_data, mime_type):
                # Get updated user data
                user = User.find_by_id(user_id)
                if user and user.get('profilePhoto'):
                    return jsonify({
                        'message': 'Photo uploaded successfully',
                        'photo_url': user['profilePhoto']
                    }), 200
            
            return jsonify({'message': 'Error saving photo to database'}), 400
        except Exception as e:
            print(f"Error in photo upload: {str(e)}")
            return jsonify({'message': 'Error processing photo'}), 400
    
    return jsonify({'message': 'Error uploading photo'}), 400

# Add education entry
@users.route('/<user_id>/education', methods=['POST'])
@token_required
def add_education(current_user, user_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if User.add_education(user_id, data):
        return jsonify({'message': 'Education added successfully'}), 201
    return jsonify({'message': 'Error adding education'}), 400

# Update education entry
@users.route('/<user_id>/education/<education_id>', methods=['PUT'])
@token_required
def update_education(current_user, user_id, education_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if User.update_education(user_id, education_id, data):
        return jsonify({'message': 'Education updated successfully'}), 200
    return jsonify({'message': 'Error updating education'}), 400

# Delete education entry
@users.route('/<user_id>/education/<education_id>', methods=['DELETE'])
@token_required
def delete_education(current_user, user_id, education_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    if User.delete_education(user_id, education_id):
        return jsonify({'message': 'Education deleted successfully'}), 200
    return jsonify({'message': 'Error deleting education'}), 400

# Update skills
@users.route('/<user_id>/skills', methods=['PUT'])
@token_required
def update_skills(current_user, user_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if not isinstance(data.get('skills', []), list):
        return jsonify({'message': 'Skills must be an array'}), 400
    
    if User.update_skills(user_id, data['skills']):
        return jsonify({'message': 'Skills updated successfully'}), 200
    return jsonify({'message': 'Error updating skills'}), 400

# Add experience entry
@users.route('/<user_id>/experience', methods=['POST'])
@token_required
def add_experience(current_user, user_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if User.add_experience(user_id, data):
        return jsonify({'message': 'Experience added successfully'}), 201
    return jsonify({'message': 'Error adding experience'}), 400

# Update experience entry
@users.route('/<user_id>/experience/<experience_id>', methods=['PUT'])
@token_required
def update_experience(current_user, user_id, experience_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if User.update_experience(user_id, experience_id, data):
        return jsonify({'message': 'Experience updated successfully'}), 200
    return jsonify({'message': 'Error updating experience'}), 400

# Delete experience entry
@users.route('/<user_id>/experience/<experience_id>', methods=['DELETE'])
@token_required
def delete_experience(current_user, user_id, experience_id):
    if str(current_user['_id']) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    if User.delete_experience(user_id, experience_id):
        return jsonify({'message': 'Experience deleted successfully'}), 200
    return jsonify({'message': 'Error deleting experience'}), 400

# Follow or unfollow a user
@users.route('/<user_id>/follow', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    """Follow or unfollow a user"""
    try:
        # Check if already following
        is_following = User.is_following(current_user['_id'], user_id)
        
        if is_following:
            # Unfollow
            if User.unfollow_user(current_user['_id'], user_id):
                return jsonify({
                    'message': 'Successfully unfollowed user',
                    'is_following': False
                }), 200
        else:
            # Follow
            if User.follow_user(current_user['_id'], user_id):
                return jsonify({
                    'message': 'Successfully followed user',
                    'is_following': True
                }), 200
                
        return jsonify({'message': 'Failed to update follow status'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Get the follow status for a user
@users.route('/<user_id>/follow-status', methods=['GET'])
@token_required
def get_follow_status(current_user, user_id):
    """Get the follow status for a user"""
    try:
        is_following = User.is_following(current_user['_id'], user_id)
        
        return jsonify({
            'is_following': is_following
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Get user's followers
@users.route('/<user_id>/followers', methods=['GET'])
@token_required
def get_followers(current_user, user_id):
    """Get list of users who follow the specified user"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        followers = []
        for follower_id in user.get('followers', []):
            follower = User.find_by_id(follower_id)
            if follower:
                followers.append({
                    '_id': str(follower['_id']),
                    'firstName': follower['firstName'],
                    'lastName': follower['lastName'],
                    'profilePhoto': follower.get('profilePhoto')
                })
        
        return jsonify({'users': followers}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Get users that the user is following
@users.route('/<user_id>/following', methods=['GET'])
@token_required
def get_following(current_user, user_id):
    """Get list of users that the specified user follows"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        following = []
        for following_id in user.get('following', []):
            followed_user = User.find_by_id(following_id)
            if followed_user:
                following.append({
                    '_id': str(followed_user['_id']),
                    'firstName': followed_user['firstName'],
                    'lastName': followed_user['lastName'],
                    'profilePhoto': followed_user.get('profilePhoto')
                })
        
        return jsonify({'users': following}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Search users by name
@users.route('/search', methods=['GET'])
@token_required
def search_users(current_user):
    """Search users by name"""
    try:
        search_query = request.args.get('query', '').strip()
        if not search_query:
            return jsonify([]), 200

        # Create case-insensitive regex pattern
        pattern = {'$regex': search_query, '$options': 'i'}
        
        # Search in users collection
        users = list(User.get_collection().find({
            '$or': [
                {'firstName': pattern},
                {'lastName': pattern}
            ]
        }))

        # Convert ObjectId to string and format response
        formatted_users = []
        for user in users:
            if str(user['_id']) != str(current_user['_id']):  # Exclude current user
                formatted_users.append({
                    '_id': str(user['_id']),
                    'firstName': user['firstName'],
                    'lastName': user['lastName'],
                    'bio': user.get('bio', ''),
                    'profilePhoto': user.get('profilePhoto')
                })

        return jsonify(formatted_users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400