import { randomBytes } from 'crypto';

export function generateClusterId(): string {
  return `cluster_${randomBytes(8).toString('hex')}`;
}
