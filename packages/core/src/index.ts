// Engine
// export { NSTGEngine } from './engine/nstg-engine.js';  // TODO: File doesn't exist yet
export { FunctionAnalyzer } from './engine/function-analyzer.js';

// Type Space
export { BooleanSpace } from './type-space/primitive-spaces/boolean-space.js';
export { NumberSpace } from './type-space/primitive-spaces/number-space.js';
export { StringSpace } from './type-space/primitive-spaces/string-space.js';
export { TypeLattice } from './type-space/type-lattice.js';
export { TypeUniverse } from './type-space/type-universe.js';

// Negative Space
export { CoverageTracker } from './negative-space/coverage-tracker.js';
export { GapDetector } from './negative-space/gap-detector.js';
export { NegativeSpaceCalculator } from './negative-space/space-calculator.js';

// Test Generation
export { TestTemplateEngine } from './test-generation/template-engine.js';
export { TestGenerator } from './test-generation/test-generator.js';

// Types
export type * from './types.js';
