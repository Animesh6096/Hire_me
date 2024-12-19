from app import app, db
from flask import jsonify

@app.route('/api/items', methods=['GET'])
def get_items():
    try:
        items = list(db.items.find({}, {'_id': 0}))  # Example query
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 