# 🚀 Cold Chain AI - Docker Compose Quick Start

## One Command Deploy!

```powershell
docker-compose up -d
```

That's it! Everything will be running in 30 seconds.

---

## 📍 Where to Access

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **Database** | localhost:5432 |

---

## 🔑 Test Login Credentials

```
Username: sender_1
Password: password123
```

Or try:
- `driver_1` / `password123`
- `receiver_1` / `password123`

---

## 📁 What You Need

Files already created for you:

```
📦 cold-chain-ai/
├── docker-compose.yml         ✅ (MAIN FILE - runs everything)
├── .env.docker                ✅ (Configuration)
├── api_server/
│   └── Dockerfile             ✅ (Backend container)
└── client_web_app/
    └── Dockerfile             ✅ (Frontend container)
```

---

## 🛑 Stop Everything

```powershell
docker-compose down
```

---

## 📊 Check Status

```powershell
docker ps
```

Should show 3 containers:
- `cold-chain-db` (PostgreSQL)
- `cold-chain-api` (Backend)
- `cold-chain-web` (Frontend)

---

## 🐛 View Logs

```powershell
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Database only
docker-compose logs -f db
```

---

## ⚙️ Configuration

Edit `.env.docker` to change:
- Database password
- JWT secret
- API URL
- CORS origins

Then restart:
```powershell
docker-compose down
docker-compose up -d
```

---

## 🔄 Rebuild

After changing code:

```powershell
# Rebuild everything
docker-compose build

# Or rebuild specific service
docker-compose build backend

# Rebuild and start
docker-compose up -d --build
```

---

## 💾 Database

Data is stored in Docker volume `postgres_data` and persists even after `docker-compose down`.

To reset database:
```powershell
docker-compose down -v
docker-compose up -d
```

---

## 📚 Full Documentation

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete guide

---

## ✅ Summary

**To deploy:**
```powershell
docker-compose up -d
```

**To access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

**To stop:**
```powershell
docker-compose down
```

Done! 🎉
