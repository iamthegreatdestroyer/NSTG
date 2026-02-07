/**
 * @fileoverview BoundaryWalker - Explore boundaries between tested and untested space
 *
 * Walks along the boundaries of the negative space to find critical test inputs.
 * Boundaries are where bugs most commonly occur - at the edges between different
 * regions of behavior.
 */

import {
  BooleanSpace,
  getBoundaryValues,
  getSpecialValues,
  NumberSpace,
  StringSpace,
} from '../type-space/index.js';
import type { NegativeSpaceRegion, TestInput, TypeNode } from '../types.js';

/**
 * Boundary walk result
 */
export interface BoundaryWalkResult {
  /** Generated boundary test inputs */
  testInputs: TestInput[];

  /** Explanation of each test input */
  explanations: string[];

  /** Regions explored */
  regionsExplored: string[];

  /** Total boundary points found */
  boundaryPointCount: number;
}

/**
 * Options for boundary walking
 */
export interface BoundaryWalkOptions {
  /** Maximum number of test inputs to generate */
  maxInputs?: number;

  /** Whether to include special values */
  includeSpecialValues?: boolean;

  /** Depth of boundary exploration (1-3) */
  depth?: number;
}

/**
 * BoundaryWalker
 *
 * Explores the boundaries between tested and untested regions of the type space.
 * Generates test inputs at boundary points where bugs are most likely to occur.
 *
 * Key insight: Most bugs occur at boundaries:
 * - Between positive and negative numbers (crossing zero)
 * - Between empty and non-empty strings
 * - At min/max values
 * - At special values (NaN, Infinity, null, undefined)
 *
 * Usage:
 * ```typescript
 * const walker = new BoundaryWalker();
 *
 * const result = walker.walkBoundary(gap, {
 *   maxInputs: 20,
 *   includeSpecialValues: true,
 *   depth: 2,
 * });
 *
 * // Use generated test inputs
 * for (const input of result.testInputs) {
 *   test(`boundary case: ${result.explanations[i]}`, () => {
 *     myFunction(...input.args);
 *   });
 * }
 * ```
 */
export class BoundaryWalker {
  private readonly numberSpace: NumberSpace;
  private readonly stringSpace: StringSpace;
  private readonly booleanSpace: BooleanSpace;

  constructor() {
    this.numberSpace = new NumberSpace();
    this.stringSpace = new StringSpace();
    this.booleanSpace = new BooleanSpace();
  }

  /**
   * Walk the boundary of a negative space region
   *
   * @param region - The negative space region to explore
   * @param options - Boundary walk options
   * @returns Boundary test inputs and metadata
   */
  walkBoundary(region: NegativeSpaceRegion, options: BoundaryWalkOptions = {}): BoundaryWalkResult {
    const { maxInputs = 50, includeSpecialValues = true, depth = 2 } = options;

    const testInputs: TestInput[] = [];
    const explanations: string[] = [];
    const regionsExplored = new Set<string>();

    // Strategy 1: Generate boundary values for the region's type
    const boundaryValues = this.generateBoundaryValues(region, includeSpecialValues);

    for (const value of boundaryValues.slice(0, maxInputs)) {
      testInputs.push({
        parameterName: 'boundary',
        value,
        typeRegion: region.typeRegion,
        args: [value],
      });
      explanations.push(this.explainBoundaryValue(value, region));
      regionsExplored.add(region.id);
    }

    // Strategy 2: If depth > 1, explore adjacent regions
    if (depth > 1 && testInputs.length < maxInputs) {
      const adjacentValues = this.generateAdjacentValues(region, maxInputs - testInputs.length);

      for (const value of adjacentValues) {
        testInputs.push({
          parameterName: 'adjacent',
          value,
          typeRegion: region.typeRegion,
          args: [value],
        });
        explanations.push(`Adjacent to ${region.id}: ${String(value)}`);
      }
    }

    // Strategy 3: If depth > 2, explore combinations
    if (depth > 2 && testInputs.length < maxInputs) {
      const combinationValues = this.generateCombinationValues(
        region,
        maxInputs - testInputs.length
      );

      for (const value of combinationValues) {
        testInputs.push({
          parameterName: 'combination',
          value,
          typeRegion: region.typeRegion,
          args: [value],
        });
        explanations.push(`Combination for ${region.id}`);
      }
    }

    return {
      testInputs,
      explanations,
      regionsExplored: Array.from(regionsExplored),
      boundaryPointCount: testInputs.length,
    };
  }

  /**
   * Walk boundaries between multiple regions
   */
  walkBetweenRegions(
    region1: NegativeSpaceRegion,
    region2: NegativeSpaceRegion,
    options: BoundaryWalkOptions = {}
  ): BoundaryWalkResult {
    const { maxInputs = 20 } = options;

    const testInputs: TestInput[] = [];
    const explanations: string[] = [];
    const regionsExplored = new Set([region1.id, region2.id]);

    // Extract type names for getBoundaryValues (expects string type names like 'number', 'string')
    const typeName1 = region1.typeRegion.type.name || region1.typeRegion.type.kind;
    const typeName2 = region2.typeRegion.type.name || region2.typeRegion.type.kind;

    // Get boundary values between the two regions
    const boundaryValues = getBoundaryValues(String(typeName1), String(typeName2));
    for (const value of boundaryValues.slice(0, maxInputs)) {
      testInputs.push({
        parameterName: 'boundary',
        value,
        typeRegion: region1.typeRegion,
        args: [value],
      });
      explanations.push(`Boundary between ${region1.id} and ${region2.id}: ${String(value)}`);
    }

    return {
      testInputs,
      explanations,
      regionsExplored: Array.from(regionsExplored),
      boundaryPointCount: testInputs.length,
    };
  }

