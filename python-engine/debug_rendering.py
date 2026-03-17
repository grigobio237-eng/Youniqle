from pymongo import MongoClient
import config
from modules.video_synthesis import create_video
import logging
import sys

# Configure logging to stdout
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
print("Script started!")

try:
    print("Connecting to MongoDB...")
    db = MongoClient(config.MONGODB_URI).get_default_database()
    # Find the project that should be rendering
    project = db.videoprojects.find_one({'status': 'rendering'})
    
    if not project:
        print("No project in 'rendering' status found. Checking 'review_ready' or 'failed'...")
        project = db.videoprojects.find_one(sort=[('_id', -1)])
        print(f"Using latest project: {project['_id']} (Status: {project['status']})")

    if project:
        print(f"Attempting to render project {project['_id']}...")
        import json
        if isinstance(project['script'], str):
            script_data = json.loads(project['script'])
        else:
            script_data = project['script']
            
        output_path = create_video(project['_id'], script_data, project.get('platform', 'shorts'))
        print(f"Success! Output at: {output_path}")
    else:
        print("No projects found.")

except Exception as e:
    print(f"Rendering failed with error: {e}")
    import traceback
    traceback.print_exc()
