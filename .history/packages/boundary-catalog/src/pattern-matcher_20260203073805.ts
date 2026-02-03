/**
 * @fileoverview Boundary Pattern Matcher - Intelligent edge case detection
 *
 * Provides pattern-based matching to suggest relevant edge cases based on
 * type structure, function names, and historical patterns.
 *
 * @module @nstg/boundary-catalog/pattern-matcher
 * @author NSTG Team
 * @license MIT
 */

import type { TypeNode, TypeConstraint, PrimitiveType } from '@nstg/core';
import type { EdgeCase, EdgeCaseCategory } from './catalog.js';
import { BoundaryCatalog } from './catalog.js';

/**
 * Pattern match result with confidence
 */
export interface PatternMatch {
  /** The matched edge case */
  readonly edgeCase: EdgeCase;
  /** Confidence score (0-1) */
  readonly confidence: number;
  /** Reason for match */
  readonly reason: string;
}

/**
 * Matching strategy for pattern recognition
 */
export type MatchingStrategy =
  | 'type-based' // Match by primitive type
  | 'semantic' // Match by function/variable name
  | 'constraint-based' // Match by type constraints
  | 'historical'; // Match by usage frequency

/**
 * Context for pattern matching
 */
export interface MatchContext {
  /** Function or variable name */
  readonly name?: string;
  /** JSDoc description */
  readonly description?: string;
  /** Historical usage data */
  readonly usageData?: Map<unknown, number>;
}

/**
 * Intelligent pattern matcher for boundary detection
 *
 * Analyzes type structures and context to suggest relevant edge cases
 * that may not be immediately obvious from the type alone.
 *
 * @example
 * ```typescript
 * const matcher = new BoundaryPatternMatcher();
 *
 * const matches = matcher.matchPattern(
 *   { primitiveType: 'number', constraints: [] },
 *   { name: 'age' }
 * );
 *
 * console.log('Suggested edge cases:', matches);
 * // Prioritizes: 0, -1, NaN (negative age, invalid input)
 * ```
 */
export class BoundaryPatternMatcher {
  private catalog: BoundaryCatalog;
  private usageHistory: Map<string, Map<unknown, number>>;

  constructor() {
    this.catalog = new BoundaryCatalog();
    this.usageHistory = new Map();
  }

