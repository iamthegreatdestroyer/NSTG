import type { TypeNode, TypeSpaceRegion } from '../../types.js';

/**
 * BooleanSpace - Handles the universe of boolean types
 *
 * Boolean is the simplest type space: { true, false }
 *
 * However, in JavaScript/TypeScript, truthy/falsy values complicate things:
 * - Explicit boolean: true, false
 * - Truthy values: anything except false, 0, -0, 0n, "", null, undefined, NaN
 * - Falsy values: false, 0, -0, 0n, "", null, undefined, NaN
 *
 * This class focuses on the explicit boolean type space.
 */
export class BooleanSpace {
  /**
   * Calculate the universe of possible boolean values
   *
   * For boolean type, the universe is always { true, false }
   */
  calculateUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    return [
      {
        id: 'boolean-true',
        type: { kind: 'primitive', name: 'boolean' },
        constraints: [],
        cardinality: 1,
      },
      {
        id: 'boolean-false',
        type: { kind: 'primitive', name: 'boolean' },
        constraints: [],
        cardinality: 1,
      },
    ];
  }

  /**
   * Generate boundary values for boolean type
   *
   * For boolean, the "boundaries" are just the two values.
   */
  generateBoundaryValues(): boolean[] {
    return [true, false];
  }

  /**
   * Estimate cardinality of a boolean space region
   *
   * Boolean space always has cardinality 2 (or 1 for literal true/false)
   */
  estimateCardinality(region: TypeSpaceRegion): number {
    if (region.id === 'boolean-true' || region.id === 'boolean-false') {
      return 1;
    }
    return 2;
  }

  /**
   * Check if a value is within a type space region
   */
  isValueInRegion(value: boolean, region: TypeSpaceRegion): boolean {
    if (region.id === 'boolean-true') {
      return value === true;
    }
    if (region.id === 'boolean-false') {
      return value === false;
    }
    return true;
  }

  /**
   * Generate all possible boolean values
   *
   * Since the space is finite and small, we can enumerate completely.
   */
  enumerateAll(): boolean[] {
    return [true, false];
  }

  /**
   * Check if the boolean space is fully covered by tested values
   */
  isFullyCovered(testedValues: boolean[]): boolean {
    return testedValues.includes(true) && testedValues.includes(false);
  }

  /**
   * Get the complementary value (logical NOT)
   */
  complement(value: boolean): boolean {
    return !value;
  }

  /**
   * Get untested values given a set of tested values
   */
  getUntestedValues(testedValues: boolean[]): boolean[] {
    const untested: boolean[] = [];

    if (!testedValues.includes(true)) {
      untested.push(true);
    }
    if (!testedValues.includes(false)) {
      untested.push(false);
    }

    return untested;
  }
}
