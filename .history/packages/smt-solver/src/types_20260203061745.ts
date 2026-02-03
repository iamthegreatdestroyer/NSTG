import type { Result } from '@nstg/shared';

/**
 * SMT constraint representation
 */
export interface SMTConstraint {
  type: 'equality' | 'inequality' | 'range' | 'pattern' | 'custom';
  expression: string;
  variables: string[];
}

/**
 * SMT solver result
 */
export interface SMTResult {
  satisfiable: boolean;
  model?: Record<string, unknown>;
  error?: string;
}

/**
 * SMT solver configuration
 */
export interface SMTSolverConfig {
  timeout: number;
  maxSolutions: number;
  optimization: 'speed' | 'memory' | 'balanced';
}

/**
 * SMT variable declaration
 */
export interface SMTVariable {
  name: string;
  sort: 'Int' | 'Real' | 'Bool' | 'String' | 'BitVec';
  constraints?: SMTConstraint[];
}
