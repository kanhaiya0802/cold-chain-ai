# Cold Chain AI - Docker Compose Setup (Simple & Easy)

## 🎯 One-Click Deployment

This setup uses Docker Compose to run everything locally with a single command.

---

## 📋 Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- **Git** (to clone the project)

Verify installation:
```powershell
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Navigate to Project Root
```powershell
cd E:\codes\Cold-cahin-ai\cold-chain-ai

# Verify you see these files:
ls docker-compose.yml
ls .env.docker
ls Dockerfile  # in api_server and client_web_app
```

### Step 2: Start All Services
```powershell
# This starts: Database, Backend API, and Frontend
docker-compose up -d

# Wait 30 seconds for everything to start...
```

### Step 3: Access Your Application
```
Frontend: http://localhost:3000
Backend:  http://localhost:8000
Database: localhost:5432
```

---

## 🎨 Access Your App

### Login Page
Open in browser: **http://localhost:3000**

### Test Credentials (from seed.py)
```
Username: sender_1
Password: password123

Or:
Username: driver_1
Password: password123

Or:
Username: receiver_1
Password: password123
```

---

## 📊 Docker Compose Services

### 1. PostgreSQL Database
- **Container:** `cold-chain-db`
- **Port:** 5432 (accessible from host)
- **Username:** postgres
- **Password:** password123 (from .env.docker)
- **Database:** cold_chain_ai

### 2. Backend API (FastAPI)
- **Container:** `cold-chain-api`
- **Port:** 8000 (accessible at http://localhost:8000)
- **Auto-reload:** Yes (code changes apply instantly)
- **API Docs:** http://localhost:8000/docs

### 3. Frontend (React + Nginx)
- **Container:** `cold-chain-web`
- **Port:** 3000 (accessible at http://localhost:3000)
- **Built from:** client_web_app/

---

## 🛠️ Common Docker Commands

### View All Containers
```powershell
docker ps

# See all (including stopped):
docker ps -a
```

### View Logs
```powershell
# Backend logs
docker logs cold-chain-api

# Follow backend logs (real-time)
docker logs -f cold-chain-api

# Frontend logs
docker logs -f cold-chain-web

# Database logs
docker logs -f cold-chain-db
```

### Stop Services
```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### Rebuild Services
```powershell
# Rebuild if you changed Dockerfile
docker-compose build

# Rebuild and start
docker-compose up -d --build
```

### Access Database
```powershell
# Connect to PostgreSQL
docker exec -it cold-chain-db psql -U postgres -d cold_chain_ai

# Inside psql:
\dt          # List all tables
\du          # List users
SELECT * FROM "user";  # Query users table
\q           # Exit
```

### Access Container Shell
```powershell
# Backend shell
docker exec -it cold-chain-api bash

# Frontend shell
docker exec -it cold-chain-web sh

# Database shell
docker exec -it cold-chain-db bash
```

---

## 📝 File Structure

```
cold-chain-ai/
├── docker-compose.yml          # Main orchestration file
├── .env.docker                 # Configuration (passwords, secrets)
├── api_server/
│   ├── Dockerfile              # Backend container
│   ├── main.py
│   ├── requirements.txt
│   └── ... (other backend files)
├── client_web_app/
│   ├── Dockerfile              # Frontend container
│   ├── nginx.conf              # Web server config
│   ├── package.json
│   └── src/
└── ... (other files)
```

---

## ⚙️ Configuration

Edit `.env.docker` to change settings:

```env
# Database password
DB_PASSWORD=password123

# JWT secret (change this!)
JWT_SECRET=your-secret-jwt-key-change-this

# Database connection string
DATABASE_URL=postgresql://postgres:password123@db:5432/cold_chain_ai

# API URL for frontend
VITE_API_URL=http://localhost:8000

# CORS allowed origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

After changing `.env.docker`, restart services:
```powershell
docker-compose down
docker-compose up -d
```

---

## 🆘 Troubleshooting

### Problem: "Database is not ready"
**Solution:** Wait 10-15 seconds for database to start
```powershell
# Check database status
docker logs cold-chain-db

# Wait and restart
docker-compose restart db
docker-compose restart backend
```

### Problem: "Port 3000 already in use"
**Solution:** Stop the other service or use different port
```powershell
# Kill process using port 3000
netstat -ano | findstr :3000  # Find process
taskkill /PID <PID> /F         # Kill it

# Or change port in docker-compose.yml:
# Change "3000:80" to "3001:80"
```

### Problem: "Backend can't connect to database"
**Solution:** Check database is running
```powershell
docker ps  # Is cold-chain-db running?
docker logs cold-chain-db  # Check for errors
```

### Problem: "Frontend showing 'Cannot find module'"
**Solution:** Rebuild frontend
```powershell
docker-compose down
docker-compose up -d --build
```

### Problem: "API returns CORS error"
**Solution:** Check ALLOWED_ORIGINS in .env.docker
```env
# Should include your frontend URL:
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🔄 Development Workflow

### Changing Backend Code
1. Edit files in `api_server/`
2. Backend auto-reloads (enabled in docker-compose.yml)
3. Refresh browser to see changes

### Changing Frontend Code
1. Edit files in `client_web_app/src/`
2. Rebuild frontend:
   ```powershell
   docker-compose build frontend
   docker-compose up -d frontend
   ```
3. Refresh browser

### Changing Database Schema
1. Modify models in `api_server/models/models.py`
2. Stop and start backend:
   ```powershell
   docker-compose restart backend
   ```
3. Or reset database:
   ```powershell
   docker-compose down -v
   docker-compose up -d
   ```

---

## 📊 Checking Service Health

### Check if services are running
```powershell
docker ps

# Output should show:
# cold-chain-db   (postgres)
# cold-chain-api  (backend)
# cold-chain-web  (frontend)
```

### Check if endpoints are accessible
```powershell
# Backend health
Invoke-WebRequest http://localhost:8000/health

# Backend API docs
# Open in browser: http://localhost:8000/docs

# Frontend
# Open in browser: http://localhost:3000
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Login & user interface |
| Backend | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger documentation |
| Database | localhost:5432 | PostgreSQL connection |

---

## 📚 Docker Compose Reference

```yaml
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose build

# Run specific service
docker-compose up -d backend

# Stop specific service
docker-compose stop backend

# Remove volumes (reset data)
docker-compose down -v
```

---

## ✅ Next Steps

1. ✅ Run `docker-compose up -d`
2. ✅ Wait 30 seconds
3. ✅ Open http://localhost:3000
4. ✅ Login with sender_1 / password123
5. ✅ Start developing!

---

## 💡 Tips

- Keep `.env.docker` synced with your environment
- Don't commit actual secrets to git (use `.env.docker` in .gitignore)
- Use `docker-compose logs -f` to debug issues
- Database data persists in Docker volumes (survives `docker-compose down`)
- To reset database: `docker-compose down -v` then `docker-compose up -d`

---

## 🎉 You're Done!

Your entire Cold Chain AI application is now running in Docker with one command:

```powershell
docker-compose up -d
```

Happy coding! 🚀
