/**
 * Type Space Module - Index
 *
 * Exports all type space calculation utilities for determining the
 * "Universe" part of the negative space formula:
 *
 * Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)
 */

export { TypeUniverse } from './type-universe.js';
export { TypeLattice } from './type-lattice.js';
export { NumberSpace } from './primitive-spaces/number-space.js';
export { StringSpace } from './primitive-spaces/string-space.js';
export { BooleanSpace } from './primitive-spaces/boolean-space.js';
export {
  getSpecialValues,
  isSpecialValue,
  getProblematicValues,
  getBoundaryValues,
  isBoundaryValue,
} from './special-values.js';
