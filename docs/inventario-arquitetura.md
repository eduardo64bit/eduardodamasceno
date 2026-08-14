# Inventário de Arquitetura — eduardodamasceno.com.br

Documento técnico completo da solução, baseado exclusivamente no código-fonte, estrutura de pastas, configurações e dependências. Destinado a servir de base para infográfico de arquitetura.

> **Relacionado:** [arquitetura.md](./arquitetura.md) cobre rotas, auth e plano de cutover. Este documento é o inventário detalhado da plataforma.

---

# 1. Resumo do Projeto

**eduardodamasceno.com.br** é um portfólio profissional self-hosted de **Eduardo Damasceno**, Designer de Produto. O objetivo declarado no metadata da aplicação é apresentar trabalho em UX/UI, inovação e estratégia de produto (`app/layout.tsx`).

A plataforma combina um **site institucional** (home com hero, sobre, especialidades, lista de clientes e grid de cases), um **currículo público** em `/cv`, **cases de portfólio** protegidos por senha, um **chat de contato** integrado ao Telegram, e um **editor administrativo** (`/editor`) para gerenciar currículo e cases sem depender de CMS externo.

As principais funcionalidades são: exibição de projetos publicados com filtros por segmento, detalhe de case com carrossel de imagens e corpo HTML, currículo estruturado em SQLite, chat anônimo com notificação via bot Telegram, painel operacional `/status`, e importação de cases a partir de WordPress.

O público-alvo inferido do copy em `lib/portfolio/copy.ts` e da estrutura do site inclui **recrutadores, clientes e parceiros de negócio** interessados em experiência em plataformas financeiras, B2B/SaaS, sistemas regulados e produtos autorais.

A proposta da plataforma é ser um **monólito Next.js** com persistência local (SQLite + arquivos em disco), deploy via Docker em VM Oracle Cloud, exposição pública via **Cloudflare Tunnel** (HTTPS na borda), e autenticação simples por senha para leitura de cases e edição de conteúdo.

---

# 2. Funcionalidades

| Módulo | Finalidade |
|--------|------------|
| **Site institucional (Home)** | Página `/` com hero animado, sobre, especialidades, clientes e grid de cases publicados com filtros por segmento em `/#projetos` (`app/(portfolio)/page.tsx`, `PortfolioHome.tsx`, `CaseProjectsSection.tsx`) |
| **Portfólio / Cases** | Índice em `/portfolio` e detalhe em `/portfolio/[slug]`, com carrossel, YouTube embed e corpo HTML (`CaseDetailView.tsx`) |
| **Apresentação de case** | Deck fullscreen em `/case`, sincronizado de `case/` para `public/case/` |
| **Currículo protegido** | Rota `/cv` renderiza o currículo ativo do SQLite (`app/cv/page.tsx`, `CVPageContent.tsx`) |
| **Design System** | Referência visual em `/ds` (`app/(portfolio)/ds/page.tsx`, `DesignSystemPage.tsx`) |
| **Chat de contato** | Widget flutuante na home; sessões anônimas, SSE e integração Telegram (`PortfolioChat.tsx`, `app/api/chat/*`) |
| **Login de leitor** | `/login` — autenticação compartilhada por `/portfolio`, `/case` e `/cv` via `PORTFOLIO_PASSWORD` |
| **Editor / CMS** | Hub e CRUD em `/editor/*` para currículo e cases |
| **Gestão de currículo** | Múltiplas versões de CV, perfil, experiências, projetos autorais, skills e educação (`app/editor/cv/*`, `ResumeEditor.tsx`) |
| **Gestão de cases** | Criar, editar, publicar cases; metadados, segmentos, corpo HTML, galeria (`app/editor/cases/*`, `CaseEditor.tsx`) |
| **Upload de imagens (cases)** | Multipart via API `/api/editor/cases/[slug]/media`; armazenamento em `data/media/cases/<slug>/` |
| **Servir mídia** | Route handler `/media/[...path]` lê arquivos do disco com cache de 24h |
| **Autenticação (dupla)** | Leitor (`portfolio_session`) e editor (`editor_session`) independentes (`middleware.ts`, `lib/domains/auth/*`) |
| **Dashboard / Status** | `/status` + `/api/status` — saúde do app, SQLite, Telegram, site público (`lib/domains/status/collector.ts`) |
| **Import WordPress** | Scripts CLI para inventário e import de posts para SQLite (`scripts/wp-import.mjs`, `wp-inventory.mjs`) |
| **Migrações de mídia** | Scripts para migrar imagens locais e do HTML para `case_media` (`scripts/migrate-case-*.mjs`) |
| **Redirect legado** | `/homolog/*` → rotas definitivas; `/cases/*` → `/portfolio/*` (`middleware.ts`) |
| **Tema claro/escuro** | Toggle no portfólio com script anti-FOUC (`PortfolioThemeProvider.tsx`, `lib/portfolio/theme.ts`) |
| **Animações de scroll** | GSAP + split-type em hero e reveals (`components/portfolio/motion/*`) |
| **Impressão de CV** | `/editor/cv/[id]/print` para versão de impressão |
| **Telegram (webhook)** | Respostas do dono encaminhadas ao visitante via SSE (`app/api/chat/telegram/webhook/route.ts`) |

