import { getDb } from './client'
import {
  mapAuthorProject,
  mapEducation,
  mapExperience,
  mapProfile,
  mapResume,
  mapSkill,
} from './rows'
import type { Resume, ResumeData } from '../types'

export function getActiveResume(): ResumeData | null {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM resumes WHERE is_active = 1 LIMIT 1')
    .get()

  if (!row) return null
  return fetchResumeRelations(mapResume(row as Parameters<typeof mapResume>[0]))
}

export function getResumeById(id: string): ResumeData | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id)
  if (!row) return null
  return fetchResumeRelations(mapResume(row as Parameters<typeof mapResume>[0]))
}

export function getAllResumes(): Resume[] {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM resumes ORDER BY created_at DESC')
    .all() as Parameters<typeof mapResume>[0][]

  return rows.map(mapResume)
}

export function fetchResumeRelations(resume: Resume): ResumeData {
  const db = getDb()

  const profileRow = db
    .prepare('SELECT * FROM profile WHERE resume_id = ?')
    .get(resume.id)
  const experienceRows = db
    .prepare(
      'SELECT * FROM experiences WHERE resume_id = ? ORDER BY order_index ASC'
    )
    .all(resume.id) as Parameters<typeof mapExperience>[0][]
  const authorProjectRows = db
    .prepare(
      'SELECT * FROM author_projects WHERE resume_id = ? ORDER BY order_index ASC'
    )
    .all(resume.id) as Parameters<typeof mapAuthorProject>[0][]
  const skillRows = db
    .prepare('SELECT * FROM skills WHERE resume_id = ?')
    .all(resume.id) as Parameters<typeof mapSkill>[0][]
  const educationRows = db
    .prepare(
      'SELECT * FROM education WHERE resume_id = ? ORDER BY order_index ASC'
    )
    .all(resume.id) as Parameters<typeof mapEducation>[0][]

  return {
    resume,
    profile: profileRow ? mapProfile(profileRow as Parameters<typeof mapProfile>[0]) : null,
    experiences: experienceRows.map(mapExperience),
    authorProjects: authorProjectRows.map(mapAuthorProject),
    skills: skillRows.map(mapSkill),
    education: educationRows.map(mapEducation),
  }
}
