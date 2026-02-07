/**
 * @fileoverview Boundary Catalog - Database of known edge cases
 *
 * Provides a comprehensive catalog of boundary values and edge cases
 * for various types, enabling smarter test generation.
 *
 * @module @nstg/boundary-catalog/catalog
 * @author NSTG Team
 * @license MIT
 */

import type { PrimitiveType, TypeNode } from '@nstg/shared';

/**
 * Edge case with metadata
 */
export interface EdgeCase {
  /** The actual edge case value */
  readonly value: unknown;
  /** Category of edge case */
  readonly category: EdgeCaseCategory;
  /** Description of why this is an edge case */
  readonly description: string;
  /** Priority (0-1, higher = more important) */
  readonly priority: number;
  /** Tags for classification */
  readonly tags: readonly string[];
}

/**
 * Edge case categories
 */
export type EdgeCaseCategory =
  | 'arithmetic-overflow'
  | 'string-encoding'
  | 'array-bounds'
  | 'null-safety'
  | 'type-coercion'
  | 'floating-point-precision'
  | 'special-values'
  | 'boundary-conditions'
  | 'unicode-edge-cases'
  | 'circular-references';

/**
 * Boundary pattern for type-specific edge cases
 */
export interface BoundaryPattern {
  /** Type this pattern applies to */
  readonly primitiveType: PrimitiveType;
  /** Edge cases for this type */
  readonly edgeCases: readonly EdgeCase[];
  /** Additional constraints */
  readonly constraints?: {
    readonly minValue?: number;
    readonly maxValue?: number;
    readonly allowNull?: boolean;
    readonly allowUndefined?: boolean;
  };
}

/**
 * Comprehensive catalog of boundary values and edge cases
 *
 * Provides built-in knowledge of common edge cases across different types,
 * helping TestGenerator produce more comprehensive test suites.
 *
 * @example
 * ```typescript
 * const catalog = new BoundaryCatalog();
 *
 * const numericEdges = catalog.getBoundariesForType({
 *   primitiveType: 'number',
 *   constraints: []
 * });
 *
 * console.log('Numeric boundaries:', numericEdges);
 * // [0, -1, 1, Number.MAX_SAFE_INTEGER, NaN, Infinity, ...]
 * ```
 */
export class BoundaryCatalog {
  private patterns: Map<PrimitiveType, BoundaryPattern>;

  constructor() {
    this.patterns = new Map();
    this.initializePatterns();
  }

