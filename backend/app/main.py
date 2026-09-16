from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import vehicles, maintenances, fuels, expenses, dashboard, export, documents, tires, reminders

# Créer les tables dans la base de données (si elles n'existent pas encore)
#Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FleetManager Pro API",
    description="API de gestion de flotte de véhicules",
    version="1.0.0"
)

# Configuration CORS pour autoriser le frontend React (Vite) à communiquer avec le backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, remplacez "*" par l'URL exacte de votre frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion de tous les routeurs
app.include_router(vehicles.router)
app.include_router(maintenances.router)
app.include_router(fuels.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(export.router)
app.include_router(documents.router)
app.include_router(tires.router)
app.include_router(reminders.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API FleetManager Pro"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}