  /**
   * Match patterns for a type node
   *
   * @param typeNode - Type to match patterns for
   * @param context - Additional context for matching
   * @returns Matched patterns sorted by confidence
   */
  matchPattern(typeNode: TypeNode, context?: MatchContext): PatternMatch[] {
    const matches: PatternMatch[] = [];

    // Type-based matching (always include)
    matches.push(...this.matchByType(typeNode));

    // Semantic matching (if context provided)
    if (context?.name) {
      matches.push(...this.matchBySemantic(typeNode, context.name));
    }

    // Constraint-based matching
    if (typeNode.constraints && typeNode.constraints.length > 0) {
      matches.push(...this.matchByConstraints(typeNode));
    }

    // Historical matching (if usage data available)
    if (context?.usageData) {
      matches.push(...this.matchByHistory(typeNode, context.usageData));
    }

    // Deduplicate and sort by confidence
    const uniqueMatches = this.deduplicateMatches(matches);
    return uniqueMatches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Match by primitive type
   */
  private matchByType(typeNode: TypeNode): PatternMatch[] {
    const edgeCases = this.catalog.getEdgeCasesForType(typeNode.primitiveType);

    return Array.from(edgeCases).map(edgeCase => ({
      edgeCase,
      confidence: edgeCase.priority * 0.8, // Base confidence from priority
      reason: `Type-based match for ${typeNode.primitiveType}`,
    }));
  }

  /**
   * Match by semantic analysis of names
   */
  private matchBySemantic(typeNode: TypeNode, name: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const lowerName = name.toLowerCase();

    // Numeric semantic patterns
    if (typeNode.primitiveType === 'number') {
      if (lowerName.includes('age') || lowerName.includes('year')) {
        // Age/year should test 0, negative, very large
        matches.push(
          this.createMatch(0, 0.95, 'Age/year semantics: zero boundary'),
          this.createMatch(-1, 0.9, 'Age/year semantics: negative (invalid)'),
          this.createMatch(150, 0.85, 'Age/year semantics: extreme value')
        );
      }

      if (
        lowerName.includes('count') ||
        lowerName.includes('size') ||
        lowerName.includes('length')
      ) {
        // Counts should test 0, negative
        matches.push(
          this.createMatch(0, 0.95, 'Count semantics: zero boundary'),
          this.createMatch(-1, 0.9, 'Count semantics: negative (invalid)'),
          this.createMatch(Number.MAX_SAFE_INTEGER, 0.85, 'Count semantics: overflow')
        );
      }

      if (lowerName.includes('percent') || lowerName.includes('ratio')) {
        // Percentages should test 0, 1, negative, >1
        matches.push(
          this.createMatch(0, 0.95, 'Percentage semantics: zero boundary'),
          this.createMatch(1, 0.95, 'Percentage semantics: maximum (100%)'),
          this.createMatch(-0.5, 0.9, 'Percentage semantics: negative (invalid)'),
          this.createMatch(1.5, 0.9, 'Percentage semantics: over 100%')
        );
      }

      if (lowerName.includes('index') || lowerName.includes('position')) {
        // Indices should test 0, -1, large values
        matches.push(
          this.createMatch(0, 0.95, 'Index semantics: first element'),
          this.createMatch(-1, 0.9, 'Index semantics: negative index'),
          this.createMatch(1000, 0.85, 'Index semantics: out of bounds')
        );
      }

      if (
        lowerName.includes('price') ||
        lowerName.includes('amount') ||
        lowerName.includes('cost')
      ) {
        // Money should test 0, negative, very precise decimals
        matches.push(
          this.createMatch(0, 0.95, 'Money semantics: zero'),
          this.createMatch(-10.5, 0.9, 'Money semantics: negative'),
          this.createMatch(0.1 + 0.2, 0.9, 'Money semantics: precision issue'),
          this.createMatch(Number.MAX_SAFE_INTEGER, 0.85, 'Money semantics: overflow')
        );
      }
    }

    // String semantic patterns
    if (typeNode.primitiveType === 'string') {
      if (lowerName.includes('email') || lowerName.includes('mail')) {
        // Email should test empty, malformed, very long
        matches.push(
          this.createMatch('', 0.95, 'Email semantics: empty string'),
          this.createMatch('invalid', 0.9, 'Email semantics: missing @'),
          this.createMatch('a@b', 0.85, 'Email semantics: minimal valid'),
          this.createMatch(
            'test@' + 'a'.repeat(100) + '.com',
            0.85,
            'Email semantics: very long domain'
          )
        );
      }

      if (lowerName.includes('name') || lowerName.includes('title')) {
        // Names should test empty, very long, special chars
        matches.push(
          this.createMatch('', 0.95, 'Name semantics: empty string'),
          this.createMatch(' ', 0.9, 'Name semantics: whitespace only'),
          this.createMatch('A', 0.85, 'Name semantics: single character'),
          this.createMatch('a'.repeat(100), 0.85, 'Name semantics: very long')
        );
      }

      if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('href')) {
        // URLs should test empty, malformed, various protocols
        matches.push(
          this.createMatch('', 0.95, 'URL semantics: empty string'),
          this.createMatch('not-a-url', 0.9, 'URL semantics: malformed'),
          this.createMatch('javascript:alert(1)', 0.9, 'URL semantics: XSS attempt'),
          this.createMatch('http://', 0.85, 'URL semantics: incomplete')
        );
      }

      if (lowerName.includes('path') || lowerName.includes('file')) {
        // Paths should test empty, relative, absolute, traversal
        matches.push(
          this.createMatch('', 0.95, 'Path semantics: empty string'),
          this.createMatch('../../../etc/passwd', 0.95, 'Path semantics: directory traversal'),
          this.createMatch('/', 0.9, 'Path semantics: root path'),
          this.createMatch('C:\\Windows\\System32', 0.85, 'Path semantics: Windows path')
        );
      }
    }

    // Array semantic patterns
    if (typeNode.primitiveType === 'array') {
      if (
        lowerName.includes('list') ||
        lowerName.includes('items') ||
        lowerName.includes('collection')
      ) {
        matches.push(
          this.createMatch([], 0.95, 'Collection semantics: empty array'),
          this.createMatch([undefined], 0.9, 'Collection semantics: undefined element'),
          this.createMatch(Array(1000).fill(0), 0.85, 'Collection semantics: large array')
        );
      }
    }

    return matches;
  }

