/**
 * Shared types across NSTG packages
 */

export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

export type Json = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: Json;
}
export interface JsonArray extends Array<Json> {}

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

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
