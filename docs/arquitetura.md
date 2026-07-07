# Arquitetura — rotas, auth e nomenclatura

Especificação alvo do site **eduardodamasceno.com.br**.  
Decisões fechadas em jul/2026. Implementação incremental, sem quebrar Mac nem Oracle.

## Mapa de rotas (versão final)

### Site

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Home do portfólio (grid + filtros em `/#projetos`) |
| `/cv` | Público | Currículo |
| `/cases` | Público | Redirect legado → `/?section=projetos` |
| `/cases/[slug]` | Senha leitor | Detalhe do case |
| `/status` | Senha editor | Painel operacional |
| `/login` | — | Login para leitura de cases |
| `/ds` | Público | Design system (referência interna) |

### Editor

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/editor` | Senha editor | Hub — links para tudo editável |
| `/editor/login` | — | Login do editor |
| `/editor/cv` | Senha editor | Lista de currículos |
| `/editor/cv/[id]` | Senha editor | Editar currículo |
| `/editor/cv/[id]/print` | Senha editor | Impressão |
| `/editor/cases` | Senha editor | Lista de cases |
| `/editor/cases/[slug]` | Senha editor | Editar case |
| `/editor/cases/new` | Senha editor | Criar case |

### APIs (sem mudança de path)

| Rota | Descrição |
|------|-----------|
| `/api/chat/*` | Chat + webhook Telegram |
| `/api/status` | JSON do painel (proteger junto com `/status`) |
| `/media/[...path]` | Mídia em `data/media/` |

---

## Autenticação — duas portas

| Papel | Senha no `.env` | Cookie | Login | Protege |
|-------|-----------------|--------|-------|---------|
| **Leitor** | `PORTFOLIO_PASSWORD` + `PORTFOLIO_SECRET` | `portfolio_session` | `/login` | `/cases/*` (detalhe) |
| **Editor** | `EDITOR_PASSWORD` + `EDITOR_SECRET` | `editor_session` | `/editor/login` | `/editor/*`, `/status`, `/api/status` |

Leitor e editor são **independentes**: quem lê cases não edita; quem edita usa outra senha.

### Variáveis de ambiente (alvo)

```env
# SQLite
SITE_DB_PATH=./data/site.db

# Leitor — cases
PORTFOLIO_PASSWORD=...
PORTFOLIO_SECRET=...

# Editor — CV, cases, status
EDITOR_PASSWORD=...
EDITOR_SECRET=...

# Público
SITE_PUBLIC_ORIGIN=...
```

---

## Nomenclatura (cutover concluído jul/2026)

Runtime usa apenas `editor`, `site.db`, `EDITOR_*`, `SITE_DB_PATH`. Histórico em `docs/legacy-supabase/`.

---

## Modelo Mac × Oracle

Mesmo repositório; ambientes separados para dados e env.

| | Mac (dev) | Oracle (produção) |
|---|-----------|-------------------|
| Comando | `npm run dev` | `./scripts/stack.sh build && ./scripts/stack.sh up` |
| Env | `.env.local` | `.env` |
| Origin | `http://localhost:3000` | `https://eduardodamasceno.com.br` |
| Banco | `data/site.db` (bind mount) | `data/site.db` (bind mount em `~/projects/eduardodamasceno/data/`) |
| Mídia | `data/media/` | `data/media/` |
| Git | commit + push | `git pull` + deploy |
| Dados no Git | **Não** — `data/` no `.gitignore` |

**Regra:** mudança de schema ou rename de arquivo exige passo explícito nos **dois** ambientes (ou script documentado).

---

## Migração do banco (`site.db`)

Se ainda existir `data/cvmkr.db` de instalação antiga, renomeie (não recrie o schema):

### Mac

```bash
# Com o dev server parado
mv data/cvmkr.db data/site.db
# WAL/SHM, se existirem:
mv data/cvmkr.db-wal data/site.db-wal 2>/dev/null || true
mv data/cvmkr.db-shm data/site.db-shm 2>/dev/null || true
```

Atualizar `.env.local`:

```env
SITE_DB_PATH=./data/site.db
```

### Oracle

```bash
cd ~/projects/eduardodamasceno
./scripts/stack.sh down   # ou stop do container
mv data/cvmkr.db data/site.db
mv data/cvmkr.db-wal data/site.db-wal 2>/dev/null || true
mv data/cvmkr.db-shm data/site.db-shm 2>/dev/null || true
```

No `.env` da Oracle:

```env
SITE_DB_PATH=./data/site.db
EDITOR_PASSWORD=...
EDITOR_SECRET=...
```

Subir de novo: `./scripts/stack.sh up`.

### Docker Compose (volume nomeado)

Se algum ambiente usar volume `cvmkr_data` em vez de bind `./data`:

```bash
docker compose down
docker volume create eduardodamasceno_site_data
# copiar dados do volume antigo para o novo (backup antes)
# atualizar docker-compose.yml: site_data
./scripts/stack.sh up
```

No deploy atual da Oracle o bind `./data` é o caminho principal; volume nomeado é fallback do `docker-compose.yml` base.

---

## Plano de implementação (checklist)

Marcar conforme for entregando. Uma PR por fase quando possível.

### Fase 1 — Editor (rotas + rename interno) ✅

- [x] `app/cvmkr/` → `app/editor/` com estrutura alvo (`/editor`, `/editor/cv/...`)
- [x] `components/cvmkr/` → `components/editor/`
- [x] `lib/domains/auth/editor.ts` (+ fallback `CVMKR_*`)
- [x] Middleware: `/editor/*` + redirects `/cvmkr/*`
- [x] Hub em `/editor` (links: Currículo, Cases, Status, Ver site)
- [x] Atualizar `.env.example`, `.env.local.example`

### Fase 2 — Banco e env ✅

- [x] `SITE_DB_PATH` + default `data/site.db` em `lib/db/client.ts`
- [x] Fallback leitura `CVMKR_DB_PATH` / `cvmkr.db` se `site.db` ausente (log de aviso)
- [x] Scripts: `wp-import`, `set-case-segments`, etc.
- [x] `docker-compose.yml`: `site_data`, `SITE_DB_PATH`
- [x] Rename local `cvmkr.db` → `site.db` (Mac)
- [ ] Procedimento Oracle documentado acima executado no deploy

### Fase 3 — `/cases` índice ✅ (substituída na Fase 7)

- [x] `app/(portfolio)/cases/page.tsx` — grid + filtros (reuso de `CaseProjectsSection`)
- [x] Middleware: proteger `/cases` (não só `/cases/*`)
- [x] Links na home → `/cases` onde fizer sentido

### Fase 7 — Navegação cases simplificada ✅

- [x] Remover índice `/cases` — grid e filtros só na home (`/#projetos`)
- [x] `/cases` → redirect `/?section=projetos` (`next.config.ts`)
- [x] Voltar do detalhe → `/#projeto-<slug>` (`lib/portfolio/routes.ts`, `CaseDetailView.tsx`)
- [x] Middleware protege apenas `/cases/<slug>` (matcher `/cases/:path+`)
- [x] Âncoras por card na home (`CaseProjectsSection.tsx`)

### Fase 4 — `/status` com senha editor ✅

- [x] Middleware: `/status` e `/api/status` exigem sessão editor
- [x] Labels no collector: “Senha editor” (não “CVMKR”)

### Fase 5 — Editor de cases ✅

- [x] `/editor/cases/[slug]` — formulário (título, corpo, status, ordem, segmentos)
- [x] `/editor/cases/new` — criar case
- [x] Preview → `/cases/[slug]` (senha leitor)
- [x] Atualizar [cases.md](./cases.md)

### Fase 6 — Limpeza ✅

- [x] Remover fallbacks `CVMKR_*` e redirects `/cvmkr`
- [x] Grep zero `cvmkr` fora de legado/docs de migração
- [x] Atualizar README, cloudflare-tunnel, evolucao

---

## Princípios (não destrutivo)

1. **Redirects** antes de apagar rotas antigas (ex.: `/homolog` ainda ativo).
2. **Backup** `data/` antes de rename ou migration destrutiva.
3. **Mac primeiro** — validar `npm run dev` → depois Oracle `git pull` + stack.
4. **Dados não vão no Git** — sync Mac ↔ Oracle é `scp` ou import WP, não commit.
5. **Migrations SQL** — só adicionar arquivos novos; nunca editar migrations aplicadas.

Ver também [evolucao.md](./evolucao.md).

---

## Estado atual (jul/2026)

Cutover concluído — fases 1–6 e simplificação de navegação (fase 7) entregues. Spec de referência para evoluções futuras.

## Navegação de cases (jul/2026)

- **Listagem:** apenas na home, seção `/#projetos` (`CaseProjectsSection`).
- **Detalhe:** `/cases/[slug]` (senha leitor).
- **Voltar:** `/#projeto-<slug>` — retorna ao card na home, não a uma página índice.
- **Legado:** `/cases` redireciona para `/?section=projetos` (scroll automático via `ScrollToHashOnMount`).
