# Apresentação de case — `/case`

A rota protegida **`/case`** (`https://eduardodamasceno.com.br/case`) é o lugar permanente para uma **apresentação detalhada de um case específico** meu. Ela usa a mesma senha e sessão de `/portfolio` (`PORTFOLIO_PASSWORD` / `portfolio_session`).

Não é listagem. Não é o portfólio em `/portfolio`. É o deck narrativo de um único case, em profundidade — o artefato que eu uso em conversas, entrevistas e walkthroughs.

## Papel no site

| Rota | Função |
|------|--------|
| `/portfolio` | Galeria / índice de cases (protegida) |
| `/portfolio/[slug]` | Página de case no portfólio |
| **`/case`** | **Apresentação fullscreen protegida de um case em detalhe** |

A ideia é incorporar o deck **dentro do mesmo projeto** `eduardodamasceno`, em vez de um repositório ou pasta vizinha solta. Fonte e publicação vivem juntos.

## Como está organizado

```
eduardodamasceno/
├── case/                 ← fonte editável do deck (HTML/CSS/JS/assets)
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── PRESENTATION.md   ← roteiro / notas do apresentador
├── public/case/          ← cópia publicada (servida pelo Next)
├── app/case/route.ts     ← garante GET /case (sem precisar de /case/)
└── scripts/sync-presentation.sh
```

- **Editar** sempre em `case/`.
- **Publicar** no site: sincronizar → commit → deploy.

## Fluxo de trabalho

```bash
# 1. Editar o deck
cd case
./scripts/serve.sh          # preview local em http://127.0.0.1:8000

# 2. Espelhar para o que o Next serve
cd ..
npm run presentation:sync   # case/ → public/case/

# 3. Subir
git add case public/case
git commit -m "Update case presentation"
./scripts/deploy.sh
```

URL final: **https://eduardodamasceno.com.br/case**

## Princípios

1. **Um case por vez na URL `/case`.** Quando o case em destaque mudar, o deck em `case/` é substituído ou evoluído — a URL permanece estável.
2. **Mesmo projeto.** Nada de pasta irmã em `Development/case`. Tudo versionado e deployado com o portfólio.
3. **Narrativa, não catálogo.** `/case` conta a história completa (problema → discovery → solução → impacto). `/portfolio` continua sendo o índice.

## Conteúdo atual

O deck vigente é o case de **Partner Onboarding B2B (XP Inc.)**. O roteiro está em `case/PRESENTATION.md`.
