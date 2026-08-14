#!/usr/bin/env bash
# Sincroniza o deck vizinho em public/case para publicação pelo Next.js.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${CASE_SOURCE:-"$ROOT/../case"}"
TARGET="$ROOT/public/case"

for required in index.html assets css js; do
  if [[ ! -e "$SOURCE/$required" ]]; then
    echo "Deck inválido: não encontrei $SOURCE/$required" >&2
    exit 1
  fi
done

mkdir -p "$TARGET"
rsync -a --delete "$SOURCE/assets/" "$TARGET/assets/"
rsync -a --delete "$SOURCE/css/" "$TARGET/css/"
rsync -a --delete "$SOURCE/js/" "$TARGET/js/"
cp "$SOURCE/index.html" "$TARGET/index.html"

# Mantém o deck local funcionando em / e os mesmos arquivos publicados em /case.
python3 - "$TARGET/index.html" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
html = path.read_text(encoding="utf-8")
html = html.replace("<head>", '<head>\n  <base href="/case/" />', 1)
path.write_text(html, encoding="utf-8")
PY

echo "Apresentação sincronizada em $TARGET"
