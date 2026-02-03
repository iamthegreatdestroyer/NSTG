/**
 * @fileoverview CoverageTracker - Track Observable_Behavior(f) through test execution
 *
 * Monitors which regions of the type space have been explored by test cases.
 * This represents the "Observable_Behavior" component of the negative space formula.
 */

import type {
  FunctionSignature,
  TestInput,
  TestOutput,
  TypeSpaceRegion,
  TypeNode,
} from '../types.js';
import { TypeUniverse } from '../type-space/type-universe.js';

/**
 * Coverage statistics for a function
 */
export interface CoverageStats {
  /** Total number of unique test inputs */
  totalInputs: number;

  /** Number of unique regions covered */
  regionsCovered: number;

  /** Total number of regions in universe */
  totalRegions: number;

  /** Coverage percentage (null if universe is infinite) */
  coveragePercentage: number | null;

  /** Inputs grouped by region */
  inputsByRegion: Map<string, TestInput[]>;

  /** Regions not yet covered */
  uncoveredRegions: TypeSpaceRegion[];
}

/**
 * Observed test execution record
 */
export interface TestExecution {
  /** Input arguments */
  input: TestInput;

  /** Observed output (or error) */
  output: TestOutput;

  /** Timestamp of execution */
  timestamp: Date;

  /** Region(s) this test input belongs to */
  regions: string[];
}

/**
 * CoverageTracker
 *
 * Tracks which parts of the type space have been tested (Observable_Behavior).
 * Maintains a history of test executions and maps them to type space regions.
 *
 * Usage:
 * ```typescript
 * const tracker = new CoverageTracker(functionSignature);
 *
 * // Record test executions
 * tracker.recordExecution({
 *   input: { args: [42, 'hello'] },
 *   output: { value: true },
 *   timestamp: new Date(),
 * });
 *
 * // Get coverage statistics
 * const stats = tracker.getCoverageStats();
 * console.log(`Coverage: ${stats.coveragePercentage}%`);
 * ```
 */
export class CoverageTracker {
  private readonly signature: FunctionSignature;
  private readonly typeUniverse: TypeUniverse;
  private readonly executions: TestExecution[] = [];
  private universeRegions: TypeSpaceRegion[] | null = null;

  constructor(signature: FunctionSignature) {
    this.signature = signature;
    this.typeUniverse = new TypeUniverse();
  }

  /**
   * Record a test execution
   *
   * @param input - Test input arguments
   * @param output - Observed output or error
   */
  recordExecution(input: TestInput, output: TestOutput): void {
    const regions = this.determineRegionsForInput(input);

    this.executions.push({
      input,
      output,
      timestamp: new Date(),
      regions,
    });
  }

  /**
   * Record multiple test executions in batch
   */
  recordExecutions(executions: Array<{ input: TestInput; output: TestOutput }>): void {
    for (const { input, output } of executions) {
      this.recordExecution(input, output);
    }
  }

  /**
   * Get all recorded test executions
   */
  getExecutions(): readonly TestExecution[] {
    return this.executions;
  }

  /**
   * Get executions for a specific region
   */
  getExecutionsForRegion(regionId: string): TestExecution[] {
    return this.executions.filter(exec => exec.regions.includes(regionId));
  }

  /**
   * Get coverage statistics
   */
  getCoverageStats(): CoverageStats {
    const universeRegions = this.getUniverseRegions();
    const coveredRegionIds = this.getCoveredRegionIds();

    const inputsByRegion = new Map<string, TestInput[]>();
    for (const exec of this.executions) {
      for (const regionId of exec.regions) {
        if (!inputsByRegion.has(regionId)) {
          inputsByRegion.set(regionId, []);
        }
        inputsByRegion.get(regionId)!.push(exec.input);
      }
    }

    const uncoveredRegions = universeRegions.filter(region => !coveredRegionIds.has(region.id));

    const totalCardinality = this.calculateTotalCardinality(universeRegions);
    const coveredCardinality = this.calculateTotalCardinality(
      universeRegions.filter(r => coveredRegionIds.has(r.id))
    );

    const coveragePercentage = this.calculateCoveragePercentage(
      coveredCardinality,
      totalCardinality
    );

    return {
      totalInputs: this.executions.length,
      regionsCovered: coveredRegionIds.size,
      totalRegions: universeRegions.length,
      coveragePercentage,
      inputsByRegion,
      uncoveredRegions,
    };
  }

  /**
   * Get all covered regions
   */
  getCoveredRegions(): TypeSpaceRegion[] {
    const universeRegions = this.getUniverseRegions();
    const coveredIds = this.getCoveredRegionIds();

    return universeRegions.filter(region => coveredIds.has(region.id));
  }

  /**
   * Check if a specific region is covered
   */
  isRegionCovered(regionId: string): boolean {
    return this.getCoveredRegionIds().has(regionId);
  }

  /**
   * Get the set of covered region IDs
   */
  private getCoveredRegionIds(): Set<string> {
    const covered = new Set<string>();
    for (const exec of this.executions) {
      for (const regionId of exec.regions) {
        covered.add(regionId);
      }
    }
    return covered;
  }

  /**
   * Determine which region(s) a test input belongs to
   */
  private determineRegionsForInput(input: TestInput): string[] {
    const universeRegions = this.getUniverseRegions();
    const matchingRegions: string[] = [];

    for (const region of universeRegions) {
      if (this.doesInputMatchRegion(input, region)) {
        matchingRegions.push(region.id);
      }
    }

    return matchingRegions;
  }

