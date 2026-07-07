import path from 'path'

const SITE_DB_NAME = 'site.db'

/** Diretório `data/` — pasta do SQLite e de `media/`. */
export function getDataDir(cwd = process.cwd()): string {
  const fromEnv = process.env.SITE_DB_PATH
  if (fromEnv) return path.dirname(path.resolve(cwd, fromEnv))
  return path.join(cwd, 'data')
}

/** Caminho do SQLite — `SITE_DB_PATH` ou `data/site.db`. */
export function resolveSiteDbPath(cwd = process.cwd()): string {
  const explicit = process.env.SITE_DB_PATH
  if (explicit) return path.resolve(cwd, explicit)
  return path.join(cwd, 'data', SITE_DB_NAME)
}
