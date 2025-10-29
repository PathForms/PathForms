/**
 * Converts a number to its superscript Unicode representation
 * @param num - The number to convert to superscript
 * @returns The superscript string
 */
export function toSuperscript(num: number): string {
  const superscriptMap: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '-': '⁻',
  };

  return num.toString().split('').map(char => superscriptMap[char] || char).join('');
}

/**
 * Formats an exponent in the form a^n where n is displayed as superscript
 * @param exponent - The exponent value
 * @returns Formatted string like "a²" or "a⁻³"
 */
export function formatExponent(exponent: number): string {
  if (exponent === 0) return 'a⁰';
  if (exponent === 1) return 'a';
  if (exponent === -1) return 'a⁻¹';
  return `a${toSuperscript(exponent)}`;
}
