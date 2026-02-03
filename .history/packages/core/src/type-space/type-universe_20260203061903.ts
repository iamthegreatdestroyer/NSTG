import type { TypeNode, TypeSpaceRegion, TypeConstraint } from '../types.js';
import { SPECIAL_VALUES } from '@nstg/shared';

/**
 * TypeUniverse - Calculates the universe of all possible values for a type
 * 
 * This is the foundation of negative space analysis. Given a type signature,
 * we enumerate all possible valid values to establish the "universe" from which
 * we subtract observed behavior to find the negative space.
 */
export class TypeUniverse {
  /**
   * Calculate the complete universe of possible values for a type
   */
  calculateUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    switch (typeNode.kind) {
      case 'primitive':
        return this.calculatePrimitiveUniverse(typeNode);
      case 'literal':
        return this.calculateLiteralUniverse(typeNode);
      case 'union':
        return this.calculateUnionUniverse(typeNode);
      case 'intersection':
        return this.calculateIntersectionUniverse(typeNode);
      case 'array':
        return this.calculateArrayUniverse(typeNode);
      case 'object':
        return this.calculateObjectUniverse(typeNode);
      case 'any':
        return this.calculateAnyUniverse();
      case 'never':
        return [];
      default:
        return this.calculateUnknownUniverse(typeNode);
    }
  }

  /**
   * Calculate universe for primitive types (number, string, boolean, etc.)
   */
  private calculatePrimitiveUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    const typeName = typeNode.name?.toLowerCase() || 'unknown';
    
    switch (typeName) {
      case 'number':
        return this.createNumberUniverse(typeNode.constraints);
      case 'string':
        return this.createStringUniverse(typeNode.constraints);
      case 'boolean':
        return this.createBooleanUniverse();
      case 'null':
        return [this.createRegion('null', typeNode, [], 1)];
      case 'undefined':
        return [this.createRegion('undefined', typeNode, [], 1)];
      default:
        return [this.createRegion('unknown-primitive', typeNode, [], 'infinite')];
    }
  }

  /**
   * Calculate universe for literal types
   */
  private calculateLiteralUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    return [this.createRegion('literal', typeNode, [], 1)];
  }

  /**
   * Calculate universe for union types (T | U)
   */
  private calculateUnionUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    if (!typeNode.children) return [];
    
    const regions: TypeSpaceRegion[] = [];
    for (const child of typeNode.children) {
      regions.push(...this.calculateUniverse(child));
    }
    return regions;
  }

  /**
   * Calculate universe for intersection types (T & U)
   */
  private calculateIntersectionUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    if (!typeNode.children) return [];
    
    // Intersection narrows the space - we need to find values that satisfy ALL types
    const universes = typeNode.children.map(child => this.calculateUniverse(child));
    
    // For now, return the most restrictive universe (smallest cardinality)
    return universes.reduce((smallest, current) => {
      const smallestCard = this.getTotalCardinality(smallest);
      const currentCard = this.getTotalCardinality(current);
      return currentCard < smallestCard ? current : smallest;
    });
  }

  /**
   * Calculate universe for array types
   */
  private calculateArrayUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    // Arrays have infinite possible lengths, but we can partition by length
    const elementType = typeNode.children?.[0];
    if (!elementType) return [];

    const constraints = typeNode.constraints || [];
    const lengthConstraints = constraints.filter(c => c.type === 'length');
    
    if (lengthConstraints.length > 0) {
      return this.createBoundedArrayUniverse(elementType, lengthConstraints);
    }
    
    // Unbounded array - partition by common lengths
    return [
      this.createRegion('array-empty', typeNode, [], 1),
      this.createRegion('array-single', typeNode, [], 'infinite'),
      this.createRegion('array-multiple', typeNode, [], 'infinite'),
    ];
  }

  /**
   * Calculate universe for object types
   */
  private calculateObjectUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    // Object universe is the cartesian product of all property universes
    // For practical purposes, we create regions for key combinations
    return [
      this.createRegion('object-empty', typeNode, [], 1),
      this.createRegion('object-partial', typeNode, [], 'infinite'),
      this.createRegion('object-complete', typeNode, [], 'infinite'),
    ];
  }

  /**
   * Calculate universe for 'any' type (everything)
   */
  private calculateAnyUniverse(): TypeSpaceRegion[] {
    return [
      { id: 'any-universe', type: { kind: 'any' }, constraints: [], cardinality: 'infinite' }
    ];
  }

  /**
   * Calculate universe for unknown types
   */
  private calculateUnknownUniverse(typeNode: TypeNode): TypeSpaceRegion[] {
    return [this.createRegion('unknown', typeNode, [], 'infinite')];
  }

  /**
   * Create number universe with special values and constraints
   */
  private createNumberUniverse(constraints?: TypeConstraint[]): TypeSpaceRegion[] {
    const regions: TypeSpaceRegion[] = [];
    
    // Special values region
    regions.push(
      this.createRegion('number-special', { kind: 'primitive', name: 'number' }, [], 
        SPECIAL_VALUES.NUMBER.length
      )
    );
    
    // Apply range constraints if present
    const rangeConstraints = constraints?.filter(c => c.type === 'range') || [];
    if (rangeConstraints.length > 0) {
      for (const constraint of rangeConstraints) {
        regions.push(
          this.createRegion('number-range', { kind: 'primitive', name: 'number' }, 
            [constraint], 'infinite'
          )
        );
      }
    } else {
      // Partition into standard regions
      regions.push(
        this.createRegion('number-negative', { kind: 'primitive', name: 'number' }, [], 'infinite'),
        this.createRegion('number-zero', { kind: 'primitive', name: 'number' }, [], 1),
        this.createRegion('number-positive', { kind: 'primitive', name: 'number' }, [], 'infinite')
      );
    }
    
    return regions;
  }

  /**
   * Create string universe with special values and constraints
   */
  private createStringUniverse(constraints?: TypeConstraint[]): TypeSpaceRegion[] {
    const regions: TypeSpaceRegion[] = [];
    
    // Empty string
    regions.push(
      this.createRegion('string-empty', { kind: 'primitive', name: 'string' }, [], 1)
    );
    
    // Special characters
    regions.push(
      this.createRegion('string-special', { kind: 'primitive', name: 'string' }, [], 
        SPECIAL_VALUES.STRING.length
      )
    );
    
    // Pattern constraints
    const patternConstraints = constraints?.filter(c => c.type === 'pattern') || [];
    if (patternConstraints.length > 0) {
      for (const constraint of patternConstraints) {
        regions.push(
          this.createRegion('string-pattern', { kind: 'primitive', name: 'string' }, 
            [constraint], 'infinite'
          )
        );
      }
    } else {
      // Partition by length
      regions.push(
        this.createRegion('string-short', { kind: 'primitive', name: 'string' }, [], 'infinite'),
        this.createRegion('string-medium', { kind: 'primitive', name: 'string' }, [], 'infinite'),
        this.createRegion('string-long', { kind: 'primitive', name: 'string' }, [], 'infinite')
      );
    }
    
    return regions;
  }

  /**
   * Create boolean universe (true, false)
   */
  private createBooleanUniverse(): TypeSpaceRegion[] {
    return [
      this.createRegion('boolean-true', { kind: 'primitive', name: 'boolean' }, [], 1),
      this.createRegion('boolean-false', { kind: 'primitive', name: 'boolean' }, [], 1)
    ];
  }

  /**
   * Create bounded array universe based on length constraints
   */
  private createBoundedArrayUniverse(
    elementType: TypeNode,
    lengthConstraints: TypeConstraint[]
  ): TypeSpaceRegion[] {
    // Extract min/max from constraints
    const regions: TypeSpaceRegion[] = [];
    
    for (const constraint of lengthConstraints) {
      regions.push(
        this.createRegion('array-bounded', 
          { kind: 'array', children: [elementType] }, 
          [constraint], 
          'infinite'
        )
      );
    }
    
    return regions;
  }

  /**
   * Calculate total cardinality across regions
   */
  private getTotalCardinality(regions: TypeSpaceRegion[]): number {
    let total = 0;
    for (const region of regions) {
      if (region.cardinality === 'infinite') return Infinity;
      total += region.cardinality;
    }
    return total;
  }

  /**
   * Create a type space region
   */
  private createRegion(
    id: string,
    type: TypeNode,
    constraints: TypeConstraint[],
    cardinality: number | 'infinite'
  ): TypeSpaceRegion {
    return { id, type, constraints, cardinality };
  }
}
