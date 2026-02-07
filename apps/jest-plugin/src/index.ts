/**
 * NSTG Jest Plugin - Jest integration for Negative Space Test Generation
 *
 * Provides custom Jest matchers and utilities for NSTG test generation.
 */

export interface NSTGMatchers {
  toHaveCoveredBoundary(boundary: string): void;
}

declare global {
  namespace jest {
    interface Matchers<R> extends NSTGMatchers {}
  }
}

export default {
  /**
   * Jest preset configuration for NSTG
   */
  preset: 'NSTG',
};
