import { cookies } from 'next/headers'
import { createSessionToken } from './token'

export const EDITOR_SESSION_COOKIE = 'editor_session'

export function editorSecret(): string {
  return process.env.EDITOR_SECRET ?? 'editor-secret'
}

export function editorPassword(): string {
  return process.env.EDITOR_PASSWORD ?? 'admin'
}

export function getEditorSessionToken(password = editorPassword()): string {
  return createSessionToken(password, editorSecret())
}

export async function isEditorAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(EDITOR_SESSION_COOKIE)?.value
  if (!token) return false
  return token === getEditorSessionToken()
}
