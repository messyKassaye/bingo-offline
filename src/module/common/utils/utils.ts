export function getEnumName<T extends { [key: number]: string }>(
  enumObj: T,
  value: number,
): string {
  return enumObj[value] || 'Unknown';
}
