# Cases

Conteúdo dos projetos do portfólio. Fonte atual: import do WordPress + edição manual no SQLite.

## Modelo

| Tabela | Uso |
|--------|-----|
| `cases` | Metadados: slug, título, subtítulo, capa, YouTube, status, ordem |
| `case_content` | Corpo HTML (`body_html`) |
| `case_media` | Galeria (paths relativos a `data/media/`) |

**Público:** apenas `status = 'published'`, ordenado por `sort_order`.

**Protegido:** `/portfolio`, `/portfolio/[slug]`, `/case` e `/cv` exigem a mesma senha `PORTFOLIO_PASSWORD` (middleware).

**Navegação:** a listagem fica em `/portfolio`. O detalhe abre em `/portfolio/<slug>`; o link “← Projetos” volta para `/portfolio#projeto-<slug>`. URLs antigas em `/cases/*` redirecionam para `/portfolio/*`. A seção Projetos na home só aparece se `PORTFOLIO_SHOW_HOME_PROJECTS=true`.

## Importar do WordPress

Configure no `.env`:

```env
WP_SITE_URL=https://eduardo64bit.wordpress.com
WP_SITE_PASSWORD="senha-do-site"
# WP_POST_PASSWORD="senha-dos-posts"   # se diferente
```

Comandos:

```bash
npm run wp:inventory    # lista posts → data/wp-inventory.json
npm run wp:import       # importa para SQLite + baixa imagens
npm run wp:import:wxr   # alternativa via export XML
```

Reimport forçado (sobrescreve cases existentes com mesmo `wp_id`):

```bash
node scripts/wp-import.mjs --force
```

## Editar no browser

1. Acesse `/editor/login` → **Cases** → escolha um case ou **+ Novo case**
2. Campos: título, subtítulo, status, ordem, segmentos, **galeria (upload + capa + ordem)**, YouTube, corpo HTML
3. **Preview →** abre `/portfolio/<slug>` (senha de leitor)
4. Galeria: arraste para reordenar; **Definir capa** na miniatura desejada; **Salvar** persiste `case_media` e remove arquivos excluídos

## Enriquecer via SQL (alternativa)

1. **Publicar:** `UPDATE cases SET status = 'published' WHERE slug = 'meu-case';`
2. **Ordem na home:** `UPDATE cases SET sort_order = 10 WHERE slug = 'meu-case';` (menor = mais acima)
3. **Capa:** path relativo, ex. `/media/cases/meu-case/cover.png` (arquivo em `data/media/cases/...`)
4. **Galeria:** inserir linhas em `case_media` com `sort_order` sequencial
5. **Segmentos (filtro na home):** coluna `cases.segments` — JSON array, ex. `'["financeiros","plataformas"]'`. Valores: `financeiros`, `industria`, `plataformas`, `autorais`. Um case pode ter vários.
6. **Corpo:** editar `case_content.body_html` (HTML sanitizado na renderização)

Ferramentas: [DB Browser for SQLite](https://sqlitebrowser.org/), ou `sqlite3 data/site.db`.

**Docker:** com bind mount `./data`, Mac e container usam o mesmo `data/site.db`. Sem bind, o volume `site_data` guarda `/app/data/site.db`.

## Mídia

Servida em runtime por `/media/[...path]` → `data/media/`.

Estrutura típica após import:

```
data/media/cases/<slug>/cover.png
data/media/cases/<slug>/01.png
```

## Checklist de qualidade

- [ ] Título e subtítulo claros
- [ ] Capa otimizada (peso razoável)
- [ ] Galeria com `alt` descritivo
- [ ] `body_html` revisado (headings, listas, embeds)
- [ ] `youtube_url` se houver vídeo
- [ ] `status = published` e `sort_order` definido
- [ ] `segments` preenchido para aparecer nos filtros da home
- [ ] Testar em `/portfolio/<slug>` (logado) e na home

## Roadmap

- Unificar lógica de import nos scripts `.mjs` com `lib/domains/cases/mutations.ts`
- Editor visual do corpo (sem HTML) — etapa 2
