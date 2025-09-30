# Kanban Board Application

A full-stack Kanban board application built with React TypeScript frontend and FastAPI backend, designed for small startup teams to manage their projects and tasks efficiently.

## Features

### Core Functionality
- **Kanban Board Interface**: Classic board view with customizable columns
- **Drag-and-Drop**: Smooth task movement between columns
- **Task Management**: Create, edit, and delete tasks with rich information
- **Customizable Columns**: Create, rename, and delete columns to fit your workflow

### Collaboration Features
- **Task Assignment**: Assign tasks to team members
- **Comments System**: In-task discussions with team members
- **User Mentions**: @mentions in comments for notifications
- **Tags/Labels**: Organize tasks with customizable tags

### Real-time Updates
- **WebSocket Integration**: Real-time updates across all connected clients
- **Live Collaboration**: See changes made by team members instantly

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Styled Components** for styling
- **React Beautiful DnD** for drag-and-drop
- **Axios** for API communication

### Backend
- **FastAPI** for the REST API
- **SQLAlchemy** for database ORM
- **SQLite** for development (easily switchable to PostgreSQL)
- **WebSockets** for real-time features
- **JWT** for authentication

## Project Structure

```
kanban_board/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Main API application
│   │   ├── models.py       # Database models
│   │   ├── database.py     # Database configuration
│   │   └── __init__.py
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── create_db.py        # Database initialization
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── types/          # TypeScript types
│   │   ├── api/            # API client
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
└── README.md              # This file
```

## Setup Instructions

### Quick Start with Docker (Recommended)

1. **Make sure Docker and Docker Compose are installed**

2. **Clone the repository and navigate to the project directory:**
   ```bash
   cd kanban_board
   ```

3. **Start the application:**
   ```bash
   docker-compose up --build
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Manual Setup

#### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URL and other configuration:
   ```
   DATABASE_URL=sqlite:///./kanban.db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Create database:**
   ```bash
   python create_db.py
   ```

6. **Run the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The frontend will be available at `http://localhost:5173`

## Database Migration

If you need to make changes to the database schema:

1. **Create a new migration:**
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   ```

2. **Apply migrations:**
   ```bash
   alembic upgrade head
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Boards
- `GET /boards` - Get all user boards
- `POST /boards` - Create a new board
- `GET /boards/{board_id}` - Get specific board

### Columns
- `POST /boards/{board_id}/columns` - Create a new column
- `PUT /columns/{column_id}` - Update column
- `DELETE /columns/{column_id}` - Delete column

### Tasks
- `POST /boards/{board_id}/tasks` - Create a new task
- `GET /tasks/{task_id}` - Get specific task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

### Comments
- `GET /tasks/{task_id}/comments` - Get task comments
- `POST /tasks/{task_id}/comments` - Create a new comment

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm run test
```

### Code Style
- Backend: Follow PEP 8 and use black for formatting
- Frontend: Use ESLint and Prettier for code formatting

## Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Install production dependencies: `pip install -r requirements.txt`
4. Run with a production WSGI server like Gunicorn:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
