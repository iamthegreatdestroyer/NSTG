/**
 * Copyright (c) 2025 NSTG. All Rights Reserved.
 *
 * This file is part of NSTG (Negative Space Test Generation).
 * Dual-licensed under AGPL-3.0-or-later and Commercial License.
 */

import type { TestCase } from '../types.js';

/**
 * Supported test framework formats
 */
export type TestFramework = 'jest' | 'vitest' | 'mocha';

/**
 * Options for template rendering
 */
export interface TemplateRenderOptions {
  /** Test framework to target */
  framework?: TestFramework;
  /** Include imports in output */
  includeImports?: boolean;
  /** Indentation (spaces) */
  indentation?: number;
  /** Include comments/explanations */
  includeComments?: boolean;
  /** Group tests by describe blocks */
  groupByRegion?: boolean;
}

/**
 * Rendered test file output
 */
export interface RenderedTest {
  /** Test framework used */
  framework: TestFramework;
  /** Generated test code */
  code: string;
  /** Number of test cases rendered */
  testCount: number;
  /** Import statements */
  imports: string[];
}

/**
 * TestTemplateEngine generates executable test code from test cases.
 *
 * Supports multiple test frameworks with framework-specific syntax:
 * - Jest: expect() assertions
 * - Vitest: expect() with Vitest extensions
 * - Mocha: assert/chai assertions
 *
 * Generates properly formatted, idiomatic test code with:
 * - Framework-appropriate imports
 * - Describe/test blocks
 * - Proper assertion syntax
 * - Comments and explanations
 *
 * @example
 * ```typescript
 * const engine = new TestTemplateEngine();
 * const result = engine.renderTests(testCases, {
 *   framework: 'jest',
 *   includeComments: true
 * });
 * console.log(result.code); // Ready to save as .test.ts
 * ```
 */
export class TestTemplateEngine {
  /**
   * Render multiple test cases into a complete test file
   */
  renderTests(testCases: TestCase[], options: TemplateRenderOptions = {}): RenderedTest {
    const {
      framework = 'jest',
      includeImports = true,
      indentation = 2,
      includeComments = true,
      groupByRegion = true,
    } = options;

    const indent = ' '.repeat(indentation);
    const lines: string[] = [];

    // Add imports
    if (includeImports) {
      const imports = this.generateImports(framework, testCases);
      lines.push(...imports, '');
    }

    // Group tests by region if requested
    if (groupByRegion) {
      const grouped = this.groupTestsByRegion(testCases);

      for (const [regionId, tests] of grouped.entries()) {
        const regionName = tests[0].region.type;
        lines.push(`describe('${regionName}', () => {`);

        for (const testCase of tests) {
          const testCode = this.renderTest(testCase, framework, indent, includeComments);
          lines.push(...testCode);
        }

        lines.push('});', '');
      }
    } else {
      // Render all tests in single describe block
      const functionName = testCases[0]?.functionName || 'function';
      lines.push(`describe('${functionName}', () => {`);

      for (const testCase of testCases) {
        const testCode = this.renderTest(testCase, framework, indent, includeComments);
        lines.push(...testCode);
      }

      lines.push('});');
    }

    return {
      framework,
      code: lines.join('\n'),
      testCount: testCases.length,
      imports: includeImports ? this.generateImports(framework, testCases) : [],
    };
  }

  /**
   * Render a single test case
   */
  private renderTest(
    testCase: TestCase,
    framework: TestFramework,
    indent: string,
    includeComments: boolean
  ): string[] {
    const lines: string[] = [];

    // Add comment with explanation
    if (includeComments && testCase.metadata?.explanation) {
      lines.push(`${indent}// ${testCase.metadata.explanation}`);
    }

    // Test declaration
    const testKeyword = this.getTestKeyword(framework);
    lines.push(`${indent}${testKeyword}('${testCase.description}', () => {`);

    // Test body
    const bodyLines = this.generateTestBody(testCase, framework, indent + indent);
    lines.push(...bodyLines);

    lines.push(`${indent}});`, '');

    return lines;
  }

  /**
   * Generate test body with assertions
   */
  private generateTestBody(testCase: TestCase, framework: TestFramework, indent: string): string[] {
    const lines: string[] = [];

    // Generate function call
    const argsStr = testCase.inputs.map(arg => this.formatArgument(arg)).join(', ');
    const functionCall = `${testCase.functionName}(${argsStr})`;

    // Generate assertion based on expected behavior
    switch (testCase.expectedBehavior) {
      case 'should-return':
        lines.push(
          ...this.generateReturnAssertion(functionCall, testCase.expectedValue, framework, indent)
        );
        break;

      case 'should-throw':
        lines.push(
          ...this.generateThrowAssertion(functionCall, testCase.expectedValue, framework, indent)
        );
        break;

      case 'should-satisfy':
        lines.push(
          ...this.generateSatisfyAssertion(functionCall, testCase.expectedValue, framework, indent)
        );
        break;
    }

    return lines;
  }

  /**
   * Generate assertion for should-return behavior
   */
  private generateReturnAssertion(
    functionCall: string,
    expectedValue: unknown,
    framework: TestFramework,
    indent: string
  ): string[] {
    const lines: string[] = [];

    if (framework === 'jest' || framework === 'vitest') {
      const assertion = this.generateExpectAssertion(functionCall, expectedValue);
      lines.push(`${indent}${assertion}`);
    } else if (framework === 'mocha') {
      lines.push(`${indent}const result = ${functionCall};`);
      lines.push(`${indent}assert.strictEqual(result, ${this.formatArgument(expectedValue)});`);
    }

    return lines;
  }