**Módulos ausentes no código:** não há blog, CMS para copy da home (textos em `lib/portfolio/copy.ts`), upload de documentos genéricos, nem gestão de clientes via banco (lista hardcoded em `lib/portfolio/clients.ts`).

---

# 3. Arquitetura

## Frontend

- **Next.js 15 App Router** com React 19 e TypeScript.
- **Server Components** por padrão nas páginas; componentes interativos marcados com `'use client'` (editor, chat, animações, formulários).
- **Tailwind CSS** + tokens CSS `--pf-*` para tema do portfólio.
- **Fonte:** Manrope via `next/font/google` (`app/layout.tsx`).
- **Material Icons** via CDN Google Fonts.

## Backend

- Backend embutido no **mesmo processo Next.js** (standalone output).
- **Route Handlers** em `app/api/*` e `app/media/[...path]/route.ts`.
- **Server Actions** para login, logout, save de CV e cases (`'use server'` em `app/**/actions.ts`).
- **Domínio** organizado em `lib/domains/*` (auth, cases, chat, status).
- **Acesso a dados** via `better-sqlite3` síncrono em `lib/db/client.ts`.

## Camada de dados

- **SQLite** em `data/site.db` (path configurável por `SITE_DB_PATH`).
- **Mídia** em `data/media/` (cases, potencialmente logos de clientes).
- Schema inicial em `lib/db/schema.sql`; evolução via migrations numeradas e `user_version` pragma em `lib/db/client.ts` (versões 1–8).
- WAL mode e foreign keys habilitados.

## Autenticação

- **Duas portas independentes** (`docs/arquitetura.md`):
  - **Leitor:** `PORTFOLIO_PASSWORD` + `PORTFOLIO_SECRET` → cookie `portfolio_session` → protege `/portfolio/*`, `/case/*` e `/cv`.
  - **Editor:** `EDITOR_PASSWORD` + `EDITOR_SECRET` → cookie `editor_session` → protege `/editor/*`, `/status`, `/api/status`.
- Token = **HMAC-SHA256** da senha com o secret (`lib/domains/auth/token.ts`).
- Validação no **middleware Edge** (`middleware.ts`) e em APIs via `requireEditorApi()`.

## Upload

- Apenas **imagens de cases** no editor: POST multipart para `/api/editor/cases/[slug]/media`.
- Validação: extensões `.jpg/.jpeg/.png/.webp/.gif`, máx. 10 MB (`lib/domains/cases/media-storage.ts`).
- Arquivos salvos em `data/media/cases/<slug>/`; metadados (`case_media`, `cover_path`) persistidos ao salvar o case via Server Action.

## Renderização

