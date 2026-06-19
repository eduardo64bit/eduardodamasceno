import { randomUUID } from 'crypto'
import { getDb } from './client'
import type { SaveResumePayload } from '../types'
import { getResumeById } from './queries'

export function setActiveResume(id: string) {
  const db = getDb()
  const now = new Date().toISOString()

  const tx = db.transaction(() => {
    db.prepare('UPDATE resumes SET is_active = 0').run()
    const result = db
      .prepare('UPDATE resumes SET is_active = 1, updated_at = ? WHERE id = ?')
      .run(now, id)
    if (result.changes === 0) throw new Error('Currículo não encontrado.')
  })
  tx()
}

export function deleteResume(id: string) {
  const db = getDb()
  const row = db
    .prepare('SELECT is_base FROM resumes WHERE id = ?')
    .get(id) as { is_base: number } | undefined

  if (!row) throw new Error('Currículo não encontrado.')
  if (row.is_base) throw new Error('O currículo base não pode ser excluído.')

  db.prepare('DELETE FROM resumes WHERE id = ?').run(id)
}

export function duplicateResume(id: string, newName: string): string {
  const data = getResumeById(id)
  if (!data) throw new Error('Currículo não encontrado.')

  const db = getDb()
  const newId = randomUUID()
  const now = new Date().toISOString()

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO resumes (id, name, description, is_base, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, ?, ?)`
    ).run(newId, newName, data.resume.description, now, now)

    if (data.profile) {
      const { id: _pid, resume_id: _rid, ...profile } = data.profile
      db.prepare(
        `INSERT INTO profile (id, resume_id, name, title, location, email, phone, linkedin, portfolio, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        randomUUID(),
        newId,
        profile.name,
        profile.title,
        profile.location,
        profile.email,
        profile.phone,
        profile.linkedin,
        profile.portfolio,
        profile.summary
      )
    }

    const insertExp = db.prepare(
      `INSERT INTO experiences (id, resume_id, company, role, start_date, end_date, is_current, description, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    for (const e of data.experiences) {
      const { id: _id, resume_id: _rid, ...exp } = e
      insertExp.run(
        randomUUID(),
        newId,
        exp.company,
        exp.role,
        exp.start_date,
        exp.end_date,
        exp.is_current ? 1 : 0,
        exp.description,
        exp.order_index
      )
    }

    const insertSkill = db.prepare(
      `INSERT INTO skills (id, resume_id, category, items) VALUES (?, ?, ?, ?)`
    )
    for (const s of data.skills) {
      const { id: _id, resume_id: _rid, ...skill } = s
      insertSkill.run(randomUUID(), newId, skill.category, JSON.stringify(skill.items))
    }

    const insertEdu = db.prepare(
      `INSERT INTO education (id, resume_id, title, institution, description, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    for (const e of data.education) {
      const { id: _id, resume_id: _rid, ...edu } = e
      insertEdu.run(
        randomUUID(),
        newId,
        edu.title,
        edu.institution,
        edu.description,
        edu.order_index
      )
    }
  })

  tx()
  return newId
}

export function createResume(payload: SaveResumePayload): string {
  const db = getDb()
  const newId = randomUUID()
  const now = new Date().toISOString()

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO resumes (id, name, description, is_base, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, ?, ?)`
    ).run(
      newId,
      payload.resumeInfo.name || 'Novo currículo',
      payload.resumeInfo.description || null,
      now,
      now
    )
    upsertRelations(db, newId, payload)
  })

  tx()
  return newId
}

export function updateResume(id: string, payload: SaveResumePayload) {
  const db = getDb()
  const now = new Date().toISOString()

  const tx = db.transaction(() => {
    const result = db
      .prepare(
        `UPDATE resumes SET name = ?, description = ?, updated_at = ? WHERE id = ?`
      )
      .run(
        payload.resumeInfo.name,
        payload.resumeInfo.description || null,
        now,
        id
      )
    if (result.changes === 0) throw new Error('Currículo não encontrado.')
    upsertRelations(db, id, payload)
  })

  tx()
}

function upsertRelations(
  db: ReturnType<typeof getDb>,
  resumeId: string,
  payload: SaveResumePayload
) {
  const existing = db
    .prepare('SELECT id FROM profile WHERE resume_id = ?')
    .get(resumeId) as { id: string } | undefined

  const profileId = existing?.id ?? randomUUID()
  db.prepare(
    `INSERT INTO profile (id, resume_id, name, title, location, email, phone, linkedin, portfolio, summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(resume_id) DO UPDATE SET
       name = excluded.name,
       title = excluded.title,
       location = excluded.location,
       email = excluded.email,
       phone = excluded.phone,
       linkedin = excluded.linkedin,
       portfolio = excluded.portfolio,
       summary = excluded.summary`
  ).run(
    profileId,
    resumeId,
    payload.profile.name,
    payload.profile.title,
    payload.profile.location,
    payload.profile.email,
    payload.profile.phone,
    payload.profile.linkedin,
    payload.profile.portfolio,
    payload.profile.summary
  )

  db.prepare('DELETE FROM experiences WHERE resume_id = ?').run(resumeId)
  const insertExp = db.prepare(
    `INSERT INTO experiences (id, resume_id, company, role, start_date, end_date, is_current, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  payload.experiences.forEach((e, i) => {
    insertExp.run(
      randomUUID(),
      resumeId,
      e.company,
      e.role,
      e.start_date,
      e.end_date,
      e.is_current ? 1 : 0,
      e.description,
      i
    )
  })

  db.prepare('DELETE FROM skills WHERE resume_id = ?').run(resumeId)
  const insertSkill = db.prepare(
    `INSERT INTO skills (id, resume_id, category, items) VALUES (?, ?, ?, ?)`
  )
  for (const s of payload.skills) {
    insertSkill.run(randomUUID(), resumeId, s.category, JSON.stringify(s.items))
  }

  db.prepare('DELETE FROM education WHERE resume_id = ?').run(resumeId)
  const insertEdu = db.prepare(
    `INSERT INTO education (id, resume_id, title, institution, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  payload.education.forEach((e, i) => {
    insertEdu.run(
      randomUUID(),
      resumeId,
      e.title,
      e.institution,
      e.description,
      i
    )
  })
}
