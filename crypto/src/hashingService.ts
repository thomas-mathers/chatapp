import bcrypt from "bcrypt";

export async function hash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function check(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