- Todas as páginas principais usam `export const dynamic = 'force-dynamic'` — **sem ISR estático**.
- Após mutações, `revalidatePath()` invalida cache de rotas afetadas (`app/editor/cases/[slug]/actions.ts`, `app/editor/cv/actions.ts`).
- Corpo de cases renderizado com `dangerouslySetInnerHTML` após processamento em `lib/portfolio/case-content.ts`.
- Imagens servidas por route handler customizado, **não** por `next/image` (ausente no código de componentes).

## Rotas

| Grupo | Rotas |
|-------|-------|
| Público | `/`, `/ds`, `/login` |
| Leitor | `/portfolio`, `/portfolio/[slug]`, `/case`, `/cv` |
| Redirect | `/cases/*` → `/portfolio/*`; `/homolog/*` → 308 |
| Editor | `/editor`, `/editor/login`, `/editor/cv/*`, `/editor/cases/*` |
| Ops | `/status` |
| API | `/api/chat/*`, `/api/status`, `/api/editor/cases/[slug]/media` |
| Mídia | `/media/[...path]` |

## API

- **Chat:** `POST /api/chat/sessions`, mensagens, `GET .../stream` (SSE), webhook Telegram.
- **Status:** `GET /api/status` (JSON, protegido).
- **Editor media:** `POST /api/editor/cases/[slug]/media` (protegido por cookie editor).

## Server Actions

- `portfolioLoginAction` — login leitor.
- `loginAction` / `logoutAction` — login/logout editor.
- `saveResume`, ações de CV em `app/editor/cv/[id]/actions.ts`.
- `saveCaseAction` — metadados + sync de `case_media` e remoção de arquivos órfãos.

## Fluxo geral das requisições

1. Cliente HTTP → **Cloudflare** (HTTPS) → **cloudflared** na VM → `127.0.0.1:9090`.
2. **Docker** mapeia porta host 9090 → container 3000.
3. **Next.js middleware** avalia auth conforme rota.
4. **Server Component** ou **Route Handler** executa.
5. Leitura/escrita em **SQLite** (`better-sqlite3`) e/ou **filesystem** (`data/media/`).
6. Resposta HTML/JSON/stream SSE retorna ao cliente.

---

# 4. Infraestrutura

| Item | Detalhe (fonte no código/docs) |
|------|-------------------------------|
| **SO dev** | macOS (dev via `npm run dev`) |
| **SO produção** | VM **Oracle Cloud** com Linux (`systemctl` em `docs/cloudflare-tunnel.md`, `scripts/stack.sh`) |
| **Servidor HTTP** | **Next.js standalone** (`node server.js`) — sem Nginx no repositório |
| **Runtime** | **Node.js 22** (`Dockerfile`: `node:22-bookworm-slim`) |
| **Proxy / borda** | **Cloudflare** DNS + **Cloudflare Tunnel** (`cloudflared`, serviço `lda-cloudflared`) |
| **Banco** | **SQLite** em `data/site.db` (bind mount `./data:/app/data` em `docker-compose.override.yml`) |
| **Armazenamento** | Filesystem local `data/media/` |
| **Docker** | `Dockerfile` multi-stage + `docker-compose.yml` + override com bind mount |
| **Cloudflare** | Tunnel `lda-processos`; hostnames `eduardodamasceno.com.br`, `www`, `edu.xdstudio.com.br` → `:9090` |
| **HTTPS** | Terminado na Cloudflare; origem HTTP local `http://127.0.0.1:9090` |
| **Domínio** | `eduardodamasceno.com.br` (`SITE_PUBLIC_ORIGIN`, `docs/cloudflare-tunnel.md`) |
| **Portas** | Dev: **3000**; container: **3000**; host Docker: **9090** (`EDUARDODAMASCENO_HTTP_PORT`) |
| **Telegram** | API externa `api.telegram.org` para notificações e webhook |

## Variáveis de ambiente (`.env.example`)

| Variável | Uso |
|----------|-----|
| `EDUARDODAMASCENO_HTTP_PORT` | Porta HTTP no host Docker (padrão 9090) |
| `SITE_DB_PATH` | Caminho do SQLite |
| `EDITOR_PASSWORD` / `EDITOR_SECRET` | Auth editor |
| `PORTFOLIO_PASSWORD` / `PORTFOLIO_SECRET` | Auth leitor de cases |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `TELEGRAM_WEBHOOK_SECRET` | Chat |
| `SITE_PUBLIC_ORIGIN` | URL pública para checks e webhook |
| `WP_SITE_URL` / `WP_SITE_PASSWORD` / `WP_POST_PASSWORD` | Import WordPress |

