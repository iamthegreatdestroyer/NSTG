/**
 * @fileoverview NegativeSpaceCalculator - Core implementation of the negative space formula
 * Implements: Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)
 * 
 * This is the heart of NSTG - it takes the complete universe of possible inputs for a function
 * and subtracts the inputs that have already been tested (observable behavior) to find the
 * "dark matter" of untested valid inputs.
 */

import type {
  FunctionSignature,
  TypeNode,
  TypeSpaceRegion,
  NegativeSpaceRegion,
  TestInput,
} from '../types.js';
import { TypeUniverse } from '../type-space/type-universe.js';
import { TypeLattice } from '../type-space/type-lattice.js';

/**
 * Result of negative space calculation
 */
export interface NegativeSpaceResult {
  /** All regions in the type universe */
  universeRegions: TypeSpaceRegion[];
  
  /** Regions that have been tested (observable behavior) */
  coveredRegions: TypeSpaceRegion[];
  
  /** Regions that have NOT been tested (negative space) */
  negativeSpaceRegions: NegativeSpaceRegion[];
  
  /** Total cardinality of the universe (may be 'infinite') */
  totalCardinality: number | 'infinite';
  
  /** Cardinality of covered space */
  coveredCardinality: number | 'infinite';
  
  /** Cardinality of negative space */
  negativeCardinality: number | 'infinite';
  
  /** Coverage percentage (null if infinite cardinality) */
  coveragePercentage: number | null;
}

/**
 * NegativeSpaceCalculator
 * 
 * Implements the core negative space formula:
 * Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)
 * 
 * Usage:
 * ```typescript
 * const calculator = new NegativeSpaceCalculator();
 * const result = calculator.calculate(functionSignature, observedInputs);
 * 
 * // Find untested regions
 * result.negativeSpaceRegions.forEach(region => {
 *   console.log(`Untested: ${region.description}`);
 *   console.log(`Priority: ${region.priority}`);
 * });
 * ```
 */
export class NegativeSpaceCalculator {
  private readonly typeUniverse: TypeUniverse;
  private readonly typeLattice: TypeLattice;

  constructor() {
    this.typeUniverse = new TypeUniverse();
    this.typeLattice = new TypeLattice();
  }

  /**
   * Calculate negative space for a function
   * 
   * @param signature - Function type signature
   * @param observedInputs - Array of test inputs that have been observed/tested
   * @returns Complete negative space analysis result
   */
  calculate(
    signature: FunctionSignature,
    observedInputs: TestInput[]
  ): NegativeSpaceResult {
    // Step 1: Calculate Universe(TypeSignature(f))
    const universeRegions = this.calculateUniverseForSignature(signature);
    
    // Step 2: Determine Observable_Behavior(f) from test inputs
    const coveredRegions = this.determineCoveredRegions(
      universeRegions,
      observedInputs,
      signature.parameters
    );
    
    // Step 3: Subtract to find Negative_Space = Universe - Observable
    const negativeSpaceRegions = this.subtractCoveredSpace(
      universeRegions,
      coveredRegions
    );
    
    // Step 4: Calculate cardinalities and coverage metrics
    const totalCardinality = this.calculateTotalCardinality(universeRegions);
    const coveredCardinality = this.calculateTotalCardinality(coveredRegions);
    const negativeCardinality = this.calculateTotalCardinality(negativeSpaceRegions);
    
    const coveragePercentage = this.calculateCoveragePercentage(
      coveredCardinality,
      totalCardinality
    );

    return {
      universeRegions,
      coveredRegions,
      negativeSpaceRegions,
      totalCardinality,
      coveredCardinality,
      negativeCardinality,
      coveragePercentage,
    };
  }

  /**
   * Calculate the complete universe for a function signature
   * Combines universes of all parameters using Cartesian product
   */
  private calculateUniverseForSignature(
    signature: FunctionSignature
  ): TypeSpaceRegion[] {
    if (signature.parameters.length === 0) {
      // No parameters = single region representing "no input"
      return [{
        id: 'void-input',
        description: 'Function with no parameters',
        cardinality: 1,
        typeNode: { kind: 'never' },
        constraints: [],
      }];
    }

    if (signature.parameters.length === 1) {
      // Single parameter = direct universe calculation
      return this.typeUniverse.calculateUniverse(signature.parameters[0].type);
    }

    // Multiple parameters = Cartesian product of parameter universes
    return this.calculateCartesianProductUniverse(signature.parameters);
  }

  /**
   * Calculate Cartesian product universe for multiple parameters
   * Example: f(x: number, y: boolean) = NumberSpace × BooleanSpace
   */
  private calculateCartesianProductUniverse(
    parameters: Array<{ name: string; type: TypeNode }>
  ): TypeSpaceRegion[] {
    // Calculate universe for each parameter
    const parameterUniverses = parameters.map(param => ({
      name: param.name,
      regions: this.typeUniverse.calculateUniverse(param.type),
    }));

    // Combine via Cartesian product
    const productRegions: TypeSpaceRegion[] = [];
    
    const generateCombinations = (
      index: number,
      currentCombination: TypeSpaceRegion[]
    ): void => {
      if (index === parameterUniverses.length) {
        // Base case: all parameters combined
        const combinedRegion = this.combineRegions(currentCombination, parameters);
        productRegions.push(combinedRegion);
        return;
      }

      // Recursive case: add each region of current parameter
      const currentParam = parameterUniverses[index];
      for (const region of currentParam.regions) {
        generateCombinations(index + 1, [...currentCombination, region]);
      }
    };

    generateCombinations(0, []);
    return productRegions;
  }

