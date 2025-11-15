# 🐳 Docker Quick Start

## Build & Run

```bash
# Build the image
docker build -t finance-tracker .

# Run the container
docker run -d \
  --name finance-tracker \
  -p 3000:3000 \
  -e VITE_DATA_MODE=hybrid \
  -e VITE_DATABASE_URL="your_database_url" \
  -e VITE_UPSTOX_CLIENT_ID="your_client_id" \
  -e VITE_UPSTOX_CLIENT_SECRET="your_client_secret" \
  finance-tracker

# View logs
docker logs -f finance-tracker

# Access the app
open http://localhost:3000
```

## Using Docker Compose

Create `.env` file:
```env
DATABASE_URL=postgresql://...
UPSTOX_CLIENT_ID=your_id
UPSTOX_CLIENT_SECRET=your_secret
```

Run:
```bash
docker-compose up -d
```

## Health Check

```bash
# Check if container is healthy
docker ps

# Manual health check
curl http://localhost:3000
```

## Cleanup

```bash
# Stop and remove
docker stop finance-tracker
docker rm finance-tracker

# Remove image
docker rmi finance-tracker
```
