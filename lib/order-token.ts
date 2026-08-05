import { randomBytes } from "node:crypto"

// Excludes visually ambiguous characters (0/O, 1/I/L) since this code is typed
// by hand into a bank transfer's "reason/purpose" field.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

export function generateOrderToken(): string {
    const bytes = randomBytes(8)
    let token = ""

    for (const byte of bytes) {
        token += ALPHABET[byte % ALPHABET.length]
    }

    return `OX-${token}`
}