  /**
   * Initialize built-in boundary patterns
   */
  private initializePatterns(): void {
    // Numeric boundaries
    this.patterns.set('number', {
      primitiveType: 'number',
      edgeCases: [
        {
          value: 0,
          category: 'boundary-conditions',
          description: 'Zero - identity element, division by zero',
          priority: 1.0,
          tags: ['zero', 'identity', 'arithmetic'],
        },
        {
          value: -1,
          category: 'boundary-conditions',
          description: 'Negative one - sign boundary',
          priority: 0.9,
          tags: ['negative', 'sign', 'arithmetic'],
        },
        {
          value: 1,
          category: 'boundary-conditions',
          description: 'Positive one - multiplicative identity',
          priority: 0.9,
          tags: ['positive', 'identity', 'arithmetic'],
        },
        {
          value: Number.MAX_SAFE_INTEGER,
          category: 'arithmetic-overflow',
          description: 'Maximum safe integer (2^53 - 1)',
          priority: 0.95,
          tags: ['overflow', 'max', 'integer'],
        },
        {
          value: Number.MIN_SAFE_INTEGER,
          category: 'arithmetic-overflow',
          description: 'Minimum safe integer (-(2^53 - 1))',
          priority: 0.95,
          tags: ['overflow', 'min', 'integer'],
        },
        {
          value: NaN,
          category: 'special-values',
          description: 'Not-a-Number - invalid arithmetic result',
          priority: 0.98,
          tags: ['special', 'invalid', 'arithmetic'],
        },
        {
          value: Infinity,
          category: 'special-values',
          description: 'Positive infinity - division by zero',
          priority: 0.95,
          tags: ['special', 'infinity', 'arithmetic'],
        },
        {
          value: -Infinity,
          category: 'special-values',
          description: 'Negative infinity',
          priority: 0.95,
          tags: ['special', 'infinity', 'arithmetic'],
        },
        {
          value: -0,
          category: 'floating-point-precision',
          description: 'Negative zero - IEEE 754 quirk',
          priority: 0.85,
          tags: ['special', 'zero', 'floating-point'],
        },
        {
          value: Number.EPSILON,
          category: 'floating-point-precision',
          description: 'Smallest representable difference',
          priority: 0.8,
          tags: ['precision', 'floating-point', 'epsilon'],
        },
        {
          value: 0.1 + 0.2,
          category: 'floating-point-precision',
          description: 'Classic floating-point precision issue',
          priority: 0.9,
          tags: ['precision', 'floating-point', 'arithmetic'],
        },
      ],
    });

    // String boundaries
    this.patterns.set('string', {
      primitiveType: 'string',
      edgeCases: [
        {
          value: '',
          category: 'boundary-conditions',
          description: 'Empty string',
          priority: 1.0,
          tags: ['empty', 'length', 'boundary'],
        },
        {
          value: ' ',
          category: 'string-encoding',
          description: 'Single space',
          priority: 0.8,
          tags: ['whitespace', 'space'],
        },
        {
          value: '\0',
          category: 'string-encoding',
          description: 'Null byte - can truncate strings',
          priority: 0.95,
          tags: ['null-byte', 'encoding', 'security'],
        },
        {
          value: '\n',
          category: 'string-encoding',
          description: 'Newline character',
          priority: 0.7,
          tags: ['whitespace', 'newline'],
        },
        {
          value: '\t',
          category: 'string-encoding',
          description: 'Tab character',
          priority: 0.7,
          tags: ['whitespace', 'tab'],
        },
        {
          value: '🎉',
          category: 'unicode-edge-cases',
          description: 'Emoji - multi-byte unicode',
          priority: 0.85,
          tags: ['unicode', 'emoji', 'encoding'],
        },
        {
          value: '𝕳𝖊𝖑𝖑𝖔',
          category: 'unicode-edge-cases',
          description: 'Mathematical alphanumeric symbols',
          priority: 0.8,
          tags: ['unicode', 'special-chars'],
        },
        {
          value: 'a'.repeat(1000),
          category: 'boundary-conditions',
          description: 'Very long string (1000 chars)',
          priority: 0.9,
          tags: ['length', 'large', 'memory'],
        },
        {
          value: '<script>alert("xss")</script>',
          category: 'string-encoding',
          description: 'XSS payload - HTML injection',
          priority: 0.95,
          tags: ['security', 'xss', 'injection'],
        },
        {
          value: "'; DROP TABLE users; --",
          category: 'string-encoding',
          description: 'SQL injection attempt',
          priority: 0.95,
          tags: ['security', 'sql-injection'],
        },
      ],
    });

    // Boolean boundaries (minimal)
    this.patterns.set('boolean', {
      primitiveType: 'boolean',
      edgeCases: [
        {
          value: true,
          category: 'boundary-conditions',
          description: 'Boolean true',
          priority: 1.0,
          tags: ['boolean', 'true'],
        },
        {
          value: false,
          category: 'boundary-conditions',
          description: 'Boolean false',
          priority: 1.0,
          tags: ['boolean', 'false'],
        },
      ],
    });

    // Null boundaries
    this.patterns.set('null', {
      primitiveType: 'null',
      edgeCases: [
        {
          value: null,
          category: 'null-safety',
          description: 'Null value',
          priority: 1.0,
          tags: ['null', 'nullish'],
        },
      ],
    });

    // Undefined boundaries
    this.patterns.set('undefined', {
      primitiveType: 'undefined',
      edgeCases: [
        {
          value: undefined,
          category: 'null-safety',
          description: 'Undefined value',
          priority: 1.0,
          tags: ['undefined', 'nullish'],
        },
      ],
    });

    // Array boundaries
    this.patterns.set('array', {
      primitiveType: 'array',
      edgeCases: [
        {
          value: [],
          category: 'array-bounds',
          description: 'Empty array',
          priority: 1.0,
          tags: ['empty', 'array', 'boundary'],
        },
        {
          value: [1],
          category: 'array-bounds',
          description: 'Single-element array',
          priority: 0.8,
          tags: ['single', 'array'],
        },
        {
          value: Array(1000).fill(0),
          category: 'array-bounds',
          description: 'Large array (1000 elements)',
          priority: 0.9,
          tags: ['large', 'array', 'memory'],
        },
        {
          value: [undefined, null, 0, false, ''],
          category: 'type-coercion',
          description: 'Array with falsy values',
          priority: 0.85,
          tags: ['falsy', 'coercion', 'array'],
        },
      ],
    });

    // Object boundaries
    this.patterns.set('object', {
      primitiveType: 'object',
      edgeCases: [
        {
          value: {},
          category: 'boundary-conditions',
          description: 'Empty object',
          priority: 1.0,
          tags: ['empty', 'object', 'boundary'],
        },
        {
          value: { a: 1 },
          category: 'boundary-conditions',
          description: 'Single-property object',
          priority: 0.7,
          tags: ['single', 'object'],
        },
        {
          value: Object.create(null),
          category: 'type-coercion',
          description: 'Object with no prototype',
          priority: 0.85,
          tags: ['prototype', 'object', 'special'],
        },
      ],
    });
  }

