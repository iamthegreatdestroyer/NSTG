# NSTG Testing Standards

## Purpose

Define testing conventions, patterns, and quality standards for the NSTG project.

## Testing Philosophy

> "The test generator must be tested more rigorously than the tests it generates."

### Core Principles

1. **Meta-Testing**: Use NSTG to generate tests for NSTG
2. **High Coverage**: Minimum 85% coverage, target 95%
3. **Fast Feedback**: Unit tests < 1s, integration < 10s
4. **Deterministic**: No flaky tests allowed
5. **Meaningful**: Every test has a clear purpose

## Test Structure

### File Organization

```
packages/core/
├── src/
│   └── analysis/
│       └── type-analyzer.ts
└── __tests__/
    └── analysis/
        └── type-analyzer.test.ts
```

**Rules:**

- Mirror source structure in `__tests__/`
- Test file names: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Test Naming Convention

```typescript
describe('TypeAnalyzer', () => {
  describe('analyze method', () => {
    it('should extract primitive types from simple signatures', () => {
      // Arrange
      const code = 'function add(a: number, b: number): number { }';

      // Act
      const result = analyzer.analyze(code);

      // Assert
      expect(result.parameters).toHaveLength(2);
      expect(result.parameters[0].type.kind).toBe('number');
    });

    it('should throw TypeError when given invalid TypeScript syntax', () => {
      // Arrange
      const invalidCode = 'function broken(a: ) { }';

      // Act & Assert
      expect(() => analyzer.analyze(invalidCode)).toThrow(TypeError);
    });
  });
});
```

**Format**: `should [expected behavior] when [condition/input]`

## Coverage Targets

| Package            | Minimum | Target |
| ------------------ | ------- | ------ |
| `core`             | 90%     | 95%    |
| `smt-solver`       | 85%     | 90%    |
| `boundary-catalog` | 80%     | 90%    |
| `shared`           | 95%     | 98%    |
| `apps/*`           | 70%     | 80%    |

**Measurement:**

```bash
pnpm test:coverage
```

**CI Enforcement:**

- PRs must maintain or improve coverage
- Coverage badge in README
- Detailed coverage report on PRs

## Test Categories

### Unit Tests

**Purpose**: Test individual functions in isolation

**Characteristics:**

- No file I/O, network, or external dependencies
- Fast (<100ms per test)
- Use mocks/stubs sparingly

**Example:**

```typescript
describe('NumberSpace', () => {
  it('should generate all integers in range', () => {
    const space = new NumberSpace({ min: 1, max: 3, integers: true });
    const values = Array.from(space.values());

    expect(values).toEqual([1, 2, 3]);
  });

  it('should respect finite cardinality constraints', () => {
    const space = new NumberSpace({ min: 0, max: 100 });

    expect(space.isFinite()).toBe(true);
    expect(space.cardinality()).toBe(101);
  });
});
```

### Integration Tests

**Purpose**: Test component interactions

**Characteristics:**

- May involve file I/O, but no network
- Moderate speed (<1s per test)
- Test realistic workflows

**Example:**

```typescript
describe('TestGenerator integration', () => {
  it('should analyze function and generate comprehensive tests', async () => {
    const sourceCode = readFileSync('fixtures/validator.ts', 'utf-8');

    const analyzer = new FunctionAnalyzer();
    const testGen = new TestGenerator();

    const signature = analyzer.analyze(sourceCode)[0];
    const tests = await testGen.generate(signature);

    expect(tests.length).toBeGreaterThan(5);
    expect(tests.some(t => t.category === 'boundary')).toBe(true);
  });
});
```

### Property-Based Tests

**Purpose**: Test invariants across many inputs

**Framework**: fast-check

**Example:**

```typescript
import fc from 'fast-check';

describe('TypeUniverse properties', () => {
  it('union of type and its complement is the universe', () => {
    fc.assert(
      fc.property(
        fc.anything(), // arbitrary type
        type => {
          const universe = TypeUniverse.for(type);
          const complement = universe.complement(type);
          const union = universe.union(type, complement);

          expect(universe.equals(union)).toBe(true);
        }
      )
    );
  });
});
```

## Test Fixtures

### Location

```
test-fixtures/
├── functions/
│   ├── simple-validators/
│   │   ├── isEmail.ts
│   │   └── isEmail.expected.json
│   └── complex/
└── expected-tests/
```

