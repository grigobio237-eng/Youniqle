from pymongo import MongoClient
import config
import sys

try:
    db = MongoClient(config.MONGODB_URI).get_default_database()
    result = db.videoprojects.update_many({'status': 'script_generated'}, {'$set': {'status': 'asset_generating'}})
    print(f"Approved {result.modified_count} projects to asset_generating")
except Exception as e:
    print(f"Error: {e}")
