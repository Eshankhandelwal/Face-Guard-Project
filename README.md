# FaceGuard — Face Recognition Surveillance System

A full-stack AI-powered surveillance and communication system built for
police departments. Developed as a final year project at Jaipur Engineering
College and Research Centre, Dept. of Computer Science & Engineering.

## Team
- Manav Mudgal (22EJCCS125)
- Deepak Choudhary (22EJCCS069)
- Indresh Mehta (22EJCCS099)
- Kanika (22EJCCS104)

**Guide:** Ms. Kanika Bhutani — Assistant Professor, CSE

---

## What This Project Does

- Real-time face recognition using AI (DeepFace + OpenCV)
- Missing persons reporting and tracking with case reference numbers
- Live alerts via WebSocket when a face match is detected
- Role-based dashboards for Admin, Police Officers, and Citizens
- Interactive map showing alert locations across the city
- PDF report generation for missing person cases
- Photo upload search — upload any photo to search the database
- Lost item reporting and tracking

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python 3.11 + FastAPI             |
| Database   | SQLite (auto-created)             |
| Face AI    | DeepFace + OpenCV                 |
| Auth       | JWT tokens                        |
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Real-time  | WebSockets                        |
| Maps       | Leaflet.js + React-Leaflet        |
| Charts     | Recharts                          |
| PDF        | ReportLab                         |

---

## System Requirements

Before running this project make sure you have:

- **Python 3.11** (not 3.12, not 3.13, not 3.14 — must be 3.11)
- **Node.js 18 or above** (LTS version recommended)
- **Git**
- **4GB RAM minimum** (DeepFace loads ML models into memory)
- **2GB free disk space** (for Python packages and AI models)

---

## Installation — Step by Step

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/faceguard.git
cd faceguard
```

---

### Step 2 — Check Python version
```bash
python --version
# Must show Python 3.11.x
```

If you have a different version, download Python 3.11 from:
```
https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
```

During install — check "Add python.exe to PATH"

---

### Step 3 — Install backend packages
```bash
cd backend
py -3.11 -m pip install -r requirements.txt
```

This will take **5 to 10 minutes** — DeepFace and TensorFlow are large packages.
You will see lots of downloading text — that is normal, let it finish.

---

### Step 4 — Start the backend server
```bash
py -3.11 -m uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Test it by opening: http://localhost:8000/docs

---

### Step 5 — Install frontend packages (open a NEW terminal)
```bash
cd frontend
npm install
```

---

### Step 6 — Start the frontend
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in 300ms
➜  Local:   http://localhost:5173/
```

Open: http://localhost:5173

---

### Step 7 — Create Admin Account

**Option A — Via terminal (recommended):**
```bash
py -3.11 -c "import requests; r = requests.post('http://localhost:8000/api/auth/register', json={'name':'Admin','email':'admin@faceguard.com','password':'admin123','role':'admin'}); print(r.status_code, r.json())"
```

**Option B — Via website:**
1. Go to http://localhost:5173
2. Click Login → Register
3. Register with role Admin
   (Admin option only available on first registration)

---

## Running the Project (Every Time)

You need **two terminals open** every time you run the project:

**Terminal 1 — Backend:**
```bash
cd face-recognition-system/backend
py -3.11 -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd face-recognition-system/frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## Default Login Credentials

After creating admin via terminal:

| Role    | Email                   | Password  |
|---------|-------------------------|-----------|
| Admin   | admin@faceguard.com     | admin123  |

Officers and Citizens are created by Admin from the Manage Users page.

---

## Role Access

| Feature                | Admin | Officer | Citizen |
|------------------------|-------|---------|---------|
| Dashboard              | ✅    | ✅      | ✅      |
| Missing Persons        | ✅    | ✅      | ❌      |
| Add Missing Person     | ✅    | ✅      | ✅      |
| Alerts                 | ✅    | ✅      | ❌      |
| Alert Map              | ✅    | ✅      | ❌      |
| Photo Search           | ✅    | ✅      | ❌      |
| Live Camera            | ✅    | ✅      | ❌      |
| Lost Items             | ✅    | ✅      | ✅      |
| Track Case             | ❌    | ❌      | ✅      |
| Report Missing Person  | ❌    | ❌      | ✅      |
| Manage Users           | ✅    | ❌      | ❌      |
| Export PDF             | ✅    | ✅      | ❌      |
| My Profile             | ✅    | ✅      | ✅      |

