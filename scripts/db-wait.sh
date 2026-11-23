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

for _ in $(seq 1 60); do
  if "$RUNTIME" exec spotbird-db pg_isready -U spotbird -d spotbird >/dev/null 2>&1; then
    exit 0
  fi
  sleep 1
done
echo "PostgreSQL belum siap. Cek: $RUNTIME logs spotbird-db" >&2
exit 1
