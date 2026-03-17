from pymongo import MongoClient
import config

try:
    db = MongoClient(config.MONGODB_URI).get_default_database()
    # Reset latest project to 'assets_generated' to test the modal
    latest = db.videoprojects.find_one(sort=[('_id', -1)])
    if latest:
        db.videoprojects.update_one({'_id': latest['_id']}, {'$set': {'status': 'assets_generated'}})
        print(f"Reset project {latest['_id']} to 'assets_generated'")
    else:
        print("No project found")
except Exception as e:
    print(f"Error: {e}")
