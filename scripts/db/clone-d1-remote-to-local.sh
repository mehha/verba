#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

WRANGLER_CONFIG="${WRANGLER_CONFIG:-wrangler.jsonc}"
LOCAL_BINDING="${D1_LOCAL_BINDING:-D1}"
PERSIST_TO="${D1_LOCAL_PERSIST_TO:-.wrangler/state}"
LOCAL_D1_DIR="$PERSIST_TO/v3/d1"
BACKUP_DIR="${D1_BACKUP_DIR:-backups/d1}"
TMP_DIR="$(mktemp -d)"
LOCAL_SQLITE_PATH=""

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

extract_first_database_name() {
  local config_file="$1"

  if command -v rg >/dev/null 2>&1; then
    rg -oN '"database_name"\s*:\s*"[^"]+"' "$config_file" \
      | head -n1 \
      | sed -E 's/.*"database_name"\s*:\s*"([^"]+)".*/\1/'
    return
  fi

  grep -oE '"database_name"[[:space:]]*:[[:space:]]*"[^"]+"' "$config_file" \
    | head -n1 \
    | sed -E 's/.*"database_name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/'
}

if [[ ! -f "$WRANGLER_CONFIG" ]]; then
  echo "Error: Wrangler config not found at $WRANGLER_CONFIG."
  exit 1
fi

REMOTE_DB_NAME="${1:-${D1_REMOTE_DB_NAME:-$(extract_first_database_name "$WRANGLER_CONFIG")}}"

if [[ -z "$REMOTE_DB_NAME" ]]; then
  echo "Error: Could not determine D1 database name from $WRANGLER_CONFIG."
  echo "Pass it explicitly: bash scripts/db/clone-d1-remote-to-local.sh <database-name>"
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "Error: sqlite3 is required for local D1 data import."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%F-%H%M%S)"
EXPORT_PATH="${2:-$BACKUP_DIR/${REMOTE_DB_NAME}-${STAMP}.sql}"
IMPORT_PATH="$TMP_DIR/import.sql"

echo "Exporting remote D1 database '$REMOTE_DB_NAME' to $EXPORT_PATH ..."
pnpm wrangler d1 export "$REMOTE_DB_NAME" --remote --output "$EXPORT_PATH"

{
  printf 'PRAGMA foreign_keys=OFF;\nBEGIN;\n'
  cat "$EXPORT_PATH"
  printf '\nCOMMIT;\nPRAGMA foreign_keys=ON;\n'
} > "$IMPORT_PATH"

echo "Resetting local D1 state in $LOCAL_D1_DIR ..."
rm -rf "$LOCAL_D1_DIR"

echo "Initializing local D1 binding '$LOCAL_BINDING' ..."
pnpm wrangler d1 execute "$LOCAL_BINDING" --local --persist-to="$PERSIST_TO" --command "SELECT 1;"

LOCAL_SQLITE_PATH="$(find "$LOCAL_D1_DIR" -type f -name '*.sqlite' | head -n1 || true)"

if [[ -z "$LOCAL_SQLITE_PATH" ]]; then
  echo "Error: Could not locate local D1 sqlite file under $LOCAL_D1_DIR."
  exit 1
fi

echo "Importing full export into local sqlite database '$LOCAL_SQLITE_PATH' ..."
sqlite3 "$LOCAL_SQLITE_PATH" < "$IMPORT_PATH"

cat <<EOF
Done.

- Remote export: $EXPORT_PATH
- Local binding: $LOCAL_BINDING
- Local persist dir: $PERSIST_TO
- Local sqlite file: $LOCAL_SQLITE_PATH

Note: this only affects Wrangler's local D1 state. If your D1 bindings in $WRANGLER_CONFIG
still use "remote": true, local app sessions will continue to talk to remote D1 until you disable that.
EOF
