'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { setActiveResume, deleteResume, duplicateResume } from '@/app/cvmkr/dashboard/actions'
import type { Resume } from '@/lib/types'

interface Props {
  resume: Resume
}

export function ResumeCard({ resume }: Props) {
  const [pending, startTransition] = useTransition()

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  function handleSetActive() {
    startTransition(() => setActiveResume(resume.id))
  }

  function handleDelete() {
    if (resume.is_base) {
      alert('O currículo base não pode ser excluído.')
      return
    }
    if (!confirm(`Excluir "${resume.name}"? Esta ação não pode ser desfeita.`)) return
    startTransition(() => deleteResume(resume.id))
  }

  function handleDuplicate() {
    const newName = prompt('Nome para a cópia:', `${resume.name} (cópia)`)
    if (!newName?.trim()) return
    startTransition(async () => {
      await duplicateResume(resume.id, newName.trim())
    })
  }

  return (
    <div
      className={`bg-white rounded-xl border ${
        resume.is_active ? 'border-blue-400 shadow-blue-100 shadow-md' : 'border-gray-200'
      } p-5 flex flex-col gap-3 transition-shadow`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-900 truncate">{resume.name}</h2>
            {resume.is_active && (
              <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Ativo
              </span>
            )}
            {resume.is_base && (
              <span className="shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                Base
              </span>
            )}
          </div>
          {resume.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{resume.description}</p>
          )}
        </div>
        <p className="text-xs text-gray-400 shrink-0">{fmt(resume.updated_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        <Link
          href={`/cvmkr/edit/${resume.id}`}
          className="btn-ghost"
        >
          Editar
        </Link>

        {!resume.is_active && (
          <button onClick={handleSetActive} disabled={pending} className="btn-ghost">
            Definir como ativo
          </button>
        )}

        <button onClick={handleDuplicate} disabled={pending} className="btn-ghost">
          Duplicar
        </button>

        <a
          href={`/cvmkr/print/${resume.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          Baixar PDF
        </a>

        {!resume.is_base && (
          <button
            onClick={handleDelete}
            disabled={pending}
            className="btn-ghost text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}
