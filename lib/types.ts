export interface Resume {
  id: string
  name: string
  description: string | null
  is_base: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  resume_id: string
  name: string
  title: string
  location: string
  email: string
  phone: string
  linkedin: string
  summary: string
}

export interface Experience {
  id: string
  resume_id: string
  company: string
  role: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string
  order_index: number
}

export interface Skill {
  id: string
  resume_id: string
  category: string
  items: string[]
}

export interface Education {
  id: string
  resume_id: string
  title: string
  institution: string
  description: string
  order_index: number
}

export interface ResumeData {
  resume: Resume
  profile: Profile | null
  experiences: Experience[]
  skills: Skill[]
  education: Education[]
}

// Partial types used in the editor (no id/resume_id before save)
export type ProfileInput = Omit<Profile, 'id' | 'resume_id'>
export type ExperienceInput = Omit<Experience, 'id' | 'resume_id'>
export type SkillInput = Omit<Skill, 'id' | 'resume_id'>
export type EducationInput = Omit<Education, 'id' | 'resume_id'>

export interface SaveResumePayload {
  resumeInfo: { name: string; description: string }
  profile: ProfileInput
  experiences: ExperienceInput[]
  skills: SkillInput[]
  education: EducationInput[]
}
