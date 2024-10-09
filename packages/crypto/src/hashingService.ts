import { compare, genSalt, hash } from 'bcryptjs';

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
