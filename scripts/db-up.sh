#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if command -v podman >/dev/null 2>&1; then
  RUNTIME=podman
elif command -v docker >/dev/null 2>&1; then
  RUNTIME=docker
else
  echo "Butuh Podman atau Docker untuk menjalankan PostgreSQL lokal." >&2
  exit 1
fi

if "$RUNTIME" container exists spotbird-db >/dev/null 2>&1; then
  "$RUNTIME" start spotbird-db >/dev/null 2>&1 || true
else
  "$RUNTIME" run -d \
    --name spotbird-db \
    -p 5433:5432 \
    -e POSTGRES_USER=spotbird \
    -e POSTGRES_PASSWORD=spotbird \
    -e POSTGRES_DB=spotbird \
    -v spotbird_pgdata:/var/lib/postgresql/data \
    -v "$PWD/api/db/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro" \
    -v "$PWD/api/db/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro" \
    --health-cmd "pg_isready -U spotbird -d spotbird" \
    --health-interval 3s \
    --health-timeout 3s \
    --health-retries 20 \
    docker.io/library/postgres:16-alpine
fi

bash scripts/db-wait.sh