  /**
   * Generate boundary values for a region
   */
  private generateBoundaryValues(
    region: NegativeSpaceRegion,
    includeSpecialValues: boolean
  ): unknown[] {
    const values: unknown[] = [];

    // Determine type from region ID
    if (region.id.startsWith('number-')) {
      const numberValues = this.numberSpace.generateBoundaryValues(region.typeRegion.constraints);
      values.push(...numberValues);

      if (includeSpecialValues) {
        values.push(...(getSpecialValues('number') as number[]));
      }
    } else if (region.id.startsWith('string-')) {
      const stringValues = this.stringSpace.generateBoundaryValues(region.typeRegion.constraints);
      values.push(...stringValues);

      if (includeSpecialValues) {
        values.push(...(getSpecialValues('string') as string[]));
      }
    } else if (region.id.startsWith('boolean-')) {
      values.push(...this.booleanSpace.generateBoundaryValues());
    }

    return values;
  }

  /**
   * Generate values adjacent to a region
   */
  private generateAdjacentValues(region: NegativeSpaceRegion, maxValues: number): unknown[] {
    const values: unknown[] = [];

    if (region.id.startsWith('number-')) {
      // For number regions, generate values just outside the region
      if (region.id === 'number-positive') {
        values.push(0, -Number.EPSILON, Number.MIN_VALUE);
      } else if (region.id === 'number-negative') {
        values.push(0, Number.EPSILON, -Number.MIN_VALUE);
      } else if (region.id === 'number-zero') {
        values.push(-Number.EPSILON, Number.EPSILON, -0);
      }
    } else if (region.id.startsWith('string-')) {
      // For string regions, generate strings just outside length boundaries
      if (region.id === 'string-empty') {
        values.push('a', 'ab');
      } else if (region.id === 'string-single') {
        values.push('', 'ab');
      } else if (region.id === 'string-short') {
        values.push('a', 'a'.repeat(11));
      }
    }

    return values.slice(0, maxValues);
  }

  /**
   * Generate combination values (for complex boundaries)
   */
  private generateCombinationValues(region: NegativeSpaceRegion, maxValues: number): unknown[] {
    const values: unknown[] = [];

    // Generate combinations of boundary conditions
    if (region.id.startsWith('number-')) {
      // Combine special values with normal boundaries
      const boundaries = [0, 1, -1, Number.MAX_SAFE_INTEGER];
      const special = [NaN, Infinity, -Infinity];

      for (const boundary of boundaries) {
        for (const _spec of special) {
          if (values.length >= maxValues) break;
          // In real implementation, this would generate compound test cases
          values.push(boundary);
        }
      }
    }

    return values.slice(0, maxValues);
  }

  /**
   * Explain why a boundary value is interesting
   */
  private explainBoundaryValue(value: unknown, region: NegativeSpaceRegion): string {
    const valueStr = String(value);

    // Special number values
    if (typeof value === 'number') {
      if (Number.isNaN(value)) {
        return `NaN - special value that breaks arithmetic operations`;
      }
      if (value === Infinity) {
        return `Infinity - upper bound of number space`;
      }
      if (value === -Infinity) {
        return `-Infinity - lower bound of number space`;
      }
      if (Object.is(value, -0)) {
        return `-0 - negative zero (distinct from +0)`;
      }
      if (value === 0) {
        return `0 - boundary between positive and negative`;
      }
      if (value === Number.MAX_SAFE_INTEGER) {
        return `MAX_SAFE_INTEGER - largest safe integer`;
      }
      if (value === Number.MIN_SAFE_INTEGER) {
        return `MIN_SAFE_INTEGER - smallest safe integer`;
      }
    }

    // Special string values
    if (typeof value === 'string') {
      if (value === '') {
        return `Empty string - minimal string value`;
      }
      if (value.length === 1) {
        return `Single character - smallest non-empty string`;
      }
      if (value.includes('\n')) {
        return `Contains newline - special whitespace`;
      }
      if (value.includes('\0')) {
        return `Contains null byte - special character`;
      }
    }

    // Boolean values
    if (typeof value === 'boolean') {
      return `Boolean ${valueStr} - discrete value`;
    }

    return `Boundary value: ${valueStr} in ${region.id}`;
  }

  /**
   * Generate all boundary points for a type
   */
  generateAllBoundaries(typeNode: TypeNode): unknown[] {
    const boundaries: unknown[] = [];

    switch (typeNode.kind) {
      case 'primitive':
        if (typeNode.name === 'number') {
          boundaries.push(...this.numberSpace.generateBoundaryValues());
        } else if (typeNode.name === 'string') {
          boundaries.push(...this.stringSpace.generateBoundaryValues());
        } else if (typeNode.name === 'boolean') {
          boundaries.push(...this.booleanSpace.generateBoundaryValues());
        }
        break;

      case 'literal':
        // Literal values are stored in constraints or name
        if (typeNode.name) {
          boundaries.push(typeNode.name);
        }
        break;

      case 'union':
        if (typeNode.children) {
          for (const member of typeNode.children) {
            boundaries.push(...this.generateAllBoundaries(member));
          }
        }
        break;

      // Add more cases as needed
    }

    return boundaries;
  }
}