### Format

```typescript
// test-fixtures/functions/simple-validators/isEmail.ts
export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

// test-fixtures/expected-tests/isEmail.expected.json
{
  "function": "isEmail",
  "expectedTests": [
    {
      "name": "should accept valid email format",
      "input": "user@example.com",
      "expected": true
    },
    {
      "name": "should reject email without @ symbol",
      "input": "userexample.com",
      "expected": false
    }
  ]
}
```

## Mocking Guidelines

### When to Mock

✅ **Do mock:**

- External services (APIs, databases)
- File system for unit tests
- Time/dates for deterministic tests
- Expensive computations

❌ **Don't mock:**

- Internal domain logic
- Pure functions
- Simple data structures
- The system under test

### How to Mock

```typescript
// Prefer dependency injection
class TestGenerator {
  constructor(private readonly solver: ConstraintSolver = new Z3Solver()) {}
}

// Test with mock
const mockSolver: ConstraintSolver = {
  solve: vi.fn().mockResolvedValue({ satisfiable: true, model: {} }),
};

const generator = new TestGenerator(mockSolver);
```

## Assertions

### Prefer Specific Matchers

```typescript
// ✅ Good - specific and clear
expect(result).toHaveLength(3);
expect(value).toBeGreaterThan(0);
expect(array).toContain(expectedItem);

// ❌ Bad - vague and hard to debug
expect(result.length === 3).toBe(true);
expect(value > 0).toBeTruthy();
expect(array.includes(expectedItem)).not.toBe(false);
```

### Custom Matchers

```typescript
// apps/jest-plugin/src/matchers/toBeValidTest.ts
expect.extend({
  toBeValidTest(received: GeneratedTest) {
    const pass =
      received.name !== '' &&
      received.input !== undefined &&
      received.assertion !== undefined;

    return {
      pass,
      message: () =>
        pass
          ? `Expected test not to be valid`
          : `Expected test to be valid. Missing: ${/* details */}`
    };
  }
});

// Usage
expect(generatedTest).toBeValidTest();
```

## Performance Testing

### Benchmarks

**Location**: `benchmarks/`

**Framework**: Vitest bench mode

```typescript
import { bench, describe } from 'vitest';

describe('Type Universe Construction', () => {
  bench('construct number universe', () => {
    new NumberUniverse(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  });

  bench('construct string universe with constraints', () => {
    new StringUniverse({ minLength: 0, maxLength: 1000, pattern: /[a-z]+/ });
  });
});
```

**CI Integration:**

- Run benchmarks on every PR
- Compare against main branch baseline
- Block PRs with >10% performance regression

## Testing the Test Generator (Meta-Testing)

### Self-Application

```typescript
// scripts/meta-test.ts
/**
 * Use NSTG to generate tests for NSTG itself
 */
async function generateMetaTests() {
  const nstg = new NSTG();

  // Analyze NSTG's own core functions
  const coreFunctions = await analyzeCorePackage();

  // Generate tests for them
  for (const func of coreFunctions) {
    const tests = await nstg.generateTests(func);

    // Validate generated tests
    const validation = await validateTests(tests, func);

    if (!validation.valid) {
      throw new Error(`Generated invalid tests for ${func.name}`);
    }

    // Write to test files
    await writeTestFile(func, tests);
  }
}
```

### Validation Criteria

Generated tests must:

1. Compile without errors
2. Execute without crashing
3. Have meaningful assertions
4. Cover stated edge cases
5. Pass when code is correct
6. Fail when code has bugs

## Continuous Integration

### Pre-Commit

- Run tests for changed files only
- Fast (<5s)

### Pre-Push

- Run full test suite
- Moderate speed (<30s)

### Pull Request

- Full test suite
- Coverage report
- Performance benchmarks
- E2E tests

### Main Branch

- All of the above
- Mutation testing
- Long-running stress tests

## Test Quality Metrics

Track and improve:

- **Coverage**: % of lines executed
- **Mutation Score**: % of mutations caught
- **Flakiness**: Test stability over 100 runs
- **Speed**: Tests per second
- **Maintainability**: Test lines : source lines ratio (target: 1.5:1)

## Resources

- Vitest Documentation: https://vitest.dev
- fast-check Guide: https://github.com/dubzzz/fast-check
- Testing Best Practices: Kent C. Dodds' blog
