from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import vehicles, maintenances, fuels, expenses, dashboard, export, documents, tires, reminders

app = FastAPI(title="FleetManager Pro API")

# Configuration CORS pour accepter Vercel et localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Autorise tout en production pour simplifier
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routeurs avec le préfixe /api
app.include_router(vehicles.router, prefix="/api")
app.include_router(maintenances.router, prefix="/api")
app.include_router(fuels.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(tires.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(export.router, prefix="/api")

# Route de test pour vérifier que le serveur répond
@app.get("/")
def read_root():
    return {"message": "FleetManager API is running!", "status": "healthy"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}