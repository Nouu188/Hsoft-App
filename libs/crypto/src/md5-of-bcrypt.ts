import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';

const logger = new Logger('MD5ofBcrypt');

export function md5OfBcrypt(bcryptHash: string): string {
  if (!bcryptHash) {
    logger.warn('md5OfBcrypt received empty input');
    return '';
  }

  try {
    const md5 = createHash('md5').update(bcryptHash, 'utf8').digest('hex');
    logger.debug(`Generated MD5 of bcrypt: ${md5}`);
    return md5;
  } catch (error) {
    logger.error(`Failed to generate MD5 of bcrypt: ${error.message}`, error.stack);
    throw error;
  }
}
