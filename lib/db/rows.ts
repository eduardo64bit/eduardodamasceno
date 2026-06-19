import type { Education, Experience, Profile, Resume, Skill } from '../types'

type ResumeRow = Omit<Resume, 'is_base' | 'is_active'> & {
  is_base: number
  is_active: number
}

type ExperienceRow = Omit<Experience, 'is_current'> & { is_current: number }
type SkillRow = Omit<Skill, 'items'> & { items: string }

export function mapResume(row: ResumeRow): Resume {
  return {
    ...row,
    is_base: Boolean(row.is_base),
    is_active: Boolean(row.is_active),
  }
}

export function mapExperience(row: ExperienceRow): Experience {
  return { ...row, is_current: Boolean(row.is_current) }
}

export function mapSkill(row: SkillRow): Skill {
  return { ...row, items: JSON.parse(row.items) as string[] }
}

export function mapProfile(row: Profile): Profile {
  return row
}

export function mapEducation(row: Education): Education {
  return row
}
