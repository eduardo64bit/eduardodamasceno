import { getActiveResume } from '@/lib/db'
import { CVTemplate } from '@/components/CVTemplate'

export async function CVPageContent() {
  let data = null

  try {
    data = await getActiveResume()
  } catch {
    // DB not ready yet
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto my-20 px-6 text-center text-gray-400">
          <p className="text-lg font-semibold">Eduardo Damasceno</p>
          <p className="text-sm mt-2">Currículo em breve.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CVTemplate data={data} />
    </main>
  )
}
