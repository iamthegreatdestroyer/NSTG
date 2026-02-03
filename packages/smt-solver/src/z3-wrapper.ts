/**
 * @fileoverview Z3 WASM constraint solver wrapper
 *
 * Provides a TypeScript-friendly interface to the Z3 theorem prover via z3-solver WASM.
 * Handles context initialization, constraint translation, and solution extraction.
 *
 * @module @nstg/smt-solver/z3-wrapper
 * @author NSTG Team
 * @license MIT
 */

import { init, Context, Solver, Model, Expr, Sort } from 'z3-solver';
import type { TypeConstraint, TypeNode, PrimitiveType } from '@nstg/core';

/**
 * Z3 constraint representation after translation
 */
export interface Z3Constraint {
  /** Original NSTG constraint */
  readonly original: TypeConstraint;
  /** Z3 expression */
  readonly expr: Expr;
  /** Variable bindings */
  readonly variables: Map<string, Expr>;
}

/**
 * Solution from Z3 solver
 */
export interface Z3Solution {
  /** Solution status */
  readonly status: 'sat' | 'unsat' | 'unknown';
  /** Model if satisfiable */
  readonly model?: Model;
  /** Variable assignments */
  readonly assignments: Map<string, unknown>;
  /** Unsat core if unsatisfiable */
  readonly unsatCore?: string[];
}

/**
 * Z3 solver configuration options
 */
export interface Z3SolverOptions {
  /** Timeout in milliseconds */
  readonly timeout?: number;
  /** Maximum memory in MB */
  readonly maxMemory?: number;
  /** Enable model generation */
  readonly produceModels?: boolean;
  /** Enable unsat core extraction */
  readonly produceUnsatCores?: boolean;
  /** Solver logic (QF_LIA, QF_NIA, QF_S, etc.) */
  readonly logic?: string;
}

/**
 * Z3 Solver wrapper providing TypeScript-friendly constraint solving
 *
 * Features:
 * - Async WASM initialization
 * - TypeConstraint to SMT-LIB translation
 * - Multiple solver theories (arithmetic, strings, datatypes)
 * - Memory management and cleanup
 * - Solution extraction and model parsing
 *
 * @example
 * ```typescript
 * const solver = new Z3Solver();
 * await solver.init();
 *
 * const constraint: TypeConstraint = {
 *   type: 'range',
 *   min: 0,
 *   max: 100
 * };
 *
 * const solution = await solver.solve([constraint], { timeout: 5000 });
 * if (solution.status === 'sat') {
 *   console.log('Solution:', solution.assignments);
 * }
 *
 * await solver.dispose();
 * ```
 */
export class Z3Solver {
  private context: Context | null = null;
  private solver: Solver | null = null;
  private initialized = false;
  private variableCounter = 0;

  /**
   * Initialize Z3 WASM context and solver
   *
   * Must be called before any solving operations.
   *
   * @param options - Solver configuration options
   * @throws {Error} If WASM initialization fails
   */
  async init(options: Z3SolverOptions = {}): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize Z3 WASM context
      const { Context } = await init();
      this.context = new Context('main');

      // Create solver with configuration
      this.solver = new this.context.Solver();

      // Apply solver options
      if (options.timeout !== undefined) {
        this.solver.set('timeout', options.timeout);
      }

      if (options.maxMemory !== undefined) {
        this.solver.set('max_memory', options.maxMemory);
      }

      if (options.produceModels !== false) {
        this.solver.set('model', true);
      }

      if (options.produceUnsatCores) {
        this.solver.set('unsat_core', true);
      }

