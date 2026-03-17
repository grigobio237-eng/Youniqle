import datetime

# Simple in-memory quota tracking for prototype
# TODO: Persist using DB or File

DAILY_LIMIT = 5
current_count = 0
last_reset = datetime.date.today()

def check_quota():
    global current_count, last_reset
    today = datetime.date.today()
    
    if today > last_reset:
        current_count = 0
        last_reset = today
        
    return current_count < DAILY_LIMIT

def increment_quota():
    global current_count
    current_count += 1
