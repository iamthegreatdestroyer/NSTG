# NSTG Code Patterns

## Purpose

Define preferred patterns, idioms, and conventions for writing NSTG code.

## TypeScript Patterns

### Result Type Pattern

**Use for:** Functions that can fail without exceptional circumstances

```typescript
// packages/shared/src/types.ts
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

// Usage
function parseTypeAnnotation(code: string): Result<TypeNode, ParseError> {
  try {
    const ast = parseCode(code);
    return { success: true, value: extractType(ast) };
  } catch (error) {
    return {
      success: false,
      error: new ParseError('Invalid type annotation', { cause: error }),
    };
  }
}

// Consumer
const result = parseTypeAnnotation(input);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error.message);
}
```

### Option Type Pattern

**Use for:** Values that may not exist

```typescript
// packages/shared/src/types.ts
export type Option<T> = T | null;

export const Option = {
  some<T>(value: T): Option<T> {
    return value;
  },
  none<T>(): Option<T> {
    return null;
  },
  map<T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> {
    return opt !== null ? fn(opt) : null;
  },
  flatMap<T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> {
    return opt !== null ? fn(opt) : null;
  },
};

// Usage
function findParameter(name: string): Option<FunctionParameter> {
  return this.parameters.find(p => p.name === name) ?? null;
}
```

### Builder Pattern for Complex Objects

```typescript
class TestCaseBuilder {
  private testCase: Partial<TestCase> = {};

  withName(name: string): this {
    this.testCase.name = name;
    return this;
  }

  withInput(input: unknown): this {
    this.testCase.input = input;
    return this;
  }

  withExpected(expected: unknown): this {
    this.testCase.expected = expected;
    return this;
  }

  withCategory(category: TestCategory): this {
    this.testCase.category = category;
    return this;
  }

  build(): TestCase {
    if (!this.testCase.name || this.testCase.input === undefined) {
      throw new Error('Test case requires name and input');
    }

    return {
      name: this.testCase.name,
      input: this.testCase.input,
      expected: this.testCase.expected ?? null,
      category: this.testCase.category ?? 'general',
      metadata: {},
    };
  }
}

// Usage
const test = new TestCaseBuilder()
  .withName('should handle empty string')
  .withInput('')
  .withExpected(false)
  .withCategory('boundary')
  .build();
```

### Visitor Pattern for AST Traversal

```typescript
interface TypeNodeVisitor<T> {
  visitPrimitive(node: PrimitiveTypeNode): T;
  visitArray(node: ArrayTypeNode): T;
  visitObject(node: ObjectTypeNode): T;
  visitUnion(node: UnionTypeNode): T;
  visitIntersection(node: IntersectionTypeNode): T;
}

abstract class TypeNode {
  abstract accept<T>(visitor: TypeNodeVisitor<T>): T;
}

class PrimitiveTypeNode extends TypeNode {
  constructor(public readonly kind: 'string' | 'number' | 'boolean') {
    super();
  }

  accept<T>(visitor: TypeNodeVisitor<T>): T {
    return visitor.visitPrimitive(this);
  }
}

// Usage - Type Space Calculator
class TypeSpaceCalculator implements TypeNodeVisitor<TypeSpace> {
  visitPrimitive(node: PrimitiveTypeNode): TypeSpace {
    switch (node.kind) {
      case 'string':
        return StringSpace.unbounded();
      case 'number':
        return NumberSpace.unbounded();
      case 'boolean':
        return BooleanSpace.all();
    }
  }

  visitArray(node: ArrayTypeNode): TypeSpace {
    const elementSpace = node.element.accept(this);
    return new ArraySpace(elementSpace);
  }

  // ... other visit methods
}
```

### Strategy Pattern for Algorithms

