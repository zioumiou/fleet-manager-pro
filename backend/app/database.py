from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL non trouvé dans .env")

# Encoder l'URL pour gérer les caractères spéciaux dans le mot de passe
# Si l'URL contient déjà un mot de passe encodé, on l'utilise tel quel
# Sinon, on encode le mot de passe
if "@" in DATABASE_URL:
    # L'URL est déjà complète, on l'utilise
    engine_url = DATABASE_URL
else:
    # Fallback : construction manuelle
    raise ValueError("DATABASE_URL doit être une URL complète")

# Configuration PostgreSQL
engine = create_engine(
    engine_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"connect_timeout": 10}  # Timeout pour éviter les blocages
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()