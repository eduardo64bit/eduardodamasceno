#!/usr/bin/env bash
# Registra webhook do Telegram para uma URL pública (produção ou túnel local).
# Uso:
#   ./scripts/telegram-set-webhook-url.sh https://eduardodamasceno.com.br
#   ./scripts/telegram-set-webhook-url.sh https://abc.trycloudflare.com
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ORIGIN="${1:-}"
if [[ -z "$ORIGIN" ]]; then
  echo "Uso: $0 <origin-publica>" >&2
  echo "Ex.: $0 https://eduardodamasceno.com.br" >&2
  exit 1
fi

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
elif [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${TELEGRAM_BOT_TOKEN:?Defina TELEGRAM_BOT_TOKEN no .env ou .env.local}"

WEBHOOK_URL="${ORIGIN%/}/api/chat/telegram/webhook"
API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"

echo "Removendo webhook anterior..."
curl -sS "${API}/deleteWebhook" | python3 -m json.tool 2>/dev/null || curl -sS "${API}/deleteWebhook"
echo
echo "Registrando: ${WEBHOOK_URL}"

if [[ -n "${TELEGRAM_WEBHOOK_SECRET:-}" ]]; then
  curl -sS "${API}/setWebhook" \
    --data-urlencode "url=${WEBHOOK_URL}" \
    --data-urlencode "secret_token=${TELEGRAM_WEBHOOK_SECRET}" \
    --data-urlencode "drop_pending_updates=true" | python3 -m json.tool 2>/dev/null || true
else
  curl -sS "${API}/setWebhook" \
    --data-urlencode "url=${WEBHOOK_URL}" \
    --data-urlencode "drop_pending_updates=true" | python3 -m json.tool 2>/dev/null || true
fi

echo
echo "Status:"
curl -sS "${API}/getWebhookInfo" | python3 -m json.tool 2>/dev/null || curl -sS "${API}/getWebhookInfo"
echo
