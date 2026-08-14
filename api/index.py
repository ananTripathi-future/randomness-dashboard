import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

try:
    from main import app
except Exception as err:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(title="Randomness Test Lab Cloud API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/api/health")
    def health():
        return {
            "status": "online",
            "service": "Randomness Test Lab Cloud Backend (Vercel Mode)",
            "notice": f"Running in cloud mode: {err}"
        }
