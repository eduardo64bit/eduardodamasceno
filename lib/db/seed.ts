import type Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { BASE_RESUME_ID, baseResumePayload } from './base-resume-data'

export function seedDatabase(database: Database.Database) {
  const now = new Date().toISOString()
  const { resumeInfo, profile, experiences, authorProjects, skills, education } = baseResumePayload

  database
    .prepare(
      `INSERT INTO resumes (id, name, description, is_base, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 1, 1, ?, ?)`
    )
    .run(BASE_RESUME_ID, resumeInfo.name, resumeInfo.description, now, now)

  database
    .prepare(
      `INSERT INTO profile (id, resume_id, name, title, location, email, phone, linkedin, portfolio, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      BASE_RESUME_ID,
      profile.name,
      profile.title,
      profile.location,
      profile.email,
      profile.phone,
      profile.linkedin,
      profile.portfolio,
      profile.summary
    )

  const insertExp = database.prepare(
    `INSERT INTO experiences (id, resume_id, company, role, start_date, end_date, is_current, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  experiences.forEach((exp, i) => {
    insertExp.run(
      randomUUID(),
      BASE_RESUME_ID,
      exp.company,
      exp.role,
      exp.start_date,
      exp.end_date,
      exp.is_current ? 1 : 0,
      exp.description,
      i
    )
  })

  const insertAuthorProject = database.prepare(
    `INSERT INTO author_projects (id, resume_id, name, role, start_date, end_date, is_current, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
  authorProjects.forEach((project, i) => {
    insertAuthorProject.run(
      randomUUID(),
      BASE_RESUME_ID,
      project.name,
      project.role,
      project.start_date,
      project.end_date,
      project.is_current ? 1 : 0,
      project.description,
      i
    )
  })

  const insertSkill = database.prepare(
    `INSERT INTO skills (id, resume_id, category, items) VALUES (?, ?, ?, ?)`
  )
  for (const skill of skills) {
    insertSkill.run(
      randomUUID(),
      BASE_RESUME_ID,
      skill.category,
      JSON.stringify(skill.items)
    )
  }

  const insertEdu = database.prepare(
    `INSERT INTO education (id, resume_id, title, institution, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  education.forEach((edu, i) => {
    insertEdu.run(
      randomUUID(),
      BASE_RESUME_ID,
      edu.title,
      edu.institution,
      edu.description,
      i
    )
  })
}
