import { getActiveResume } from '@/lib/db'
import { CVTemplate } from '@/components/CVTemplate'

export const revalidate = 60 // ISR: revalidate every 60 s

export default async function HomePage() {
  const data = await getActiveResume()

  if (!data) {
    return (
      <main className="max-w-3xl mx-auto my-20 px-6 text-center text-gray-400">
        <p className="text-lg">Nenhum currículo ativo encontrado.</p>
      </main>
    )
  }

  return (
    <main>
      <CVTemplate data={data} />
    </main>
  )
}
