from pymongo import MongoClient
import config
import logging

try:
    db = MongoClient(config.MONGODB_URI).get_default_database()
    pending = db.videoprojects.count_documents({'status': 'pending'})
    script_gen = db.videoprojects.count_documents({'status': 'script_generated'})
    asset_gen = db.videoprojects.count_documents({'status': 'asset_generating'})
    assets_done = db.videoprojects.count_documents({'status': 'assets_generated'})
    
    print(f"Pending: {pending}")
    print(f"Script Generated: {script_gen}")
    print(f"Asset Generating: {asset_gen}")
    print(f"Assets Generated: {assets_done}")
    
    # List latest project status
    latest = db.videoprojects.find_one(sort=[('_id', -1)])
    if latest:
        print(f"Latest Project ID: {latest['_id']}")
        print(f"Latest Project Status: {latest['status']}")
        if 'failReason' in latest:
            print(f"Fail Reason: {latest['failReason']}")

except Exception as e:
    print(f"Error: {e}")
