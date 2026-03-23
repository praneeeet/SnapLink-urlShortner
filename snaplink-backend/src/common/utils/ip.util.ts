import * as crypto from 'crypto';

export function hashIP(ip: string): string {
  try {
    return crypto.createHash('sha256').update(ip).digest('hex');
  } catch {
    return 'unknown';
  }
}
