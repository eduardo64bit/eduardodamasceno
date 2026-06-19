#!/usr/bin/env bash
# Registra webhook do Telegram Bot para o chat do portfólio.
# Após mudar TELEGRAM_WEBHOOK_SECRET no .env: ./scripts/stack.sh up && ./scripts/telegram-set-webhook.sh
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
: "${SITE_PUBLIC_ORIGIN:?Defina SITE_PUBLIC_ORIGIN no .env}"

WEBHOOK_URL="${SITE_PUBLIC_ORIGIN%/}/api/chat/telegram/webhook"
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
