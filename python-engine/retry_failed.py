from pymongo import MongoClient
import config

try:
    db = MongoClient(config.MONGODB_URI).get_default_database()
    result = db.videoprojects.update_many({'status': 'failed'}, {'$set': {'status': 'asset_generating', 'failReason': None}})
    print(f"Retried {result.modified_count} failed projects")
except Exception as e:
    print(f"Error: {e}")
