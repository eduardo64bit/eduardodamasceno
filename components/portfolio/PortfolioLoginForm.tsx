'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  portfolioLoginAction,
  type PortfolioLoginState,
} from '@/app/(portfolio)/login/actions'

export function PortfolioLoginForm({ from }: { from?: string }) {
  const router = useRouter()
  const [state, action, pending] = useActionState<PortfolioLoginState, FormData>(
    portfolioLoginAction,
    {}
  )

  useEffect(() => {
    if (state.redirectTo) router.replace(state.redirectTo)
  }, [state.redirectTo, router])

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="from" value={from ?? ''} />

      <div>
        <label
          htmlFor="portfolio-password"
          className="block text-sm font-medium text-[var(--pf-muted-2)] mb-2"
        >
          Senha de acesso
        </label>
        <input
          id="portfolio-password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-xl border border-[var(--pf-border-strong)] bg-[var(--pf-surface)] px-4 py-3 text-sm text-[var(--pf-text)] placeholder:text-[var(--pf-muted-3)] focus:outline-none focus:ring-2 focus:ring-[var(--pf-text)]/20 transition"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-[var(--pf-border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--pf-text)] hover:bg-[var(--pf-btn-hover-bg)] hover:text-[var(--pf-btn-hover-text)] transition disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
