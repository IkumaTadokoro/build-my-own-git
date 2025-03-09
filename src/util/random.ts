const ALPHABET_AND_NUMBERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateRandomString(length: number): string {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * ALPHABET_AND_NUMBERS.length)
    return ALPHABET_AND_NUMBERS[index]
  }).join('')
}
