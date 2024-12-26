from flask import Blueprint, request, jsonify
from app.models.post import Post
from bson import ObjectId
import jwt
from functools import wraps
from app.config import Config

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