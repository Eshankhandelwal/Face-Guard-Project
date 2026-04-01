from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routes import auth, persons, alerts, items
from routes import auth, persons, alerts, items, reports
from broadcaster import broadcaster  # ← import from separate file
import os

Base.metadata.create_all(bind=engine)
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="FaceGuard API",
    description="Face Recognition Surveillance & Communication System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router,    prefix="/api/auth",    tags=["Authentication"])
app.include_router(persons.router, prefix="/api/persons", tags=["Missing Persons"])
app.include_router(alerts.router,  prefix="/api/alerts",  tags=["Alerts"])
app.include_router(items.router,   prefix="/api/items",   tags=["Lost Items"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await broadcaster.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        broadcaster.disconnect(websocket)

@app.get("/")
def root():
    return {"status": "running", "message": "FaceGuard API is online"}