import { NextResponse } from 'next/server'
import { isEditorAuthenticated } from '@/lib/domains/auth/editor'

export async function requireEditorApi(): Promise<NextResponse | null> {
  if (!(await isEditorAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
