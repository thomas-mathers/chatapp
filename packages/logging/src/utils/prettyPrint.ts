export function prettyPrint(value: unknown) {
  return JSON.stringify(value, null, 2);
}