  /**
   * Combine multiple regions into a single compound region
   */
  private combineRegions(
    regions: TypeSpaceRegion[],
    parameters: Array<{ name: string; type: TypeNode }>
  ): TypeSpaceRegion {
    const id = regions.map(r => r.id).join('×');
    const description = regions.map((r, i) => 
      `${parameters[i].name}: ${r.description}`
    ).join(', ');
    
    // Cardinality of Cartesian product = product of individual cardinalities
    let cardinality: number | 'infinite' = 1;
    for (const region of regions) {
      if (region.cardinality === 'infinite' || cardinality === 'infinite') {
        cardinality = 'infinite';
      } else {
        cardinality *= region.cardinality;
      }
    }

    return {
      id,
      description,
      cardinality,
      typeNode: { kind: 'never' }, // Compound node - not representable as single TypeNode
      constraints: regions.flatMap(r => r.constraints),
    };
  }

  /**
   * Determine which regions have been covered by observed test inputs
   */
  private determineCoveredRegions(
    universeRegions: TypeSpaceRegion[],
    observedInputs: TestInput[],
    parameters: Array<{ name: string; type: TypeNode }>
  ): TypeSpaceRegion[] {
    const covered: TypeSpaceRegion[] = [];

    for (const region of universeRegions) {
      if (this.isRegionCovered(region, observedInputs, parameters)) {
        covered.push(region);
      }
    }

    return covered;
  }

  /**
   * Check if a region is covered by any observed input
   */
  private isRegionCovered(
    region: TypeSpaceRegion,
    observedInputs: TestInput[],
    parameters: Array<{ name: string; type: TypeNode }>
  ): boolean {
    return observedInputs.some(input => 
      this.doesInputCoverRegion(input, region, parameters)
    );
  }

  /**
   * Check if a specific test input covers a region
   */
  private doesInputCoverRegion(
    input: TestInput,
    region: TypeSpaceRegion,
    parameters: Array<{ name: string; type: TypeNode }>
  ): boolean {
    // For compound regions (multiple parameters), check each component
    if (region.id.includes('×')) {
      // Compound region from Cartesian product
      const regionIds = region.id.split('×');
      return parameters.every((param, index) => {
        const value = input.args[index];
        const regionId = regionIds[index];
        return this.isValueInRegion(value, regionId, param.type);
      });
    }

    // For simple regions (single parameter), check the value directly
    if (parameters.length === 1 && input.args.length === 1) {
      return this.isValueInRegion(input.args[0], region.id, parameters[0].type);
    }

    return false;
  }

  /**
   * Check if a value belongs to a specific region
   */
  private isValueInRegion(
    value: unknown,
    regionId: string,
    typeNode: TypeNode
  ): boolean {
    // Delegate to type-space modules for region membership checking
    // This is a simplified implementation - real version would use NumberSpace, StringSpace, etc.
    
    if (regionId.startsWith('number-')) {
      return typeof value === 'number';
    }
    if (regionId.startsWith('string-')) {
      return typeof value === 'string';
    }
    if (regionId.startsWith('boolean-')) {
      return typeof value === 'boolean';
    }
    
    return false;
  }

  /**
   * Subtract covered space from universe to find negative space
   */
  private subtractCoveredSpace(
    universeRegions: TypeSpaceRegion[],
    coveredRegions: TypeSpaceRegion[]
  ): NegativeSpaceRegion[] {
    const coveredIds = new Set(coveredRegions.map(r => r.id));
    
    return universeRegions
      .filter(region => !coveredIds.has(region.id))
      .map((region, index) => this.toNegativeSpaceRegion(region, index));
  }

  /**
   * Convert TypeSpaceRegion to NegativeSpaceRegion with priority
   */
  private toNegativeSpaceRegion(
    region: TypeSpaceRegion,
    index: number
  ): NegativeSpaceRegion {
    // Priority calculation:
    // - Higher priority for boundary regions (detected by keywords)
    // - Higher priority for smaller cardinality (easier to test)
    // - Lower priority for infinite cardinality
    
    const isBoundary = region.id.includes('boundary') || 
                       region.id.includes('zero') ||
                       region.id.includes('empty') ||
                       region.id.includes('single');
    
    let priority: number;
    if (region.cardinality === 'infinite') {
      priority = 0.1; // Low priority for infinite regions
    } else if (isBoundary) {
      priority = 1.0; // High priority for boundary regions
    } else if (region.cardinality <= 10) {
      priority = 0.9; // Very high priority for small finite regions
    } else if (region.cardinality <= 100) {
      priority = 0.7; // High priority for medium finite regions
    } else {
      priority = 0.5; // Medium priority for large finite regions
    }

    return {
      ...region,
      priority,
      reason: isBoundary 
        ? 'Boundary region - high bug probability'
        : region.cardinality === 'infinite'
        ? 'Infinite region - requires sampling strategy'
        : 'Untested region in type space',
    };
  }

  /**
   * Calculate total cardinality across regions
   */
  private calculateTotalCardinality(
    regions: TypeSpaceRegion[]
  ): number | 'infinite' {
    if (regions.some(r => r.cardinality === 'infinite')) {
      return 'infinite';
    }

    return regions.reduce((sum, region) => {
      return (sum as number) + (region.cardinality as number);
    }, 0 as number | 'infinite');
  }

  /**
   * Calculate coverage percentage
   */
  private calculateCoveragePercentage(
    covered: number | 'infinite',
    total: number | 'infinite'
  ): number | null {
    if (covered === 'infinite' || total === 'infinite') {
      return null; // Cannot calculate percentage with infinite cardinality
    }

    if (total === 0) {
      return 100; // Empty universe = 100% coverage
    }

    return (covered / total) * 100;
  }
}
