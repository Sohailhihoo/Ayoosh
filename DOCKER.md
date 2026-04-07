# 🐳 Docker Setup for Beauty Store

A complete Docker containerization of the beauty store e-commerce platform.

## 📁 Project Structure

```
beauty-store/
├── docker-compose.yml           # Main orchestration file
├── docker-compose.override.yml  # Development overrides (auto-loaded)
├── .env.docker                  # Environment template
├── backend/
│   ├── Dockerfile              # Express API container
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              # Next.js container
    └── .dockerignore
```

## 🚀 Quick Start

### Step 1: Prerequisites
Make sure Docker Desktop is installed and running on your computer.

### Step 2: Start All Services
Open a terminal in the `beauty-store` folder and run:

```bash
docker-compose up --build
```

This will:
- Build the frontend and backend containers
- Start MongoDB database
- Start Redis cache
- Connect everything together

### Step 3: Access Your App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start all services |
| `docker-compose up --build` | Rebuild and start |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs` | View all logs |
| `docker-compose logs backend` | View backend logs |
| `docker-compose ps` | List running containers |

## 🔧 Development Mode

In development, the `docker-compose.override.yml` is automatically loaded, which:
- Mounts your source code into containers
- Enables hot reloading
- Uses development environment

## 🏭 Production Mode

For production (without hot reloading):

```bash
docker-compose -f docker-compose.yml up --build -d
```

## 🛑 Stopping Services

```bash
# Stop and keep data
docker-compose down

# Stop and remove all data (⚠️ deletes database!)
docker-compose down -v
```

## 🗃️ Data Persistence

Your data is stored in Docker volumes:
- `mongodb_data` - Database files
- `redis_data` - Cache data

These persist even after `docker-compose down`.

## 🔑 Environment Variables

Edit `.env.docker` for configuration:
- `JWT_SECRET` - Change in production!
- `STRIPE_SECRET_KEY` - Your Stripe key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## 🐛 Troubleshooting

**Containers not starting?**
```bash
docker-compose logs
```

**Need a fresh start?**
```bash
docker-compose down -v
docker-compose up --build
```

**Port already in use?**
Stop other services using ports 3000, 5000, 27017, or 6379.
