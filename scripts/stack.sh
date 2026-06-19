#!/usr/bin/env bash
# Sobe ou derruba eduardodamasceno (Docker Compose).
#
# Porta HTTP no host: EDUARDODAMASCENO_HTTP_PORT no .env (padrão 9090).

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

docker_compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "Docker Compose não encontrado." >&2
    exit 1
  fi
}

cmd="${1:-up}"

case "$cmd" in
  build)
    shift || true
    docker_compose build "$@"
    ;;
  up | start)
    if ! docker info >/dev/null 2>&1; then
      echo "Docker não está rodando. Ex.: sudo systemctl start docker" >&2
      exit 1
    fi
    docker_compose up -d
    host_port="$(docker_compose port web 3000 2>/dev/null | awk -F: '{print $NF}')"
    echo "eduardodamasceno: http://127.0.0.1:${host_port:-9090}"
    ;;
  down | stop)
    docker_compose down
    ;;
  logs)
    shift || true
    docker_compose logs -f "$@"
    ;;
  *)
    echo "Uso: $0 {up|down|logs|build}" >&2
    exit 1
    ;;
esac
