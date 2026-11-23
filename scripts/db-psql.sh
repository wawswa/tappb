#!/usr/bin/env bash
set -euo pipefail

if command -v podman >/dev/null 2>&1; then
  RUNTIME=podman
elif command -v docker >/dev/null 2>&1; then
  RUNTIME=docker
else
  echo "Butuh Podman atau Docker untuk menjalankan PostgreSQL lokal." >&2
  exit 1
fi

exec "$RUNTIME" exec -it spotbird-db psql -U spotbird -d spotbird