  /**
   * Match by type constraints
   */
  private matchByConstraints(typeNode: TypeNode): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const constraint of typeNode.constraints) {
      if (constraint.type === 'range' && typeNode.primitiveType === 'number') {
        // Test boundary values from range constraints
        if (constraint.min !== undefined) {
          matches.push(
            this.createMatch(constraint.min, 0.95, 'Range constraint: minimum value'),
            this.createMatch(constraint.min - 1, 0.9, 'Range constraint: below minimum')
          );
        }
        if (constraint.max !== undefined) {
          matches.push(
            this.createMatch(constraint.max, 0.95, 'Range constraint: maximum value'),
            this.createMatch(constraint.max + 1, 0.9, 'Range constraint: above maximum')
          );
        }
      }

      if (constraint.type === 'length' && typeNode.primitiveType === 'string') {
        // Test length boundaries
        if (constraint.min !== undefined) {
          matches.push(
            this.createMatch('a'.repeat(constraint.min), 0.95, 'Length constraint: minimum'),
            this.createMatch(
              'a'.repeat(constraint.min - 1),
              0.9,
              'Length constraint: below minimum'
            )
          );
        }
        if (constraint.max !== undefined) {
          matches.push(
            this.createMatch('a'.repeat(constraint.max), 0.95, 'Length constraint: maximum'),
            this.createMatch(
              'a'.repeat(constraint.max + 1),
              0.9,
              'Length constraint: above maximum'
            )
          );
        }
      }
    }

    return matches;
  }

  /**
   * Match by historical usage patterns
   */
  private matchByHistory(typeNode: TypeNode, usageData: Map<unknown, number>): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const totalUsage = Array.from(usageData.values()).reduce((sum, count) => sum + count, 0);

    // Prioritize frequently used values
    for (const [value, count] of usageData.entries()) {
      const frequency = count / totalUsage;
      if (frequency > 0.1) {
        // 10% threshold
        matches.push({
          edgeCase: {
            value,
            category: 'boundary-conditions',
            description: `Frequently used value (${(frequency * 100).toFixed(1)}%)`,
            priority: frequency,
            tags: ['historical', 'frequent'],
          },
          confidence: 0.7 + frequency * 0.3, // 0.7-1.0 based on frequency
          reason: 'Historical usage pattern',
        });
      }
    }

    return matches;
  }

  /**
   * Create a pattern match from a value
   */
  private createMatch(value: unknown, confidence: number, reason: string): PatternMatch {
    // Find corresponding edge case in catalog
    for (const type of this.catalog.getSupportedTypes()) {
      const edgeCases = this.catalog.getEdgeCasesForType(type);
      const found = Array.from(edgeCases).find(ec => ec.value === value);
      if (found) {
        return { edgeCase: found, confidence, reason };
      }
    }

    // Create ad-hoc edge case if not in catalog
    return {
      edgeCase: {
        value,
        category: 'boundary-conditions',
        description: reason,
        priority: confidence,
        tags: ['semantic', 'derived'],
      },
      confidence,
      reason,
    };
  }

  /**
   * Deduplicate matches by value
   */
  private deduplicateMatches(matches: PatternMatch[]): PatternMatch[] {
    const seen = new Map<unknown, PatternMatch>();

    for (const match of matches) {
      const existing = seen.get(match.edgeCase.value);
      if (!existing || match.confidence > existing.confidence) {
        seen.set(match.edgeCase.value, match);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Record usage of a value for historical learning
   */
  recordUsage(typeKey: string, value: unknown): void {
    if (!this.usageHistory.has(typeKey)) {
      this.usageHistory.set(typeKey, new Map());
    }

    const typeHistory = this.usageHistory.get(typeKey)!;
    const currentCount = typeHistory.get(value) || 0;
    typeHistory.set(value, currentCount + 1);
  }

  /**
   * Get usage history for a type
   */
  getUsageHistory(typeKey: string): Map<unknown, number> | undefined {
    return this.usageHistory.get(typeKey);
  }

  /**
   * Clear usage history
   */
  clearHistory(): void {
    this.usageHistory.clear();
  }
}
