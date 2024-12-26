from flask import Blueprint, request, jsonify
from app.models.user import User
from bson import ObjectId
import jwt
from functools import wraps
from app.config import Config
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta

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