## Processos de inicialização

**Desenvolvimento (Mac):**

```bash
npm install && cp .env.local.example .env.local && npm run dev
```

**Produção (Oracle):**

```bash
git pull
./scripts/stack.sh build && ./scripts/stack.sh up
```

- `docker-entrypoint.sh` ajusta permissões de `/app/data` e executa como usuário `nextjs` via `gosu`.
- Dados sincronizados Mac ↔ Oracle via `scp`/`rsync` (não versionados no Git — `data/` no `.gitignore`).

**Publicação:** commit → push → `git pull` na Oracle → rebuild Docker → sync manual de `site.db` e `data/media/` quando necessário.

---

# 5. Stack Tecnológica

| Tecnologia | Versão encontrada | Finalidade |
|------------|-------------------|------------|
| Next.js | 15.5.15 (`package-lock.json`) | Framework full-stack, App Router, standalone |
| React | 19.2.5 | UI |
| React DOM | 19.2.5 | Renderização client |
| TypeScript | 5.9.3 | Tipagem |
| Tailwind CSS | 3.4.19 | Estilos utilitários |
| PostCSS | 8.5.9 | Pipeline CSS |
| Autoprefixer | 10.4.27 | Prefixos CSS |
| better-sqlite3 | 11.10.0 | Driver SQLite síncrono |
| @types/better-sqlite3 | ^7.6.12 (package.json) | Tipos |
| GSAP | 3.15.0 | Animações scroll/hero |
| split-type | 0.3.4 | Split de texto para animação |
| Node.js | 22 (Dockerfile) | Runtime produção |
| Docker | Compose v2/v1 (`stack.sh`) | Containerização |
| Debian Bookworm slim | (imagem base Docker) | SO do container |
| gosu | (apt no Dockerfile) | Drop privileges no entrypoint |
| ESLint | 9.39.4 | Lint |
| eslint-config-next | 15.5.15 | Regras Next |
| @types/node | 22.19.17 | Tipos Node |
| @types/react / react-dom | ^19.0.0 | Tipos React |
| Cloudflare Tunnel | cloudflared (externo) | HTTPS público sem abrir porta |
| Telegram Bot API | (HTTP fetch) | Notificações e respostas do chat |
| SQLite | 3 (via better-sqlite3) | Banco relacional embutido |
| Manrope (Google Fonts) | via next/font | Tipografia |
| Material Icons | CDN Google | Ícones |
| Web Crypto API | (Edge middleware) | HMAC de sessão no middleware |

**Ausente no `package.json`:** Prisma, Drizzle, OpenAI, Nginx, Sharp, Framer Motion, Zod, Redis.

---

# 6. Estrutura do Projeto

| Pasta / arquivo | Responsabilidade |
|-----------------|------------------|
| `app/(portfolio)/` | Site público: home (grid em `/#projetos`), detalhe de case, login, status, design system |
| `app/(portfolio)/portfolio/` | Índice e detalhe protegidos do portfólio |
| `app/case/` | Route handler do deck protegido em `/case` |
| `case/` / `public/case/` | Fonte editável e cópia publicada do deck |
| `app/cv/` | Página pública do currículo |
| `app/editor/` | CMS: hub, login, CRUD de CV e cases, Server Actions |
| `app/api/chat/` | REST + SSE do chat e webhook Telegram |
| `app/api/status/` | JSON do painel operacional |
| `app/api/editor/` | Upload de mídia de cases |
| `app/media/[...path]/` | Servir arquivos de `data/media/` |
| `app/layout.tsx` | Root layout, metadata, fonte, tema boot |
| `components/portfolio/` | UI do site: home, cases, chat, nav, motion, DS |
| `components/editor/` | UI do CMS: forms, header, media editor |
| `components/cv/` | Renderização do CV público |
| `lib/domains/` | Lógica de negócio: auth, cases, chat, status |
| `lib/db/` | Cliente SQLite, schema, migrations, queries, seed |
| `lib/portfolio/` | Copy, tema, rotas, âncoras (`/#projetos`, `/#projeto-<slug>`), utilitários de case content |
| `lib/site/` | URLs externas (LinkedIn etc.) |
| `middleware.ts` | Auth gates e redirect `/homolog` |
| `data/` | `site.db` + `media/` (gitignored) |
| `scripts/` | Deploy (`stack.sh`), WP import, Telegram, migrações |
| `docs/` | Arquitetura, cases, chat, Cloudflare, evolução |
| `deploy/cloudflared/` | Exemplo de config multi-host |
| `Dockerfile` / `docker-compose*.yml` | Build e orquestração |
| `docs/legacy-supabase/` | Schema Postgres arquivado (migração histórica) |

