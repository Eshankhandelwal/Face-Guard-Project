from broadcaster import broadcaster
from routes.auth import require_officer, require_any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from database import get_db
from models import MissingPerson, Alert
from schemas import MissingPersonOut
from face_engine import extract_face_encoding, match_face_against_database, compare_faces
from typing import List, Optional
import json, os, shutil, uuid
import json

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload(file: UploadFile) -> tuple[str, str]:
    """Save uploaded file. Returns (filepath, url)."""
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return filepath, f"/uploads/{filename}"


# @router.post("/add")
# async def add_missing_person(
#     name: str = Form(...),
#     age: Optional[int] = Form(None),
#     gender: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     last_seen_location: Optional[str] = Form(None),
#     contact_number: Optional[str] = Form(None),
#     photo: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):

@router.post("/add")
async def add_missing_person(
    name: str = Form(...),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    last_seen_location: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_officer)  # ← Officers and admins only
):

    # 1. Save photo to disk
    filepath, photo_url = save_upload(photo)

    # 2. Extract face encoding using DeepFace
    encoding = extract_face_encoding(filepath)
    if encoding is None:
        print(f"[WARN] No face detected in photo for {name}")

    # 3. Store in database
    person = MissingPerson(
        name=name,
        age=age,
        gender=gender,
        description=description,
        last_seen_location=last_seen_location,
        contact_number=contact_number,
        photo_url=photo_url,
        face_encoding=json.dumps(encoding) if encoding else None,
    )
    db.add(person)
    db.commit()
    db.refresh(person)

    return {
        "message": "Missing person added successfully",
        "id": person.id,
        "face_detected": encoding is not None
    }


@router.get("/", response_model=List[MissingPersonOut])
def get_all_persons(
    status: Optional[str] = None,
    search: Optional[str] = None,
    gender: Optional[str] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MissingPerson)

    if status:
        query = query.filter(MissingPerson.status == status)
    if search:
        query = query.filter(MissingPerson.name.ilike(f"%{search}%"))
    if gender:
        query = query.filter(MissingPerson.gender == gender)
    if age_min is not None:
        query = query.filter(MissingPerson.age >= age_min)
    if age_max is not None:
        query = query.filter(MissingPerson.age <= age_max)

    return query.order_by(MissingPerson.created_at.desc()).all()


