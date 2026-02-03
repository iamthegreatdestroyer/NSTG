/**
 * Copyright (c) 2025 NSTG. All Rights Reserved.
 *
 * This file is part of NSTG (Negative Space Test Generation).
 * Dual-licensed under AGPL-3.0-or-later and Commercial License.
 */

import type { TestCase } from '../types.js';
import type { TestFramework } from './template-engine.js';

/**
 * Assertion types supported across frameworks
 */
export type AssertionType =
  | 'strict-equality' // toBe() / assert.strictEqual()
  | 'deep-equality' // toEqual() / assert.deepEqual()
  | 'throws' // toThrow() / assert.throws()
  | 'type-check' // Type validation
  | 'predicate' // Custom predicate
  | 'special-value'; // NaN, -0, Infinity

/**
 * Generated assertion code
 */
export interface AssertionCode {
  /** Assertion type used */
  type: AssertionType;
  /** Generated code */
  code: string;
  /** Whether async handling needed */
  isAsync: boolean;
  /** Comments explaining assertion */
  comments: string[];
}

/**
 * Options for assertion generation
 */
export interface AssertionOptions {
  /** Include explanatory comments */
  includeComments?: boolean;
  /** Use strict equality by default */
  preferStrictEquality?: boolean;
  /** Custom matcher names */
  customMatchers?: Record<string, string>;
}

/**
 * AssertionBuilder generates smart assertions for test cases.
 *
 * Selects appropriate assertion methods based on:
 * - Expected behavior (return, throw, satisfy)
 * - Value types (primitive, object, special)
 * - Framework capabilities
 *
 * Features:
 * - Framework-specific syntax (Jest/Vitest expect(), Mocha assert())
 * - Special value handling (NaN, -0, Infinity)
 * - Deep vs shallow equality selection
 * - Type-safe assertions
 * - Async/promise support
 *
 * @example
 * ```typescript
 * const builder = new AssertionBuilder();
 * const assertion = builder.buildAssertion(testCase, 'jest');
 * console.log(assertion.code); // expect(fn()).toBe(42)
 * ```
 */
export class AssertionBuilder {
  /**
   * Build assertion code for a test case
   */
  buildAssertion(
    testCase: TestCase,
    framework: TestFramework,
    options: AssertionOptions = {}
  ): AssertionCode {
    const { includeComments = false } = options;

    // Determine assertion type
    const assertionType = this.selectAssertionType(testCase);

    // Generate framework-specific code
    const code = this.generateAssertionCode(testCase, framework, assertionType, options);

    // Generate comments
    const comments: string[] = [];
    if (includeComments) {
      comments.push(...this.generateComments(testCase, assertionType));
    }

    return {
      type: assertionType,
      code,
      isAsync: this.isAsyncAssertion(testCase),
      comments,
    };
  }

  /**
   * Select appropriate assertion type for test case
   */
  private selectAssertionType(testCase: TestCase): AssertionType {
    // Error/exception cases
    if (testCase.expectedBehavior === 'should-throw') {
      return 'throws';
    }

    // Predicate/constraint satisfaction
    if (testCase.expectedBehavior === 'should-satisfy') {
      return 'predicate';
    }

    // Handle special numeric values
    if (this.hasSpecialValue(testCase.expectedValue)) {
      return 'special-value';
    }

    // Type checking
    if (this.isTypeCheckAssertion(testCase)) {
      return 'type-check';
    }

    // Object comparison (deep equality)
    if (this.requiresDeepEquality(testCase.expectedValue)) {
      return 'deep-equality';
    }

    // Default to strict equality
    return 'strict-equality';
  }

  /**
   * Generate framework-specific assertion code
   */
  private generateAssertionCode(
    testCase: TestCase,
    framework: TestFramework,
    assertionType: AssertionType,
    options: AssertionOptions
  ): string {
    const functionCall = this.buildFunctionCall(testCase);

    if (framework === 'jest' || framework === 'vitest') {
      return this.generateExpectAssertion(functionCall, testCase, assertionType, options);
    } else if (framework === 'mocha') {
      return this.generateAssertAssertion(functionCall, testCase, assertionType, options);
    }

    throw new Error(`Unsupported framework: ${framework}`);
  }

  /**
   * Generate Jest/Vitest expect() assertion
   */
  private generateExpectAssertion(
    functionCall: string,
    testCase: TestCase,
    assertionType: AssertionType,
    options: AssertionOptions
  ): string {
    switch (assertionType) {
      case 'throws':
        return `expect(() => ${functionCall}).toThrow();`;

      case 'special-value':
        return this.generateSpecialValueAssertion(functionCall, testCase.expectedValue, 'expect');

      case 'deep-equality':
        return `expect(${functionCall}).toEqual(${this.formatValue(testCase.expectedValue)});`;

      case 'strict-equality':
        return `expect(${functionCall}).toBe(${this.formatValue(testCase.expectedValue)});`;

      case 'type-check':
        return this.generateTypeCheckAssertion(functionCall, testCase.expectedValue, 'expect');

      case 'predicate':
        return this.generatePredicateAssertion(functionCall, testCase.expectedValue, 'expect');

      default:
        return `expect(${functionCall}).toBe(${this.formatValue(testCase.expectedValue)});`;
    }
  }

