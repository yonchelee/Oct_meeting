#!/usr/bin/env bash
# Syntax-check the deck: pull the inline <script> blocks out of index.html,
# run node --check over them, and count tag pairs. Seconds, run it after every edit.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
DECK="${1:-$ROOT/index.html}"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

python3 - "$DECK" "$OUT/inline.js" <<'PY'
import re, sys
deck, out = sys.argv[1], sys.argv[2]
s = open(deck, encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', s, re.S)
open(out, 'w', encoding='utf-8').write('\n'.join(blocks))
print(f'deck      {len(s):,} bytes')
print(f'script    {len(blocks)} inline block(s), {sum(len(b) for b in blocks):,} bytes')
print(f'slides    {s.count(chr(60) + "section")}')
print(f'nav dots  {s.count(chr(60) + "button class=" + chr(34) + "nav-dot")}')
for tag in ('section', 'div', 'aside', 'ol', 'ul', 'li', 'button', 'canvas', 'video'):
    o, c = len(re.findall(rf'<{tag}[\s>]', s)), s.count(f'</{tag}>')
    if o != c:
        print(f'MISMATCH  <{tag}> {o} open vs {c} close')
PY

node --check "$OUT/inline.js" && echo 'js        OK'
