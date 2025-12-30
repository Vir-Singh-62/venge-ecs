export function getEnumStrings<T>(e: object) {
  return Object.keys(e).filter((k) => Number.isNaN(Number(k))) as T[];
}