  /**
   * Generate Mocha assert() assertion
   */
  private generateAssertAssertion(
    functionCall: string,
    testCase: TestCase,
    assertionType: AssertionType,
    options: AssertionOptions
  ): string {
    switch (assertionType) {
      case 'throws':
        return `assert.throws(() => ${functionCall});`;

      case 'special-value':
        return this.generateSpecialValueAssertion(functionCall, testCase.expectedValue, 'assert');

      case 'deep-equality':
        return `const result = ${functionCall};\nassert.deepStrictEqual(result, ${this.formatValue(testCase.expectedValue)});`;

      case 'strict-equality':
        return `const result = ${functionCall};\nassert.strictEqual(result, ${this.formatValue(testCase.expectedValue)});`;

      case 'type-check':
        return this.generateTypeCheckAssertion(functionCall, testCase.expectedValue, 'assert');

      case 'predicate':
        return this.generatePredicateAssertion(functionCall, testCase.expectedValue, 'assert');

      default:
        return `const result = ${functionCall};\nassert.strictEqual(result, ${this.formatValue(testCase.expectedValue)});`;
    }
  }

  /**
   * Generate assertion for special numeric values
   */
  private generateSpecialValueAssertion(
    functionCall: string,
    expectedValue: unknown,
    style: 'expect' | 'assert'
  ): string {
    if (typeof expectedValue !== 'number') {
      return style === 'expect'
        ? `expect(${functionCall}).toBe(${this.formatValue(expectedValue)});`
        : `assert.strictEqual(${functionCall}, ${this.formatValue(expectedValue)});`;
    }

    if (Number.isNaN(expectedValue)) {
      return style === 'expect'
        ? `expect(${functionCall}).toBeNaN();`
        : `assert.isNaN(${functionCall});`;
    }

    if (Object.is(expectedValue, -0)) {
      return style === 'expect'
        ? `expect(Object.is(${functionCall}, -0)).toBe(true);`
        : `assert.strictEqual(Object.is(${functionCall}, -0), true);`;
    }

    if (expectedValue === Infinity) {
      return style === 'expect'
        ? `expect(${functionCall}).toBe(Infinity);`
        : `assert.strictEqual(${functionCall}, Infinity);`;
    }

    if (expectedValue === -Infinity) {
      return style === 'expect'
        ? `expect(${functionCall}).toBe(-Infinity);`
        : `assert.strictEqual(${functionCall}, -Infinity);`;
    }

    return style === 'expect'
      ? `expect(${functionCall}).toBe(${expectedValue});`
      : `assert.strictEqual(${functionCall}, ${expectedValue});`;
  }

  /**
   * Generate type checking assertion
   */
  private generateTypeCheckAssertion(
    functionCall: string,
    expectedValue: unknown,
    style: 'expect' | 'assert'
  ): string {
    const valueObj = expectedValue as any;
    const expectedType = valueObj?.returnType || 'unknown';

    if (style === 'expect') {
      return `const result = ${functionCall};\nexpect(typeof result).toBe('${expectedType}');`;
    } else {
      return `const result = ${functionCall};\nassert.strictEqual(typeof result, '${expectedType}');`;
    }
  }

  /**
   * Generate predicate assertion
   */
  private generatePredicateAssertion(
    functionCall: string,
    expectedValue: unknown,
    style: 'expect' | 'assert'
  ): string {
    const valueObj = expectedValue as any;
    const description = valueObj?.description || 'valid value';

    if (style === 'expect') {
      return `const result = ${functionCall};\nexpect(result).toBeDefined(); // ${description}`;
    } else {
      return `const result = ${functionCall};\nassert.isDefined(result); // ${description}`;
    }
  }

  /**
   * Build function call string from test case
   */
  private buildFunctionCall(testCase: TestCase): string {
    const args = testCase.inputs.map(arg => this.formatValue(arg)).join(', ');
    return `${testCase.functionName}(${args})`;
  }

  /**
   * Format value for code generation
   */
  private formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    if (typeof value === 'number') {
      if (Number.isNaN(value)) return 'NaN';
      if (value === Infinity) return 'Infinity';
      if (value === -Infinity) return '-Infinity';
      if (Object.is(value, -0)) return '-0';
      return String(value);
    }

    if (typeof value === 'string') {
      const escaped = value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `'${escaped}'`;
    }

    if (typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Check if expected value contains special numeric values
   */
  private hasSpecialValue(value: unknown): boolean {
    if (typeof value !== 'number') {
      return false;
    }

    return Number.isNaN(value) || !Number.isFinite(value) || Object.is(value, -0);
  }

  /**
   * Check if assertion requires deep equality
   */
  private requiresDeepEquality(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Check if assertion is type checking only
   */
  private isTypeCheckAssertion(testCase: TestCase): boolean {
    const valueObj = testCase.expectedValue as any;
    return (
      typeof valueObj === 'object' &&
      valueObj !== null &&
      'returnType' in valueObj &&
      !('type' in valueObj)
    );
  }

  /**
   * Check if assertion needs async handling
   */
  private isAsyncAssertion(testCase: TestCase): boolean {
    // Check if function signature indicates async
    // This would require FunctionSignature in TestCase
    return false; // Simplified for now
  }

  /**
   * Generate explanatory comments for assertion
   */
  private generateComments(testCase: TestCase, assertionType: AssertionType): string[] {
    const comments: string[] = [];

    switch (assertionType) {
      case 'special-value':
        comments.push('Special value assertion (NaN, -0, Infinity)');
        break;
      case 'throws':
        comments.push('Expected to throw error');
        break;
      case 'deep-equality':
        comments.push('Deep object comparison');
        break;
      case 'predicate':
        comments.push('Predicate/constraint satisfaction');
        break;
    }

    if (testCase.metadata?.explanation) {
      comments.push(testCase.metadata.explanation);
    }

    return comments;
  }
}
