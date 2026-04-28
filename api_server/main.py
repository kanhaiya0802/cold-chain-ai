from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load api_server/.env first (own config), then project root as fallback
_api_server_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_api_server_dir, ".env"), override=True)

from core.database import Base, engine
from routers import auth_router, logs_router, websocket_router, order_router, dispatch_router, agent_router, receiver_router, transport_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cold Chain AI Backend", version="1.0.0")

# CORS Setup
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    return {"status": "Backend API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint for load balancers and Cloud Run"""
    try:
        # Add database connectivity check if needed
        return {"status": "healthy", "service": "cold-chain-api"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}, 503
