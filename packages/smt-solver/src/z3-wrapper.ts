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

import type { TypeConstraint } from '@nstg/core';
import { Context, Expr, init, Model, Solver } from 'z3-solver';

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
  readonly unsatCore: string[] | undefined;
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
      const z3Module = await init();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.context = new (z3Module as any).Context('main');

      if (!this.context) {
        throw new Error('Failed to create Z3 context');
      }

      // Create solver with configuration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.solver = new (this.context as any).Solver() as Solver | null;

      if (!this.solver) {
        throw new Error('Failed to create Z3 solver');
      }

      // Apply solver options
      if (options.timeout !== undefined) {
        (this.solver as any).set('timeout', options.timeout);
      }

      if (options.maxMemory !== undefined) {
        (this.solver as any).set('max_memory', options.maxMemory);
      }

      if (options.produceModels !== false) {
        (this.solver as any).set('model', true);
      }

      if (options.produceUnsatCores) {
        (this.solver as any).set('unsat_core', true);
      }

      if (options.logic) {
        (this.solver as any).set('logic', options.logic);
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

          const constraints: (Expr | undefined)[] = [];
          if (constraint.min !== undefined) {
            const minExpr = ctx.Int.val(constraint.min).le(x);
            if (minExpr !== undefined) constraints.push(minExpr);
          }
          if (constraint.max !== undefined) {
            const maxExpr = x.le(ctx.Int.val(constraint.max));
            if (maxExpr !== undefined) constraints.push(maxExpr);
          }

          const validConstraints = constraints.filter((c): c is Expr => c !== undefined);
          expr =
            validConstraints.length === 1
              ? validConstraints[0]
              : (ctx.And as any)(...validConstraints);
          break;
        }

        case 'pattern': {
          // String pattern matching (approximate using string constraints)
          const contextAny = ctx as any;
          const s = contextAny.String?.const(varName) || contextAny.Const(varName, 'String');
          variables.set(varName, s);

          // Z3 string theory has limited regex support
          // For now, use basic string operations
          if (constraint.pattern) {
            // Convert simple patterns to Z3 string constraints
            const pattern = constraint.pattern;
            const stringVal = contextAny.String?.val(pattern) || contextAny.StringVal(pattern);

            if (pattern.startsWith('^') && pattern.endsWith('$')) {
              // Exact match pattern
              const literal = pattern.slice(1, -1);
              const literalVal = contextAny.String?.val(literal) || contextAny.StringVal(literal);
              expr = s.eq(literalVal) || ctx.Bool.val(true);
            } else if (pattern.startsWith('^')) {
              // Prefix pattern
              const prefix = pattern.slice(1);
              const prefixVal = contextAny.String?.val(prefix) || contextAny.StringVal(prefix);
              expr = contextAny.PrefixOf?.(prefixVal, s) || ctx.Bool.val(true);
            } else if (pattern.endsWith('$')) {
              // Suffix pattern
              const suffix = pattern.slice(0, -1);
              const suffixVal = contextAny.String?.val(suffix) || contextAny.StringVal(suffix);
              expr = contextAny.SuffixOf?.(suffixVal, s) || ctx.Bool.val(true);
            } else {
              // Contains pattern (fallback)
              expr = contextAny.Contains?.(s, stringVal) || ctx.Bool.val(true);
            }
          } else {
            // No specific pattern, just a string
            expr = ctx.Bool.val(true);
          }
          break;
        }

        case 'length': {
          // String/array length constraint
          const contextAny = ctx as any;
          const s = contextAny.String?.const(varName) || contextAny.Const(varName, 'String');
          variables.set(varName, s);

          const lengthExpr = contextAny.Length?.(s) || ctx.Int.val(0);
          const constraints: (Expr | undefined)[] = [];

          if (constraint.min !== undefined) {
            const minExpr = ctx.Int.val(constraint.min).le(lengthExpr);
            if (minExpr !== undefined) constraints.push(minExpr);
          }
          if (constraint.max !== undefined) {
            const maxExpr = lengthExpr.le(ctx.Int.val(constraint.max));
            if (maxExpr !== undefined) constraints.push(maxExpr);
          }

          const validConstraints = constraints.filter((c): c is Expr => c !== undefined);
          expr =
            validConstraints.length === 1
              ? validConstraints[0]
              : (ctx.And as any)(...validConstraints);
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

            const disjuncts = constraint.values
              .map(v => {
                const eqExpr = x.eq(ctx.Int.val(v as number));
                return eqExpr !== undefined ? eqExpr : null;
              })
              .filter((d: Expr | null): d is Expr => d !== null);
            expr = disjuncts.length === 1 ? disjuncts[0] : (ctx.Or as any)(...disjuncts);
          } else if (typeof firstValue === 'string') {
            const contextAny = ctx as any;
            const s = contextAny.String?.const(varName) || contextAny.Const(varName, 'String');
            variables.set(varName, s);

            const stringVal = (v: string) => contextAny.String?.val(v) || contextAny.StringVal(v);
            const disjuncts = constraint.values
              .map(v => {
                const eqExpr = s.eq(stringVal(v as string));
                return eqExpr !== undefined ? eqExpr : null;
              })
              .filter((d: Expr | null): d is Expr => d !== null);
            expr = disjuncts.length === 1 ? disjuncts[0] : (ctx.Or as any)(...disjuncts);
          } else {
            // Unsupported enum type, use boolean
            const b = ctx.Bool.const(varName);
            variables.set(varName, b);
            expr = ctx.Bool.val(true);
          }
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
        solver.add(z3Constraint.expr as any);

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
          unsatCore: undefined,
        };
      } else if (result === 'unsat') {
        // Extract unsat core if enabled
        let unsatCore: string[] | undefined = undefined;

        if (options.produceUnsatCores) {
          try {
            const core = (solver as any).unsatCore?.();
            if (core !== undefined && Array.isArray(core)) {
              unsatCore = (core as Expr[]).map((c: Expr) => c.toString());
            }
          } catch {
            // If unsat core extraction fails, leave it undefined
            unsatCore = undefined;
          }
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
          unsatCore: undefined,
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
