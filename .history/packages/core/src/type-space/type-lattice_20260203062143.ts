import type { TypeNode } from '../types.js';

/**
 * TypeLattice - Represents hierarchical relationships between types
 * 
 * Establishes a partial ordering over types to understand subtyping relationships,
 * which is crucial for determining when one type space is contained within another.
 */
export class TypeLattice {
  /**
   * Check if typeA is a subtype of typeB (typeA ⊆ typeB)
   * 
   * In negative space analysis, if we've tested typeA, we've also implicitly
   * tested any subtypes of typeA.
   */
  isSubtype(typeA: TypeNode, typeB: TypeNode): boolean {
    // Reflexivity: every type is a subtype of itself
    if (this.areTypesEqual(typeA, typeB)) return true;
    
    // Never is subtype of everything
    if (typeA.kind === 'never') return true;
    
    // Everything is subtype of any
    if (typeB.kind === 'any') return true;
    
    // Any is not a subtype of anything (except any/unknown)
    if (typeA.kind === 'any' && typeB.kind !== 'any' && typeB.kind !== 'unknown') {
      return false;
    }
    
    // Literal types are subtypes of their base primitive types
    if (typeA.kind === 'literal' && typeB.kind === 'primitive') {
      return this.isLiteralSubtypeOfPrimitive(typeA, typeB);
    }
    
    // Union type subtyping: A | B ⊆ C iff A ⊆ C and B ⊆ C
    if (typeA.kind === 'union') {
      return this.isUnionSubtype(typeA, typeB);
    }
    
    // Intersection type subtyping: A & B ⊆ C iff A ⊆ C or B ⊆ C
    if (typeA.kind === 'intersection') {
      return this.isIntersectionSubtype(typeA, typeB);
    }
    
    // Array type subtyping (covariant in element type)
    if (typeA.kind === 'array' && typeB.kind === 'array') {
      return this.isArraySubtype(typeA, typeB);
    }
    
    // Object type subtyping (structural)
    if (typeA.kind === 'object' && typeB.kind === 'object') {
      return this.isObjectSubtype(typeA, typeB);
    }
    
    return false;
  }

  /**
   * Check if typeA is a supertype of typeB (typeA ⊇ typeB)
   */
  isSupertype(typeA: TypeNode, typeB: TypeNode): boolean {
    return this.isSubtype(typeB, typeA);
  }

  /**
   * Find the least upper bound (join) of two types
   * 
   * The smallest type that contains both typeA and typeB.
   * Used for widening types during analysis.
   */
  join(typeA: TypeNode, typeB: TypeNode): TypeNode {
    if (this.areTypesEqual(typeA, typeB)) return typeA;
    
    if (this.isSubtype(typeA, typeB)) return typeB;
    if (this.isSubtype(typeB, typeA)) return typeA;
    
    // If neither is a subtype of the other, create a union
    return {
      kind: 'union',
      children: [typeA, typeB]
    };
  }

  /**
   * Find the greatest lower bound (meet) of two types
   * 
   * The largest type that is contained in both typeA and typeB.
   * Used for narrowing types during analysis.
   */
  meet(typeA: TypeNode, typeB: TypeNode): TypeNode {
    if (this.areTypesEqual(typeA, typeB)) return typeA;
    
    if (this.isSubtype(typeA, typeB)) return typeA;
    if (this.isSubtype(typeB, typeA)) return typeB;
    
    // If no direct relationship, create an intersection
    return {
      kind: 'intersection',
      children: [typeA, typeB]
    };
  }

  /**
   * Widen a type by moving up the lattice
   * 
   * Used when we want to generalize from specific values to broader types.
   * Example: widening literal 5 to number type
   */
  widen(type: TypeNode): TypeNode {
    switch (type.kind) {
      case 'literal':
        return this.widenLiteral(type);
      case 'union':
        return this.widenUnion(type);
      default:
        return type;
    }
  }

  /**
   * Narrow a type by moving down the lattice
   * 
   * Used when we have additional constraints that restrict the type space.
   * Example: narrowing number to positive numbers
   */
  narrow(type: TypeNode, constraint: unknown): TypeNode {
    // Add constraint to type and return narrowed version
    return {
      ...type,
      constraints: [...(type.constraints || []), constraint as any]
    };
  }

