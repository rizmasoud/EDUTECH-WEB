import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64url');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `scrypt$${salt}$${derivedKey.toString('base64url')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, encodedKey] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !encodedKey) return false;
    const expectedKey = Buffer.from(encodedKey, 'base64url');
    const actualKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;
    return actualKey.length === expectedKey.length && timingSafeEqual(actualKey, expectedKey);
  }
}
