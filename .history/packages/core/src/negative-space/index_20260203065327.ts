/**
 * @fileoverview Negative Space Module - Core implementation of negative space analysis
 *
 * Exports:
 * - NegativeSpaceCalculator: Implements the core formula
 * - CoverageTracker: Tracks Observable_Behavior
 * - GapDetector: Identifies untested regions
 * - BoundaryWalker: Explores boundary conditions
 */

export { NegativeSpaceCalculator } from './space-calculator.js';
export type { NegativeSpaceResult } from './space-calculator.js';

export { CoverageTracker } from './coverage-tracker.js';
export type { CoverageStats, TestExecution } from './coverage-tracker.js';

export { GapDetector } from './gap-detector.js';
export type { GapAnalysis, GapStatistics, GapDetectionOptions } from './gap-detector.js';

export { BoundaryWalker } from './boundary-walker.js';
export type { BoundaryWalkResult, BoundaryWalkOptions } from './boundary-walker.js';