```typescript
interface TestGenerationStrategy {
  name: string;
  generate(signature: FunctionSignature): Promise<TestCase[]>;
}

class BoundaryValueStrategy implements TestGenerationStrategy {
  name = 'boundary-value';

  async generate(signature: FunctionSignature): Promise<TestCase[]> {
    // Generate boundary value tests
    return [];
  }
}

class EquivalenceClassStrategy implements TestGenerationStrategy {
  name = 'equivalence-class';

  async generate(signature: FunctionSignature): Promise<TestCase[]> {
    // Generate equivalence class tests
    return [];
  }
}

class TestGenerator {
  constructor(
    private strategies: TestGenerationStrategy[] = [
      new BoundaryValueStrategy(),
      new EquivalenceClassStrategy(),
    ]
  ) {}

  async generate(signature: FunctionSignature): Promise<TestCase[]> {
    const allTests = await Promise.all(this.strategies.map(s => s.generate(signature)));

    return allTests.flat();
  }
}
```

## Async Patterns

### Prefer Async/Await over Promises

```typescript
// ✅ Good
async function generateTests(func: FunctionSignature): Promise<TestCase[]> {
  const typeSpace = await analyzeTypeSpace(func);
  const constraints = await extractConstraints(func);
  const solution = await solver.solve(constraints);

  return buildTests(solution);
}

// ❌ Avoid (unless you need fine-grained control)
function generateTests(func: FunctionSignature): Promise<TestCase[]> {
  return analyzeTypeSpace(func)
    .then(typeSpace => extractConstraints(func))
    .then(constraints => solver.solve(constraints))
    .then(solution => buildTests(solution));
}
```

### Parallel Execution

```typescript
// When operations are independent
async function processAllFunctions(functions: FunctionSignature[]): Promise<TestSuite> {
  const testResults = await Promise.all(functions.map(func => generateTests(func)));

  return combine(testResults);
}

// When you need to limit concurrency
async function processWithLimit(
  functions: FunctionSignature[],
  limit: number = 5
): Promise<TestSuite> {
  const results: TestCase[][] = [];

  for (let i = 0; i < functions.length; i += limit) {
    const batch = functions.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(func => generateTests(func)));
    results.push(...batchResults);
  }

  return combine(results);
}
```

## Error Handling

### Custom Error Classes

```typescript
// packages/shared/src/errors.ts
export abstract class NSTGError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class ParseError extends NSTGError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'PARSE_ERROR', options);
  }
}

export class ConstraintSolvingError extends NSTGError {
  constructor(
    message: string,
    public readonly constraints: TypeConstraint[],
    options?: ErrorOptions
  ) {
    super(message, 'CONSTRAINT_SOLVING_ERROR', options);
  }
}

// Usage
if (!isValidTypeScript(code)) {
  throw new ParseError('Invalid TypeScript syntax', {
    cause: new SyntaxError('Unexpected token'),
  });
}
```

### Error Boundaries for Async Operations

```typescript
async function safeGenerate(signature: FunctionSignature): Promise<Result<TestCase[], NSTGError>> {
  try {
    const tests = await generateTests(signature);
    return { success: true, value: tests };
  } catch (error) {
    if (error instanceof NSTGError) {
      return { success: false, error };
    }

    // Wrap unexpected errors
    return {
      success: false,
      error: new InternalError('Test generation failed', { cause: error }),
    };
  }
}
```

## Performance Patterns

### Lazy Evaluation

```typescript
class TypeUniverse {
  private _values?: Set<unknown>;

  get values(): Set<unknown> {
    if (!this._values) {
      this._values = this.computeValues();
    }
    return this._values;
  }

  private computeValues(): Set<unknown> {
    // Expensive computation
    return new Set();
  }
}
```

### Memoization

```typescript
// packages/shared/src/utils/memoize.ts
export function memoize<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const cache = new Map<string, Return>();

  return (...args: Args): Return => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const computeTypeSpace = memoize((signature: string) => {
  // Expensive computation
  return new TypeSpace();
});
```

### Streaming Results

```typescript
// For large result sets
async function* generateTestsStream(signature: FunctionSignature): AsyncGenerator<TestCase> {
  const typeSpace = await analyzeTypeSpace(signature);

  for await (const point of typeSpace.sample(1000)) {
    yield createTestCase(point);
  }
}

// Consumer
for await (const test of generateTestsStream(signature)) {
  await writeTest(test);
}
```

## Type Safety Patterns

### Branded Types