@router.get("/{person_id}", response_model=MissingPersonOut)
def get_person(person_id: int, db: Session = Depends(get_db)):
    person = db.query(MissingPerson).filter(MissingPerson.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


# @router.post("/match-face")
# async def match_face(
#     photo: UploadFile = File(...),
#     camera_id: Optional[str] = Form("CAM-01"),
#     location: Optional[str] = Form("Unknown Location"),
#     db: Session = Depends(get_db)
# ):

@router.post("/match-face")
async def match_face(
    photo: UploadFile = File(...),
    camera_id: Optional[str] = Form("CAM-01"),
    location: Optional[str] = Form("Unknown Location"),
    db: Session = Depends(get_db),
    current_user = Depends(require_officer)  # ← Officers only
):
    
    """
    Core API: Upload an image → match against all missing persons → create alerts.
    This is called by the Camera page every 5 seconds when scanning.
    """
    filepath, screenshot_url = save_upload(photo)

    # Get all active missing persons
    persons = db.query(MissingPerson).filter(MissingPerson.status == "missing").all()

    # Run face matching
    matches = match_face_against_database(filepath, persons)

    # Create alert for each match
    alerts_created = []
    for match in matches:
        alert = Alert(
            person_id=match["person"].id,
            confidence=match["confidence"],
            location=location,
            camera_id=camera_id,
            screenshot_url=screenshot_url,
            status="new"
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        alerts_created.append({
            "alert_id": alert.id,
            "person_name": match["person"].name,
            "person_id": match["person"].id,
            "confidence": match["confidence"]
        })

        await broadcaster.broadcast({
    "type": "NEW_ALERT",
    "alert_id": alert.id,
    "person_name": match["person"].name,
    "person_id": match["person"].id,
    "confidence": match["confidence"],
    "location": location,
    "camera_id": camera_id,
    "screenshot_url": screenshot_url,
    "created_at": alert.created_at.isoformat()
})

    # Cleanup if no match
    if not matches and os.path.exists(filepath):
        os.remove(filepath)

    return {
        "matches_found": len(matches),
        "alerts": alerts_created
    }


@router.put("/{person_id}/status")
def update_status(person_id: int, status: str, db: Session = Depends(get_db)):
    person = db.query(MissingPerson).filter(MissingPerson.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Not found")
    person.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}


@router.get("/track/{case_ref}")
def track_case(case_ref: str, db: Session = Depends(get_db)):
    """
    Public endpoint — no auth required.
    Citizens use this to track their case by reference number.
    Case reference format: FG-YEAR-ID (e.g. FG-2025-0001)
    """
    try:
        # Parse case reference FG-2025-0001 → person_id = 1
        parts = case_ref.upper().strip().split("-")
        if len(parts) != 3 or parts[0] != "FG":
            raise HTTPException(
                status_code=400,
                detail="Invalid case reference. Format should be FG-YEAR-ID (e.g. FG-2025-0001)"
            )
        person_id = int(parts[2])
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid case reference format"
        )

    person = db.query(MissingPerson).filter(
        MissingPerson.id == person_id
    ).first()

    if not person:
        raise HTTPException(
            status_code=404,
            detail="No case found with this reference number"
        )

    # Get alerts for this case
    alerts = db.query(Alert).filter(
        Alert.person_id == person_id
    ).order_by(Alert.created_at.desc()).all()

    # Build timeline events
    timeline = []

    # Event 1 — Case reported
    timeline.append({
        "event":       "Case Reported",
        "description": f"Missing person report filed for {person.name}",
        "timestamp":   person.created_at.isoformat() if person.created_at else None,
        "type":        "reported",
        "icon":        "filed"
    })

    # Event 2+ — Each alert
    for alert in reversed(alerts):
        timeline.append({
            "event":       "Face Match Detected",
            "description": f"Possible match detected at {alert.location or 'unknown location'} "
                           f"via {alert.camera_id or 'camera'} "
                           f"with {alert.confidence:.1f}% confidence",
            "timestamp":   alert.created_at.isoformat() if alert.created_at else None,
            "type":        "alert",
            "confidence":  alert.confidence,
            "location":    alert.location,
            "camera_id":   alert.camera_id,
            "status":      alert.status,
            "icon":        "camera"
        })

        if alert.status == "reviewed":
            timeline.append({
                "event":       "Alert Reviewed",
                "description": "A police officer has reviewed this alert and is taking action",
                "timestamp":   alert.created_at.isoformat() if alert.created_at else None,
                "type":        "reviewed",
                "icon":        "officer"
            })

    # Final event — if found
    if person.status == "found":
        timeline.append({
            "event":       "Person Found",
            "description": f"{person.name} has been located and the case is now closed",
            "timestamp":   None,
            "type":        "found",
            "icon":        "found"
        })

    from datetime import datetime
    year = person.created_at.year if person.created_at else datetime.now().year

    return {
        "case_ref":    f"FG-{year}-{person_id:04d}",
        "name":        person.name,
        "age":         person.age,
        "gender":      person.gender,
        "status":      person.status,
        "last_seen":   person.last_seen_location,
        "reported_on": person.created_at.isoformat() if person.created_at else None,
        "photo_url":   person.photo_url,
        "total_alerts": len(alerts),
        "timeline":    timeline,
        "contact":     person.contact_number,
    }

@router.post("/search-by-photo")
async def search_by_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_officer)
):
    """
    Upload any photo → search entire missing persons database
    Returns ranked list of matches with confidence scores
    """
    filepath, screenshot_url = save_upload(photo)

    # Get all missing persons who have face encodings
    persons = db.query(MissingPerson).filter(
        MissingPerson.status == "missing",
        MissingPerson.face_encoding != None
    ).all()

    if not persons:
        return {
            "matches": [],
            "total_searched": 0,
            "message": "No missing persons with face data found in database"
        }

    # Run face matching
    matches = match_face_against_database(filepath, persons)

    # Build result — include ALL persons with their scores
    # not just matches above threshold
    query_encoding = extract_face_encoding(filepath)

    all_results = []
    for person in persons:
        if not person.face_encoding:
            continue
        try:
            stored_enc = json.loads(person.face_encoding)
        except Exception:
            continue

        is_match, confidence = compare_faces(query_encoding, stored_enc)

        all_results.append({
            "person_id":           person.id,
            "name":                person.name,
            "age":                 person.age,
            "gender":              person.gender,
            "last_seen_location":  person.last_seen_location,
            "contact_number":      person.contact_number,
            "photo_url":           person.photo_url,
            "status":              person.status,
            "confidence":          round(confidence, 2),
            "is_match":            is_match,
            "created_at":          person.created_at.isoformat()
                                   if person.created_at else None
        })

    # Sort by confidence — best match first
    all_results.sort(key=lambda x: x["confidence"], reverse=True)

    # Cleanup uploaded file after use
    if os.path.exists(filepath):
        os.remove(filepath)

    matched = [r for r in all_results if r["is_match"]]

    return {
        "matches":        matched,
        "all_results":    all_results[:10],  # Top 10 regardless of threshold
        "total_searched": len(persons),
        "matches_found":  len(matched),
        "query_photo":    screenshot_url,
        "message":        f"Found {len(matched)} match(es) out of {len(persons)} persons searched"
    }