  /**
   * Check if a test input matches a region
   */
  private doesInputMatchRegion(input: TestInput, region: TypeSpaceRegion): boolean {
    // Handle compound regions (multiple parameters)
    if (region.id.includes('×')) {
      const regionIds = region.id.split('×');
      return this.signature.parameters.every((param, index) => {
        if (index >= input.args.length) return false;
        const value = input.args[index];
        const regionId = regionIds[index];
        return this.isValueInRegion(value, regionId, param.type);
      });
    }

    // Handle simple regions (single parameter)
    if (this.signature.parameters.length === 1 && input.args.length === 1) {
      return this.isValueInRegion(input.args[0], region.id, this.signature.parameters[0].type);
    }

    return false;
  }

  /**
   * Check if a value belongs to a region
   */
  private isValueInRegion(value: unknown, regionId: string, typeNode: TypeNode): boolean {
    const valueType = typeof value;

    // Number regions
    if (regionId.startsWith('number-')) {
      if (valueType !== 'number') return false;
      const num = value as number;

      if (regionId === 'number-special') {
        return Number.isNaN(num) || !Number.isFinite(num) || Object.is(num, -0);
      }
      if (regionId === 'number-zero') return num === 0 && !Object.is(num, -0);
      if (regionId === 'number-positive') return num > 0 && Number.isFinite(num);
      if (regionId === 'number-negative') return num < 0 && Number.isFinite(num);
      if (regionId === 'number-positive-infinity') return num === Infinity;
      if (regionId === 'number-negative-infinity') return num === -Infinity;
    }

    // String regions
    if (regionId.startsWith('string-')) {
      if (valueType !== 'string') return false;
      const str = value as string;

      if (regionId === 'string-empty') return str.length === 0;
      if (regionId === 'string-single') return str.length === 1;
      if (regionId === 'string-short') return str.length >= 2 && str.length <= 10;
      if (regionId === 'string-medium') return str.length >= 11 && str.length <= 100;
      if (regionId === 'string-long') return str.length >= 101 && str.length <= 1000;
      if (regionId === 'string-very-long') return str.length > 1000;
    }

    // Boolean regions
    if (regionId.startsWith('boolean-')) {
      if (valueType !== 'boolean') return false;
      if (regionId === 'boolean-true') return value === true;
      if (regionId === 'boolean-false') return value === false;
    }

    return false;
  }

  /**
   * Get universe regions (lazy initialization)
   */
  private getUniverseRegions(): TypeSpaceRegion[] {
    if (this.universeRegions === null) {
      this.universeRegions = this.calculateUniverseRegions();
    }
    return this.universeRegions;
  }

  /**
   * Calculate universe regions for the function signature
   */
  private calculateUniverseRegions(): TypeSpaceRegion[] {
    if (this.signature.parameters.length === 0) {
      return [
        {
          id: 'void-input',
          description: 'Function with no parameters',
          cardinality: 1,
          typeNode: { kind: 'never' },
          constraints: [],
        },
      ];
    }

    if (this.signature.parameters.length === 1) {
      return this.typeUniverse.calculateUniverse(this.signature.parameters[0].type);
    }

    // Multiple parameters - calculate Cartesian product
    return this.calculateCartesianProductRegions();
  }

  /**
   * Calculate Cartesian product of parameter universes
   */
  private calculateCartesianProductRegions(): TypeSpaceRegion[] {
    const parameterUniverses = this.signature.parameters.map(param => ({
      name: param.name,
      regions: this.typeUniverse.calculateUniverse(param.type),
    }));

    const productRegions: TypeSpaceRegion[] = [];

    const generateCombinations = (index: number, currentCombination: TypeSpaceRegion[]): void => {
      if (index === parameterUniverses.length) {
        const combinedRegion = this.combineRegions(currentCombination);
        productRegions.push(combinedRegion);
        return;
      }

      const currentParam = parameterUniverses[index];
      for (const region of currentParam.regions) {
        generateCombinations(index + 1, [...currentCombination, region]);
      }
    };

    generateCombinations(0, []);
    return productRegions;
  }

  /**
   * Combine regions into compound region
   */
  private combineRegions(regions: TypeSpaceRegion[]): TypeSpaceRegion {
    const id = regions.map(r => r.id).join('×');
    const description = regions
      .map((r, i) => `${this.signature.parameters[i].name}: ${r.description}`)
      .join(', ');

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
      typeNode: { kind: 'never' },
      constraints: regions.flatMap(r => r.constraints),
    };
  }

  /**
   * Calculate total cardinality
   */
  private calculateTotalCardinality(regions: TypeSpaceRegion[]): number | 'infinite' {
    if (regions.some(r => r.cardinality === 'infinite')) {
      return 'infinite';
    }

    return regions.reduce(
      (sum, region) => {
        return (sum as number) + (region.cardinality as number);
      },
      0 as number | 'infinite'
    );
  }

  /**
   * Calculate coverage percentage
   */
  private calculateCoveragePercentage(
    covered: number | 'infinite',
    total: number | 'infinite'
  ): number | null {
    if (covered === 'infinite' || total === 'infinite') {
      return null;
    }

    if (total === 0) {
      return 100;
    }

    return (covered / total) * 100;
  }

  /**
   * Clear all recorded executions
   */
  clear(): void {
    this.executions.length = 0;
  }
}
