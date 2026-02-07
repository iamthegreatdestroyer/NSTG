import { SPECIAL_VALUES } from '@nstg/shared';
import type { TypeConstraint, TypeNode, TypeSpaceRegion } from '../../types.js';

/**
 * NumberSpace - Handles the universe of number types
 *
 * Numbers in JavaScript/TypeScript have many special cases:
 * - NaN, Infinity, -Infinity, -0
 * - Integer vs floating point
 * - Safe integer range (Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER)
 * - Subnormal numbers, precision limits
 *
 * This class partitions the number space intelligently for test generation.
 */
export class NumberSpace {
  /**
   * Calculate the universe of possible number values
   */
  calculateUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    const constraints = typeNode.constraints || [];
    const rangeConstraints = constraints.filter(c => c.type === 'range');

    if (rangeConstraints.length > 0) {
      return this.calculateConstrainedUniverse(rangeConstraints);
    }

    return this.calculateUnconstrainedUniverse();
  }

  /**
   * Generate boundary values for number type
   *
   * These are the values at the edges of different regions,
   * where bugs are most likely to occur.
   */
  generateBoundaryValues(constraints?: TypeConstraint[]): number[] {
    const boundaries = new Set<number>();

    // Always include special values
    for (const special of SPECIAL_VALUES.NUMBER) {
      boundaries.add(special);
    }

    // Standard boundaries
    boundaries.add(Number.MIN_SAFE_INTEGER);
    boundaries.add(Number.MAX_SAFE_INTEGER);
    boundaries.add(Number.MIN_VALUE);
    boundaries.add(Number.MAX_VALUE);
    boundaries.add(Number.EPSILON);
    boundaries.add(-Number.EPSILON);

    // Zero and nearby values
    boundaries.add(-1);
    boundaries.add(-0);
    boundaries.add(0);
    boundaries.add(1);

    // Apply constraint boundaries
    if (constraints) {
      for (const constraint of constraints) {
        if (constraint.type === 'range') {
          this.addRangeBoundaries(constraint, boundaries);
        }
      }
    }

    return Array.from(boundaries);
  }

  /**
   * Estimate cardinality of a number space region
   */
  estimateCardinality(region: TypeSpaceRegion): number | 'infinite' {
    const constraints = region.constraints;

    if (!constraints || constraints.length === 0) {
      return 'infinite';
    }

    // Check for range constraints
    const rangeConstraints = constraints.filter(c => c.type === 'range');
    if (rangeConstraints.length === 0) {
      return 'infinite';
    }

    // Calculate size of constrained range
    let min = -Infinity;
    let max = Infinity;

    for (const constraint of rangeConstraints) {
      const { min: cMin, max: cMax } = this.parseRangeConstraint(constraint);
      min = Math.max(min, cMin);
      max = Math.min(max, cMax);
    }

    if (!isFinite(min) || !isFinite(max)) {
      return 'infinite';
    }

    // If range is integers, return exact count
    if (Number.isInteger(min) && Number.isInteger(max)) {
      return max - min + 1;
    }

    // For floating point, range is effectively infinite
    return 'infinite';
  }

  /**
   * Check if a value is within a type space region
   */
  isValueInRegion(value: number, region: TypeSpaceRegion): boolean {
    // Check special value regions
    if (region.id === 'number-special') {
      return SPECIAL_VALUES.NUMBER.includes(value);
    }

    // Check range constraints
    for (const constraint of region.constraints) {
      if (constraint.type === 'range') {
        if (!this.satisfiesRangeConstraint(value, constraint)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate unconstrained number universe
   */
  private calculateUnconstrainedUniverse(): TypeSpaceRegion[] {
    return [
      {
        id: 'number-special',
        type: { kind: 'primitive', name: 'number' },
        constraints: [],
        cardinality: SPECIAL_VALUES.NUMBER.length,
      },
      {
        id: 'number-negative-infinity',
        type: { kind: 'primitive', name: 'number' },
        constraints: [this.createRangeConstraint(-Infinity, Number.MIN_SAFE_INTEGER - 1)],
        cardinality: 'infinite',
      },
      {
        id: 'number-negative',
        type: { kind: 'primitive', name: 'number' },
        constraints: [this.createRangeConstraint(Number.MIN_SAFE_INTEGER, -1)],
        cardinality: 'infinite',
      },
      {
        id: 'number-zero',
        type: { kind: 'primitive', name: 'number' },
        constraints: [this.createRangeConstraint(0, 0)],
        cardinality: 1,
      },
      {
        id: 'number-positive',
        type: { kind: 'primitive', name: 'number' },
        constraints: [this.createRangeConstraint(1, Number.MAX_SAFE_INTEGER)],
        cardinality: 'infinite',
      },
      {
        id: 'number-positive-infinity',
        type: { kind: 'primitive', name: 'number' },
        constraints: [this.createRangeConstraint(Number.MAX_SAFE_INTEGER + 1, Infinity)],
        cardinality: 'infinite',
      },
    ];
  }

  /**
   * Calculate constrained number universe
   */
  private calculateConstrainedUniverse(rangeConstraints: TypeConstraint[]): TypeSpaceRegion[] {
    const regions: TypeSpaceRegion[] = [];

    for (const constraint of rangeConstraints) {
      const { min, max } = this.parseRangeConstraint(constraint);

      regions.push({
        id: `number-range-${min}-${max}`,
        type: { kind: 'primitive', name: 'number' },
        constraints: [constraint],
        cardinality: this.estimateRangeCardinality(min, max),
      });
    }

    return regions;
  }

  /**
   * Parse range constraint to extract min/max values
   */
  private parseRangeConstraint(constraint: TypeConstraint): { min: number; max: number } {
    // Constraint expression format: "min <= x <= max" or similar
    // For now, assume constraint has min/max properties
    const expr = constraint.expression as any;

    return {
      min: expr.min ?? -Infinity,
      max: expr.max ?? Infinity,
    };
  }

  /**
   * Check if value satisfies range constraint
   */
  private satisfiesRangeConstraint(value: number, constraint: TypeConstraint): boolean {
    const { min, max } = this.parseRangeConstraint(constraint);
    return value >= min && value <= max;
  }

  /**
   * Add range boundaries to set
   */
  private addRangeBoundaries(constraint: TypeConstraint, boundaries: Set<number>): void {
    const { min, max } = this.parseRangeConstraint(constraint);

    if (isFinite(min)) {
      boundaries.add(min);
      boundaries.add(min - 1);
      boundaries.add(min + 1);
    }

    if (isFinite(max)) {
      boundaries.add(max);
      boundaries.add(max - 1);
      boundaries.add(max + 1);
    }
  }

  /**
   * Estimate cardinality of a range
   */
  private estimateRangeCardinality(min: number, max: number): number | 'infinite' {
    if (!isFinite(min) || !isFinite(max)) {
      return 'infinite';
    }

    if (Number.isInteger(min) && Number.isInteger(max)) {
      return Math.max(0, max - min + 1);
    }

    return 'infinite';
  }

  /**
   * Create a range constraint object
   */
  private createRangeConstraint(min: number, max: number): TypeConstraint {
    return {
      type: 'range',
      min,
      max,
    };
  }
}
