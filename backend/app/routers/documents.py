from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/documents", tags=["documents"])

# Créer le dossier uploads s'il n'existe pas
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/vehicles/{vehicle_id}/", response_model=schemas.Document)
async def upload_document(
    vehicle_id: int,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    # Nom de fichier unique pour éviter les écrasements
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{vehicle_id}_{timestamp}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Sauvegarde du fichier sur le disque
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Enregistrement en base de données
    db_doc = models.Document(
        vehicle_id=vehicle_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    return db_doc

@router.get("/vehicles/{vehicle_id}/", response_model=list[schemas.Document])
def get_vehicle_documents(vehicle_id: int, db: Session = Depends(get_db)):
    return db.query(models.Document).filter(models.Document.vehicle_id == vehicle_id).all()

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # Suppression du fichier physique
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    
    db.delete(doc)
    db.commit()
    return {"message": "Document supprimé avec succès"}