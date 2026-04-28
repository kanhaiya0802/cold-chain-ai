from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import jwt
import os

from schemas import schemas
from services import crud
from core.database import get_db

from core.auth import get_current_user
from models import models

router = APIRouter(tags=["orders"])

@router.get("/inventory", response_model=List[schemas.Inventory])
def get_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # If the user is a sender, only show their inventory
    sender_id = current_user.user_id if current_user.role == "sender" else None
    return crud.get_inventory(db, sender_id=sender_id, skip=skip, limit=limit)

@router.get("/batches", response_model=List[schemas.Batch])
def get_batches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_batches(db, skip=skip, limit=limit)

@router.get("/orders", response_model=List[schemas.Order])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_orders(db, user_id=current_user.user_id, role=current_user.role, skip=skip, limit=limit)

@router.post("/orders/{order_id}/approve", response_model=schemas.Order)
def approve_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "sender":
        raise HTTPException(status_code=403, detail="Only senders can approve orders")
        
    order, msg = crud.approve_order(db, order_id)
    if not order:
        raise HTTPException(status_code=400, detail=msg)
    return order

@router.post("/orders/{order_id}/pack", response_model=schemas.Order)
def pack_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "sender":
        raise HTTPException(status_code=403, detail="Only senders can pack orders")
        
    order, msg = crud.pack_order(db, order_id)
    if not order:
        raise HTTPException(status_code=400, detail=msg)
    return order
