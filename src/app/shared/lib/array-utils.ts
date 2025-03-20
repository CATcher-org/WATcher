export function uniqueCount<T>(array: T[]): number {
  return new Set(array).size;
}
