from flask import Blueprint

task_bp = Blueprint('tasks', __name__)

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    # Example route logic
    return "List of tasks"