/**
 * @fileoverview Boundary Catalog package entry point
 *
 * Exports catalog and pattern matching capabilities for edge case detection.
 *
 * @module @nstg/boundary-catalog
 * @author NSTG Team
 * @license MIT
 */

export { BoundaryCatalog } from './catalog.js';
export type { EdgeCase, EdgeCaseCategory, BoundaryPattern } from './catalog.js';

export { BoundaryPatternMatcher } from './pattern-matcher.js';
export type { PatternMatch, MatchingStrategy, MatchContext } from './pattern-matcher.js';
