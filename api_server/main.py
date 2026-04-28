from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load env variables (for Gemini API Key)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), "client_web_app", ".env"))

from core.database import Base, engine
from routers import auth_router, logs_router, websocket_router, order_router, dispatch_router, agent_router, receiver_router, transport_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cold Chain AI Backend")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(logs_router.router)
app.include_router(websocket_router.router)
app.include_router(order_router.router)
app.include_router(dispatch_router.router)
app.include_router(agent_router.router)
app.include_router(receiver_router.router)
app.include_router(transport_router.router)

@app.get("/")
def read_root():
    return {"status": "Backend API is running"}
