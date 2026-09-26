#!/bin/sh
# Renders config.template.json into the config.json the app fetches before it
# boots. Installed as /docker-entrypoint.d/40-runtime-config.sh: the nginx
# image's own entrypoint runs everything in that directory and then execs
# nginx, so this must not replace /docker-entrypoint.sh itself.
set -eu

TEMPLATE=/usr/share/nginx/html/config.template.json
OUTPUT=/usr/share/nginx/html/config.json

# The online bingo link is optional and unused when empty.
: "${VITE_ONLINE_BINGO_URL:=}"
: "${VITE_BALANCE_SIGNING_PUBLIC_KEY:=}"
export VITE_ONLINE_BINGO_URL VITE_BALANCE_SIGNING_PUBLIC_KEY

# Explicit list, so envsubst only replaces the variables we mean.
VARS='${VITE_API_URL} ${VITE_ONLINE_BINGO_URL} ${VITE_BALANCE_SIGNING_PUBLIC_KEY}'

envsubst "$VARS" < "$TEMPLATE" > "$OUTPUT"

# envsubst maps an unset variable to "" silently; fail at startup instead of
# letting the browser call the wrong host.
for key in VITE_API_URL; do
  if grep -q "\"$key\": *\"\"" "$OUTPUT"; then
    echo "runtime-config: $key is unset - every required VITE_* must be passed to the container" >&2
    cat "$OUTPUT" >&2
    exit 1
  fi
done

echo "runtime-config: wrote $OUTPUT"
