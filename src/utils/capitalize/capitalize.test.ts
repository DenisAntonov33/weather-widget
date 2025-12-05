import { describe, it, expect } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('should capitalize a single word', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('should capitalize multiple words', () => {
    expect(capitalize('hello world')).toBe('Hello World');
    expect(capitalize('scattered clouds')).toBe('Scattered Clouds');
    expect(capitalize('light rain')).toBe('Light Rain');
  });

  it('should handle already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello');
    expect(capitalize('Hello World')).toBe('Hello World');
    expect(capitalize('SCATTERED CLOUDS')).toBe('SCATTERED CLOUDS');
  });

  it('should handle all lowercase strings', () => {
    expect(capitalize('hello world')).toBe('Hello World');
    expect(capitalize('scattered clouds')).toBe('Scattered Clouds');
  });

  it('should handle all uppercase strings', () => {
    expect(capitalize('HELLO WORLD')).toBe('HELLO WORLD');
    expect(capitalize('SCATTERED CLOUDS')).toBe('SCATTERED CLOUDS');
  });

  it('should handle mixed case strings', () => {
    expect(capitalize('hELLo WoRLd')).toBe('HELLo WoRLd');
    expect(capitalize('sCaTtErEd ClOuDs')).toBe('SCaTtErEd ClOuDs');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
  });

  it('should handle strings with numbers', () => {
    expect(capitalize('test 123')).toBe('Test 123');
    expect(capitalize('version 2.0')).toBe('Version 2.0');
  });

  it('should handle multiple consecutive spaces', () => {
    expect(capitalize('hello   world')).toBe('Hello   World');
    expect(capitalize('test    multiple    spaces')).toBe('Test    Multiple    Spaces');
  });

  it('should handle leading and trailing spaces', () => {
    expect(capitalize(' hello world ')).toBe(' Hello World ');
    expect(capitalize('  test  ')).toBe('  Test  ');
  });

  it('should handle special characters', () => {
    expect(capitalize('hello-world')).toBe('Hello-world');
    expect(capitalize('test@example.com')).toBe('Test@example.com');
    expect(capitalize('hello, world!')).toBe('Hello, World!');
  });

  it('should handle single space', () => {
    expect(capitalize(' ')).toBe(' ');
  });

  it('should handle strings with only spaces', () => {
    expect(capitalize('   ')).toBe('   ');
  });

  it('should handle real-world weather descriptions', () => {
    expect(capitalize('scattered clouds')).toBe('Scattered Clouds');
    expect(capitalize('light rain')).toBe('Light Rain');
    expect(capitalize('clear sky')).toBe('Clear Sky');
    expect(capitalize('heavy intensity rain')).toBe('Heavy Intensity Rain');
    expect(capitalize('few clouds')).toBe('Few Clouds');
  });
});

