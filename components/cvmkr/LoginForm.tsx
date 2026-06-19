'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction, type LoginState } from '@/app/cvmkr/login/actions'

export function LoginForm({ from }: { from?: string }) {
  const router = useRouter()
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  )

  useEffect(() => {
    if (state.redirectTo) router.replace(state.redirectTo)
  }, [state.redirectTo, router])

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from ?? ''} />

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="cvmkr-field w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