Não existe pasta `public/` com assets no workspace atual; o Dockerfile ainda copia `public` do build.

---

# 7. Fluxo de Dados

## Requisição pública (home)

```
Usuário (browser)
    ↓ HTTPS
Cloudflare (DNS + TLS)
    ↓ HTTP
cloudflared (tunnel lda-processos)
    ↓ 127.0.0.1:9090
Docker (port map 9090→3000)
    ↓
Next.js Server Component (app/(portfolio)/page.tsx)
    ↓
better-sqlite3 → data/site.db (cases publicados, resume ativo)
    ↓
lib/portfolio/copy.ts + clients.ts (copy estático)
    ↓
HTML + assets → Usuário
```

## Leitura de case protegido

```
Usuário → /portfolio → clica card → /portfolio/[slug]
    ↓
middleware.ts (cookie portfolio_session vs HMAC)
    ↓ (se inválido → /login?from=/portfolio/<slug>)
Server Component → lib/domains/cases/queries.ts
    ↓
SQLite (cases, case_content, case_media)
    ↓
CaseDetailView + /media/... para imagens
    ↓
“← Projetos” → /portfolio#projeto-<slug> (ScrollToHashOnMount)
```

## Edição de case

```
Editor (browser) → /editor/cases/[slug]
    ↓
middleware (editor_session)
    ↓
CaseEditor (client) → upload POST /api/editor/cases/[slug]/media
    ↓                              ↓
saveCaseAction (Server Action)   data/media/cases/<slug>/
    ↓
lib/domains/cases/mutations.ts → SQLite (cases, case_content, case_media)
    ↓
revalidatePath('/') /portfolio /portfolio/<slug> /editor/...
```

## Chat

```
Visitante → PortfolioChat (client, sessionId em memória do browser)
    ↓
POST /api/chat/sessions → SQLite (chat_sessions, chat_messages)
    ↓
Telegram sendMessage (se configurado)
    ↓
GET /api/chat/sessions/[id]/stream (SSE, pub/sub in-memory)
    ↓
Resposta do dono via webhook POST /api/chat/telegram/webhook → SSE → UI
```

---

# 8. Banco de Dados

| Item | Detalhe |
|------|---------|
| **Banco** | SQLite |
| **Localização** | `data/site.db` (default); `SITE_DB_PATH` ou `/app/data/site.db` no Docker |
| **ORM** | Nenhum — SQL direto via `better-sqlite3` |
| **Migrations** | `lib/db/schema.sql` + `lib/db/migrations/*.sql` + lógica em `lib/db/client.ts` (`user_version` 1–8) |
| **Modo** | WAL, foreign keys ON |

## Tabelas e entidades

| Tabela | Entidade | Relacionamentos |
|--------|----------|-----------------|
| `resumes` | Versões de currículo | 1:N com profile, experiences, author_projects, skills, education |
| `profile` | Dados pessoais do CV | 1:1 com `resumes` (UNIQUE resume_id) |
| `experiences` | Experiência profissional | N:1 `resumes` |
| `author_projects` | Projetos autorais no CV | N:1 `resumes` |
| `skills` | Habilidades por categoria | N:1 `resumes` |
| `education` | Formação | N:1 `resumes` |
| `cases` | Metadados do case | 1:1 `case_content`; 1:N `case_media` |
| `case_content` | Corpo HTML | 1:1 `cases` |
| `case_media` | Galeria (path, alt, ordem) | N:1 `cases` |
| `chat_sessions` | Sessão de chat | 1:N `chat_messages` |
| `chat_messages` | Mensagens user/owner | N:1 `chat_sessions` |

