import path from 'path'
import type { ReactNode } from 'react'
import { Document, Font, Link, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer'
import type { Education, Experience, ResumeData } from '@/lib/types'

const fontDir = path.join(process.cwd(), 'public', 'fonts')

Font.register({
  family: 'Manrope',
  fonts: [
    { src: path.join(fontDir, 'manrope-regular.ttf'), fontWeight: 400 },
    { src: path.join(fontDir, 'manrope-medium.ttf'), fontWeight: 500 },
    { src: path.join(fontDir, 'manrope-semibold.ttf'), fontWeight: 600 },
    { src: path.join(fontDir, 'manrope-bold.ttf'), fontWeight: 700 },
  ],
})

Font.registerHyphenationCallback((word) => [word])

const ink = '#111827'
const heading = '#374151'
const body = '#4b5563'
const muted = '#6b7280'
const rule = '#d1d5db'
const accent = '#1e40af'

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 46,
    paddingHorizontal: 40,
    fontFamily: 'Manrope',
    fontSize: 10,
    color: body,
    lineHeight: 1.45,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.15,
    color: ink,
  },
  title: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 500,
    color: heading,
  },
  descriptor: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.45,
    color: accent,
  },
  listLine: {
    fontSize: 10,
    lineHeight: 1.45,
    color: body,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: heading,
    borderBottomWidth: 0.6,
    borderBottomColor: rule,
    paddingBottom: 2,
    marginBottom: 8,
  },
  contactColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCol: {
    width: '48%',
  },
  line: {
    fontSize: 10,
    lineHeight: 1.4,
    color: body,
    marginBottom: 2,
  },
  link: {
    fontSize: 10,
    lineHeight: 1.4,
    color: accent,
    textDecoration: 'underline',
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.45,
    color: body,
    marginBottom: 6,
  },
  job: {
    marginTop: 10,
  },
  headline: {
    fontSize: 11,
    fontWeight: 700,
    color: ink,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: 500,
    color: heading,
  },
  dates: {
    marginTop: 2,
    marginBottom: 4,
    fontSize: 10,
    color: muted,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletMark: {
    width: 6.5,
    height: 6.5,
    marginTop: 3.5,
    marginRight: 5,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
    color: body,
  },
  note: {
    color: muted,
  },
  footer: {
    position: 'absolute',
    top: 808,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: muted,
  },
})

type Block = { type: 'p'; text: string } | { type: 'ul'; items: string[] }

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = []
  for (const raw of text.split('\n')) {
    const lineText = raw.trim()
    if (!lineText) continue
    const bullet = lineText.match(/^[-•–]\s+(.*)$/)
    if (bullet) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ul') last.items.push(bullet[1])
      else blocks.push({ type: 'ul', items: [bullet[1]] })
    } else {
      blocks.push({ type: 'p', text: lineText })
    }
  }
  return blocks
}

function DotList({ items, header = false }: { items: string[]; header?: boolean }) {
  if (items.length === 0) return null
  return (
    <Text style={header ? styles.descriptor : styles.listLine}>
      {items.map((item, index) => (
        <Text key={`${item}-${index}`}>{index > 0 ? ` - ${item}` : item}</Text>
      ))}
    </Text>
  )
}

