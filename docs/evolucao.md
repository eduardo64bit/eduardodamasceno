# Evolução não destrutiva

Regras práticas para mudanças seguras neste repositório.

## Banco de dados (SQLite)

- **Nunca editar** migrations já aplicadas (`lib/db/migrations/*.sql`).
- **Sempre adicionar** nova migration numerada e incrementar `user_version` em `lib/db/client.ts`.
- Colunas novas: preferir `ALTER TABLE ... ADD COLUMN` com default, ou migration idempotente com `PRAGMA table_info`.
- Dados vivem no volume Docker `site_data` / pasta `data/` — backup antes de scripts destrutivos.
- `npm run dev` e Docker compartilham o mesmo arquivo se `SITE_DB_PATH` apontar para o mesmo path.
- Spec de rotas e migração: [arquitetura.md](./arquitetura.md).

## Deploy e ambiente

- Após mudar `.env`: `./scripts/stack.sh up` (recria container com vars novas).
- Após mudar código: `./scripts/stack.sh build && ./scripts/stack.sh up`.
- Build Docker pode cachear camadas — se o site não refletir mudanças, use `docker compose build --no-cache web`.
- Telegram: após mudar `TELEGRAM_WEBHOOK_SECRET`, rode `./scripts/telegram-set-webhook.sh`.

## Chat

- Sessão do visitante: memória do browser (não cookie). Fechar aba = nova sessão.
- Sessão no servidor: TTL 24h; apagada ao sair da página (`pagehide`).
- Pub/sub SSE é in-memory (single container). Não escalar horizontalmente sem Redis/etc.

## Cases

- `status = 'published'` aparece na home; `draft` fica oculto.
- Mídia em `data/media/` — versionar no git só se intencional; produção usa volume.
- Import WordPress é **upsert** por `wp_id` / slug — reimport com `--force` sobrescreve conteúdo importado.

## Código

- Preferir estender (`lib/domains/*`, migrations) a reescrever.
- Remover código morto só quando grep confirmar zero referências.
- Auth de `/portfolio`, `/case` e `/cv` (leitor) e `/editor` (dono) é independente — ver [arquitetura.md](./arquitetura.md).

## O que pode sair depois do cutover

- Redirect `/homolog` em `middleware.ts` — quando tráfego legado zerar.
- Docs Vercel/Supabase — quando migração estiver 100% estável.

## Próximas frentes

- Design system (`/ds`) — tokens `--pf-*` no CV.
- Upload de capa/galeria no editor de cases.
- Consolidar `upsertImportedCase` (TS) com scripts `wp-import*.mjs`.
- Remover redirect `/homolog` quando tráfego zerar.
