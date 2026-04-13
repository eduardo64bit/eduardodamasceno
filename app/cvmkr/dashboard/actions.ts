'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function setActiveResume(id: string) {
  const supabase = await createClient()

  // Deactivate all first
  await supabase.from('resumes').update({ is_active: false }).neq('id', '')

  // Activate selected
  const { error } = await supabase
    .from('resumes')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/cvmkr/dashboard')
  revalidatePath('/')
}

export async function deleteResume(id: string) {
  const supabase = await createClient()

  const { data: resume } = await supabase
    .from('resumes')
    .select('is_base')
    .eq('id', id)
    .single()

  if (resume?.is_base) {
    throw new Error('O currículo base não pode ser excluído.')
  }

  await supabase.from('resumes').delete().eq('id', id)

  revalidatePath('/cvmkr/dashboard')
  revalidatePath('/')
}

export async function duplicateResume(id: string, newName: string) {
  const supabase = await createClient()

  const [
    { data: source },
    { data: profile },
    { data: experiences },
    { data: skills },
    { data: education },
  ] = await Promise.all([
    supabase.from('resumes').select('*').eq('id', id).single(),
    supabase.from('profile').select('*').eq('resume_id', id).single(),
    supabase.from('experiences').select('*').eq('resume_id', id).order('order_index'),
    supabase.from('skills').select('*').eq('resume_id', id),
    supabase.from('education').select('*').eq('resume_id', id).order('order_index'),
  ])

  if (!source) throw new Error('Currículo não encontrado.')

  const { data: newResume, error } = await supabase
    .from('resumes')
    .insert({
      name: newName,
      description: source.description,
      is_base: false,
      is_active: false,
    })
    .select()
    .single()

  if (error || !newResume) throw new Error('Erro ao duplicar currículo.')

  const newId: string = newResume.id

  await Promise.all([
    profile &&
      supabase.from('profile').insert({ ...profile, id: undefined, resume_id: newId }),
    experiences?.length &&
      supabase.from('experiences').insert(
        experiences.map(({ id: _id, ...e }) => ({ ...e, resume_id: newId }))
      ),
    skills?.length &&
      supabase.from('skills').insert(
        skills.map(({ id: _id, ...s }) => ({ ...s, resume_id: newId }))
      ),
    education?.length &&
      supabase.from('education').insert(
        education.map(({ id: _id, ...e }) => ({ ...e, resume_id: newId }))
      ),
  ])

  revalidatePath('/cvmkr/dashboard')

  return newId
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('cvmkr_session')
  redirect('/cvmkr/login')
}