      if (options.logic) {
        this.solver.set('logic', options.logic);
      }

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Z3 solver: ${error}`);
    }
  }

  /**
   * Translate TypeConstraint to Z3 constraint expression
   *
   * Supports:
   * - Range constraints: min ≤ x ≤ max
   * - Pattern constraints: regex matching (approximate via string theory)
   * - Length constraints: string/array length
   * - Enum constraints: x ∈ {v1, v2, ...}
   * - Custom predicates: user-defined constraints
   *
   * @param constraint - NSTG type constraint
   * @param varName - Variable name for the constraint
   * @returns Translated Z3 constraint
   * @throws {Error} If solver not initialized or translation fails
   */
  translateConstraint(
    constraint: TypeConstraint,
    varName: string = `v${this.variableCounter++}`
  ): Z3Constraint {
    this.ensureInitialized();

    const ctx = this.context!;
    const variables = new Map<string, Expr>();

    try {
      let expr: Expr;

      switch (constraint.type) {
        case 'range': {
          // Numeric range: min ≤ x ≤ max
          const x = ctx.Int.const(varName);
          variables.set(varName, x);

          const constraints: Expr[] = [];
          if (constraint.min !== undefined) {
            constraints.push(ctx.Int.val(constraint.min).le(x));
          }
          if (constraint.max !== undefined) {
            constraints.push(x.le(ctx.Int.val(constraint.max)));
          }

          expr = constraints.length === 1 ? constraints[0] : ctx.And(...constraints);
          break;
        }

        case 'pattern': {
          // String pattern matching (approximate using string constraints)
          const s = ctx.String.const(varName);
          variables.set(varName, s);

          // Z3 string theory has limited regex support
          // For now, use basic string operations
          if (constraint.pattern) {
            // Convert simple patterns to Z3 string constraints
            const pattern = constraint.pattern;

            if (pattern.startsWith('^') && pattern.endsWith('$')) {
              // Exact match pattern
              const literal = pattern.slice(1, -1);
              expr = s.eq(ctx.String.val(literal));
            } else if (pattern.startsWith('^')) {
              // Prefix pattern
              const prefix = pattern.slice(1);
              expr = ctx.PrefixOf(ctx.String.val(prefix), s);
            } else if (pattern.endsWith('$')) {
              // Suffix pattern
              const suffix = pattern.slice(0, -1);
              expr = ctx.SuffixOf(ctx.String.val(suffix), s);
            } else {
              // Contains pattern (fallback)
              expr = ctx.Contains(s, ctx.String.val(pattern));
            }
          } else {
            // No specific pattern, just a string
            expr = ctx.Bool.val(true);
          }
          break;
        }

        case 'length': {
          // String/array length constraint
          const s = ctx.String.const(varName);
          variables.set(varName, s);

          const lengthExpr = ctx.Length(s);
          const constraints: Expr[] = [];

          if (constraint.min !== undefined) {
            constraints.push(ctx.Int.val(constraint.min).le(lengthExpr));
          }
          if (constraint.max !== undefined) {
            constraints.push(lengthExpr.le(ctx.Int.val(constraint.max)));
          }

          expr = constraints.length === 1 ? constraints[0] : ctx.And(...constraints);
          break;
        }

        case 'enum': {
          // Enumeration constraint: x ∈ {v1, v2, ...}
          if (!constraint.values || constraint.values.length === 0) {
            expr = ctx.Bool.val(false); // Empty enum is unsatisfiable
            break;
          }

          // Determine type from first value
          const firstValue = constraint.values[0];

          if (typeof firstValue === 'number') {
            const x = ctx.Int.const(varName);
            variables.set(varName, x);

            const disjuncts = constraint.values.map(v => x.eq(ctx.Int.val(v as number)));
            expr = disjuncts.length === 1 ? disjuncts[0] : ctx.Or(...disjuncts);
          } else if (typeof firstValue === 'string') {
            const s = ctx.String.const(varName);
            variables.set(varName, s);

            const disjuncts = constraint.values.map(v => s.eq(ctx.String.val(v as string)));
            expr = disjuncts.length === 1 ? disjuncts[0] : ctx.Or(...disjuncts);
          } else {
            // Unsupported enum type, use boolean
            const b = ctx.Bool.const(varName);
            variables.set(varName, b);
            expr = ctx.Bool.val(true);
          }
          break;
        }

        case 'custom': {
          // Custom predicate - limited support
          // For complex predicates, we create unconstrained variables
          const x = ctx.Int.const(varName);
          variables.set(varName, x);
          expr = ctx.Bool.val(true); // No constraint, allow any value
          break;
        }

        default: {
          // Unknown constraint type
          const x = ctx.Int.const(varName);
          variables.set(varName, x);
          expr = ctx.Bool.val(true);
          break;
        }
      }

      return {
        original: constraint,
        expr,
        variables,
      };
    } catch (error) {
      throw new Error(`Failed to translate constraint ${constraint.type}: ${error}`);
    }
  }

  /**
   * Solve constraints and extract solution
   *
   * Workflow:
   * 1. Translate all TypeConstraints to Z3 expressions
   * 2. Add constraints to solver
   * 3. Check satisfiability
   * 4. Extract model if SAT
   * 5. Parse variable assignments
   *
   * @param constraints - Array of NSTG type constraints
   * @param options - Solver options (overrides init options)
   * @returns Solution with status and assignments
   * @throws {Error} If solver not initialized
   */
  async solve(constraints: TypeConstraint[], options: Z3SolverOptions = {}): Promise<Z3Solution> {
    this.ensureInitialized();

    const solver = this.solver!;
    const ctx = this.context!;

    try {
      // Apply runtime solver options
      if (options.timeout !== undefined) {
        solver.set('timeout', options.timeout);
      }

      // Reset solver for fresh solve
      solver.reset();

      // Translate and add all constraints
      const z3Constraints: Z3Constraint[] = [];
      const allVariables = new Map<string, Expr>();

      for (const constraint of constraints) {
        const z3Constraint = this.translateConstraint(constraint);
        z3Constraints.push(z3Constraint);
        solver.add(z3Constraint.expr);

        // Collect all variables
        for (const [name, expr] of z3Constraint.variables) {
          allVariables.set(name, expr);
        }
      }

      // Check satisfiability
      const result = await solver.check();

      if (result === 'sat') {
        // Extract model
        const model = solver.model();
        const assignments = new Map<string, unknown>();

        // Parse variable assignments from model
        for (const [name, variable] of allVariables) {
          const value = model.eval(variable);
          assignments.set(name, this.parseZ3Value(value));
        }

        return {
          status: 'sat',
          model,
          assignments,
        };
      } else if (result === 'unsat') {
        // Extract unsat core if enabled
        let unsatCore: string[] | undefined;

        if (options.produceUnsatCores) {
          const core = solver.unsatCore();
          unsatCore = core.map(c => c.toString());
        }

        return {
          status: 'unsat',
          assignments: new Map(),
          unsatCore,
        };
      } else {
        // Unknown (timeout, resource limit, etc.)
        return {
          status: 'unknown',
          assignments: new Map(),
        };
      }
    } catch (error) {
      throw new Error(`Solver error: ${error}`);
    }
  }

  /**
   * Parse Z3 value to JavaScript primitive
   *
   * @param value - Z3 expression value
   * @returns JavaScript value
   */
  private parseZ3Value(value: Expr): unknown {
    const valueStr = value.toString();

    // Try to parse as integer
    if (/^-?\d+$/.test(valueStr)) {
      return parseInt(valueStr, 10);
    }

    // Try to parse as string (Z3 strings are quoted)
    if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
      return valueStr.slice(1, -1);
    }

    // Boolean values
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;

    // Return as-is if parsing fails
    return valueStr;
  }

  /**
   * Dispose Z3 context and free WASM memory
   *
   * Should be called when solver is no longer needed to prevent memory leaks.
   */
  async dispose(): Promise<void> {
    if (this.context) {
      // Z3 context cleanup is automatic in z3-solver
      this.context = null;
      this.solver = null;
      this.initialized = false;
      this.variableCounter = 0;
    }
  }

  /**
   * Ensure solver is initialized before operations
   *
   * @throws {Error} If solver not initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.context || !this.solver) {
      throw new Error('Z3 solver not initialized. Call init() before solving.');
    }
  }

  /**
   * Check if solver is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
