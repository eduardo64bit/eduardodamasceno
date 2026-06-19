# Migrar dados do Supabase para SQLite local

Se você ainda tem currículos no Supabase antes de desligar o projeto:

## 1. Exportar do Supabase

No painel Supabase → **Table Editor**, exporte CSV de cada tabela:

- `resumes`, `profile`, `experiences`, `skills`, `education`

Ou use o SQL Editor com `COPY` / export JSON.

## 2. Banco local

O app cria automaticamente `data/cvmkr.db` com o **currículo base** (seed) na primeira execução.

Para importar manualmente:

1. Pare o app.
2. Abra o SQLite: `sqlite3 data/cvmkr.db`
3. Insira os registros respeitando o schema em `lib/db/schema.sql`.
4. Em `skills.items`, use JSON: `["item1","item2"]`.
5. `is_base` / `is_active` / `is_current` são `0` ou `1`.

## 3. Remover variáveis Supabase

Apague do `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Não são mais usadas.
