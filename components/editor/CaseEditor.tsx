'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { saveCaseAction, type SaveCaseState } from '@/app/editor/cases/[slug]/actions'
import { CASE_SEGMENTS, type CaseSegmentId } from '@/lib/domains/cases/segments'
import { slugifyCaseTitle } from '@/lib/domains/cases/slug'
import type { CaseFull } from '@/lib/domains/cases/types'

const fieldClass =
  'editor-field w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

interface Props {
  slug: string
  initial: CaseFull | null
}

export function CaseEditor({ slug, initial }: Props) {
  const isNew = slug === 'new'
  const [state, action, pending] = useActionState<SaveCaseState, FormData>(
    saveCaseAction.bind(null, slug),
    {}
  )
  const [saved, setSaved] = useState(false)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [newSlug, setNewSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!state.error && !pending && !isNew) {
      setSaved(true)
      const t = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [state, pending, isNew])

  useEffect(() => {
    if (isNew && !slugTouched && title) {
      setNewSlug(slugifyCaseTitle(title))
    }
  }, [title, isNew, slugTouched])

  return (
    <form action={action} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Metadados
        </h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>

        {isNew ? (
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              id="slug"
              name="slug"
              required
              value={newSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setNewSlug(e.target.value)
              }}
              className={fieldClass}
              placeholder="meu-projeto"
            />
            <p className="mt-1 text-xs text-gray-400">
              Aparece em /cases/<strong>{newSlug || 'slug'}</strong>
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Slug: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{slug}</code>
          </p>
        )}

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
            Subtítulo
          </label>
          <input id="subtitle" name="subtitle" defaultValue={initial?.subtitle ?? ''} className={fieldClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? 'draft'}
              className={fieldClass}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-1">
              Ordem na home
            </label>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={initial?.sort_order ?? 0}
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-gray-400">Menor = mais acima</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Segmentos
        </h2>
        <div className="flex flex-wrap gap-3">
          {CASE_SEGMENTS.map(({ id, label }) => (
            <label key={id} className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="segments"
                value={id}
                defaultChecked={initial?.segments.includes(id as CaseSegmentId)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Mídia
        </h2>

        <div>
          <label htmlFor="cover_path" className="block text-sm font-medium text-gray-700 mb-1">
            Capa (path)
          </label>
          <input
            id="cover_path"
            name="cover_path"
            defaultValue={initial?.cover_path ?? ''}
            className={fieldClass}
            placeholder="/media/cases/meu-case/cover.png"
          />
        </div>

        <div>
          <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube URL
          </label>
          <input
            id="youtube_url"
            name="youtube_url"
            type="url"
            defaultValue={initial?.youtube_url ?? ''}
            className={fieldClass}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {initial?.media && initial.media.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Galeria ({initial.media.length})</p>
            <ul className="text-xs text-gray-500 space-y-1 font-mono">
              {initial.media.map((m) => (
                <li key={m.id}>{m.path}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              Edição da galeria via import WP ou SQL — em breve no editor.
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Conteúdo
        </h2>
        <div>
          <label htmlFor="body_html" className="block text-sm font-medium text-gray-700 mb-1">
            Corpo (HTML)
          </label>
          <textarea
            id="body_html"
            name="body_html"
            rows={18}
            defaultValue={initial?.body_html ?? ''}
            className={`${fieldClass} font-mono text-xs leading-relaxed`}
          />
        </div>
      </section>

      {state.error ? (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          {pending ? 'Salvando…' : isNew ? 'Criar case' : 'Salvar'}
        </button>

        {!isNew && saved ? (
          <span className="text-sm text-emerald-600">Salvo.</span>
        ) : null}

        {!isNew ? (
          <Link
            href={`/cases/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Preview →
          </Link>
        ) : null}

        <Link href="/editor/cases" className="text-sm text-gray-500 hover:text-gray-800 ml-auto">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
