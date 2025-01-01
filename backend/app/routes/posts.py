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
        # Get the current user to access their working posts
        user = User.find_by_id(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Get user's working posts
        working_posts = user.get('working', [])
        
        # Get all posts except user's own posts
        all_other_posts = list(Post.get_collection().find({
            "user_id": {"$ne": current_user_id}
        }))
        
        # Add status flags and convert ObjectId to string
        for post in all_other_posts:
            post['_id'] = str(post['_id'])
            post['hasApplied'] = str(post['_id']) in user.get('applied', [])
            post['isInterested'] = str(post['_id']) in user.get('interested', [])
            post['isWorking'] = str(post['_id']) in working_posts
            
            # Get creator info
            creator = User.get_basic_info(post['user_id'])
            if creator:
                post['creator'] = creator
                
        return jsonify({
            "posts": all_other_posts,
            "total": len(all_other_posts)
        }), 200
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

@posts.route('/user-interactions', methods=['GET'])
@token_required
def get_user_interaction_posts(current_user_id):
    try:
        # Get the user to access their interested and applied posts
        user = User.find_by_id(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the lists of post IDs
        interested_posts = user.get('interested', [])
        applied_posts = user.get('applied', [])

        # Convert string IDs to ObjectId for MongoDB query
        interested_ids = [ObjectId(pid) for pid in interested_posts]
        applied_ids = [ObjectId(pid) for pid in applied_posts]

        # Get all posts that the user has interacted with
        all_interaction_posts = list(Post.get_collection().find({
            "_id": {"$in": list(set(interested_ids + applied_ids))}
        }))

        # Add interaction flags and convert ObjectId to string
        for post in all_interaction_posts:
            post['_id'] = str(post['_id'])
            post['hasApplied'] = str(post['_id']) in applied_posts
            post['isInterested'] = str(post['_id']) in interested_posts
            
            # Check if user was declined for this post
            declined_applicants = post.get('declined_applicants', [])
            post['isDeclined'] = current_user_id in declined_applicants
            
            # Get creator info
            creator = User.get_basic_info(post['user_id'])
            if creator:
                post['creator'] = creator

        return jsonify({
            "posts": all_interaction_posts,
            "total_interested": len(interested_posts),
            "total_applied": len(applied_posts)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/approve/<user_id>', methods=['POST'])
@token_required
def approve_applicant(current_user_id, post_id, user_id):
    try:
        post = Post.get_collection().find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        # Check if current user is the post owner
        if post['user_id'] != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Update post's applicants status
        result = Post.get_collection().update_one(
            {"_id": ObjectId(post_id)},
            {
                "$addToSet": {"approved_applicants": user_id},
                "$pull": {"applicants": user_id, "declined_applicants": user_id}
            }
        )
        
        # Add post to user's working list and remove from applied list
        user_result = User.get_collection().update_one(
            {"_id": ObjectId(user_id)},
            {
                "$addToSet": {"working": post_id},
                "$pull": {"applied": post_id}
            }
        )
        
        if result.modified_count or user_result.modified_count:
            return jsonify({"message": "Applicant approved successfully"}), 200
        return jsonify({"message": "No changes made"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/decline/<user_id>', methods=['POST'])
@token_required
def decline_applicant(current_user_id, post_id, user_id):
    try:
        post = Post.get_collection().find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        # Check if current user is the post owner
        if post['user_id'] != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Remove user from applicants and add to declined_applicants
        result = Post.get_collection().update_one(
            {"_id": ObjectId(post_id)},
            {
                "$pull": {"applicants": user_id},
                "$addToSet": {"declined_applicants": user_id}
            }
        )
        
        if result.modified_count:
            return jsonify({"message": "Applicant declined successfully"}), 200
        return jsonify({"message": "No changes made"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/<post_id>/remove-application', methods=['POST'])
@token_required
def remove_application(current_user_id, post_id):
    try:
        # Remove user from declined_applicants and clean up user's applied list
        post_result = Post.get_collection().update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"declined_applicants": current_user_id}}
        )
        
        # Remove from user's applied list
        user_result = User.get_collection().update_one(
            {"_id": ObjectId(current_user_id)},
            {"$pull": {"applied": post_id}}
        )
        
        if post_result.modified_count or user_result.modified_count:
            return jsonify({"message": "Application removed successfully"}), 200
        return jsonify({"message": "No changes made"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@posts.route('/working-posts', methods=['GET'])
@token_required
def get_working_posts(current_user_id):
    try:
        # Get the user to access their working posts
        user = User.find_by_id(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the list of working post IDs
        working_posts = user.get('working', [])

        # Convert string IDs to ObjectId for MongoDB query
        working_ids = [ObjectId(pid) for pid in working_posts]

        # Get all posts that the user is working on
        all_working_posts = list(Post.get_collection().find({
            "_id": {"$in": working_ids}
        }))

        # Add status and convert ObjectId to string
        for post in all_working_posts:
            post['_id'] = str(post['_id'])
            post['isWorking'] = True
            
            # Get creator info
            creator = User.get_basic_info(post['user_id'])
            if creator:
                post['creator'] = creator

        return jsonify({
            "posts": all_working_posts,
            "total_working": len(working_posts)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 