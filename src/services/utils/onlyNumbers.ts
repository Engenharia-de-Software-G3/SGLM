export function onlyNumbers(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
