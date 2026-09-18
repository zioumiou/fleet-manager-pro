from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import uuid
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/documents", tags=["documents"])

# Dossier de stockage des documents
UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/vehicles/{vehicle_id}/", response_model=schemas.Document)
async def upload_document(
    vehicle_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Vérifier que le véhicule existe
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    # Valider le type de fichier
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Type de fichier non autorisé. Types acceptés: PDF, JPG, PNG"
        )
    
    # Générer un nom de fichier unique
    file_extension = file.filename.split(".")[-1] if file.filename else "pdf"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Sauvegarder le fichier
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Créer l'entrée en base de données
    db_document = models.Document(
        vehicle_id=vehicle_id,
        document_type=document_type,
        file_path=file_path,
        file_name=file.filename or "document",
        file_size=len(content),
        upload_date=datetime.now().date()
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return db_document

@router.get("/vehicles/{vehicle_id}/", response_model=List[schemas.Document])
def get_vehicle_documents(vehicle_id: int, db: Session = Depends(get_db)):
    documents = db.query(models.Document).filter(
        models.Document.vehicle_id == vehicle_id
    ).all()
    return documents

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # Supprimer le fichier physique
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Supprimer l'entrée de la base de données
    db.delete(document)
    db.commit()
    
    return {"message": "Document supprimé avec succès"}

@router.get("/{document_id}/download")
async def download_document(document_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé sur le serveur")
    
    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type="application/octet-stream"
    )