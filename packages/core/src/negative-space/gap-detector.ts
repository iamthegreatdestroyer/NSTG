/**
 * @fileoverview GapDetector - Identify untested regions in the type space
 *
 * Analyzes coverage patterns to find gaps (negative space) and prioritizes them
 * based on factors like boundary proximity, cardinality, and bug probability.
 */

import type {
  TypeSpaceRegion,
  NegativeSpaceRegion,
  FunctionSignature,
  TestInput,
} from '../types.js';
import { CoverageTracker } from './coverage-tracker.js';
import { TypeUniverse } from '../type-space/type-universe.js';

/**
 * Gap analysis result
 */
export interface GapAnalysis {
  /** All identified gaps (untested regions) */
  gaps: NegativeSpaceRegion[];

  /** Gaps sorted by priority (highest first) */
  prioritizedGaps: NegativeSpaceRegion[];

  /** Boundary gaps (regions adjacent to tested space) */
  boundaryGaps: NegativeSpaceRegion[];

  /** Interior gaps (regions surrounded by tested space) */
  interiorGaps: NegativeSpaceRegion[];

  /** Statistics about the gaps */
  statistics: GapStatistics;
}

/**
 * Statistics about detected gaps
 */
export interface GapStatistics {
  /** Total number of gaps */
  totalGaps: number;

  /** Number of boundary gaps */
  boundaryGapCount: number;

  /** Number of interior gaps */
  interiorGapCount: number;

  /** Total cardinality of all gaps */
  totalGapCardinality: number | 'infinite';

  /** Average priority of gaps */
  averagePriority: number;

  /** Highest priority gap */
  highestPriorityGap: NegativeSpaceRegion | null;
}

/**
 * Options for gap detection
 */
export interface GapDetectionOptions {
  /** Minimum priority threshold (0-1) */
  minPriority?: number;

  /** Maximum number of gaps to return */
  maxGaps?: number;

  /** Whether to include infinite cardinality regions */
  includeInfinite?: boolean;

  /** Prioritization strategy */
  strategy?: 'boundary-first' | 'cardinality-first' | 'balanced';
}

/**
 * GapDetector
 *
 * Identifies untested regions (gaps) in the type space and prioritizes them
 * for test generation. Uses multiple strategies to determine which gaps are
 * most likely to contain bugs.
 *
 * Usage:
 * ```typescript
 * const detector = new GapDetector(signature, coverageTracker);
 *
 * const analysis = detector.detectGaps({
 *   strategy: 'boundary-first',
 *   maxGaps: 10,
 * });
 *
 * // Generate tests for highest priority gaps
 * for (const gap of analysis.prioritizedGaps.slice(0, 5)) {
 *   console.log(`Generate test for: ${gap.description}`);
 * }
 * ```
 */
export class GapDetector {
  private readonly signature: FunctionSignature;
  private readonly coverageTracker: CoverageTracker;
  private readonly typeUniverse: TypeUniverse;

  constructor(signature: FunctionSignature, coverageTracker: CoverageTracker) {
    this.signature = signature;
    this.coverageTracker = coverageTracker;
    this.typeUniverse = new TypeUniverse();
  }

  /**
   * Detect gaps in test coverage
   *
   * @param options - Gap detection options
   * @returns Complete gap analysis
   */
  detectGaps(options: GapDetectionOptions = {}): GapAnalysis {
    const {
      minPriority = 0,
      maxGaps = Infinity,
      includeInfinite = true,
      strategy = 'balanced',
    } = options;

    // Get all gaps (untested regions)
    const stats = this.coverageTracker.getCoverageStats();
    let gaps = this.convertToNegativeSpaceRegions(stats.uncoveredRegions);

    // Apply filters
    if (!includeInfinite) {
      gaps = gaps.filter(gap => gap.cardinality !== 'infinite');
    }

    gaps = gaps.filter(gap => gap.priority >= minPriority);

    // Classify gaps
    const boundaryGaps = this.identifyBoundaryGaps(gaps);
    const interiorGaps = gaps.filter(gap => !this.isBoundaryGap(gap));

    // Prioritize based on strategy
    const prioritizedGaps = this.prioritizeGaps(gaps, boundaryGaps, strategy);

    // Limit to maxGaps
    const limitedPrioritizedGaps = prioritizedGaps.slice(0, maxGaps);

    // Calculate statistics
    const statistics = this.calculateStatistics(gaps, boundaryGaps, interiorGaps);

    return {
      gaps,
      prioritizedGaps: limitedPrioritizedGaps,
      boundaryGaps,
      interiorGaps,
      statistics,
    };
  }