function BulletItem({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Svg width={6.5} height={6.5} style={styles.bulletMark} viewBox="0 0 12 12">
        <Path d="M3.25 2.15 L9.1 6 L3.25 9.85 Z" fill={accent} />
      </Svg>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function RichText({ text }: { text: string }) {
  return (
    <View>
      {parseBlocks(text).map((block, i) =>
        block.type === 'ul' ? (
          <View key={i}>
            {block.items.map((item, j) => (
              <BulletItem key={j}>{item}</BulletItem>
            ))}
          </View>
        ) : (
          <Text key={i} style={styles.paragraph}>
            {block.text}
          </Text>
        ),
      )}
    </View>
  )
}

function ExperienceEntry({ exp, first = false }: { exp: Experience; first?: boolean }) {
  // First page this job is drawn on is the opening. A later page repeats the heading.
  const seen = { last: -1, opened: -1 }
  const dates = dateLine(exp.start_date, exp.end_date, exp.is_current)
  return (
    <View style={first ? undefined : styles.job}>
      <View fixed>
        <Text style={styles.headline}>{exp.company}</Text>
        <Text
          style={[styles.headline, { position: 'absolute', top: 0, left: 0, right: 0 }]}
          render={({ pageNumber }) => {
            if (seen.last !== -1 && pageNumber < seen.last) seen.opened = -1
            seen.last = pageNumber
            const continued = seen.opened !== -1 && pageNumber !== seen.opened
            if (seen.opened === -1) seen.opened = pageNumber
            return continued ? `${exp.company} (continuação)` : ''
          }}
        />
        {exp.role ? <Text style={styles.subtitle}>{exp.role}</Text> : null}
        <Text style={styles.dates}>{dates}</Text>
      </View>
      {exp.description ? <RichText text={exp.description} /> : null}
    </View>
  )
}

function dateLine(start: string, end: string | null, current: boolean) {
  if (current) return `${start} - Presente`
  if (end) return `${start} - ${end}`
  return start
}

function EducationList({ items }: { items: Education[] }) {
  return (
    <View>
      {items.map((edu) => {
        const note =
          edu.description.trim().toLowerCase() === 'formação complementar' ? '' : edu.description
        return (
          <BulletItem key={edu.id}>
            {edu.title}
            {edu.institution ? ` - ${edu.institution}` : ''}
            {note ? <Text style={styles.note}>{` - ${note}`}</Text> : ''}
          </BulletItem>
        )
      })}
    </View>
  )
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  const profile = data.profile
  if (!profile) return <Document />

  const tags = profile.descriptor
    .split('|')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const summary = profile.summary
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const education = data.education.filter((item) => item.section !== 'complementary')
  const complementary = data.education.filter((item) => item.section === 'complementary')
  return (
    <Document
      title={`${profile.name}. ${profile.title || data.resume.name}`}
      author={profile.name}
    >
      <Page size="A4" style={styles.page} experimentalPagination>
        <View style={styles.footer} fixed>
          <Text>{profile.name}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        {profile.title ? <Text style={styles.title}>{profile.title}</Text> : null}
        {tags.length > 0 ? <DotList items={tags} header /> : null}

        {(profile.location ||
          profile.email ||
          profile.phone ||
          profile.linkedin ||
          profile.portfolio) && (
          <Section title="Contato">
            <View style={styles.contactColumns}>
              <View style={styles.contactCol}>
                {profile.location ? <Text style={styles.line}>{profile.location}</Text> : null}
                {profile.email ? (
                  <Link src={`mailto:${profile.email}`} style={styles.link}>
                    {profile.email}
                  </Link>
                ) : null}
                {profile.phone ? <Text style={styles.line}>{profile.phone}</Text> : null}
              </View>
              <View style={styles.contactCol}>
                {profile.linkedin ? (
                  <Link src={profile.linkedin} style={styles.link}>
                    {profile.linkedin}
                  </Link>
                ) : null}
                {profile.portfolio ? (
                  <Link src={profile.portfolio} style={styles.link}>
                    {profile.portfolio}
                  </Link>
                ) : null}
              </View>
            </View>
          </Section>
        )}

        {summary.length > 0 && (
          <Section title="Resumo">
            {summary.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </Section>
        )}

        {data.experiences.length > 0 && (
          <Section title="Experiência">
            {data.experiences.map((exp, index) => (
              <ExperienceEntry key={exp.id} exp={exp} first={index === 0} />
            ))}
          </Section>
        )}

        {data.authorProjects.length > 0 && (
          <Section title="Projetos autorais">
            {data.authorProjects.map((project) => (
              <View key={project.id} style={styles.job}>
                <View wrap={false}>
                  <Text style={styles.headline}>{project.name}</Text>
                  {project.role ? <Text style={styles.subtitle}>{project.role}</Text> : null}
                  <Text style={styles.dates}>
                    {dateLine(project.start_date, project.end_date, project.is_current)}
                  </Text>
                </View>
                {project.description ? <RichText text={project.description} /> : null}
              </View>
            ))}
          </Section>
        )}

        {data.skills.map((group) => (
          <Section key={group.id} title={group.category}>
            <DotList items={group.items} />
          </Section>
        ))}

        {education.length > 0 && (
          <Section title="Educação">
            <EducationList items={education} />
          </Section>
        )}

        {complementary.length > 0 && (
          <Section title="Formação complementar">
            <EducationList items={complementary} />
          </Section>
        )}

      </Page>
    </Document>
  )
}
