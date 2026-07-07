'use client'

import { useCallback, useRef, useState } from 'react'
import type { CaseMediaDraft } from '@/lib/domains/cases/editor-media'

export type { CaseMediaDraft }

function toDraft(media: CaseMediaDraft[]): CaseMediaDraft[] {
  return media.map((m, index) => ({
    path: m.path,
    alt: m.alt,
    caption: m.caption,
    sort_order: index,
  }))
}

interface Props {
  slug: string
  initialMedia: CaseMediaDraft[]
  initialCoverPath: string
  legacyRemoteImages?: Array<{ src: string; alt: string }>
  onChange: (media: CaseMediaDraft[], coverPath: string) => void
}

export function CaseMediaEditor({
  slug,
  initialMedia,
  initialCoverPath,
  legacyRemoteImages = [],
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<CaseMediaDraft[]>(() => toDraft(initialMedia))
  const [coverPath, setCoverPath] = useState(
    () => initialCoverPath || initialMedia[0]?.path || ''
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const emit = useCallback(
    (nextItems: CaseMediaDraft[], nextCover: string) => {
      const normalized = nextItems.map((item, index) => ({ ...item, sort_order: index }))
      setItems(normalized)
      setCoverPath(nextCover)
      onChange(normalized, nextCover)
    },
    [onChange]
  )

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.size > 0)
    if (list.length === 0) return

    setUploading(true)
    setError(null)

    const body = new FormData()
    for (const file of list) {
      body.append('files', file)
    }

    try {
      const res = await fetch(`/api/editor/cases/${encodeURIComponent(slug)}/media`, {
        method: 'POST',
        body,
      })
      const data = (await res.json()) as { uploaded?: { path: string }[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Falha no upload.')
        return
      }

      const added = (data.uploaded ?? []).map((entry, index) => ({
        path: entry.path,
        alt: '',
        caption: '',
        sort_order: items.length + index,
      }))

      const nextItems = [...items, ...added]
      const nextCover = coverPath || added[0]?.path || ''
      emit(nextItems, nextCover)
    } catch {
      setError('Falha no upload.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeItem = (index: number) => {
    const removed = items[index]
    const nextItems = items.filter((_, i) => i !== index)
    const nextCover =
      coverPath === removed.path ? (nextItems[0]?.path ?? '') : coverPath
    emit(nextItems, nextCover)
  }

  const setAsCover = (path: string) => {
    emit(items, path)
  }

  const moveItem = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    emit(next, coverPath)
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    if (uploading) return
    if (event.dataTransfer.files?.length) {
      void uploadFiles(event.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:border-blue-400"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files)
          }}
        />
        <p className="text-sm text-gray-700">
          Arraste imagens aqui ou{' '}
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            escolha arquivos
          </button>
        </p>
        <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP ou GIF · máx. 10MB cada</p>
        {uploading ? <p className="mt-2 text-xs text-gray-500">Enviando…</p> : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((item, index) => {
            const isCover = coverPath === item.path
            return (
              <li
                key={item.path}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragIndex !== null) {
                    moveItem(dragIndex, index)
                    setDragIndex(null)
                  }
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`rounded-md border bg-white overflow-hidden ${
                  isCover ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                } ${dragIndex === index ? 'opacity-60' : ''}`}
              >
                <div className="relative aspect-video bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.path} alt={item.alt || ''} className="h-full w-full object-cover" />
                  {isCover ? (
                    <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Capa
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-1 p-1.5">
                  <span className="cursor-grab text-[10px] text-gray-400" title="Arraste para reordenar">
                    ⋮⋮
                  </span>
                  <button
                    type="button"
                    onClick={() => setAsCover(item.path)}
                    disabled={isCover}
                    className="text-[10px] leading-tight text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    {isCover ? 'Capa' : 'Definir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="ml-auto text-[10px] leading-tight text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Nenhuma imagem na galeria.</p>
      )}

      {legacyRemoteImages.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            {legacyRemoteImages.length} imagem(ns) ainda vêm do conteúdo HTML (links externos)
          </p>
          <p className="mt-1 text-xs text-amber-800/90">
            Elas continuam no site, mas não dá para reordenar aqui. Faça upload das versões locais
            para passar a gerenciá-las nesta galeria.
          </p>
          <ul className="mt-3 space-y-2">
            {legacyRemoteImages.map((img) => (
              <li key={img.src} className="flex items-center gap-3">
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt || ''} className="h-full w-full object-cover" />
                </div>
                <p className="min-w-0 truncate font-mono text-[10px] text-amber-900/80">{img.src}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
