// Engine
export { NSTGEngine } from './engine/nstg-engine.js';
export { FunctionAnalyzer } from './engine/function-analyzer.js';

// Type Space
export { TypeUniverse } from './type-space/type-universe.js';
export { TypeLattice } from './type-space/type-lattice.js';
export { NumberSpace } from './type-space/primitive-spaces/number-space.js';
export { StringSpace } from './type-space/primitive-spaces/string-space.js';
export { BooleanSpace } from './type-space/primitive-spaces/boolean-space.js';

// Negative Space
export { NegativeSpaceCalculator } from './negative-space/space-calculator.js';
export { CoverageTracker } from './negative-space/coverage-tracker.js';
export { GapDetector } from './negative-space/gap-detector.js';

// Test Generation
export { TestGenerator } from './test-generation/test-generator.js';
export { TestTemplateEngine } from './test-generation/template-engine.js';

// Types
export type * from './types.js';
