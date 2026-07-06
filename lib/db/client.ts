import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
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

  if (version < 7) {
    ensureCaseSegmentsColumn(database)
    database.pragma('user_version = 7')
    version = 7
  }

  if (version < 8) {
    const migrationPath = path.join(
      process.cwd(),
      'lib',
      'db',
      'migrations',
      '007_author_projects.sql'
    )
    database.exec(fs.readFileSync(migrationPath, 'utf-8'))
    migrateBipdocExperiencesToAuthorProjects(database)
    database.pragma('user_version = 8')
    version = 8
  }

  ensureChatOwnerPresenceColumn(database)
}

function ensureCaseSegmentsColumn(database: Database.Database) {
  const cols = database.prepare('PRAGMA table_info(cases)').all() as { name: string }[]
  if (!cols.some((c) => c.name === 'segments')) {
    database.exec("ALTER TABLE cases ADD COLUMN segments TEXT NOT NULL DEFAULT '[]'")
  }
}

function migrateBipdocExperiencesToAuthorProjects(database: Database.Database) {
  type ExpRow = {
    id: string
    resume_id: string
    company: string
    role: string
    start_date: string
    end_date: string | null
    is_current: number
    description: string
    order_index: number
  }

  const bipdocRows = database
    .prepare("SELECT * FROM experiences WHERE lower(trim(company)) = 'bipdoc'")
    .all() as ExpRow[]

  if (bipdocRows.length === 0) return

  const insertProject = database.prepare(
    `INSERT INTO author_projects (id, resume_id, name, role, start_date, end_date, is_current, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const deleteExp = database.prepare('DELETE FROM experiences WHERE id = ?')

  for (const row of bipdocRows) {
    const existing = database
      .prepare(
        "SELECT id FROM author_projects WHERE resume_id = ? AND lower(trim(name)) = 'bipdoc' LIMIT 1"
      )
      .get(row.resume_id) as { id: string } | undefined

    if (existing) {
      deleteExp.run(row.id)
      continue
    }

    insertProject.run(
      randomUUID(),
      row.resume_id,
      row.company,
      row.role,
      row.start_date,
      row.end_date,
      row.is_current,
      row.description,
      row.order_index
    )
    deleteExp.run(row.id)
  }
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
