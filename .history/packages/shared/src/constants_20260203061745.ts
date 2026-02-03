/**
 * Shared constants
 */

export const NSTG_VERSION = '0.0.0';

export const DEFAULT_CONFIG = {
  maxNegativeSpaceRegions: 1000,
  maxBoundaryTests: 100,
  timeout: 30000,
  parallel: true,
} as const;

export const SPECIAL_VALUES = {
  NUMBER: [NaN, Infinity, -Infinity, 0, -0, Number.MAX_VALUE, Number.MIN_VALUE],
  STRING: ['', '\0', '\u200B', '\uFEFF'],
  OBJECT: [null, undefined],
} as const;
