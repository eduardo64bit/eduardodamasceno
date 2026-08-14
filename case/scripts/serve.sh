#!/usr/bin/env bash
# Sobe o deck local de forma segura: verifica a porta, libera se necessário e inicia limpo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8000}"
HOST="${HOST:-127.0.0.1}"

cd "$ROOT"

pids_on_port() {
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null || true
}

is_alive() {
  curl -fsS --max-time 1 "http://${HOST}:${PORT}/" >/dev/null 2>&1
}

free_port() {
  local pids
  pids="$(pids_on_port)"
  if [[ -z "$pids" ]]; then
    return 0
  fi

  echo "→ Porta ${PORT} ocupada (PID: $(echo "$pids" | tr '\n' ' ')). Encerrando…"
  # SIGTERM primeiro; se ainda estiver vivo, SIGKILL
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 0.4

  pids="$(pids_on_port)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 0.2
  fi

  if [[ -n "$(pids_on_port)" ]]; then
    echo "✗ Não consegui liberar a porta ${PORT}." >&2
    exit 1
  fi
  echo "→ Porta ${PORT} livre."
}

echo "CASE · Partner Onboarding"
echo "─────────────────────────"

if is_alive; then
  echo "→ Já havia um servidor respondendo em http://${HOST}:${PORT}/"
  echo "→ Reiniciando limpo…"
  free_port
elif [[ -n "$(pids_on_port)" ]]; then
  echo "→ Processo órfão na porta ${PORT} (não responde)."
  free_port
else
  echo "→ Porta ${PORT} livre."
fi

echo "→ Servindo ${ROOT}"
echo "→ Abra http://${HOST}:${PORT}/"
echo "→ Ctrl+C para encerrar"
echo

exec python3 -m http.server "$PORT" --bind "$HOST"
