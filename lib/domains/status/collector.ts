import fs from 'fs'
import os from 'os'
import { getDb, getDbPath } from '@/lib/db/client'

export type ServiceStatus = 'ok' | 'warn' | 'error'

export interface StatusCheck {
  id: string
  label: string
  status: ServiceStatus
  detail: string
}

export interface StatusGroup {
  id: string
  title: string
  checks: StatusCheck[]
}

export interface SiteStatus {
  generatedAt: string
  hostname: string
  groups: StatusGroup[]
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${Math.floor(seconds % 60)}s`
}

async function checkPublicSite(origin: string): Promise<StatusCheck> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(origin, {
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
    })
    clearTimeout(timeout)
    return {
      id: 'public-site',
      label: 'Site público',
      status: res.ok ? 'ok' : 'warn',
      detail: res.ok ? `${origin} — HTTP ${res.status}` : `${origin} — HTTP ${res.status}`,
    }
  } catch {
    return {
      id: 'public-site',
      label: 'Site público',
      status: 'error',
      detail: `${origin} — inacessível`,
    }
  }
}

function collectAppChecks(): StatusCheck[] {
  const mem = process.memoryUsage()
  const env = process.env.NODE_ENV ?? 'development'

  return [
    {
      id: 'node-env',
      label: 'Ambiente',
      status: env === 'production' ? 'ok' : 'warn',
      detail: env,
    },
    {
      id: 'uptime',
      label: 'Uptime do processo',
      status: 'ok',
      detail: formatUptime(process.uptime()),
    },
    {
      id: 'memory',
      label: 'Memória (heap)',
      status: mem.heapUsed > 400 * 1024 * 1024 ? 'warn' : 'ok',
      detail: formatBytes(mem.heapUsed),
    },
    {
      id: 'site-origin',
      label: 'Origem configurada',
      status: process.env.SITE_PUBLIC_ORIGIN ? 'ok' : 'warn',
      detail: process.env.SITE_PUBLIC_ORIGIN ?? 'SITE_PUBLIC_ORIGIN não definida',
    },
  ]
}

function collectDatabaseChecks(): StatusCheck[] {
  try {
    const db = getDb()
    const dbPath = getDbPath()
    const stat = fs.statSync(dbPath)
    const schemaVersion = db.pragma('user_version', { simple: true }) as number

    const published = (
      db.prepare("SELECT COUNT(*) AS c FROM cases WHERE status = 'published'").get() as {
        c: number
      }
    ).c
    const total = (db.prepare('SELECT COUNT(*) AS c FROM cases').get() as { c: number }).c
    const drafts = total - published

    const mediaDir = dbPath.replace(/[^/]+$/, 'media')
    let mediaCount = 0
    if (fs.existsSync(mediaDir)) {
      mediaCount = fs.readdirSync(mediaDir).length
    }

    return [
      {
        id: 'db-connection',
        label: 'SQLite',
        status: 'ok',
        detail: 'Conectado',
      },
      {
        id: 'db-schema',
        label: 'Schema',
        status: 'ok',
        detail: `versão ${schemaVersion}`,
      },
      {
        id: 'db-size',
        label: 'Arquivo do banco',
        status: 'ok',
        detail: `${formatBytes(stat.size)} · atualizado ${stat.mtime.toLocaleString('pt-BR')}`,
      },
      {
        id: 'cases-published',
        label: 'Cases publicados',
        status: published > 0 ? 'ok' : 'warn',
        detail: String(published),
      },
      {
        id: 'cases-drafts',
        label: 'Cases em rascunho',
        status: 'ok',
        detail: String(drafts),
      },
      {
        id: 'media-files',
        label: 'Arquivos em data/media',
        status: mediaCount > 0 ? 'ok' : 'warn',
        detail: String(mediaCount),
      },
    ]
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return [
      {
        id: 'db-connection',
        label: 'SQLite',
        status: 'error',
        detail: message,
      },
    ]
  }
}

function collectIntegrationChecks(): StatusCheck[] {
  const telegramToken = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim())
  const telegramChat = Boolean(process.env.TELEGRAM_CHAT_ID?.trim())
  const telegramWebhook = Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim())

  return [
    {
      id: 'telegram',
      label: 'Telegram (chat)',
      status: telegramToken && telegramChat ? 'ok' : 'warn',
      detail:
        telegramToken && telegramChat
          ? 'Bot e chat configurados'
          : 'Token ou chat ID ausente',
    },
    {
      id: 'telegram-webhook',
      label: 'Webhook Telegram',
      status: telegramWebhook ? 'ok' : 'warn',
      detail: telegramWebhook ? 'Secret configurado' : 'TELEGRAM_WEBHOOK_SECRET ausente',
    },
    {
      id: 'portfolio-auth',
      label: 'Senha cases (/cases)',
      status: process.env.PORTFOLIO_PASSWORD ? 'ok' : 'warn',
      detail: process.env.PORTFOLIO_PASSWORD ? 'Configurada' : 'Usando padrão do .env',
    },
    {
      id: 'cvmkr-auth',
      label: 'Senha CVMKR',
      status: process.env.CVMKR_PASSWORD ? 'ok' : 'warn',
      detail: process.env.CVMKR_PASSWORD ? 'Configurada' : 'Usando padrão do .env',
    },
  ]
}

export async function collectSiteStatus(): Promise<SiteStatus> {
  const origin = process.env.SITE_PUBLIC_ORIGIN ?? 'https://eduardodamasceno.com.br'
  const publicCheck = await checkPublicSite(origin)

  return {
    generatedAt: new Date().toISOString(),
    hostname: os.hostname(),
    groups: [
      {
        id: 'app',
        title: 'Aplicação',
        checks: collectAppChecks(),
      },
      {
        id: 'network',
        title: 'Rede',
        checks: [publicCheck],
      },
      {
        id: 'database',
        title: 'Banco de dados',
        checks: collectDatabaseChecks(),
      },
      {
        id: 'integrations',
        title: 'Integrações',
        checks: collectIntegrationChecks(),
      },
    ],
  }
}