## Campos relevantes em `cases`

- `status`: `draft` | `published`
- `segments`: JSON array (`financeiros`, `industria`, `plataformas`, `autorais`)
- `cover_path`, `youtube_url`, `sort_order`, `wp_id` (import WP)

## Seed

- `lib/db/seed.ts` popula resume base se tabela `resumes` vazia na primeira inicialização.

---

# 9. Editor (CMS)

Localização: `app/editor/` + `components/editor/`.

## Funcionalidades

- **Hub** (`/editor`): links para Currículos, Cases e Status (`app/editor/page.tsx`).
- **Login** (`/editor/login`): formulário com Server Action `loginAction`.
- **Logout**: `logoutAction` em `app/editor/actions.ts`.

## Telas

| Rota | Função |
|------|--------|
| `/editor` | Hub administrativo |
| `/editor/login` | Autenticação editor |
| `/editor/cv` | Lista de currículos |
| `/editor/cv/[id]` | Editor completo do CV |
| `/editor/cv/[id]/print` | Versão para impressão |
| `/editor/cases` | Lista de cases |
| `/editor/cases/new` | Criar case |
| `/editor/cases/[slug]` | Editar case existente |

Layout: tema claro fixo via `EditorLightTheme` (`app/editor/layout.tsx`).

## Gerenciamento de conteúdo (cases)

- `CaseEditor.tsx`: título, slug, subtítulo, status, ordem, segmentos (checkboxes), URL YouTube, corpo HTML (textarea), galeria.
- **Preview** link para `/portfolio/<slug>` (requer senha leitor).
- Novos cases: salvar metadados primeiro antes de upload de imagens.

## Gerenciamento do currículo

- `ResumeEditor.tsx`: profile, experiências, projetos autorais, skills (JSON items), educação.
- Múltiplos resumes; um ativo (`is_active` unique partial index).
- Persistência via `saveResume` Server Action → `lib/db/mutations.ts`.

## Gerenciamento do portfólio

- Indiretamente via cases (`sort_order`, `status`, `segments` afetam a home em `/#projetos`).
- Copy da home **não** é editável no editor (hardcoded em `lib/portfolio/copy.ts`).

## Upload de mídia

- `CaseMediaEditor.tsx`: grid 4 colunas, drag-reorder, definir capa, remover.
- Upload via `fetch` POST para `/api/editor/cases/[slug]/media`.
- Ao salvar: `syncCaseMedia` em `lib/domains/cases/mutations.ts` sincroniza `case_media`, atualiza `cover_path`, remove arquivos excluídos do disco.

## Autenticação

- Cookie `editor_session` (httpOnly, secure em production, sameSite lax, 7 dias).
- Middleware protege todas as rotas `/editor/*` exceto login.
- API de upload usa `requireEditorApi()` (mesmo token).

## Persistência

- **SQLite** para metadados e referências de mídia.
- **Disco** para bytes das imagens em `data/media/cases/<slug>/`.
- `revalidatePath` após saves para refletir no site.

---

# 10. Recursos Inteligentes

**Nenhum uso de IA/ML identificado no código de runtime.**

- Não há dependências OpenAI, Anthropic, embeddings ou OCR.
- A única menção a "Claude Code" está em `lib/db/base-resume-data.ts` como item de skill no currículo seed — não é integração técnica.
- Chat usa **resposta automática fixa** (`CHAT_AUTO_REPLY` em `lib/domains/chat/constants.ts`), não LLM.
- Copy da home menciona "IA aplicada ao processo de descoberta" como especialidade textual (`lib/portfolio/copy.ts`), sem implementação no sistema.

---

# 11. Arquitetura Física

