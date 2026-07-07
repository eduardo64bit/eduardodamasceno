import path from 'path'

const SITE_DB_NAME = 'site.db'

/**
 * @param {string} root — raiz do repositório
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveSiteDbPath(root, env = process.env) {
  const explicit = env.SITE_DB_PATH
  if (explicit) return path.resolve(root, explicit)
  return path.join(root, 'data', SITE_DB_NAME)
}
