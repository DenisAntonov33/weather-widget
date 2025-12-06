/**
 * Parses a value (number or string) to a number.
 * Returns the number if valid, or null if the value cannot be parsed.
 * 
 * @param value - The value to parse (number or string)
 * @returns The parsed number, or null if invalid
 * 
 * @example
 * parseNumber(42) // 42
 * parseNumber("42") // 42
 * parseNumber("abc") // null
 * parseNumber(null) // null
 */
export function parseNumber(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

