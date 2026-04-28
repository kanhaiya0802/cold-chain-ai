from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from schemas import schemas
from services import crud
from core.database import get_db

router = APIRouter(tags=["dispatch"])

@router.get("/shipments", response_model=List[schemas.Shipment])
def get_shipments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # In a real system, you'd filter by role and user ID here as well
    return crud.get_shipments(db, skip=skip, limit=limit)

@router.get("/shipments/{shipment_id}", response_model=schemas.Shipment)
def get_shipment(shipment_id: int, db: Session = Depends(get_db)):
    shipment = crud.get_shipment_by_id(db, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.get("/trucks", response_model=List[schemas.Truck])
def get_trucks(db: Session = Depends(get_db)):
    return db.query(models.Truck).all()

@router.post("/shipments", response_model=schemas.Shipment)
def create_shipment(req: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    # In a full app, we'd also link the orders here
    shipment = crud.create_shipment(db, req)
    return shipment

@router.get("/alerts", response_model=List[schemas.Alert])
def get_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_active_alerts(db, limit=limit)

@router.get("/reports/daily")
def get_daily_report(db: Session = Depends(get_db)):
    from models import models
    from sqlalchemy import func
    import google.generativeai as genai
    import os
    
    # Inventory Summary
    total_inventory = db.query(func.sum(models.Inventory.total_quantity)).scalar() or 0
    reserved_inventory = db.query(func.sum(models.Inventory.reserved_quantity)).scalar() or 0
    low_stock_items = db.query(models.Inventory).filter(models.Inventory.available_quantity < 500).count()
    
    # Orders Summary
    total_orders = db.query(models.Order).count()
    pending_orders = db.query(models.Order).filter(models.Order.status == models.OrderStatusEnum.pending).count()
    reached_orders = db.query(models.Order).filter(models.Order.status == models.OrderStatusEnum.delivered).count() # Assuming delivered means reached
    
    # Alerts Summary
    active_alerts = db.query(models.Alert).filter(models.Alert.status == "active").count()
    delay_alerts = db.query(models.Alert).filter(models.Alert.alert_type == models.AlertTypeEnum.delay, models.Alert.status == "active").count()
    temp_alerts = db.query(models.Alert).filter(models.Alert.alert_type == models.AlertTypeEnum.temperature, models.Alert.status == "active").count()
    
    # Shipments
    active_shipments = db.query(models.Shipment).filter(models.Shipment.status == models.ShipmentStatusEnum.in_transit).count()
    
    stats = {
        "date": "Today",
        "inventory": {
            "total_units": total_inventory,
            "reserved_units": reserved_inventory,
            "low_stock_skus": low_stock_items
        },
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "reached": reached_orders
        },
        "shipments": {
            "active": active_shipments
        },
        "alerts": {
            "total_active": active_alerts,
            "delays": delay_alerts,
            "temperature_breaches": temp_alerts
        }
    }

    # Generate AI Summary
    ai_summary = "AI Summary unavailable. Check API Key."
    api_key = os.environ.get("VITE_GEMINI_API_KEY")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""
            Generate a professional, executive-level "Cold Chain Daily Operations Report" summary based on these stats:
            - Total Inventory: {total_inventory} units
            - Reserved Units: {reserved_inventory}
            - Total Orders: {total_orders} (Pending: {pending_orders}, Reached: {reached_orders})
            - Active Shipments: {active_shipments}
            - Total Active Alerts: {active_alerts} (Delays: {delay_alerts}, Temp Breaches: {temp_alerts})

            Structure the response as:
            1. Executive Summary (2 sentences)
            2. Detailed Order Breakdown
            3. Risk & Mitigation Advice

            Use professional logistics terminology. Keep it concise but insightful. Format with Markdown.
            """
            response = model.generate_content(prompt)
            ai_summary = response.text
        except Exception as e:
            if "429" in str(e) or "ResourceExhausted" in str(e):
                ai_summary = "⚠️ Gemini API Rate Limit reached (Free Tier). Please wait 60 seconds before generating a new report. The automated risk engine is currently active and using the available quota."
            else:
                ai_summary = f"Error generating AI summary: {str(e)}"

    stats["ai_narrative"] = ai_summary
    return stats
