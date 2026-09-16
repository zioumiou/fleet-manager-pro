from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import vehicles, maintenances, fuels, expenses, dashboard, export, documents, tires, reminders

app = FastAPI(title="FleetManager Pro API")

# ✅ Middleware CORS - DOIT être ajouté AVANT les routeurs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fleet-manager-pro-six.vercel.app",
        "https://fleet-manager-pro.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# ✅ Middleware supplémentaire pour forcer les headers CORS sur toutes les réponses
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Enregistrement des routeurs
app.include_router(vehicles.router, prefix="/api")
app.include_router(maintenances.router, prefix="/api")
app.include_router(fuels.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(tires.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(export.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "FleetManager API is running!", "status": "healthy"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}