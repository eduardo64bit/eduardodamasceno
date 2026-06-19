import { randomInt } from 'crypto'

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function generateShortCode(length = 4): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
}
