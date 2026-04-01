import numpy as np
import json
import os

# Try importing DeepFace — falls back to mock if not installed yet
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    print("✅ DeepFace loaded successfully")
except Exception as e:
    DEEPFACE_AVAILABLE = False
    print(f"⚠️  DeepFace not available, running in MOCK mode: {e}")


def extract_face_encoding(image_path: str):
    """
    Extract 128-dimensional face embedding from image.
    Returns list of floats, or None if no face detected.
    """
    if not DEEPFACE_AVAILABLE:
        # Mock mode: return random vector for testing
        print(f"[MOCK] Generating fake encoding for {image_path}")
        return np.random.rand(128).tolist()

    try:
        result = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet",          # Fast and accurate
            enforce_detection=False,       # Don't crash if no face found
            detector_backend="opencv"
        )
        if result and len(result) > 0:
            return result[0]["embedding"]
        return None
    except Exception as e:
        print(f"[ERROR] Face encoding failed: {e}")
        return None


def cosine_similarity(v1: list, v2: list) -> float:
    """Compute cosine similarity between two vectors. Returns 0.0–1.0."""
    a = np.array(v1)
    b = np.array(v2)
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(dot / norm)


def compare_faces(encoding1: list, encoding2: list, threshold: float = 0.7) -> tuple:
    """
    Compare two face encodings.
    Returns: (is_match: bool, confidence_percent: float)
    """
    if not encoding1 or not encoding2:
        return False, 0.0

    similarity = cosine_similarity(encoding1, encoding2)
    confidence = round(similarity * 100, 2)
    is_match = similarity >= threshold

    return is_match, confidence


def match_face_against_database(image_path: str, db_persons: list) -> list:
    """
    Match a face image against all missing persons in DB.
    
    Args:
        image_path: path to the captured face image
        db_persons: list of MissingPerson ORM objects
    
    Returns:
        List of dicts: [{"person": <MissingPerson>, "confidence": float}]
        Sorted by confidence descending.
    """
    query_encoding = extract_face_encoding(image_path)
    if query_encoding is None:
        print("[INFO] No face detected in uploaded image")
        return []

    matches = []
    for person in db_persons:
        if not person.face_encoding:
            continue

        try:
            stored_encoding = json.loads(person.face_encoding)
        except Exception:
            continue

        is_match, confidence = compare_faces(query_encoding, stored_encoding)

        if is_match and confidence > 65.0:
            matches.append({
                "person": person,
                "confidence": confidence
            })
            print(f"[MATCH] {person.name} — {confidence:.1f}%")

    # Best match first
    matches.sort(key=lambda x: x["confidence"], reverse=True)
    return matches