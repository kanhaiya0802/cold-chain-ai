from sqlalchemy.orm import Session
from core.database import SessionLocal, engine, Base
from models import models
from core.auth import get_password_hash
from datetime import datetime, timedelta, timezone
import random

import sys

def seed_db():
    db = SessionLocal()
    
    # If not forcing, check if data already exists
    if "--force" not in sys.argv:
        if db.query(models.User).first():
            print("Database already populated. Skipping seed. (Run with --force to wipe and reseed)")
            return

    print("Dropping existing tables and creating new schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


    # --- Users ---
    print("Seeding Users...")
    hashed = get_password_hash("password123")
    
    # 3 Senders
    senders_data = [
        {"username": "sender_1", "name": "Rajesh Kumar", "org": "North Bengaluru Pharma Hub", "verified": True, "id": "V-KA-9921"},
        {"username": "sender_2", "name": "Anita Desai", "org": "South Logistics Center", "verified": True, "id": "V-KA-8872"},
        {"username": "sender_3", "name": "Vikram Singh", "org": "Central City Cold-Storage", "verified": False, "id": None},
    ]
    
    # 4 Receivers
    receivers_data = [
        {"username": "receiver_1", "name": "Dr. Aruna", "org": "Apollo Hospital Jayanagar", "verified": True},
        {"username": "receiver_2", "name": "Dr. Benson", "org": "Manipal Health Mall", "verified": True},
        {"username": "receiver_3", "name": "Clinic Admin", "org": "City Wellness Clinic", "verified": False},
        {"username": "receiver_4", "name": "Hosp. Supply", "org": "Fortis Hospital Bannerghatta", "verified": True},
    ]
    
    # 4 Drivers
    drivers_data = [
        {"username": "driver_1", "name": "Suresh G", "org": "Rapid Cold-Chain"},
        {"username": "driver_2", "name": "Sam Rivers", "org": "Swift Pharma Logics"},
        {"username": "driver_3", "name": "Rahul M", "org": "City Couriers"},
        {"username": "driver_4", "name": "David L", "org": "Express Cold-Link"},
    ]

    db_users = {}
    
    for s in senders_data:
        user = models.User(name=s["name"], email=f"{s['username']}@test.com", role=models.RoleEnum.sender, organization_name=s["org"], password_hash=hashed, is_verified=s["verified"], verification_id=s["id"])
        db.add(user); db.commit(); db.refresh(user)
        db_users[s["username"]] = user

    for r in receivers_data:
        user = models.User(name=r["name"], email=f"{r['username']}@test.com", role=models.RoleEnum.receiver, organization_name=r["org"], password_hash=hashed, is_verified=r["verified"])
        db.add(user); db.commit(); db.refresh(user)
        db_users[r["username"]] = user

    for d in drivers_data:
        user = models.User(name=d["name"], email=f"{d['username']}@test.com", role=models.RoleEnum.driver, organization_name=d["org"], password_hash=hashed, is_verified=True)
        db.add(user); db.commit(); db.refresh(user)
        db_users[d["username"]] = user

    # --- Trucks ---
    print("Seeding Trucks...")
    trucks = [
        models.Truck(truck_number="KA-01-AX-1234", driver_id=db_users["driver_1"].user_id, capacity=1500.0, current_status=models.TruckStatusEnum.in_transit),
        models.Truck(truck_number="KA-05-MM-5678", driver_id=db_users["driver_2"].user_id, capacity=2000.0, current_status=models.TruckStatusEnum.in_transit),
        models.Truck(truck_number="KA-03-PL-9012", driver_id=db_users["driver_3"].user_id, capacity=1200.0, current_status=models.TruckStatusEnum.available),
        models.Truck(truck_number="KA-02-ZZ-4432", driver_id=db_users["driver_4"].user_id, capacity=2500.0, current_status=models.TruckStatusEnum.in_transit),
    ]
    db.add_all(trucks); db.commit()
    for t in trucks: db.refresh(t)

    # --- Inventory ---
    print("Seeding Inventory...")
    items = [
        ("Insulin Glargine", models.InventoryCategoryEnum.vaccine, 2.0, 8.0, 5000),
        ("COVID-19 mRNA", models.InventoryCategoryEnum.vaccine, -25.0, -15.0, 2000),
        ("Hepatitis B", models.InventoryCategoryEnum.vaccine, 2.0, 8.0, 3000),
        ("Adrenaline", models.InventoryCategoryEnum.medicine, 15.0, 25.0, 1000),
    ]
    
    db_inv = []
    for sender_un in ["sender_1", "sender_2"]:
        for name, cat, min_t, max_t, qty in items:
            inv = models.Inventory(sender_id=db_users[sender_un].user_id, item_name=name, category=cat, min_temperature=min_t, max_temperature=max_t, total_quantity=qty, available_quantity=qty)
            db.add(inv); db.commit(); db.refresh(inv)
            db_inv.append(inv)

    # --- Orders & Shipments ---
    print("Seeding Logistics Flow...")
    
    # 1. Apollo Hospital orders from North Hub
    order1 = models.Order(receiver_id=db_users["receiver_1"].user_id, sender_id=db_users["sender_1"].user_id, required_delivery_date=datetime.now(timezone.utc) + timedelta(days=1), status=models.OrderStatusEnum.dispatched, priority=models.PriorityEnum.critical)
    db.add(order1); db.commit(); db.refresh(order1)
    
    ship1 = models.Shipment(truck_id=trucks[0].truck_id, sender_id=db_users["sender_1"].user_id, start_time=datetime.now(timezone.utc) - timedelta(hours=2), shipment_status=models.ShipmentStatusEnum.in_transit)
    db.add(ship1); db.commit(); db.refresh(ship1)
    
    db.add(models.ShipmentOrder(shipment_id=ship1.shipment_id, order_id=order1.order_id, delivery_sequence=1, receiver_id=db_users["receiver_1"].user_id))

    # --- Sensor Logs ---
    print("Seeding Real-time Telemetry...")
    db.add(models.SensorLog(shipment_id=ship1.shipment_id, truck_id=trucks[0].truck_id, temperature=4.5, humidity=42.0, latitude=12.9750, longitude=77.6000, door_status="closed", battery_level=88.0))
    
    db.commit()
    print("Database Seeded Successfully!")

if __name__ == "__main__":
    seed_db()