---

## Project Structure
```
face-recognition-system/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLite database connection
│   ├── models.py            # Database table models
│   ├── schemas.py           # Request/response schemas
│   ├── face_engine.py       # DeepFace AI face matching
│   ├── broadcaster.py       # WebSocket live alerts
│   ├── requirements.txt     # Python packages
│   └── routes/
│       ├── auth.py          # Login, register, user management
│       ├── persons.py       # Missing persons + face matching
│       ├── alerts.py        # Alert management
│       ├── items.py         # Lost items
│       └── reports.py       # PDF report generation
│
└── frontend/
    ├── package.json         # Node packages
    ├── vite.config.js       # Vite config
    ├── tailwind.config.js   # Tailwind config
    └── src/
        ├── App.jsx          # Routes
        ├── main.jsx         # Entry point
        ├── api/
        │   └── client.js    # Axios API client
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useAlerts.js # WebSocket hook
        ├── components/
        │   ├── AdminSidebar.jsx
        │   ├── OfficerSidebar.jsx
        │   └── CitizenSidebar.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── MissingPersons.jsx
            ├── AddPerson.jsx
            ├── Alerts.jsx
            ├── LostItems.jsx
            ├── Camera.jsx
            ├── MapView.jsx
            ├── PhotoSearch.jsx
            ├── Profile.jsx
            ├── admin/
            │   ├── AdminDashboard.jsx
            │   └── AdminUsers.jsx
            ├── officer/
            │   ├── OfficerDashboard.jsx
            │   └── OfficerCamera.jsx
            └── citizen/
                ├── CitizenDashboard.jsx
                ├── CitizenReport.jsx
                └── TrackCase.jsx
```

---

## Common Errors and Fixes

| Error | Fix |
|-------|-----|
| `pip not recognized` | Use `py -3.11 -m pip install` instead |
| `uvicorn not found` | Use `py -3.11 -m uvicorn` instead |
| `deepface install fails` | Make sure Python is 3.11 exactly |
| `Cannot import broadcaster` | File `broadcaster.py` must be in backend/ folder |
| Camera not working | Use Chrome browser, click Allow when asked for camera |
| 500 error on photo search | Check backend terminal for Python traceback |
| Page not found on refresh | Normal in dev — use the sidebar links |
| Database error on start | Delete `face_recognition.db` and restart backend |
| Admin already exists | Delete `face_recognition.db` and re-register |

---

## Demo Flow for Viva

1. Open http://localhost:5173 — show the home page
2. Login as Admin — show the admin dashboard with charts
3. Go to Manage Users — add an Officer account
4. Login as Officer in another tab
5. Go to Missing Persons — report a missing person with a photo
6. Go to Live Camera — start scanning
7. Show the face match alert appearing in real time
8. Go to Alert Map — show the pin on the city map
9. Go to Photo Search — upload a photo to search
10. Download PDF Report for the case
11. Login as Citizen — show the report form and case tracking

---

## Notes

- The database file `face_recognition.db` is created automatically
  in the backend folder on first run
- Uploaded photos are saved in `backend/uploads/` folder
- DeepFace downloads AI model files on first use (~500MB)
  — this only happens once, then they are cached
- The project runs entirely offline after packages are installed
- For demo purposes the webcam acts as a CCTV camera
```

---

## File 4 — `.gitignore` (create in root folder)

This prevents large/sensitive files from being pushed to GitHub:
```
# Python
__pycache__/
*.py[cod]
*.pyo
.env
venv/
env/

# Database — don't push, recreated on each machine
backend/face_recognition.db

# Uploaded photos — don't push to GitHub
backend/uploads/

# DeepFace AI model cache — very large
.deepface/

# Node
node_modules/
frontend/dist/
frontend/.env.local
frontend/.env.production

# OS files
.DS_Store
Thumbs.db

# VS Code
.vscode/
*.code-workspace



# 1. Clone
git clone https://github.com/YOUR_USERNAME/faceguard.git
cd faceguard

# 2. Backend
cd backend
py -3.11 -m pip install -r requirements.txt
py -3.11 -m uvicorn main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open browser
# http://localhost:5173