from pymongo import MongoClient
import config
import json

try:
    db = MongoClient(config.MONGODB_URI).get_default_database()
    latest = db.videoprojects.find_one(sort=[('_id', -1)])
    if latest and 'script' in latest:
        script_data = json.loads(latest['script'])
        print(json.dumps(script_data, indent=2, ensure_ascii=False))
    else:
        print("No script found")
except Exception as e:
    print(f"Error: {e}")
