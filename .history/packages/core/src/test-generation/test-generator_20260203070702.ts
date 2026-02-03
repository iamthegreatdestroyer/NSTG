/**
 * Copyright (c) 2025 NSTG. All Rights Reserved.
 *
 * This file is part of NSTG (Negative Space Test Generation).
 * Dual-licensed under AGPL-3.0-or-later and Commercial License.
 */

import type { FunctionSignature, NegativeSpaceRegion, TestInput, TestCase } from '../types.js';
import { BoundaryWalker } from '../negative-space/boundary-walker.js';

/**
 * Options for test generation configuration
 */
export interface TestGenerationOptions {
  /** Maximum number of tests to generate */
  maxTests?: number;
  /** Minimum priority threshold (0-1) */
  priorityThreshold?: number;
  /** Include human-readable explanations */
  includeExplanations?: boolean;
  /** Exploration depth for boundary walking (1-3) */
  explorationDepth?: number;
  /** Maximum inputs per region */
  maxInputsPerRegion?: number;
  /** Include special values (NaN, Infinity, etc.) */
  includeSpecialValues?: boolean;
}

/**
 * Statistics about generated tests
 */
export interface TestGenerationStats {
  /** Total tests generated */
  totalTests: number;
  /** Tests by priority level */
  testsByPriority: {
    high: number; // priority >= 0.8
    medium: number; // 0.5 <= priority < 0.8
    low: number; // priority < 0.5
  };
  /** Tests by region type */
  testsByRegion: Map<string, number>;
  /** Tests by expected behavior */
  testsByBehavior: {
    shouldReturn: number;
    shouldThrow: number;
    shouldSatisfy: number;
  };
  /** Average priority of generated tests */
  averagePriority: number;
}

/**
 * TestGenerator transforms negative space regions into executable test cases.
 *
 * This is the final transformation in the NSTG pipeline:
 * NegativeSpaceRegion[] → TestCase[] → executable test code
 *
 * Uses BoundaryWalker to generate test inputs at boundary points where
 * bugs are statistically most likely to occur.
 *
 * @example
 * ```typescript
 * const generator = new TestGenerator(functionSignature);
 * const testCases = generator.generateTests(negativeSpaceRegions, {
 *   maxTests: 50,
 *   priorityThreshold: 0.5,
 *   explorationDepth: 2
 * });
 * ```
 */
export class TestGenerator {
  private boundaryWalker: BoundaryWalker;
  private testCounter = 0;

  constructor(private signature: FunctionSignature) {
    this.boundaryWalker = new BoundaryWalker();
  }

  /**
   * Generate test cases from negative space regions
   *
   * @param regions - Untested regions identified by GapDetector
   * @param options - Generation configuration options
   * @returns Array of test cases ready for code generation
   */
  generateTests(regions: NegativeSpaceRegion[], options: TestGenerationOptions = {}): TestCase[] {
    const {
      maxTests = Infinity,
      priorityThreshold = 0,
      includeExplanations = true,
      explorationDepth = 2,
      maxInputsPerRegion = 10,
      includeSpecialValues = true,
    } = options;

    // Filter regions by priority threshold
    const filteredRegions = regions.filter(region => region.priority >= priorityThreshold);

    // Sort by priority descending (highest priority first)
    const sortedRegions = [...filteredRegions].sort((a, b) => b.priority - a.priority);

    const testCases: TestCase[] = [];

    // Generate tests for each region until maxTests reached
    for (const region of sortedRegions) {
      if (testCases.length >= maxTests) break;

      const remainingTests = maxTests - testCases.length;
      const testsForRegion = Math.min(remainingTests, maxInputsPerRegion);

      const regionTests = this.generateTestsForGap(region, {
        maxTests: testsForRegion,
        explorationDepth,
        includeSpecialValues,
        includeExplanations,
      });

      testCases.push(...regionTests);
    }

    return testCases;
  }

  /**
   * Generate test cases for a specific gap (untested region)
   *
   * @param region - Negative space region to test
   * @param options - Generation options
   * @returns Test cases covering the gap
   */
  generateTestsForGap(
    region: NegativeSpaceRegion,
    options: {
      maxTests: number;
      explorationDepth: number;
      includeSpecialValues: boolean;
      includeExplanations: boolean;
    }
  ): TestCase[] {
    const { maxTests, explorationDepth, includeSpecialValues, includeExplanations } = options;

    // Walk boundary to generate test inputs
    const boundaryResult = this.boundaryWalker.walkBoundary(region, {
      maxInputs: maxTests,
      depth: explorationDepth,
      includeSpecialValues,
    });

    const testCases: TestCase[] = [];

    // Create test case for each boundary input
    for (let i = 0; i < boundaryResult.testInputs.length; i++) {
      const testInput = boundaryResult.testInputs[i];
      const explanation = includeExplanations ? boundaryResult.explanations[i] : undefined;

      const testCase = this.createTestCase(region, testInput, explanation);
      testCases.push(testCase);
    }

    return testCases;
  }

  /**
   * Create a test case from region and input
   *
   * @param region - Source negative space region
   * @param testInput - Test input arguments
   * @param explanation - Optional human-readable explanation
   * @returns Complete test case
   */
  private createTestCase(
    region: NegativeSpaceRegion,
    testInput: TestInput,
    explanation?: string
  ): TestCase {
    const testId = `test-${++this.testCounter}`;

    // Determine expected behavior based on region characteristics
    const expectedBehavior = this.determineExpectedBehavior(region, testInput);

    // Generate description
    const description = this.generateDescription(region, testInput, expectedBehavior, explanation);

    return {
      id: testId,
      description,
      functionName: this.signature.name,
      inputs: testInput.args,
      expectedBehavior,
      expectedValue: this.determineExpectedValue(expectedBehavior, region),
      priority: region.priority,
      region: {
        id: region.id,
        type: region.type,
        reason: region.reason,
      },
      metadata: {
        generated: new Date().toISOString(),
        explanation,
        boundaryPoint: true,
      },
    };
  }

