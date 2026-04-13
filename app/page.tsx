import { getActiveResume } from '@/lib/db'
import { CVTemplate } from '@/components/CVTemplate'

export const revalidate = 60 // ISR: revalidate every 60 s

export default async function HomePage() {
  let data = null

  try {
    data = await getActiveResume()
  } catch {
    // Supabase not configured or DB not ready yet
  }

  if (!data) {
    return (
      <main className="max-w-3xl mx-auto my-20 px-6 text-center text-gray-400">
        <p className="text-lg font-semibold">Eduardo Damasceno</p>
        <p className="text-sm mt-2">Currículo em breve.</p>
      </main>
    )
  }

  return (
    <main>
      <CVTemplate data={data} />
    </main>
  )
}
