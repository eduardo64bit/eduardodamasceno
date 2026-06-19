#!/usr/bin/env bash
# Descobre seu TELEGRAM_CHAT_ID (número) a partir de mensagens enviadas ao bot.
# 1. Abra o bot no Telegram e envie /start
# 2. Rode: ./scripts/telegram-get-chat-id.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${TELEGRAM_BOT_TOKEN:?Defina TELEGRAM_BOT_TOKEN no .env}"

echo "Buscando updates (envie /start pro bot se a lista vier vazia)..."
echo

RESP="$(curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates")"

python3 - <<'PY' "$RESP"
import json, sys
data = json.loads(sys.argv[1])
if not data.get("ok"):
    print("Erro da API:", data)
    sys.exit(1)
results = data.get("result") or []
if not results:
    print("Nenhuma mensagem encontrada.")
    print("→ Abra @eduardodamasceno_bot (ou o nome do seu bot) e envie /start")
    print("→ Rode este script de novo")
    sys.exit(1)
seen = set()
for u in results:
    m = u.get("message") or u.get("edited_message") or {}
    chat = m.get("chat") or {}
    cid = chat.get("id")
    if cid is None or cid in seen:
        continue
    seen.add(cid)
    name = " ".join(filter(None, [chat.get("first_name"), chat.get("last_name")])).strip()
    user = chat.get("username")
    print(f"TELEGRAM_CHAT_ID={cid}  # {name or user or 'chat'}")
print()
print("Copie a linha acima para o .env e rode: ./scripts/stack.sh up")
PY
