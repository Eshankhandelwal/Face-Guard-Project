from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import LostItem
from schemas import LostItemOut
from typing import List, Optional
import os, shutil, uuid

router = APIRouter()
UPLOAD_DIR = "uploads"


@router.post("/add")
async def add_lost_item(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    last_seen_location: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    photo_url = None
    if photo and photo.filename:
        ext = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_url = f"/uploads/{filename}"

    item = LostItem(
        name=name,
        description=description,
        category=category,
        last_seen_location=last_seen_location,
        contact_number=contact_number,
        photo_url=photo_url,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Lost item reported successfully", "id": item.id}


@router.get("/", response_model=List[LostItemOut])
def get_items(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LostItem)
    if status:
        query = query.filter(LostItem.status == status)
    return query.order_by(LostItem.created_at.desc()).all()


@router.put("/{item_id}/status")
def update_item_status(item_id: int, status: str, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if item:
        item.status = status
        db.commit()
    return {"message": "Updated"}