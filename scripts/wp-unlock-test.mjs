#!/usr/bin/env node
/** Debug postpass unlock — grava data/wp-unlock-test.json (sem senhas) */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

function projectRoot() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  if (scriptDir.endsWith(`${path.sep}scripts`)) return path.resolve(scriptDir, '..')
  return scriptDir
}

function loadEnv(filePath) {
  const env = {}
  if (!fs.existsSync(filePath)) return env
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

function cookieNames(res) {
  const list = res.headers.getSetCookie?.() ?? []
  return list.map((c) => c.split('=')[0].trim())
}

function isLocked(html) {
  return html.includes('post-password-form') || html.includes('post-password-required')
}

class CookieJar {
  /** @type {Map<string, string>} */
  #cookies = new Map()

  ingest(response) {
    for (const raw of response.headers.getSetCookie?.() ?? []) {
      const pair = raw.split(';')[0]
      const eq = pair.indexOf('=')
      if (eq === -1) continue
      this.#cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
    }
  }

  header() {
    return [...this.#cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  }
}

async function fetchWithJar(url, jar, init = {}) {
  const headers = new Headers(init.headers)
  const cookie = jar.header()
  if (cookie) headers.set('Cookie', cookie)
  const res = await fetch(url, { ...init, headers })
  jar.ingest(res)
  return res
}

async function unlockCase(caseUrl, password, siteUrl) {
  const jar = new CookieJar()
  const base = siteUrl.replace(/\/$/, '')

  await fetchWithJar(`${base}/portfolio/`, jar, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `post_password=${encodeURIComponent(password)}`,
    redirect: 'follow',
  })

  const first = await fetchWithJar(caseUrl, jar)
  let html = await first.text()
  if (!isLocked(html)) return html

  const redirectTo = html.match(/name="redirect_to" value="([^"]+)"/)?.[1] ?? caseUrl
  const loginAction = `${base}/wp-login.php?action=postpass`

  const postRes = await fetchWithJar(loginAction, jar, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      post_password: password,
      redirect_to: redirectTo,
      Submit: 'Entrar',
    }),
    redirect: 'manual',
  })

  const location = postRes.headers.get('location') ?? redirectTo
  const final = await fetchWithJar(location, jar, { redirect: 'follow' })
  return final.text()
}

async function main() {
  const root = projectRoot()
  const env = { ...loadEnv(path.join(root, '.env')), ...loadEnv(path.join(root, '.env.local')) }
  const siteUrl = (process.env.WP_SITE_URL || env.WP_SITE_URL)?.replace(/\/$/, '')
  const password = process.env.WP_SITE_PASSWORD || env.WP_SITE_PASSWORD
  const casePath = '/portfolio/bipdoc-app-de-lembretes-de-medicamentos/'
  const caseUrl = `${siteUrl}${casePath}`

  const html = await unlockCase(caseUrl, password, siteUrl)

  const report = {
    caseUrl,
    locked: isLocked(html),
    htmlLength: html.length,
    entryContentLength: (
      html.match(/<div class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? ''
    ).length,
    hasImages: html.includes('wp-content/uploads'),
  }

  const out = path.join(root, 'data', 'wp-unlock-test.json')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(report, null, 2))
  console.log('Relatório:', out)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
