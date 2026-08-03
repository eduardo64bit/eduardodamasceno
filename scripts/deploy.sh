#!/usr/bin/env bash
# Publica código no GitHub e faz deploy na Oracle (git pull + Docker rebuild).
#
# Fluxo esperado:
#   editar local → npm run dev → git commit → ./scripts/deploy.sh
#
# Não faz commit. Não sincroniza data/ (banco/mídia).
#
# Variáveis opcionais:
#   DEPLOY_SSH_HOST   (padrão: oracle)
#   DEPLOY_REMOTE_DIR (padrão: ~/projects/eduardodamasceno)
#   DEPLOY_PUBLIC_URL (padrão: https://eduardodamasceno.com.br)
#
# Flags:
#   --skip-push   só deploy remoto (assume que origin/main já tem o commit)
#   --no-build    só git pull + stack up (útil após mudar só .env na Oracle)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SSH_HOST="${DEPLOY_SSH_HOST:-oracle}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-~/projects/eduardodamasceno}"
PUBLIC_URL="${DEPLOY_PUBLIC_URL:-https://eduardodamasceno.com.br}"
SKIP_PUSH=0
NO_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-push) SKIP_PUSH=1 ;;
    --no-build) NO_BUILD=1 ;;
    -h | --help)
      cat <<'EOF'
Publica código no GitHub e faz deploy na Oracle (git pull + Docker rebuild).

Uso: ./scripts/deploy.sh [--skip-push] [--no-build]

  --skip-push   só deploy remoto (assume origin/main já atualizado)
  --no-build    só git pull + stack up (útil após mudar .env na Oracle)

Não faz commit. Não sincroniza data/ (banco/mídia).

Host SSH: DEPLOY_SSH_HOST (padrão: oracle)
EOF
      exit 0
      ;;
    *)
      echo "Flag desconhecida: $arg (use --help)" >&2
      exit 1
      ;;
  esac
done

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "main" ]]; then
  echo "Deploy só a partir de main (atual: $branch)." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree suja. Faça commit (ou stash) antes do deploy:" >&2
  git status --short >&2
  exit 1
fi

git fetch origin main --quiet

local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse origin/main)"

if [[ "$local_sha" != "$remote_sha" ]]; then
  behind="$(git rev-list --count HEAD..origin/main)"
  ahead="$(git rev-list --count origin/main..HEAD)"
  if [[ "$behind" -gt 0 ]]; then
    echo "Local está $behind commit(s) atrás de origin/main. Rode git pull antes." >&2
    exit 1
  fi
  if [[ "$ahead" -gt 0 && "$SKIP_PUSH" -eq 1 ]]; then
    echo "Local está $ahead commit(s) à frente, mas --skip-push foi passado." >&2
    echo "Faça git push ou rode sem --skip-push." >&2
    exit 1
  fi
fi

if [[ "$SKIP_PUSH" -eq 0 ]]; then
  if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
    echo "→ git push origin main"
    git push origin main
  else
    echo "→ origin/main já está em $(git rev-parse --short HEAD)"
  fi
else
  echo "→ pulando push (--skip-push)"
fi

echo "→ SSH $SSH_HOST: pull + deploy em $REMOTE_DIR"

if [[ "$NO_BUILD" -eq 1 ]]; then
  remote_cmd="cd $REMOTE_DIR && git pull && ./scripts/stack.sh up"
else
  remote_cmd="cd $REMOTE_DIR && git pull && ./scripts/stack.sh build && ./scripts/stack.sh up"
fi

ssh -o BatchMode=yes -o ConnectTimeout=20 "$SSH_HOST" "$remote_cmd"

echo "→ smoke test $PUBLIC_URL/"
http_code=""
for attempt in 1 2 3 4 5 6; do
  http_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$PUBLIC_URL/" || true)"
  if [[ "$http_code" == "200" ]]; then
    break
  fi
  echo "  tentativa $attempt: HTTP ${http_code:-?} — aguardando container..."
  sleep 5
done
if [[ "$http_code" != "200" ]]; then
  echo "Aviso: home respondeu HTTP ${http_code:-?} (esperado 200)." >&2
  exit 1
fi

echo "OK — $(git rev-parse --short HEAD) em produção ($PUBLIC_URL → HTTP $http_code)"
