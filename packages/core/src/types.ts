/**
 * Core types for NSTG
 *
 * Type definitions are re-exported from @nstg/shared to avoid circular dependencies
 */

// @APEX: Foundational types from @nstg/shared to break circular dependencies
export type { PrimitiveType, TypeConstraint, TypeKind, TypeNode } from '@nstg/shared';
import type { TypeConstraint, TypeNode } from '@nstg/shared';

/**
 * Represents a function parameter with type information
 */
export interface FunctionParameter {
  name: string;
  type: TypeNode;
  optional?: boolean;
  defaultValue?: unknown;
}

/**
 * Represents a function signature for analysis
 */
export interface FunctionSignature {
  name: string;
  parameters: FunctionParameter[];
  returnType: TypeNode;
  sourceFile?: string;
  startLine?: number;
  endLine?: number;
}

/**
 * Represents a region in the type space
 */
export interface TypeSpaceRegion {
  id: string;
  type: TypeNode;
  constraints: TypeConstraint[];
  cardinality: number | 'infinite';
  description?: string; // Human-readable description of this region
}

/**
 * Represents a test case input
 */
export interface TestInput {
  parameterName: string;
  value: unknown;
  typeRegion: TypeSpaceRegion;
  args: unknown[]; // Array of argument values for the test
}

/**
 * Represents a test case output
 */
export interface TestOutput {
  value?: unknown;
  threw?: Error;
  duration?: number;
}

/**
 * Represents an observable behavior from a test
 */
export interface ObservableBehavior {
  inputs: TestInput[];
  output?: unknown;
  threw?: Error;
  duration?: number;
}

/**
 * Represents a negative space region (untested valid inputs)
 */
export interface NegativeSpaceRegion {
  id: string;
  typeRegion: TypeSpaceRegion;
  estimatedSize: number | 'infinite';
  priority: number;
  boundaries: BoundaryPoint[];
  type?: TypeNode; // Type of this region
  reason?: string; // Why this region is important to test
  description?: string; // Human-readable description
  constraints?: TypeConstraint[]; // Additional constraints for this region
  cardinality?: number | 'infinite'; // Size of this region
}

/**
 * Represents a boundary point between tested and untested space
 */
export interface BoundaryPoint {
  value: unknown;
  dimension: string;
  distance: number;
}

/**
 * Configuration for NSTG analysis
 */
export interface NSTGConfig {
  maxNegativeSpaceRegions: number;
  maxBoundaryTests: number;
  timeout: number;
  includeEdgeCases: boolean;
  smtSolverEnabled: boolean;
}

/**
 * Result of NSTG analysis
 */
export interface AnalysisResult {
  function: FunctionSignature;
  universe: TypeSpaceRegion[];
  observedBehavior: ObservableBehavior[];
  negativeSpace: NegativeSpaceRegion[];
  coverage: CoverageMetrics;
  generatedTests: GeneratedTest[];
}

/**
 * Coverage metrics
 */
export interface CoverageMetrics {
  universeCoverage: number;
  boundariesTested: number;
  edgeCasesCovered: number;
  negativeSpaceSize: number | 'infinite';
}

/**
 * Represents expected behavior for a test
 */
export type TestExpectation = 'should-return' | 'should-throw' | 'should-satisfy' | 'unknown';

/**
 * Generated test case
 */
export interface GeneratedTest {
  id: string;
  description: string;
  inputs: TestInput[];
  expectedBehavior: TestExpectation;
  expectedValue?: unknown; // Expected return value when should-return
  priority: number;
  source: 'boundary' | 'edge-case' | 'negative-space';
  region?: NegativeSpaceRegion; // Associated negative space region
  functionName?: string; // Name of function being tested
  metadata?: {
    [key: string]: unknown; // Custom metadata
  };
}

/**
 * Alias for GeneratedTest to support code that uses TestCase name
 */
export type TestCase = GeneratedTest;
