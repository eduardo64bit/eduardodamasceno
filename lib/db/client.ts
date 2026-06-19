import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { seedDatabase } from './seed'

let db: Database.Database | null = null

export function getDbPath(): string {
  return process.env.CVMKR_DB_PATH ?? path.join(process.cwd(), 'data', 'cvmkr.db')
}

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = getDbPath()
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  initSchema(db)

  return db
}

function initSchema(database: Database.Database) {
  let version = database.pragma('user_version', { simple: true }) as number

  if (version < 1) {
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
    database.exec(fs.readFileSync(schemaPath, 'utf-8'))
    database.pragma('user_version = 1')
    version = 1

    const { c } = database.prepare('SELECT COUNT(*) AS c FROM resumes').get() as { c: number }
    if (c === 0) seedDatabase(database)
  }

  if (version < 2) {
    ensureProfilePortfolioColumn(database)
    database.pragma('user_version = 2')
    version = 2
  }

  if (version < 3) {
    const migrationPath = path.join(
      process.cwd(),
      'lib',
      'db',
      'migrations',
      '003_cases.sql'
    )
    database.exec(fs.readFileSync(migrationPath, 'utf-8'))
    database.pragma('user_version = 3')
    version = 3
  }

  if (version < 4) {
    ensureProfilePortfolioColumn(database)
    database.pragma('user_version = 4')
    version = 4
  }

  if (version < 5) {
    const migrationPath = path.join(
      process.cwd(),
      'lib',
      'db',
      'migrations',
      '004_chat.sql'
    )
    database.exec(fs.readFileSync(migrationPath, 'utf-8'))
    database.pragma('user_version = 5')
    version = 5
  }

  if (version < 6) {
    const migrationPath = path.join(
      process.cwd(),
      'lib',
      'db',
      'migrations',
      '005_chat_presence.sql'
    )
    database.exec(fs.readFileSync(migrationPath, 'utf-8'))
    database.pragma('user_version = 6')
    version = 6
  }

  ensureChatOwnerPresenceColumn(database)
}

function ensureChatOwnerPresenceColumn(database: Database.Database) {
  const cols = database
    .prepare('PRAGMA table_info(chat_sessions)')
    .all() as { name: string }[]
  if (!cols.some((c) => c.name === 'owner_presence_until')) {
    database.exec('ALTER TABLE chat_sessions ADD COLUMN owner_presence_until TEXT')
    database.exec("UPDATE chat_sessions SET status = 'offline' WHERE status IN ('auto', 'closed')")
    database.exec("UPDATE chat_sessions SET status = 'online' WHERE status = 'live'")
  }
}

function ensureProfilePortfolioColumn(database: Database.Database) {
  const cols = database
    .prepare('PRAGMA table_info(profile)')
    .all() as { name: string }[]
  if (!cols.some((c) => c.name === 'portfolio')) {
    database.exec(
      `ALTER TABLE profile ADD COLUMN portfolio TEXT NOT NULL DEFAULT ''`
    )
  }
}

/** Close connection (tests / scripts). */
export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
