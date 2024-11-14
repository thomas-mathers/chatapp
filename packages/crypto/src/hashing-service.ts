import { compare, genSalt, genSaltSync, hash, hashSync } from 'bcryptjs';

export function createHashSync(password: string): string {
  const passwordSalt = genSaltSync();
  const passwordHash = hashSync(password, passwordSalt);
  return passwordHash;
}

export async function createHash(password: string): Promise<string> {
  const passwordSalt = await genSalt();
  const passwordHash = await hash(password, passwordSalt);
  return passwordHash;
}

export async function verifyHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return compare(password, hash);
}
