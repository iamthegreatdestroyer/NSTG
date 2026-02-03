import type { Result } from '@nstg/shared';

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
 * Represents a type in the type system
 */
export interface TypeNode {
  kind: TypeKind;
  name?: string;
  children?: TypeNode[];
  constraints?: TypeConstraint[];
}

/**
 * Kind of type node
 */
export type TypeKind =
  | 'primitive'
  | 'literal'
  | 'union'
  | 'intersection'
  | 'array'
  | 'tuple'
  | 'object'
  | 'function'
  | 'generic'
  | 'unknown'
  | 'any'
  | 'never';

/**
 * Constraint on a type
 */
export interface TypeConstraint {
  type: 'range' | 'pattern' | 'length' | 'custom';
  value: unknown;
  description?: string;
}

/**
 * Represents a region in the type space
 */
export interface TypeSpaceRegion {
  id: string;
  type: TypeNode;
  constraints: TypeConstraint[];
  cardinality: number | 'infinite';
}

/**
 * Represents a test case input
 */
export interface TestInput {
  parameterName: string;
  value: unknown;
  typeRegion: TypeSpaceRegion;
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
 * Generated test case
 */
export interface GeneratedTest {
  id: string;
  description: string;
  inputs: TestInput[];
  expectedBehavior: 'return' | 'throw' | 'unknown';
  priority: number;
  source: 'boundary' | 'edge-case' | 'negative-space';
}
