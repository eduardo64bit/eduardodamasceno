import { createHmac } from 'crypto'

export function createSessionToken(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('hex')
}
