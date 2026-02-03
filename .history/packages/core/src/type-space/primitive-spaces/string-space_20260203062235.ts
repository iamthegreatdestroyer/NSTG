import type { TypeNode, TypeConstraint, TypeSpaceRegion } from '../../types.js';
import { SPECIAL_VALUES } from '@nstg/shared';

/**
 * StringSpace - Handles the universe of string types
 * 
 * Strings in JavaScript/TypeScript have many edge cases:
 * - Empty string
 * - Single character vs multi-character
 * - Special characters (null bytes, unicode, emoji, whitespace)
 * - Very long strings (memory limits)
 * - Pattern-based constraints (regex)
 * - Length constraints
 * 
 * This class partitions the string space intelligently for test generation.
 */
export class StringSpace {
  /**
   * Calculate the universe of possible string values
   */
  calculateUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    const constraints = typeNode.constraints || [];
    const lengthConstraints = constraints.filter(c => c.type === 'length');
    const patternConstraints = constraints.filter(c => c.type === 'pattern');
    
    if (lengthConstraints.length > 0 || patternConstraints.length > 0) {
      return this.calculateConstrainedUniverse(lengthConstraints, patternConstraints);
    }
    
    return this.calculateUnconstrainedUniverse();
  }

  /**
   * Generate boundary values for string type
   * 
   * These are the values at the edges of different regions,
   * where bugs are most likely to occur.
   */
  generateBoundaryValues(constraints?: TypeConstraint[]): string[] {
    const boundaries: string[] = [];
    
    // Always include special values
    boundaries.push(...SPECIAL_VALUES.STRING);
    
    // Length-based boundaries
    boundaries.push(''); // Empty
    boundaries.push('a'); // Single char
    boundaries.push('ab'); // Two chars
    boundaries.push('abc'); // Three chars
    boundaries.push('a'.repeat(10)); // Short string
    boundaries.push('a'.repeat(100)); // Medium string
    boundaries.push('a'.repeat(1000)); // Long string
    boundaries.push('a'.repeat(10000)); // Very long string
    
    // Special character combinations
    boundaries.push('\n'); // Newline
    boundaries.push('\r\n'); // CRLF
    boundaries.push('\t'); // Tab
    boundaries.push('  '); // Spaces
    boundaries.push('こんにちは'); // Unicode
    boundaries.push('👋🌍'); // Emoji
    
    // Apply constraint boundaries
    if (constraints) {
      for (const constraint of constraints) {
        if (constraint.type === 'length') {
          boundaries.push(...this.generateLengthBoundaries(constraint));
        } else if (constraint.type === 'pattern') {
          boundaries.push(...this.generatePatternBoundaries(constraint));
        }
      }
    }
    
    return boundaries;
  }

  /**
   * Estimate cardinality of a string space region
   */
  estimateCardinality(region: TypeSpaceRegion): number | 'infinite' {
    const constraints = region.constraints;
    
    if (!constraints || constraints.length === 0) {
      return 'infinite';
    }
    
    // Check for exact length constraint
    const lengthConstraints = constraints.filter(c => c.type === 'length');
    if (lengthConstraints.length === 0) {
      return 'infinite';
    }
    
    // Get min/max length
    let minLength = 0;
    let maxLength = Infinity;
    
    for (const constraint of lengthConstraints) {
      const { min, max } = this.parseLengthConstraint(constraint);
      minLength = Math.max(minLength, min);
      maxLength = Math.min(maxLength, max);
    }
    
    if (!isFinite(maxLength)) {
      return 'infinite';
    }
    
    // Even with bounded length, string space is effectively infinite
    // (e.g., length 5 with 26 letters = 26^5 = 11,881,376 possibilities)
    return 'infinite';
  }

  /**
   * Check if a value is within a type space region
   */
  isValueInRegion(value: string, region: TypeSpaceRegion): boolean {
    // Check special value regions
    if (region.id === 'string-special') {
      return SPECIAL_VALUES.STRING.includes(value);
    }
    
    // Check constraints
    for (const constraint of region.constraints) {
      if (constraint.type === 'length') {
        if (!this.satisfiesLengthConstraint(value, constraint)) {
          return false;
        }
      } else if (constraint.type === 'pattern') {
        if (!this.satisfiesPatternConstraint(value, constraint)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Calculate unconstrained string universe
   */
  private calculateUnconstrainedUniverse(): TypeSpaceRegion[] {
    return [
      {
        id: 'string-empty',
        type: { kind: 'primitive', name: 'string' },
        constraints: [this.createLengthConstraint(0, 0)],
        cardinality: 1
      },
      {
        id: 'string-special',
        type: { kind: 'primitive', name: 'string' },
        constraints: [],
        cardinality: SPECIAL_VALUES.STRING.length
      },
      {
        id: 'string-single',
        type: { kind: 'primitive', name: 'string' },
        constraints: [this.createLengthConstraint(1, 1)],
        cardinality: 'infinite'
      },
      {
        id: 'string-short',
        type: { kind: 'primitive', name: 'string' },
        constraints: [this.createLengthConstraint(2, 10)],
        cardinality: 'infinite'
      },
      {
        id: 'string-medium',
        type: { kind: 'primitive', name: 'string' },
        constraints: [this.createLengthConstraint(11, 100)],
        cardinality: 'infinite'
      },
      {
        id: 'string-long',
        type: { kind: 'primitive', name: 'string' },
        constraints: [this.createLengthConstraint(101, 1000)],
        cardinality: 'infinite'
      },
      {
        id: 'string-very-long',
        type: { kind: 'primitive', name: 'string' },
        constraints: [this.createLengthConstraint(1001, Infinity)],
        cardinality: 'infinite'
      }
    ];
  }

  /**
   * Calculate constrained string universe
   */
  private calculateConstrainedUniverse(
    lengthConstraints: TypeConstraint[],
    patternConstraints: TypeConstraint[]
  ): TypeSpaceRegion[] {
    const regions: TypeSpaceRegion[] = [];
    
    // Create regions based on length constraints
    if (lengthConstraints.length > 0) {
      for (const constraint of lengthConstraints) {
        const { min, max } = this.parseLengthConstraint(constraint);
        regions.push({
          id: `string-length-${min}-${max}`,
          type: { kind: 'primitive', name: 'string' },
          constraints: [constraint, ...patternConstraints],
          cardinality: 'infinite'
        });
      }
    }
    
    // Create regions based on pattern constraints
    if (patternConstraints.length > 0 && lengthConstraints.length === 0) {
      for (const constraint of patternConstraints) {
        regions.push({
          id: `string-pattern-${this.getPatternId(constraint)}`,
          type: { kind: 'primitive', name: 'string' },
          constraints: [constraint],
          cardinality: 'infinite'
        });
      }
    }
    
    return regions;
  }

  /**
   * Parse length constraint to extract min/max values
   */
  private parseLengthConstraint(constraint: TypeConstraint): { min: number; max: number } {
    const expr = constraint.expression as any;
    return {
      min: expr.min ?? 0,
      max: expr.max ?? Infinity
    };
  }

  /**
   * Check if value satisfies length constraint
   */
  private satisfiesLengthConstraint(value: string, constraint: TypeConstraint): boolean {
    const { min, max } = this.parseLengthConstraint(constraint);
    return value.length >= min && value.length <= max;
  }

  /**
   * Check if value satisfies pattern constraint
   */
  private satisfiesPatternConstraint(value: string, constraint: TypeConstraint): boolean {
    const pattern = constraint.expression as any;
    
    if (pattern.regex) {
      return new RegExp(pattern.regex).test(value);
    }
    
    return true;
  }

  /**
   * Generate length-based boundary values
   */
  private generateLengthBoundaries(constraint: TypeConstraint): string[] {
    const { min, max } = this.parseLengthConstraint(constraint);
    const boundaries: string[] = [];
    
    if (min > 0) {
      boundaries.push('a'.repeat(Math.max(0, min - 1)));
      boundaries.push('a'.repeat(min));
      boundaries.push('a'.repeat(min + 1));
    }
    
    if (isFinite(max)) {
      boundaries.push('a'.repeat(Math.max(0, max - 1)));
      boundaries.push('a'.repeat(max));
      boundaries.push('a'.repeat(max + 1));
    }
    
    return boundaries;
  }

  /**
   * Generate pattern-based boundary values
   */
  private generatePatternBoundaries(constraint: TypeConstraint): string[] {
    // For pattern constraints, generate some common valid/invalid patterns
    // This is a simplified version; full implementation would be more sophisticated
    const pattern = constraint.expression as any;
    
    if (pattern.regex) {
      // Generate a few strings that should match/not match
      return ['test', 'Test', 'TEST', '123', 'test123', ''];
    }
    
    return [];
  }

  /**
   * Get pattern identifier for region ID
   */
  private getPatternId(constraint: TypeConstraint): string {
    const pattern = constraint.expression as any;
    if (pattern.regex) {
      return pattern.regex.toString().replace(/\W/g, '-');
    }
    return 'unknown';
  }

  /**
   * Create a length constraint object
   */
  private createLengthConstraint(min: number, max: number): TypeConstraint {
    return {
      type: 'length',
      expression: { min, max }
    };
  }
}