  /**
   * Get boundary values for a specific type
   *
   * @param typeNode - Type node to get boundaries for
   * @returns Array of edge case values
   */
  getBoundariesForType(typeNode: TypeNode): unknown[] {
    // @APEX: Guard against undefined primitiveType
    if (!typeNode.primitiveType) {
      return [];
    }

    const pattern = this.patterns.get(typeNode.primitiveType);
    if (!pattern) {
      return [];
    }

    // Return values sorted by priority
    return Array.from(pattern.edgeCases)
      .sort((a: EdgeCase, b: EdgeCase) => b.priority - a.priority)
      .map((edge: EdgeCase) => edge.value);
  }

  /**
   * Get edge cases with metadata for a type
   *
   * @param primitiveType - Primitive type
   * @returns Array of edge cases with metadata
   */
  getEdgeCasesForType(primitiveType: PrimitiveType): readonly EdgeCase[] {
    const pattern = this.patterns.get(primitiveType);
    return pattern ? pattern.edgeCases : [];
  }

  /**
   * Get edge cases by category
   *
   * @param category - Edge case category
   * @returns Array of edge cases in that category
   */
  getEdgeCasesByCategory(category: EdgeCaseCategory): EdgeCase[] {
    const results: EdgeCase[] = [];

    for (const pattern of this.patterns.values()) {
      for (const edgeCase of pattern.edgeCases) {
        if (edgeCase.category === category) {
          results.push(edgeCase);
        }
      }
    }

    return results.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get edge cases by tag
   *
   * @param tag - Tag to filter by
   * @returns Array of edge cases with that tag
   */
  getEdgeCasesByTag(tag: string): EdgeCase[] {
    const results: EdgeCase[] = [];

    for (const pattern of this.patterns.values()) {
      for (const edgeCase of pattern.edgeCases) {
        if (edgeCase.tags.includes(tag)) {
          results.push(edgeCase);
        }
      }
    }

    return results.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all supported primitive types
   */
  getSupportedTypes(): PrimitiveType[] {
    return Array.from(this.patterns.keys());
  }

  /**
   * Check if type has boundary patterns
   */
  hasPatternForType(primitiveType: PrimitiveType): boolean {
    return this.patterns.has(primitiveType);
  }
}
