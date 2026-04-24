import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time
import random
import datetime
import os

# Initialize Firebase Admin SDK
# To get your service account key:
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate new private key"
# 3. Save it as 'serviceAccountKey.json' in the same directory as this script.

SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), 'firebase-key.json')

def initialize_firestore():
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        # Fallback to check for serviceAccountKey.json if firebase-key.json is missing
        fallback_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        if os.path.exists(fallback_path):
            cred = credentials.Certificate(fallback_path)
        else:
            print(f"Error: Firebase key file not found.")
            print(f"Please ensure 'firebase-key.json' is in the 'simulator' directory.")
            return None
    else:
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    
    firebase_admin.initialize_app(cred)
    return firestore.client()

def simulate_data(db):
    truck_id = "TRUCK_001"
    print(f"Starting simulation for {truck_id}...")
    
    try:
        while True:
            # Generate dummy temperature (7°C to 12°C) - increased range to trigger alerts more often
            temperature = round(random.uniform(7.0, 12.0), 2)
            
            # Generate dummy GPS data (near a central point, e.g., Bangalore)
            latitude = round(12.9716 + random.uniform(-0.01, 0.01), 6)
            longitude = round(77.5946 + random.uniform(-0.01, 0.01), 6)
            
            data = {
                "truck_id": truck_id,
                "temperature": temperature,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "timestamp": firestore.SERVER_TIMESTAMP,
                "status": "normal" if temperature <= 8.0 else "warning"
            }
            
            # Push to Firestore
            db.collection("truck_logs").add(data)
            
            print(f"[{datetime.datetime.now()}] Sent: Temp={temperature}°C, Lat={latitude}, Lon={longitude}")
            
            # Wait for 15 seconds
            time.sleep(15)
            
    except KeyboardInterrupt:
        print("\nSimulation stopped by user.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    db = initialize_firestore()
    if db:
        simulate_data(db)