```
Internet
    ↓
Cloudflare (DNS + HTTPS/TLS)
    ↓
cloudflared (systemd: lda-cloudflared)
    ↓ HTTP
VM Oracle Cloud (Linux)
    ↓ 127.0.0.1:9090
Docker Engine
    ↓ port 9090:3000
Container "web" (node:22-bookworm-slim)
    ↓
Next.js standalone (node server.js) :3000
    ├── better-sqlite3 → /app/data/site.db (bind ./data)
    └── fs → /app/data/media/
    ↓ (opcional)
api.telegram.org (notificações chat)
```

**Comunicação entre serviços:**

| Origem | Destino | Protocolo | Porta |
|--------|---------|-----------|-------|
| Internet | Cloudflare | HTTPS | 443 |
| cloudflared | Docker host | HTTP | 9090 |
| Container | SQLite file | local FS | — |
| Container | Telegram API | HTTPS | 443 |
| Dev Mac | localhost | HTTP | 3000 |

**Sem Nginx** no stack documentado — tunnel aponta direto para a porta do Docker.

**Tunnel compartilhado** com outros projetos (`lda-processos` — luizdaniel, ilovemalu) conforme `docs/cloudflare-tunnel.md`.

---

# 12. Segurança

| Aspecto | Implementação |
|---------|---------------|
| **HTTPS** | Na borda Cloudflare; origem HTTP local |
| **Autenticação** | Senha compartilhada + HMAC-SHA256 em cookie httpOnly |
| **Proteção de rotas** | `middleware.ts` matcher para `/editor`, `/portfolio/*`, `/case/*`, `/cv`, `/status`, `/api/status` |
| **API editor** | 401 JSON se cookie inválido (`denyUnlessEditor`) |
| **Cookies** | `httpOnly`, `secure` em `NODE_ENV=production`, `sameSite: 'lax'`, `maxAge` 7 dias |
| **Sessão chat** | ID em memória do browser (não cookie); TTL 24h no servidor (`docs/evolucao.md`) |
| **Variáveis sensíveis** | `.env` / `.env.local` (não commitados); defaults fracos em dev (`admin`, `portfolio`) |
| **Uploads** | Whitelist de extensões, limite 10 MB, slug sanitizado, path traversal bloqueado em `/media` e `resolveMediaFile` |
| **HTML de cases** | Renderizado sem sanitização adicional visível no código (`dangerouslySetInnerHTML`) — conteúdo confiável (editor autenticado) |
| **Webhook Telegram** | Header opcional `TELEGRAM_WEBHOOK_SECRET` |
| **Rate limit chat** | `CHAT_RATE_LIMIT_PER_MINUTE = 5`, limite de mensagens por sessão (`lib/domains/chat/constants.ts`) |

**Headers de segurança explícitos:** não configurados em `next.config.ts` (sem CSP, HSTS custom etc. no código).

---

# 13. Performance

| Recurso | Status no código |
|---------|------------------|
| **SSR** | Sim — Server Components com `force-dynamic` em páginas principais |
| **ISR** | Não utilizado (sem `revalidate` export nas pages) |
| **Cache** | `revalidatePath` pós-mutação; mídia com `Cache-Control: public, max-age=86400` |
| **Image Optimization** | Não — sem `next/image`; imagens servidas raw pelo route handler |
| **Lazy Loading** | Não identificado via `dynamic()` import; componentes client carregados normalmente |
| **Compressão** | Delegada ao Next/Node standalone (não configurada explicitamente) |
| **Streaming** | SSE para chat (`ReadableStream` em `/api/chat/.../stream`) |
| **Server Components** | Padrão App Router para páginas de dados |
| **SQLite WAL** | `journal_mode = WAL` para concorrência de leitura |
| **Font display** | `display: 'swap'` em Manrope |
| **Animações** | GSAP com componentes client (`RevealOnScroll`, `HeroSection`) |

**Limitação documentada:** pub/sub SSE do chat é **in-memory** — não escala horizontalmente sem Redis (`docs/evolucao.md`).

---

# 14. Roadmap percebido

