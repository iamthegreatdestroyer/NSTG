import { SPECIAL_VALUES } from '@nstg/shared';

/**
 * Special Values Utilities
 *
 * Provides utilities for working with special values across different types.
 * These are values that often reveal edge cases and bugs in code.
 */

/**
 * Get all special values for a given primitive type
 */
export function getSpecialValues(typeName: string): unknown[] {
  const normalizedType = typeName.toLowerCase();

  switch (normalizedType) {
    case 'number':
      return SPECIAL_VALUES.NUMBER;
    case 'string':
      return SPECIAL_VALUES.STRING;
    case 'array':
      return SPECIAL_VALUES.ARRAY;
    case 'object':
      return SPECIAL_VALUES.OBJECT;
    default:
      return [];
  }
}

/**
 * Check if a value is a special value for its type
 */
export function isSpecialValue(value: unknown): boolean {
  // Check number special values
  if (typeof value === 'number') {
    return SPECIAL_VALUES.NUMBER.includes(value);
  }

  // Check string special values
  if (typeof value === 'string') {
    return SPECIAL_VALUES.STRING.includes(value);
  }

  // Check array special values
  if (Array.isArray(value)) {
    return SPECIAL_VALUES.ARRAY.some(special => arraysEqual(value, special as unknown[]));
  }

  // Check object special values
  if (typeof value === 'object' && value !== null) {
    return SPECIAL_VALUES.OBJECT.some(special => objectsEqual(value, special));
  }

  return false;
}

/**
 * Get special values that are likely to cause issues for a specific operation
 */
export function getProblematicValues(
  operation: 'arithmetic' | 'comparison' | 'iteration' | 'property-access'
): unknown[] {
  switch (operation) {
    case 'arithmetic':
      return [
        NaN,
        Infinity,
        -Infinity,
        0,
        -0,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ];

    case 'comparison':
      return [NaN, 0, -0, null, undefined, '', false];

    case 'iteration':
      return [
        [],
        [undefined],
        [null],
        Array(1000).fill(0), // Large array
        ...SPECIAL_VALUES.ARRAY,
      ];

    case 'property-access':
      return [
        null,
        undefined,
        {},
        Object.create(null), // Object with no prototype
        ...SPECIAL_VALUES.OBJECT,
      ];

    default:
      return [];
  }
}

/**
 * Get boundary values between different type regions
 */
export function getBoundaryValues(typeRegionA: string, typeRegionB: string): unknown[] {
  const boundaries: unknown[] = [];

  // Number boundaries
  if (typeRegionA === 'number' || typeRegionB === 'number') {
    boundaries.push(
      0,
      -1,
      1,
      Number.MIN_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_VALUE,
      Number.MAX_VALUE,
      -Infinity,
      Infinity,
      NaN
    );
  }

  // String boundaries
  if (typeRegionA === 'string' || typeRegionB === 'string') {
    boundaries.push('', 'a', '\0', '\n', ' '.repeat(1000));
  }

  // Boolean boundaries
  if (typeRegionA === 'boolean' || typeRegionB === 'boolean') {
    boundaries.push(true, false);
  }

  return boundaries;
}

/**
 * Check if a value is at a boundary (edge case)
 */
export function isBoundaryValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return (
      value === 0 ||
      value === -0 ||
      value === 1 ||
      value === -1 ||
      value === Infinity ||
      value === -Infinity ||
      Number.isNaN(value) ||
      value === Number.MAX_SAFE_INTEGER ||
      value === Number.MIN_SAFE_INTEGER ||
      value === Number.MAX_VALUE ||
      value === Number.MIN_VALUE
    );
  }

  if (typeof value === 'string') {
    return (
      value === '' ||
      value.length === 1 ||
      value.includes('\0') ||
      value.includes('\n') ||
      value.length > 1000
    );
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.length === 1;
  }

  if (typeof value === 'object') {
    return value === null || Object.keys(value as object).length === 0;
  }

  return false;
}

/**
 * Helper: Check if two arrays are equal
 */
function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/**
 * Helper: Check if two objects are equal (shallow comparison)
 */
function objectsEqual(a: object, b: object): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => (a as any)[key] === (b as any)[key]);
}
