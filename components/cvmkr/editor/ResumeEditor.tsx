'use client'

import { useState, useTransition } from 'react'
import { saveResume } from '@/app/cvmkr/edit/[id]/actions'
import type {
  ResumeData,
  ProfileInput,
  ExperienceInput,
  SkillInput,
  EducationInput,
} from '@/lib/types'

interface Props {
  id: string
  initial: ResumeData | null
}

// ── Default values ─────────────────────────────────────────────────────────────

const defaultProfile: ProfileInput = {
  name: '',
  title: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  summary: '',
}

const defaultExperience = (): ExperienceInput => ({
  company: '',
  role: '',
  start_date: '',
  end_date: null,
  is_current: false,
  description: '',
  order_index: 0,
})

const defaultSkill = (): SkillInput => ({ category: '', items: [] })

const defaultEducation = (): EducationInput => ({
  title: '',
  institution: '',
  description: '',
  order_index: 0,
})

// ── Component ──────────────────────────────────────────────────────────────────

export function ResumeEditor({ id, initial }: Props) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [resumeInfo, setResumeInfo] = useState({
    name: initial?.resume.name ?? '',
    description: initial?.resume.description ?? '',
  })

  const [profile, setProfile] = useState<ProfileInput>(
    initial?.profile
      ? {
          name: initial.profile.name,
          title: initial.profile.title,
          location: initial.profile.location,
          email: initial.profile.email,
          phone: initial.profile.phone,
          linkedin: initial.profile.linkedin,
          summary: initial.profile.summary,
        }
      : defaultProfile
  )

  const [experiences, setExperiences] = useState<ExperienceInput[]>(
    initial?.experiences.map((e) => ({
      company: e.company,
      role: e.role,
      start_date: e.start_date,
      end_date: e.end_date,
      is_current: e.is_current,
      description: e.description,
      order_index: e.order_index,
    })) ?? []
  )

  const [skills, setSkills] = useState<SkillInput[]>(
    initial?.skills.map((s) => ({ category: s.category, items: s.items })) ?? []
  )

  const [education, setEducation] = useState<EducationInput[]>(
    initial?.education.map((e) => ({
      title: e.title,
      institution: e.institution,
      description: e.description,
      order_index: e.order_index,
    })) ?? []
  )

  function handleSave() {
    setSaved(false)
    setError(null)
    startTransition(async () => {
      try {
        await saveResume(id, { resumeInfo, profile, experiences, skills, education })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* ── Resume Info ──────────────────────────────────────────────────── */}
      <Section title="Informações do Currículo">
        <Field label="Nome do currículo">
          <Input
            value={resumeInfo.name}
            onChange={(v) => setResumeInfo((p) => ({ ...p, name: v }))}
            placeholder="Ex: Currículo XP Inc."
          />
        </Field>
        <Field label="Descrição">
          <Input
            value={resumeInfo.description}
            onChange={(v) => setResumeInfo((p) => ({ ...p, description: v }))}
            placeholder="Breve descrição (uso interno)"
          />
        </Field>
      </Section>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <Section title="Perfil">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome completo">
            <Input
              value={profile.name}
              onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
              placeholder="Eduardo Damasceno"
            />
          </Field>
          <Field label="Título profissional">
            <Input
              value={profile.title}
              onChange={(v) => setProfile((p) => ({ ...p, title: v }))}
              placeholder="Designer de Produto"
            />
          </Field>
          <Field label="Localização">
            <Input
              value={profile.location}
              onChange={(v) => setProfile((p) => ({ ...p, location: v }))}
              placeholder="São Paulo, SP"
            />
          </Field>
          <Field label="E-mail">
            <Input
              value={profile.email}
              onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
              placeholder="contato@exemplo.com"
            />
          </Field>
          <Field label="Telefone">
            <Input
              value={profile.phone}
              onChange={(v) => setProfile((p) => ({ ...p, phone: v }))}
              placeholder="+55 (11) 9 0000-0000"
            />
          </Field>
          <Field label="LinkedIn (URL)">
            <Input
              value={profile.linkedin}
              onChange={(v) => setProfile((p) => ({ ...p, linkedin: v }))}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
        </div>
        <Field label="Resumo profissional">
          <Textarea
            value={profile.summary}
            onChange={(v) => setProfile((p) => ({ ...p, summary: v }))}
            placeholder="Breve bio. Use quebras de linha para separar parágrafos."
            rows={6}
          />
        </Field>
      </Section>

      {/* ── Experiences ──────────────────────────────────────────────────── */}
      <Section
        title="Experiências"
        onAdd={() => setExperiences((prev) => [...prev, defaultExperience()])}
        addLabel="+ Adicionar experiência"
      >
        {experiences.map((exp, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Experiência {i + 1}</span>
              <button
                onClick={() => setExperiences((prev) => prev.filter((_, j) => j !== i))}
                className="text-sm text-red-400 hover:text-red-600 transition"
              >
                Remover
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Empresa">
                <Input
                  value={exp.company}
                  onChange={(v) => updateList(setExperiences, i, 'company', v)}
                  placeholder="XP Inc."
                />
              </Field>
              <Field label="Cargo">
                <Input
                  value={exp.role}
                  onChange={(v) => updateList(setExperiences, i, 'role', v)}
                  placeholder="UX/UI Designer"
                />
              </Field>
              <Field label="Data de início">
                <Input
                  value={exp.start_date}
                  onChange={(v) => updateList(setExperiences, i, 'start_date', v)}
                  placeholder="Junho de 2021"
                />
              </Field>
              <Field label="Data de fim">
                <Input
                  value={exp.end_date ?? ''}
                  onChange={(v) =>
                    updateList(setExperiences, i, 'end_date', v || null)
                  }
                  placeholder="Deixe em branco se atual"
                  disabled={exp.is_current}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exp.is_current}
                onChange={(e) => {
                  setExperiences((prev) =>
                    prev.map((item, j) =>
                      j === i
                        ? { ...item, is_current: e.target.checked, end_date: null }
                        : item
                    )
                  )
                }}
                className="rounded"
              />
              Emprego atual
            </label>
            <Field label="Descrição (uma atividade por linha)">
              <Textarea
                value={exp.description}
                onChange={(v) => updateList(setExperiences, i, 'description', v)}
                placeholder="Participei da evolução de ferramentas de atendimento...&#10;Conduzi iniciativas voltadas à..."
                rows={4}
              />
            </Field>
          </div>
        ))}
      </Section>

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      <Section
        title="Habilidades"
        onAdd={() => setSkills((prev) => [...prev, defaultSkill()])}
        addLabel="+ Adicionar grupo"
      >
        {skills.map((skill, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-500">Grupo {i + 1}</span>
              <button
                onClick={() => setSkills((prev) => prev.filter((_, j) => j !== i))}
                className="text-sm text-red-400 hover:text-red-600 transition"
              >
                Remover
              </button>
            </div>
            <Field label="Categoria">
              <Input
                value={skill.category}
                onChange={(v) => updateList(setSkills, i, 'category', v)}
                placeholder="Top Skills"
              />
            </Field>
            <Field label="Itens (separados por vírgula)">
              <Input
                value={skill.items.join(', ')}
                onChange={(v) =>
                  updateList(
                    setSkills,
                    i,
                    'items',
                    v.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="UX/UI Design, Figma, Design Systems"
              />
            </Field>
          </div>
        ))}
      </Section>

      {/* ── Education ────────────────────────────────────────────────────── */}
      <Section
        title="Educação"
        onAdd={() => setEducation((prev) => [...prev, defaultEducation()])}
        addLabel="+ Adicionar formação"
      >
        {education.map((edu, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-500">Formação {i + 1}</span>
              <button
                onClick={() => setEducation((prev) => prev.filter((_, j) => j !== i))}
                className="text-sm text-red-400 hover:text-red-600 transition"
              >
                Remover
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Título / Curso">
                <Input
                  value={edu.title}
                  onChange={(v) => updateList(setEducation, i, 'title', v)}
                  placeholder="Bacharelado em Design"
                />
              </Field>
              <Field label="Instituição">
                <Input
                  value={edu.institution}
                  onChange={(v) => updateList(setEducation, i, 'institution', v)}
                  placeholder="Faculdade Cásper Líbero"
                />
              </Field>
            </div>
            <Field label="Descrição (opcional)">
              <Input
                value={edu.description}
                onChange={(v) => updateList(setEducation, i, 'description', v)}
                placeholder=""
              />
            </Field>
          </div>
        ))}
      </Section>

      {/* ── Save bar ─────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 -mx-4 sm:-mx-6 lg:-mx-10">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-green-600">Salvo com sucesso!</p>}
        {!error && !saved && <span />}

        <button
          onClick={handleSave}
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition disabled:opacity-60 ml-auto"
        >
          {pending ? 'Salvando…' : 'Salvar currículo'}
        </button>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function updateList<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  index: number,
  key: keyof T,
  value: T[keyof T]
) {
  setter((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
}

// ── Small UI primitives ────────────────────────────────────────────────────────

function Section({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string
  children: React.ReactNode
  onAdd?: () => void
  addLabel?: string
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            {addLabel}
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
    />
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
    />
  )
}
