/**
 * Copyright (c) 2025 NSTG. All Rights Reserved.
 * 
 * This file is part of NSTG (Negative Space Test Generation).
 * Dual-licensed under AGPL-3.0-or-later and Commercial License.
 */

/**
 * Test Generation Module
 * 
 * Transforms negative space regions into executable test code.
 * 
 * Pipeline:
 * 1. TestGenerator: NegativeSpaceRegion[] → TestCase[]
 * 2. TestTemplateEngine: TestCase[] → framework-specific code
 * 3. AssertionBuilder: Smart assertion generation
 * 
 * Supports multiple test frameworks:
 * - Jest: expect() assertions
 * - Vitest: expect() with Vitest extensions
 * - Mocha: assert/chai assertions
 */

export { TestGenerator } from './test-generator.js';
export type {
  TestGenerationOptions,
  TestGenerationStats,
} from './test-generator.js';

export { TestTemplateEngine } from './template-engine.js';
export type {
  TestFramework,
  TemplateRenderOptions,
  RenderedTest,
} from './template-engine.js';

export { AssertionBuilder } from './assertion-builder.js';
export type {
  AssertionType,
  AssertionCode,
  AssertionOptions,
} from './assertion-builder.js';
