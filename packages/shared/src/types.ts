/**
 * Shared types across NSTG packages
 */

export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

export type Json = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: Json;
}
export interface JsonArray extends Array<Json> {}

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

export type Awaitable<T> = T | Promise<T>;

export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export function Ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function Err<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Kind of type node - foundational for NSTG type system
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
 * Represents a type in the type system
 */
export interface TypeNode {
  kind: TypeKind;
  primitiveType?: PrimitiveType; // For convenience access to the primitive type string
  name?: string;
  children?: TypeNode[];
  constraints?: TypeConstraint[];
}

/**
 * Primitive type names
 */
export type PrimitiveType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'function'
  | 'null'
  | 'undefined'
  | 'unknown';

/**
 * Type constraint - discriminated union for different constraint types
 *
 * Used by:
 * - constraint-solver: Accesses min/max, pattern, values properties
 * - z3-wrapper: Maps to Z3 theories based on type
 * - primitive-spaces: Generates constraints for boundary regions
 */
export type TypeConstraint =
  | {
      type: 'range';
      min: number;
      max: number;
      description?: string;
      expression?: string;
    }
  | {
      type: 'length';
      min: number;
      max: number;
      description?: string;
      expression?: string;
    }
  | {
      type: 'pattern';
      pattern: string;
      description?: string;
      expression?: string;
    }
  | {
      type: 'enum';
      values: unknown[];
      description?: string;
      expression?: string;
    };
