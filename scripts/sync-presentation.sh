#!/usr/bin/env bash
# Sincroniza o deck em case/ → public/case/ para publicação em /case.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${CASE_SOURCE:-"$ROOT/case"}"
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

# Fonte local continua em /; a cópia publicada precisa de base /case/.
python3 - "$TARGET/index.html" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
html = path.read_text(encoding="utf-8")
if '<base href="/case/"' not in html:
    html = html.replace("<head>", '<head>\n  <base href="/case/" />', 1)
path.write_text(html, encoding="utf-8")
PY

echo "Apresentação sincronizada: $SOURCE → $TARGET"
echo "Publicada em https://eduardodamasceno.com.br/case"
