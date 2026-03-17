from pymongo import MongoClient
import config

try:
    db = MongoClient(config.MONGODB_URI).get_default_database()
    # Move 'assets_generated' to 'rendering' to trigger the next step
    result = db.videoprojects.update_many({'status': 'assets_generated'}, {'$set': {'status': 'rendering'}})
    print(f"Triggered rendering for {result.modified_count} projects")
except Exception as e:
    print(f"Error: {e}")
