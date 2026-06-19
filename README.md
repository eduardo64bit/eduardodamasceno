# eduardodamasceno.com.br

Site pessoal e editor de currículo (**CVMKR**), self-hosted com SQLite local — sem Supabase.

## Stack

- **Next.js 15** (App Router)
- **SQLite** (`better-sqlite3`) em `data/cvmkr.db`
- **Docker Compose** para produção local
- **Cloudflare Tunnel** para HTTPS público (mesmo padrão [ilovemalu](https://github.com) / [luizdaniel](https://github.com))

## Desenvolvimento

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Acesse http://localhost:3000 — admin em http://localhost:3000/cvmkr/login.

## Produção local (Docker)

```bash
cp .env.example .env
# Configure CVMKR_PASSWORD e CVMKR_SECRET

./scripts/stack.sh up
```

Padrão: http://127.0.0.1:9090

## Cloudflare Tunnel

Domínios: **eduardodamasceno.com.br**, **www**, e opcionalmente **edu.xdstudio.com.br**.

Veja [docs/cloudflare-tunnel.md](./docs/cloudflare-tunnel.md).

## Migrar do Supabase

Veja [docs/migrate-from-supabase.md](./docs/migrate-from-supabase.md).
