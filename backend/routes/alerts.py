from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Alert, MissingPerson, LostItem
from typing import Optional

router = APIRouter()


@router.get("/")
def get_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.created_at.desc()).limit(100).all()

    result = []
    for alert in alerts:
        person = db.query(MissingPerson).filter(MissingPerson.id == alert.person_id).first()
        result.append({
            "id": alert.id,
            "person_id": alert.person_id,
            "person_name": person.name if person else "Unknown",
            "person_photo": person.photo_url if person else None,
            "confidence": alert.confidence,
            "location": alert.location,
            "camera_id": alert.camera_id,
            "screenshot_url": alert.screenshot_url,
            "status": alert.status,
            "created_at": alert.created_at.isoformat()
        })
    return result


@router.put("/{alert_id}/status")
def update_alert_status(alert_id: int, status: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
    return {"message": "Alert status updated"}


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return {
        "total_missing": db.query(MissingPerson).filter(MissingPerson.status == "missing").count(),
        "total_found": db.query(MissingPerson).filter(MissingPerson.status == "found").count(),
        "total_alerts": db.query(Alert).count(),
        "new_alerts": db.query(Alert).filter(Alert.status == "new").count(),
        "total_lost_items": db.query(LostItem).filter(LostItem.status == "lost").count(),
    }