  /**
   * Generate assertion for should-throw behavior
   */
  private generateThrowAssertion(
    functionCall: string,
    expectedValue: unknown,
    framework: TestFramework,
    indent: string
  ): string[] {
    const lines: string[] = [];

    if (framework === 'jest' || framework === 'vitest') {
      lines.push(`${indent}expect(() => ${functionCall}).toThrow();`);
    } else if (framework === 'mocha') {
      lines.push(`${indent}assert.throws(() => ${functionCall});`);
    }

    return lines;
  }

  /**
   * Generate assertion for should-satisfy behavior
   */
  private generateSatisfyAssertion(
    functionCall: string,
    expectedValue: unknown,
    framework: TestFramework,
    indent: string
  ): string[] {
    const lines: string[] = [];

    if (framework === 'jest' || framework === 'vitest') {
      lines.push(`${indent}const result = ${functionCall};`);
      lines.push(`${indent}expect(result).toBeDefined();`);

      // Add type-specific assertions
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        const predicate = (expectedValue as any).description;
        if (predicate) {
          lines.push(`${indent}// ${predicate}`);
        }
      }
    } else if (framework === 'mocha') {
      lines.push(`${indent}const result = ${functionCall};`);
      lines.push(`${indent}assert.isDefined(result);`);
    }

    return lines;
  }

  /**
   * Generate expect() assertion for Jest/Vitest
   */
  private generateExpectAssertion(functionCall: string, expectedValue: unknown): string {
    // Handle special number values with Object.is
    if (typeof expectedValue === 'number') {
      if (Number.isNaN(expectedValue)) {
        return `expect(${functionCall}).toBeNaN();`;
      }
      if (Object.is(expectedValue, -0)) {
        return `expect(Object.is(${functionCall}, -0)).toBe(true);`;
      }
      if (expectedValue === Infinity) {
        return `expect(${functionCall}).toBe(Infinity);`;
      }
      if (expectedValue === -Infinity) {
        return `expect(${functionCall}).toBe(-Infinity);`;
      }
    }

    // Handle type-based assertions
    if (typeof expectedValue === 'object' && expectedValue !== null) {
      const valueObj = expectedValue as any;
      if (valueObj.type === 'error') {
        return `expect(() => ${functionCall}).toThrow();`;
      }
      if (valueObj.type === 'predicate') {
        return `expect(${functionCall}).toBeDefined();`;
      }
    }

    // Default equality assertion
    return `expect(${functionCall}).toBe(${this.formatArgument(expectedValue)});`;
  }

  /**
   * Format argument for code generation
   */
  private formatArgument(arg: unknown): string {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';

    if (typeof arg === 'number') {
      if (Number.isNaN(arg)) return 'NaN';
      if (arg === Infinity) return 'Infinity';
      if (arg === -Infinity) return '-Infinity';
      if (Object.is(arg, -0)) return '-0';
      return String(arg);
    }

    if (typeof arg === 'string') {
      // Escape special characters
      const escaped = arg
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `'${escaped}'`;
    }

    if (typeof arg === 'boolean') {
      return String(arg);
    }

    if (Array.isArray(arg)) {
      return `[${arg.map(item => this.formatArgument(item)).join(', ')}]`;
    }

    if (typeof arg === 'object') {
      return JSON.stringify(arg);
    }

    return String(arg);
  }

  /**
   * Generate import statements for framework
   */
  private generateImports(framework: TestFramework, testCases: TestCase[]): string[] {
    const imports: string[] = [];
    const functionNames = new Set(testCases.map(tc => tc.functionName));

    // Framework-specific imports
    if (framework === 'jest') {
      imports.push("import { describe, test, expect } from '@jest/globals';");
    } else if (framework === 'vitest') {
      imports.push("import { describe, test, expect } from 'vitest';");
    } else if (framework === 'mocha') {
      imports.push("import { describe, it } from 'mocha';");
      imports.push("import { assert } from 'chai';");
    }

    // Function imports (assumes functions are in ../src/)
    for (const functionName of functionNames) {
      imports.push(`import { ${functionName} } from '../src/index.js';`);
    }

    return imports;
  }

  /**
   * Get test keyword for framework
   */
  private getTestKeyword(framework: TestFramework): string {
    return framework === 'mocha' ? 'it' : 'test';
  }

  /**
   * Group test cases by region for organized output
   */
  private groupTestsByRegion(testCases: TestCase[]): Map<string, TestCase[]> {
    const grouped = new Map<string, TestCase[]>();

    for (const testCase of testCases) {
      const regionId = testCase.region.id;
      if (!grouped.has(regionId)) {
        grouped.set(regionId, []);
      }
      grouped.get(regionId)!.push(testCase);
    }

    return grouped;
  }

  /**
   * Render tests to file content ready to save
   *
   * @param testCases - Test cases to render
   * @param options - Rendering options
   * @returns Complete file content with header
   */
  renderTestFile(testCases: TestCase[], options: TemplateRenderOptions = {}): string {
    const result = this.renderTests(testCases, options);

    const header = [
      '/**',
      ' * Generated by NSTG (Negative Space Test Generation)',
      ` * Framework: ${result.framework}`,
      ` * Test count: ${result.testCount}`,
      ` * Generated: ${new Date().toISOString()}`,
      ' */',
      '',
    ].join('\n');

    return header + result.code;
  }
}
