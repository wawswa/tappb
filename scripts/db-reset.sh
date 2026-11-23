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

"$RUNTIME" rm -f spotbird-db >/dev/null 2>&1 || true
"$RUNTIME" volume rm -f spotbird_pgdata >/dev/null 2>&1 || true
bash scripts/db-up.sh
