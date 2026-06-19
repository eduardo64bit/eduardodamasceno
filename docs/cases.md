# Cases

Conteúdo dos projetos do portfólio. Fonte atual: import do WordPress + edição manual no SQLite.

## Modelo

| Tabela | Uso |
|--------|-----|
| `cases` | Metadados: slug, título, subtítulo, capa, YouTube, status, ordem |
| `case_content` | Corpo HTML (`body_html`) |
| `case_media` | Galeria (paths relativos a `data/media/`) |

**Público:** apenas `status = 'published'`, ordenado por `sort_order`.

**Protegido:** `/cases/[slug]` exige senha `PORTFOLIO_PASSWORD` (middleware).

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

## Enriquecer um case manualmente

1. **Publicar:** `UPDATE cases SET status = 'published' WHERE slug = 'meu-case';`
2. **Ordem na home:** `UPDATE cases SET sort_order = 10 WHERE slug = 'meu-case';` (menor = mais acima)
3. **Capa:** path relativo, ex. `/media/cases/meu-case/cover.png` (arquivo em `data/media/cases/...`)
4. **Galeria:** inserir linhas em `case_media` com `sort_order` sequencial
5. **Corpo:** editar `case_content.body_html` (HTML sanitizado na renderização)

Ferramentas: [DB Browser for SQLite](https://sqlitebrowser.org/), ou `sqlite3 data/cvmkr.db`.

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
- [ ] Testar em `/cases/<slug>` (logado) e na home

## Roadmap

- Editor visual no `/cvmkr/cases` (placeholder hoje)
- Unificar lógica de import nos scripts `.mjs` com `lib/domains/cases/mutations.ts`
