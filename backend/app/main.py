from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import vehicles, maintenances, fuels, expenses, dashboard, export, documents, tires, reminders
from .routers import naftal
from .routers import drivers

app = FastAPI(title="FleetManager Pro API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Enregistrement des routeurs avec le préfixe /api
app.include_router(vehicles.router, prefix="/api")
app.include_router(maintenances.router, prefix="/api")
app.include_router(fuels.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(tires.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")  # ✅ Cette ligne est cruciale
app.include_router(documents.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(naftal.router, prefix="/api")
app.include_router(drivers.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "FleetManager API is running!"}