Com base em `docs/cases.md`, `docs/evolucao.md`, `README.md` e comentários no código:

| Item | Fonte |
|------|-------|
| **Editor visual do corpo do case** (sem HTML manual) — "etapa 2" | `docs/cases.md` |
| **Unificar import WP** com `lib/domains/cases/mutations.ts` | `docs/cases.md`, `docs/evolucao.md` |
| **Design system** — expandir tokens `--pf-*` no CV | `docs/evolucao.md` |
| **Remover redirect `/homolog`** quando tráfego legado zerar | `middleware.ts`, `README.md`, `docs/evolucao.md` |
| **Remover docs Vercel/Supabase** após estabilização | `docs/evolucao.md` |
| **Logos de clientes** em `/media/clients/{id}.svg` (campo `logoPath` preparado) | `lib/portfolio/clients.ts` |
| **Escalar chat** com Redis (mencionado como necessidade futura) | `docs/evolucao.md` |

**Nota:** `docs/evolucao.md` ainda lista "Upload de capa/galeria no editor" como próxima frente, mas o código já implementa `CaseMediaEditor` e API de upload — item aparentemente concluído.

---

# 15. Resumo Executivo

**eduardodamasceno** é uma aplicação **monolítica Next.js 15** (React 19, TypeScript, Tailwind) empacotada em modo **standalone** e executada em **Docker** sobre uma **VM Oracle Cloud**. A exposição pública usa **Cloudflare Tunnel** (`cloudflared`), que termina TLS na borda e encaminha tráfego HTTP para `127.0.0.1:9090`, onde o container Next.js escuta na porta interna 3000.

A persistência é **100% local**: banco **SQLite** (`data/site.db`, driver `better-sqlite3`, modo WAL) e arquivos de mídia em `data/media/`. Não há ORM, Redis, nem serviços de nuvem para dados. O schema cobre currículo (resumes e entidades relacionadas), portfólio (cases, conteúdo HTML, galeria) e chat (sessões e mensagens com TTL). Migrations versionadas em `lib/db/client.ts` evoluem o schema de forma incremental.

O produto divide-se em três superfícies: **site público** (home e design system), **conteúdo de leitor protegido** (`/portfolio`, `/case` e `/cv`, com a mesma senha) e **editor administrativo** (`/editor` com senha separada). A autenticação é baseada em **cookies httpOnly** cujo valor é um **HMAC-SHA256** da senha, validado no middleware Edge e nas páginas sensíveis. Duas credenciais independentes separam leitores de editores.

O CMS em `/editor` gerencia currículos multi-versão e cases com metadados, segmentos, corpo HTML e **galeria de imagens** (upload multipart, reorder, capa). O conteúdo editorial da home permanece em código (`lib/portfolio/copy.ts`). Cases publicados alimentam `/portfolio`; o detalhe combina carrossel (`case_media` + `cover_path`), embed YouTube e HTML processado. O deck especial em `/case` é um artefato estático versionado separadamente em `case/`.

O **chat de contato** é um subsistema próprio: sessões anônimas no SQLite, resposta automática, notificação **Telegram** e entrega de respostas do dono via **SSE** (pub/sub in-memory). Não há IA no fluxo.

A renderização é predominantemente **dinâmica no servidor** (`force-dynamic`); invalidação explícita via `revalidatePath` após edições. Imagens não passam pelo optimizer do Next — são servidas por route handler com cache de 24h.

**Deploy:** desenvolvimento no Mac (`npm run dev :3000`); produção via `git pull` + `./scripts/stack.sh build && up` na Oracle, com sincronização manual de `data/` entre ambientes. Dados nunca entram no Git.

**Evolução prevista:** editor visual de cases, consolidação do pipeline WordPress, expansão do design system, remoção de legados (`/homolog`, Supabase docs), e eventual Redis se o chat precisar escalar além de um único container.

Este inventário reflete exclusivamente o estado do repositório e documentação em `docs/`, adequado como base para um **infográfico de arquitetura** com camadas: Cloudflare → Tunnel → Docker/Node → Next.js → SQLite/FS → Telegram.
