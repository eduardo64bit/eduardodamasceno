import { createClient } from './supabase/server'
import type { Resume, ResumeData } from './types'

export async function getActiveResume(): Promise<ResumeData | null> {
  const supabase = await createClient()

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!resume) return null

  return fetchResumeRelations(resume)
}

export async function getResumeById(id: string): Promise<ResumeData | null> {
  const supabase = await createClient()

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single()

  if (!resume) return null

  return fetchResumeRelations(resume)
}

export async function getAllResumes(): Promise<Resume[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function fetchResumeRelations(resume: Resume): Promise<ResumeData> {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: experiences },
    { data: skills },
    { data: education },
  ] = await Promise.all([
    supabase.from('profile').select('*').eq('resume_id', resume.id).single(),
    supabase
      .from('experiences')
      .select('*')
      .eq('resume_id', resume.id)
      .order('order_index'),
    supabase.from('skills').select('*').eq('resume_id', resume.id),
    supabase
      .from('education')
      .select('*')
      .eq('resume_id', resume.id)
      .order('order_index'),
  ])

  return {
    resume,
    profile: profile ?? null,
    experiences: experiences ?? [],
    skills: skills ?? [],
    education: education ?? [],
  }
}
