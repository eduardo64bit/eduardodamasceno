import { subscribeChatSession } from '@/lib/domains/chat/events'
import { getChatSessionState } from '@/lib/domains/chat/service'
import type { ChatSessionStatus, ChatStreamEvent } from '@/lib/domains/chat/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUS_SYNC_MS = 5000

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

function encodeSse(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function GET(request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  const state = getChatSessionState(sessionId)
  if (!state) {
    return new Response('Sessão não encontrada.', { status: 404 })
  }

  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let statusSync: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let lastStatus: ChatSessionStatus = state.session.status

      controller.enqueue(encoder.encode(encodeSse({ type: 'status', status: lastStatus })))
      for (const message of state.messages) {
        if (message.role === 'owner') {
          controller.enqueue(encoder.encode(encodeSse({ type: 'message', message })))
        }
      }

      unsubscribe = subscribeChatSession(sessionId, (event) => {
        if (event.type === 'status') lastStatus = event.status
        controller.enqueue(encoder.encode(encodeSse(event)))
      })

      statusSync = setInterval(() => {
        const current = getChatSessionState(sessionId)
        if (!current) return
        const status = current.session.status
        if (status === lastStatus) return
        lastStatus = status
        controller.enqueue(encoder.encode(encodeSse({ type: 'status', status })))
      }, STATUS_SYNC_MS)

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'))
      }, 25000)

      request.signal.addEventListener('abort', () => {
        if (heartbeat) clearInterval(heartbeat)
        if (statusSync) clearInterval(statusSync)
        unsubscribe?.()
        controller.close()
      })
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat)
      if (statusSync) clearInterval(statusSync)
      unsubscribe?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
