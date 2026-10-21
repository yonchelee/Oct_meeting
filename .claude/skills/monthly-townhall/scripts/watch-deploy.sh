#!/usr/bin/env bash
# Wait until GitHub Pages is serving exactly what is in the working tree.
# Pushing is not deploying: Pages takes a minute or three, and the old page is
# cached until it does. Only say "deployed" after this prints DEPLOYED.
#
#   watch-deploy.sh                        # index.html against the usual URL
#   watch-deploy.sh https://host/path/     # another site
#   watch-deploy.sh "" media/closing.mp4   # also check an asset is reachable
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
URL="${1:-https://yonchelee.github.io/Oct_meeting/}"
[ -z "$URL" ] && URL="https://yonchelee.github.io/Oct_meeting/"
ASSET="${2:-}"
LOCAL="$ROOT/index.html"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

echo "local  $(wc -c < "$LOCAL" | tr -d ' ') bytes  $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null)"
echo "live   $URL"

for i in $(seq 1 60); do
  if curl -sS -m 20 -H 'Cache-Control: no-cache' "${URL}?v=${i}-$RANDOM" -o "$TMP" 2>/dev/null \
     && diff -q "$TMP" "$LOCAL" >/dev/null 2>&1; then
    echo "DEPLOYED after ~$((i * 10))s — the live page matches the working tree"
    if [ -n "$ASSET" ]; then
      echo "asset  $ASSET -> $(curl -sS -m 60 -o /dev/null -w '%{http_code} %{size_download} bytes' "${URL}${ASSET}")"
    fi
    exit 0
  fi
  sleep 10
done

echo "TIMEOUT after 10 min — still serving something else."
echo "Check the branch is the one Pages publishes, and that the push landed."
exit 1
