from flask import Blueprint, request, jsonify
from app.models.user import User
from pymongo import MongoClient
from bson import ObjectId

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the University Archival System!"})

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.find_by_email(data['email']):
        return jsonify({"error": "User already exists"}), 400
    user_id = User.create(data)
    return jsonify({"message": "User registered successfully", "user_id": user_id}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    print("Login attempt with email:", data.get('email'))  # Debug log
    
    user = User.find_by_email(data['email'])
    print("User found:", bool(user))  # Debug log
    
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
        
    password_check = User.check_password(user['password_hash'], data['password'])
    print("Password check result:", password_check)  # Debug log
    print("User data:", {
        "_id": str(user['_id']),
        "email": user['email'],
        "role": user.get('role', 'User')
    })  # Debug log
    
    if not password_check:
        return jsonify({"error": "Invalid email or password"}), 401
        
    return jsonify({
        "message": "Login successful",
        "user_id": str(user['_id']),
        "role": user.get('role', 'User')
    }), 200

@bp.route('/<user_id>', methods=['GET'])
def get_user_info(user_id):
    print(f"Fetching user info for ID: {user_id}")  # Debug log
    try:
        user = User.find_by_id(user_id)
        print("User found:", bool(user))  # Debug log
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user_data = {
            "firstName": user.get('firstName'),
            "lastName": user.get('lastName'),
            "email": user.get('email'),
            "country": user.get('country')
        }
        print("Returning user data:", user_data)  # Debug log
        return jsonify(user_data), 200
    except Exception as e:
        print("Error fetching user:", str(e))  # Debug log
        return jsonify({"error": "Invalid user ID format"}), 400