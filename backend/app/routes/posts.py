from flask import Blueprint, request, jsonify
from app.models.post import Post
from bson import ObjectId
import jwt
from functools import wraps
from app.config import Config
from app.models.user import User

posts = Blueprint('posts', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

@posts.route('/create', methods=['POST'])
@token_required
def create_post(current_user_id):
    try:
        data = request.json
        post_id = Post.create(data, current_user_id)
        return jsonify({
            "message": "Post created successfully",
            "post_id": post_id
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/apply', methods=['POST'])
@token_required
def toggle_application(current_user_id, post_id):
    try:
        success, message = Post.toggle_application(post_id, current_user_id)
        if success:
            return jsonify({"message": message}), 200
        return jsonify({"error": message}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/interest', methods=['POST'])
@token_required
def toggle_interest(current_user_id, post_id):
    try:
        success, message = Post.toggle_interest(post_id, current_user_id)
        if success:
            return jsonify({"message": message}), 200
        return jsonify({"error": message}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/user-posts', methods=['GET'])
@token_required
def get_user_posts(current_user_id):
    try:
        posts = Post.get_user_posts(current_user_id)
        return jsonify({"posts": posts}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/other-posts', methods=['GET'])
@token_required
def get_other_posts(current_user_id):
    try:
        posts = Post.get_other_posts(current_user_id)
        return jsonify({"posts": posts}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/applicants', methods=['GET'])
@token_required
def get_applicants(current_user_id, post_id):
    try:
        post = Post.get_collection().find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
        
        # Get user details for each applicant
        applicants = []
        for user_id in post.get('applicants', []):
            user = User.get_basic_info(user_id)
            if user:
                user['_id'] = user_id
                applicants.append(user)
        
        return jsonify({"users": applicants}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/interested', methods=['GET'])
@token_required
def get_interested_users(current_user_id, post_id):
    try:
        post = Post.get_collection().find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
        
        # Get user details for each interested user
        interested_users = []
        for user_id in post.get('interests', []):
            user = User.get_basic_info(user_id)
            if user:
                user['_id'] = user_id
                interested_users.append(user)
        
        return jsonify({"users": interested_users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/comments', methods=['GET'])
@token_required
def get_post_comments(current_user_id, post_id):
    try:
        success, message, comments = Post.get_comments(post_id)
        if success:
            return jsonify({"comments": comments}), 200
        return jsonify({"error": message}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/comments', methods=['POST'])
@token_required
def add_comment(current_user_id, post_id):
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "Comment text is required"}), 400
            
        success, message = Post.add_comment(post_id, current_user_id, data['text'])
        if success:
            return jsonify({"message": message}), 201
        return jsonify({"error": message}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>', methods=['DELETE'])
@token_required
def delete_post(current_user_id, post_id):
    try:
        # Get the post first to check ownership
        post = Post.get_collection().find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        # Check if the current user is the owner of the post
        if post['user_id'] != current_user_id:
            return jsonify({"error": "Unauthorized to delete this post"}), 403
            
        # Delete the post and clean up related data
        success, message = Post.delete_post(post_id)
        if success:
            return jsonify({"message": message}), 200
        return jsonify({"error": message}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>', methods=['PUT'])
@token_required
def update_post(current_user_id, post_id):
    try:
        # Get the post first to check ownership
        post = Post.get_collection().find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        # Check if the current user is the owner of the post
        if post['user_id'] != current_user_id:
            return jsonify({"error": "Unauthorized to update this post"}), 403
            
        # Update the post
        data = request.json
        success, message = Post.update_post(post_id, data)
        if success:
            return jsonify({"message": message}), 200
        return jsonify({"error": message}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400 