# Kanban Board - Setup Guide

## Issues Fixed

### 1. Python 3.12 Compatibility
- Fixed `datetime.utcnow()` deprecation in Python 3.12
- Updated `backend/app/auth.py` to use `datetime.now(timezone.utc)`

### 2. bcrypt Compatibility
- Fixed bcrypt 5.0.0 incompatibility with passlib 1.7.4
- Downgraded to bcrypt 4.1.3
- Updated `requirements.txt` to pin bcrypt==4.1.3

### 3. Drag-and-Drop Performance (October 2025)
- **Optimistic UI Updates**: Task cards now move instantly when dragged, with API calls happening in the background
- **Eliminated Full Board Reloads**: Replaced costly full board reloads after drag operations with local state updates
- **Fixed Cursor Positioning**: Removed scale transforms that were causing cursor displacement during drag
- **Disabled Interfering Transitions**: Removed CSS transitions from Card component that caused jittery movement
- **Memoized Computations**: Optimized Column rendering to prevent unnecessary re-calculations
- **Removed Click Interference**: Eliminated TaskCard onClick handler that was interfering with drag gestures
- **Error Handling**: Added automatic rollback of UI changes if drag API call fails

**Result**: Drag-and-drop now feels perfectly smooth with cursor staying aligned with the card

## Running the Application

### Option 1: Manual Setup (Current - WSL/Windows)

#### Backend
```bash
cd /home/oganesson/kanbanboard/backend
source .kanbanboard/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd /home/oganesson/kanbanboard/frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Docker Compose (Mac/Home)

#### Prerequisites
- Docker and Docker Compose installed

#### Start Application
```bash
cd /home/oganesson/kanbanboard
docker-compose up --build
```

This will:
- Build and start both frontend and backend containers
- Create SQLite database automatically
- Enable hot-reload for development
- Map ports: 5173 (frontend), 8000 (backend)

#### Stop Application
```bash
docker-compose down
```

#### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Rebuild Containers
```bash
docker-compose up --build
```

## Environment Variables

### Backend (.env)
The backend uses these environment variables (defaults work for development):

```env
DATABASE_URL=sqlite:///./kanban.db
SECRET_KEY=development-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

For production, change SECRET_KEY to a strong random string and consider using PostgreSQL instead of SQLite.

## Test User

You can register a new user or use this test account:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@kanban.com

## Database

The SQLite database is created at `backend/kanban.db`. To reset:

```bash
cd backend
rm kanban.db
source .kanbanboard/bin/activate  # WSL only
python create_db.py
```

## Troubleshooting

### WSL Docker Issues
If you encounter TLS/certificate errors with Docker in WSL:
- Ensure Docker Desktop is running on Windows
- Check WSL integration is enabled in Docker Desktop settings
- May need to configure corporate proxy/firewall settings

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173  
lsof -ti:5173 | xargs kill -9
```

### Frontend Can't Connect to Backend
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py` (should include localhost:5173)
- Verify `VITE_API_URL` environment variable in frontend

## Development Notes

- Backend uses FastAPI with hot-reload enabled
- Frontend uses Vite with HMR (Hot Module Replacement)
- WebSocket connections for real-time updates
- JWT-based authentication

## File Structure

```
kanbanboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # API routes
│   │   ├── models.py        # Database models
│   │   ├── auth.py          # Authentication (FIXED)
│   │   ├── database.py      # DB config
│   │   └── websocket.py     # WebSocket manager
│   ├── requirements.txt     # Python deps (UPDATED)
│   └── kanban.db           # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── api/            # API client
│   └── package.json        # Node deps
└── docker-compose.yml      # Docker setup
```