  /**
   * Check if two types are structurally equal
   */
  private areTypesEqual(typeA: TypeNode, typeB: TypeNode): boolean {
    if (typeA.kind !== typeB.kind) return false;
    if (typeA.name !== typeB.name) return false;
    
    // Check children equality for composite types
    if (typeA.children && typeB.children) {
      if (typeA.children.length !== typeB.children.length) return false;
      return typeA.children.every((childA, i) => 
        this.areTypesEqual(childA, typeB.children![i])
      );
    }
    
    return true;
  }

  /**
   * Check if a literal type is a subtype of a primitive type
   */
  private isLiteralSubtypeOfPrimitive(literal: TypeNode, primitive: TypeNode): boolean {
    if (!literal.name || !primitive.name) return false;
    
    const literalValue = literal.name;
    const primitiveType = primitive.name.toLowerCase();
    
    if (primitiveType === 'number') {
      return !isNaN(Number(literalValue));
    }
    if (primitiveType === 'string') {
      return typeof literalValue === 'string';
    }
    if (primitiveType === 'boolean') {
      return literalValue === 'true' || literalValue === 'false';
    }
    
    return false;
  }

  /**
   * Check if a union type is a subtype
   */
  private isUnionSubtype(union: TypeNode, target: TypeNode): boolean {
    if (!union.children) return false;
    
    // All members of the union must be subtypes of target
    return union.children.every(child => this.isSubtype(child, target));
  }

  /**
   * Check if an intersection type is a subtype
   */
  private isIntersectionSubtype(intersection: TypeNode, target: TypeNode): boolean {
    if (!intersection.children) return false;
    
    // At least one member of the intersection must be a subtype of target
    return intersection.children.some(child => this.isSubtype(child, target));
  }

  /**
   * Check array subtype relationship (covariant)
   */
  private isArraySubtype(arrayA: TypeNode, arrayB: TypeNode): boolean {
    const elementA = arrayA.children?.[0];
    const elementB = arrayB.children?.[0];
    
    if (!elementA || !elementB) return false;
    
    return this.isSubtype(elementA, elementB);
  }

  /**
   * Check object subtype relationship (structural)
   */
  private isObjectSubtype(objectA: TypeNode, objectB: TypeNode): boolean {
    // Object A is a subtype of Object B if A has all properties of B
    // and each property type in A is a subtype of the corresponding type in B
    
    const propsB = objectB.children || [];
    const propsA = objectA.children || [];
    
    return propsB.every(propB => {
      const propA = propsA.find(p => p.name === propB.name);
      if (!propA) return false;
      return this.isSubtype(propA, propB);
    });
  }

  /**
   * Widen a literal type to its base primitive type
   */
  private widenLiteral(literal: TypeNode): TypeNode {
    if (!literal.name) return literal;
    
    const value = literal.name;
    
    if (!isNaN(Number(value))) {
      return { kind: 'primitive', name: 'number' };
    }
    if (value === 'true' || value === 'false') {
      return { kind: 'primitive', name: 'boolean' };
    }
    
    return { kind: 'primitive', name: 'string' };
  }

  /**
   * Widen a union type by widening each member and merging
   */
  private widenUnion(union: TypeNode): TypeNode {
    if (!union.children) return union;
    
    const widenedChildren = union.children.map(child => this.widen(child));
    
    // Merge widened children if they're now the same
    const uniqueChildren = this.deduplicateTypes(widenedChildren);
    
    if (uniqueChildren.length === 1) {
      return uniqueChildren[0];
    }
    
    return { kind: 'union', children: uniqueChildren };
  }

  /**
   * Remove duplicate types from array
   */
  private deduplicateTypes(types: TypeNode[]): TypeNode[] {
    const unique: TypeNode[] = [];
    
    for (const type of types) {
      if (!unique.some(u => this.areTypesEqual(u, type))) {
        unique.push(type);
      }
    }
    
    return unique;
  }
}
