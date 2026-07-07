# eduardodamasceno.com.br

Portfólio, cases, chat de contato (Telegram) e editor de currículo — self-hosted com SQLite e Docker.

## Stack

| Camada | Tecnologia |
|--------|------------|
| App | Next.js 15 (App Router), React 19, Tailwind |
| Dados | SQLite (`better-sqlite3`) em `data/site.db` |
| Produção | Docker Compose + Cloudflare Tunnel |
| Chat | API própria + Telegram Bot (webhook) |

## Rotas principais

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Home do portfólio |
| `/cases` | Senha `PORTFOLIO_PASSWORD` | Índice de projetos |
| `/cases/[slug]` | Senha `PORTFOLIO_PASSWORD` | Detalhe do case |
| `/cv` | Público | Currículo |
| `/ds` | Público | Design system (referência visual) |
| `/status` | Senha `EDITOR_PASSWORD` | Painel operacional |
| `/editor/*` | Senha `EDITOR_PASSWORD` | Editor (CV, cases) |
| `/api/chat/*` | Público (sessão anônima) | Chat + webhook Telegram |

## Desenvolvimento

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

- Site: http://localhost:3000
- Editor: http://localhost:3000/editor/login

## Produção local (Docker)

```bash
cp .env.example .env
# Configure senhas, Telegram, WordPress (import)

./scripts/stack.sh build
./scripts/stack.sh up
```

Padrão: http://127.0.0.1:9090

Após mudar `.env`: `./scripts/stack.sh up` (obrigatório).

## Cases (WordPress → SQLite)

```bash
npm run wp:inventory
npm run wp:import
```

Guia completo: [docs/cases.md](./docs/cases.md)

## Chat + Telegram

Setup do bot, webhook e variáveis: [docs/telegram-chat.md](./docs/telegram-chat.md)

## Cloudflare Tunnel

[docs/cloudflare-tunnel.md](./docs/cloudflare-tunnel.md) · [docs/dominio-cloudflare.md](./docs/dominio-cloudflare.md)

## Documentação

Índice: [docs/README.md](./docs/README.md)

Evolução segura (migrations, deploy, o que não quebrar): [docs/evolucao.md](./docs/evolucao.md)

## Estrutura do código

```
app/(portfolio)/     # Site público
app/editor/           # Editor (CV, cases)
app/api/chat/        # Chat + Telegram webhook
components/portfolio/
lib/domains/         # auth, cases, chat
lib/db/              # SQLite + migrations
scripts/             # stack, WP import, Telegram
data/                # DB + media (gitignored)
```

## Legado

- [docs/migrate-from-supabase.md](./docs/migrate-from-supabase.md) — migração Postgres → SQLite
- [docs/legacy-supabase/](./docs/legacy-supabase/) — schema arquivado
- Redirect `/homolog` no `middleware.ts` — remover após cutover completo