  /**
   * Determine expected behavior for a test case
   *
   * Based on region characteristics and special values
   */
  private determineExpectedBehavior(
    region: NegativeSpaceRegion,
    testInput: TestInput
  ): 'should-return' | 'should-throw' | 'should-satisfy' {
    // Check if input contains special values that might cause errors
    const hasSpecialValues = testInput.args.some(arg => this.isSpecialValue(arg));

    // Special values often cause throws or special handling
    if (hasSpecialValues && region.reason.includes('special')) {
      return 'should-throw';
    }

    // Boundary regions typically return values
    if (region.reason.includes('Boundary')) {
      return 'should-return';
    }

    // Default: should satisfy general constraints
    return 'should-satisfy';
  }

  /**
   * Check if value is a special value (NaN, Infinity, -0, null, undefined)
   */
  private isSpecialValue(value: unknown): boolean {
    if (typeof value === 'number') {
      return Number.isNaN(value) || !Number.isFinite(value) || Object.is(value, -0);
    }
    return value === null || value === undefined;
  }

  /**
   * Determine expected value based on behavior type
   */
  private determineExpectedValue(
    behavior: 'should-return' | 'should-throw' | 'should-satisfy',
    region: NegativeSpaceRegion
  ): unknown {
    if (behavior === 'should-throw') {
      return { type: 'error', message: 'Expected error' };
    }

    if (behavior === 'should-satisfy') {
      return {
        type: 'predicate',
        description: `Value should be valid for ${region.type}`,
      };
    }

    // For should-return, return type depends on function signature
    return this.signature.returnType;
  }

  /**
   * Generate human-readable test description
   */
  private generateDescription(
    region: NegativeSpaceRegion,
    testInput: TestInput,
    expectedBehavior: string,
    explanation?: string
  ): string {
    const functionName = this.signature.name;
    const argsStr = testInput.args.map(arg => this.formatValue(arg)).join(', ');

    let description = `should handle ${functionName}(${argsStr})`;

    // Add behavior context
    if (expectedBehavior === 'should-throw') {
      description += ' (expect error)';
    }

    // Add region context
    if (region.reason) {
      description += ` - ${region.reason}`;
    }

    // Add explanation if provided
    if (explanation) {
      description += ` [${explanation}]`;
    }

    return description;
  }

  /**
   * Format value for display in test description
   */
  private formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'number') {
      if (Number.isNaN(value)) return 'NaN';
      if (value === Infinity) return 'Infinity';
      if (value === -Infinity) return '-Infinity';
      if (Object.is(value, -0)) return '-0';
    }
    if (typeof value === 'string') {
      return value.length > 20 ? `"${value.slice(0, 17)}..."` : `"${value}"`;
    }
    return String(value);
  }

  /**
   * Calculate statistics about generated tests
   */
  calculateStats(testCases: TestCase[]): TestGenerationStats {
    const stats: TestGenerationStats = {
      totalTests: testCases.length,
      testsByPriority: { high: 0, medium: 0, low: 0 },
      testsByRegion: new Map(),
      testsByBehavior: {
        shouldReturn: 0,
        shouldThrow: 0,
        shouldSatisfy: 0,
      },
      averagePriority: 0,
    };

    let totalPriority = 0;

    for (const testCase of testCases) {
      // Priority classification
      if (testCase.priority >= 0.8) {
        stats.testsByPriority.high++;
      } else if (testCase.priority >= 0.5) {
        stats.testsByPriority.medium++;
      } else {
        stats.testsByPriority.low++;
      }

      // Region tracking
      const regionId = testCase.region.id;
      stats.testsByRegion.set(regionId, (stats.testsByRegion.get(regionId) || 0) + 1);

      // Behavior tracking
      if (testCase.expectedBehavior === 'should-return') {
        stats.testsByBehavior.shouldReturn++;
      } else if (testCase.expectedBehavior === 'should-throw') {
        stats.testsByBehavior.shouldThrow++;
      } else {
        stats.testsByBehavior.shouldSatisfy++;
      }

      totalPriority += testCase.priority;
    }

    stats.averagePriority = testCases.length > 0 ? totalPriority / testCases.length : 0;

    return stats;
  }

  /**
   * Prioritize test cases (re-sort after generation)
   *
   * @param testCases - Tests to prioritize
   * @param strategy - Prioritization strategy
   * @returns Sorted test cases
   */
  prioritizeTests(
    testCases: TestCase[],
    strategy: 'priority' | 'boundary-first' | 'error-first' = 'priority'
  ): TestCase[] {
    const sorted = [...testCases];

    switch (strategy) {
      case 'priority':
        return sorted.sort((a, b) => b.priority - a.priority);

      case 'boundary-first':
        return sorted.sort((a, b) => {
          const aBoundary = a.region.reason.includes('Boundary') ? 1 : 0;
          const bBoundary = b.region.reason.includes('Boundary') ? 1 : 0;
          if (aBoundary !== bBoundary) return bBoundary - aBoundary;
          return b.priority - a.priority;
        });

      case 'error-first':
        return sorted.sort((a, b) => {
          const aError = a.expectedBehavior === 'should-throw' ? 1 : 0;
          const bError = b.expectedBehavior === 'should-throw' ? 1 : 0;
          if (aError !== bError) return bError - aError;
          return b.priority - a.priority;
        });

      default:
        return sorted;
    }
  }
}
