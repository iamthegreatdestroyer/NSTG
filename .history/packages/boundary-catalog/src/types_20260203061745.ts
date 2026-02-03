/**
 * Boundary pattern for edge case detection
 */
export interface BoundaryPattern {
  id: string;
  name: string;
  description: string;
  category: 'numeric' | 'string' | 'collection' | 'object' | 'function';
  detector: (value: unknown) => boolean;
  generator: () => unknown[];
}

/**
 * Edge case definition
 */
export interface EdgeCase {
  value: unknown;
  type: string;
  patterns: string[];
  description: string;
}

/**
 * Boundary catalog configuration
 */
export interface BoundaryCatalogConfig {
  includeBuiltIn: boolean;
  customPatterns?: BoundaryPattern[];
}