```typescript
// Prevent mixing up different string types
type FunctionName = string & { readonly __brand: 'FunctionName' };
type VariableName = string & { readonly __brand: 'VariableName' };

function createFunctionName(name: string): FunctionName {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error('Invalid function name');
  }
  return name as FunctionName;
}

// Now these won't compile if mixed up
function analyzeFunction(name: FunctionName) {}

const funcName = createFunctionName('myFunc');
analyzeFunction(funcName); // ✅

const varName: VariableName = 'myVar' as VariableName;
analyzeFunction(varName); // ❌ Type error
```

### Discriminated Unions

```typescript
type TypeSpace =
  | { kind: 'number'; min: number; max: number }
  | { kind: 'string'; minLength: number; maxLength: number }
  | { kind: 'boolean' }
  | { kind: 'array'; element: TypeSpace }
  | { kind: 'object'; properties: Record<string, TypeSpace> };

function cardinality(space: TypeSpace): number {
  switch (space.kind) {
    case 'number':
      return space.max - space.min + 1;
    case 'string':
      return Math.pow(256, space.maxLength + 1);
    case 'boolean':
      return 2;
    case 'array':
      return Infinity; // Unbounded
    case 'object':
      return Object.values(space.properties).reduce((acc, prop) => acc * cardinality(prop), 1);
  }
}
```

## Module Organization

### Barrel Exports

```typescript
// packages/core/src/index.ts
export * from './types.js';
export * from './engine/function-analyzer.js';
export * from './test-generation/test-generator.js';

// Advanced: Re-export with namespace
export * as TypeSpace from './type-space/index.js';
export * as NegativeSpace from './negative-space/index.js';

// Usage by consumers
import { FunctionAnalyzer, TypeSpace } from '@nstg/core';
```

### Internal vs Public API

```typescript
// Public API - exported from index.ts
export class TestGenerator {}

// Internal API - not exported from index.ts, but available for other packages
export class InternalTestOptimizer {}

// Private implementation - not exported at all
class CacheManager {}
```

## Logging & Debugging

### Structured Logging

```typescript
import { logger } from '@nstg/shared';

// Create context-aware logger
const log = logger.child({ component: 'TestGenerator' });

// Use semantic log levels
log.debug('Starting test generation', { functionName: signature.name });
log.info('Generated tests', { count: tests.length, duration: elapsed });
log.warn('Partial generation', { reason: 'timeout', generated: tests.length });
log.error('Generation failed', { error, functionName: signature.name });
```

## Documentation Patterns

### JSDoc Standards

````typescript
/**
 * Analyzes a function signature and generates comprehensive test cases
 * covering the negative space (untested valid inputs).
 *
 * @param signature - The function signature to analyze
 * @param options - Generation options
 * @param options.strategy - Test generation strategy to use
 * @param options.maxTests - Maximum number of tests to generate
 * @returns Array of generated test cases
 *
 * @throws {ParseError} If the function signature is invalid
 * @throws {ConstraintSolvingError} If SMT solver fails
 *
 * @example
 * ```typescript
 * const signature = analyzer.analyze('function isEmail(s: string): boolean');
 * const tests = await generator.generate(signature, { maxTests: 100 });
 * console.log(`Generated ${tests.length} tests`);
 * ```
 *
 * @see {@link FunctionAnalyzer} for signature extraction
 * @see {@link TestCase} for test case structure
 */
async function generateTests(
  signature: FunctionSignature,
  options?: GenerationOptions
): Promise<TestCase[]> {
  // Implementation
}
````

## Configuration Patterns

### Type-safe Configuration

```typescript
// packages/shared/src/config.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  maxTestsPerFunction: z.number().int().positive().default(100),
  timeout: z.number().int().positive().default(5000),
  strategies: z.array(z.enum(['boundary', 'equivalence', 'random'])),
  smtSolver: z.object({
    timeout: z.number().int().positive().default(3000),
    maxDepth: z.number().int().positive().default(10),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(input: unknown): Config {
  return ConfigSchema.parse(input);
}
```

## Testing Patterns

See [testing-standards/SKILL.md](../testing-standards/SKILL.md) for comprehensive testing patterns.

## Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Effective TypeScript: Dan Vanderkam
- Domain-Driven Design: Eric Evans