  /**
   * Find gaps adjacent to a specific tested region
   */
  findAdjacentGaps(testedRegionId: string): NegativeSpaceRegion[] {
    const allGaps = this.detectGaps().gaps;

    return allGaps.filter(gap => this.areRegionsAdjacent(gap.id, testedRegionId));
  }

  /**
   * Get the most critical gap (highest priority)
   */
  getMostCriticalGap(): NegativeSpaceRegion | null {
    const analysis = this.detectGaps();
    return analysis.prioritizedGaps[0] ?? null;
  }

  /**
   * Convert TypeSpaceRegion[] to NegativeSpaceRegion[]
   */
  private convertToNegativeSpaceRegions(regions: TypeSpaceRegion[]): NegativeSpaceRegion[] {
    return regions.map((region, index) => {
      const priority = this.calculatePriority(region);
      const reason = this.determineGapReason(region);

      return {
        ...region,
        priority,
        reason,
      };
    });
  }

  /**
   * Calculate priority for a gap
   */
  private calculatePriority(region: TypeSpaceRegion): number {
    let priority = 0.5; // Base priority

    // Factor 1: Boundary proximity (higher priority for boundary regions)
    const isBoundary = this.isBoundaryRegion(region);
    if (isBoundary) {
      priority += 0.3;
    }

    // Factor 2: Cardinality (higher priority for smaller regions)
    if (region.cardinality === 'infinite') {
      priority -= 0.2; // Lower priority for infinite regions
    } else if (region.cardinality <= 10) {
      priority += 0.2; // Very high priority for small regions
    } else if (region.cardinality <= 100) {
      priority += 0.1; // High priority for medium regions
    }

    // Factor 3: Special values (higher priority for edge cases)
    if (this.containsSpecialValues(region)) {
      priority += 0.2;
    }

    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, priority));
  }

  /**
   * Determine reason for gap
   */
  private determineGapReason(region: TypeSpaceRegion): string {
    if (this.isBoundaryRegion(region)) {
      return 'Boundary region - high bug probability';
    }

    if (this.containsSpecialValues(region)) {
      return 'Contains special values (NaN, Infinity, empty, etc.)';
    }

    if (region.cardinality === 'infinite') {
      return 'Infinite region - requires sampling strategy';
    }

    if (typeof region.cardinality === 'number' && region.cardinality <= 10) {
      return 'Small finite region - should be fully tested';
    }

    return 'Untested region in type space';
  }

  /**
   * Check if region is a boundary region
   */
  private isBoundaryRegion(region: TypeSpaceRegion): boolean {
    const boundaryKeywords = [
      'boundary',
      'zero',
      'empty',
      'single',
      'min',
      'max',
      'infinity',
      'special',
    ];

    return boundaryKeywords.some(
      keyword =>
        region.id.toLowerCase().includes(keyword) ||
        region.description.toLowerCase().includes(keyword)
    );
  }

  /**
   * Check if region contains special values
   */
  private containsSpecialValues(region: TypeSpaceRegion): boolean {
    const specialKeywords = ['special', 'nan', 'infinity', 'null', 'undefined'];

    return specialKeywords.some(keyword => region.id.toLowerCase().includes(keyword));
  }

  /**
   * Identify boundary gaps (adjacent to tested space)
   */
  private identifyBoundaryGaps(gaps: NegativeSpaceRegion[]): NegativeSpaceRegion[] {
    const coveredRegionIds = new Set(this.coverageTracker.getCoveredRegions().map(r => r.id));

    return gaps.filter(gap => {
      // Check if gap is adjacent to any covered region
      return Array.from(coveredRegionIds).some(coveredId =>
        this.areRegionsAdjacent(gap.id, coveredId)
      );
    });
  }

  /**
   * Check if gap is a boundary gap
   */
  private isBoundaryGap(gap: NegativeSpaceRegion): boolean {
    const coveredRegionIds = new Set(this.coverageTracker.getCoveredRegions().map(r => r.id));

    return Array.from(coveredRegionIds).some(coveredId =>
      this.areRegionsAdjacent(gap.id, coveredId)
    );
  }

  /**
   * Check if two regions are adjacent
   */
  private areRegionsAdjacent(regionId1: string, regionId2: string): boolean {
    // Simplified adjacency check based on region IDs
    // Real implementation would use geometric/topological relationships

    // For number regions
    const numberAdjacencies = [
      ['number-negative-infinity', 'number-negative'],
      ['number-negative', 'number-zero'],
      ['number-zero', 'number-positive'],
      ['number-positive', 'number-positive-infinity'],
    ];

    // For string regions
    const stringAdjacencies = [
      ['string-empty', 'string-single'],
      ['string-single', 'string-short'],
      ['string-short', 'string-medium'],
      ['string-medium', 'string-long'],
      ['string-long', 'string-very-long'],
    ];

    const allAdjacencies = [...numberAdjacencies, ...stringAdjacencies];

    return allAdjacencies.some(
      ([a, b]) => (regionId1 === a && regionId2 === b) || (regionId1 === b && regionId2 === a)
    );
  }

  /**
   * Prioritize gaps based on strategy
   */
  private prioritizeGaps(
    gaps: NegativeSpaceRegion[],
    boundaryGaps: NegativeSpaceRegion[],
    strategy: 'boundary-first' | 'cardinality-first' | 'balanced'
  ): NegativeSpaceRegion[] {
    const sorted = [...gaps];

    switch (strategy) {
      case 'boundary-first':
        // Boundary gaps first, then by priority
        sorted.sort((a, b) => {
          const aIsBoundary = boundaryGaps.includes(a);
          const bIsBoundary = boundaryGaps.includes(b);
          if (aIsBoundary !== bIsBoundary) {
            return aIsBoundary ? -1 : 1;
          }
          return b.priority - a.priority;
        });
        break;

      case 'cardinality-first':
        // Smallest cardinality first
        sorted.sort((a, b) => {
          if (a.cardinality === 'infinite' && b.cardinality === 'infinite') {
            return b.priority - a.priority;
          }
          if (a.cardinality === 'infinite') return 1;
          if (b.cardinality === 'infinite') return -1;
          return a.cardinality - b.cardinality;
        });
        break;

      case 'balanced':
      default:
        // Balanced: just use calculated priority
        sorted.sort((a, b) => b.priority - a.priority);
        break;
    }

    return sorted;
  }

  /**
   * Calculate statistics about gaps
   */
  private calculateStatistics(
    gaps: NegativeSpaceRegion[],
    boundaryGaps: NegativeSpaceRegion[],
    interiorGaps: NegativeSpaceRegion[]
  ): GapStatistics {
    const totalGapCardinality = gaps.reduce(
      (sum, gap) => {
        if (sum === 'infinite' || gap.cardinality === 'infinite') {
          return 'infinite';
        }
        return sum + gap.cardinality;
      },
      0 as number | 'infinite'
    );

    const averagePriority =
      gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap.priority, 0) / gaps.length : 0;

    const highestPriorityGap =
      gaps.length > 0
        ? gaps.reduce((highest, gap) => (gap.priority > highest.priority ? gap : highest))
        : null;

    return {
      totalGaps: gaps.length,
      boundaryGapCount: boundaryGaps.length,
      interiorGapCount: interiorGaps.length,
      totalGapCardinality,
      averagePriority,
      highestPriorityGap,
    };
  }
}
