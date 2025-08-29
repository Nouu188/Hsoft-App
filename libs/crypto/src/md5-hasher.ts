import * as crypto from 'crypto';

export function md5Hash(stringToHash: string): string {
  const secret = "hsoft6686";
  return crypto.createHmac('md5', secret).update(stringToHash).digest('hex');
}

export function compareMd5(value: string, hash: string): boolean {
  const hashed = md5Hash(value);
  return hashed === hash;
}
