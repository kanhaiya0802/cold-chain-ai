import time
import random
import requests
import json

import os

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")

def get_active_shipments():
    try:
        response = requests.get(f"{API_URL}/shipments")
        if response.status_code == 200:
            shipments = response.json()
            # Filter only active ones if needed, or just simulate all for demo
            return shipments
    except Exception as e:
        print(f"Error fetching shipments: {e}")
    return []

def simulate_data():
    print("Starting Cold Chain AI 2.0 Simulator...")
    print(f"Connecting to {API_URL}/logs")
    
    # State tracking for smooth transitions
    truck_states = {}

    while True:
        shipments = get_active_shipments()
        if not shipments:
            print("No shipments found. Retrying in 5s...")
            time.sleep(5)
            continue
            
        for shipment in shipments:
            shipment_id = shipment['shipment_id']
            truck_id = shipment['truck_id']
            
            if shipment_id not in truck_states:
                # Initialize state (Bengaluru area base)
                truck_states[shipment_id] = {
                    "temp": 4.0,  # Safe start
                    "humidity": 45.0,
                    "lat": 12.9716 + random.uniform(-0.1, 0.1),
                    "lng": 77.5946 + random.uniform(-0.1, 0.1),
                    "battery": 100.0,
                    "door_open": False
                }
                
            state = truck_states[shipment_id]
            
            # Simulate drift
            # Random chance of temperature spike to trigger AI (simulating cooling unit failure)
            if random.random() < 0.05:
                state["temp"] += random.uniform(1.0, 2.0) # Spike!
            else:
                state["temp"] += random.uniform(-0.2, 0.3)
                
            # Keep temp somewhat realistic if it gets too high, let it cool down unless door is open
            if state["temp"] > 9.0:
                 state["temp"] -= random.uniform(0.5, 1.0)
            if state["temp"] < 2.0:
                 state["temp"] += random.uniform(0.1, 0.5)

            state["battery"] -= random.uniform(0.01, 0.1) # slow drain
            
            # Move truck slowly
            state["lat"] += random.uniform(-0.005, 0.005)
            state["lng"] += random.uniform(-0.005, 0.005)
            
            # Door
            state["door_open"] = random.random() < 0.02 # 2% chance door opens briefly
            if state["door_open"]:
                state["temp"] += 1.0 # Immediate temp rise if door open

            payload = {
                "shipment_id": shipment_id,
                "truck_id": truck_id,
                "temperature": round(state["temp"], 2),
                "humidity": round(state["humidity"], 1),
                "latitude": round(state["lat"], 5),
                "longitude": round(state["lng"], 5),
                "door_status": "open" if state["door_open"] else "closed",
                "battery_level": round(state["battery"], 1)
            }

            try:
                res = requests.post(f"{API_URL}/logs", json=payload)
                if res.status_code == 200:
                    status = "🚨 ALERT!" if payload["temperature"] > 8.0 else "✅ OK"
                    print(f"[Shipment {shipment_id} - Truck {truck_id}] Temp: {payload['temperature']}°C, Battery: {payload['battery_level']}% -> {status}")
                else:
                    print(f"Failed to push log: {res.status_code} - {res.text}")
            except Exception as e:
                print(f"Connection error: {e}")

        # Wait before next tick (increased to 10s to avoid Gemini rate limits)
        time.sleep(10)

if __name__ == "__main__":
    simulate_data()
