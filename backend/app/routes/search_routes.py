from flask import Blueprint, request, jsonify
from pymongo import MongoClient

search_blueprint = Blueprint("search", __name__)

# MongoDB Connection
client = MongoClient("mongodb+srv://your_mongo_connection_string")
db = client['hireme']

@search_blueprint.route('/api/search', methods=['GET'])
def search():
    keyword = request.args.get('keyword', '')
    task_type = request.args.get('task_type', None)  # 'remote' or 'onsite'
    skills = request.args.getlist('skills')  # List of skills
    location = request.args.get('location', None)
    category = request.args.get('category', None)
    search_type = request.args.get('type', 'post')  # 'post' or 'person'

    results = []

    if search_type == 'post':
        query = {}
        if keyword:
            query['$or'] = [
                {"title": {"$regex": keyword, "$options": "i"}},
                {"description": {"$regex": keyword, "$options": "i"}}
            ]
        if task_type:
            query['task_type'] = task_type
        if skills:
            query['skills'] = {"$in": skills}
        if location:
            query['location'] = location
        if category:
            query['category'] = category

        posts = db['posts'].find(query)
        results = [{"id": str(post["_id"]), "title": post["title"], "description": post["description"]} for post in posts]
    elif search_type == 'person':
        query = {}
        if keyword:
            query['$or'] = [
                {"name": {"$regex": keyword, "$options": "i"}},
                {"bio": {"$regex": keyword, "$options": "i"}}
            ]
        if skills:
            query['skills'] = {"$in": skills}
        if location:
            query['location'] = location

        users = db['users'].find(query)
        results = [{"id": str(user["_id"]), "name": user["name"], "email": user["email"]} for user in users]

    return jsonify(results)
