import crypto from 'crypto';

export function cryptoRandomString(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}
