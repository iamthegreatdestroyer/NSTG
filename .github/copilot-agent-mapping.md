# Elite Agent Mapping for NSTG Development

**Purpose**: Detailed guide for selecting the right Elite Agent based on code area, task type, and complexity level.

**Version**: 1.0  
**Last Updated**: 2026-02-06

---

## 🎯 Quick Reference

| Code Area                | Primary Agent | Secondary Agent | Tertiary Agent |
| ------------------------ | ------------- | --------------- | -------------- |
| **Type System**          | @AXIOM        | @APEX           | @VELOCITY      |
| **Constraint Solving**   | @AXIOM        | @VELOCITY       | @TENSOR        |
| **Test Generation**      | @ECLIPSE      | @APEX           | @AXIOM         |
| **Parser/AST**           | @APEX         | @CORE           | @AXIOM         |
| **Performance Critical** | @VELOCITY     | @APEX           | @CORE          |
| **API Design**           | @SYNAPSE      | @APEX           | @ARCHITECT     |
| **CLI Tools**            | @APEX         | @SYNAPSE        | @SCRIBE        |
| **VS Code Extension**    | @APEX         | @CANVAS         | @SYNAPSE       |
| **Web Dashboard**        | @CANVAS       | @APEX           | @SYNAPSE       |
| **Documentation**        | @SCRIBE       | @MENTOR         | @APEX          |
| **Build System**         | @FORGE        | @FLUX           | @APEX          |
| **CI/CD**                | @FLUX         | @ECLIPSE        | @APEX          |
| **Security**             | @CIPHER       | @FORTRESS       | @APEX          |

---

## 📊 Agent Selection Matrix

### By Task Type

#### 1. Algorithm Design & Implementation

**When**: Implementing core algorithms, data structures, or complex logic

**Decision Tree**:

- **Mathematical/Theoretical** → @AXIOM
  - Type system algorithms
  - Constraint solving
  - Formal verification
- **Performance-Critical** → @VELOCITY
  - Sub-linear algorithms
  - Cache optimization
  - Memory-efficient structures
- **General Software Engineering** → @APEX
  - Standard algorithms
  - Code structure
  - Design patterns

**Example**:

```typescript
// @AXIOM: Design type lattice traversal algorithm
// Need: Mathematical soundness, formal verification
export function computeLeastUpperBound(a: TypeNode, b: TypeNode): TypeNode {
  // ...
}

// @VELOCITY: Optimize for O(1) average case lookup
// Need: Performance optimization, data structure selection
export function findBoundaryValues(typeSpace: TypeSpace): BoundaryValue[] {
  // ...
}

// @APEX: Implement visitor pattern for AST traversal
// Need: Clean code, design patterns, maintainability
export class ASTVisitor implements NodeVisitor {
  // ...
}
```

#### 2. Testing & Quality Assurance

**When**: Writing tests, designing test strategies, or implementing quality checks

**Decision Tree**:

- **Meta-Testing** → @ECLIPSE (primary)
  - Testing the test generator
  - Test quality metrics
  - Coverage analysis
- **Property-Based Testing** → @ECLIPSE + @AXIOM
  - Invariant identification
  - Property formulation
  - Formal specification
- **Unit Testing** → @ECLIPSE + @APEX
  - Test structure
  - Assertion design
  - Mock strategy

**Example**:

```typescript
// @ECLIPSE: Design comprehensive test suite for test generator
// Need: Meta-testing strategy, coverage analysis
describe('TestGenerator', () => {
  it('should generate tests that achieve 100% boundary coverage', () => {
    // ...
  });
});

// @ECLIPSE + @AXIOM: Create property-based tests with formal guarantees
// Need: Mathematical properties, exhaustive testing
it('should satisfy type soundness property', () => {
  fc.assert(
    fc.property(arbitraryType, type => {
      const result = inferType(type);
      return isSoundType(result);
    })
  );
});
```

#### 3. Documentation & Knowledge Transfer

**When**: Writing documentation, README files, guides, or API docs

**Decision Tree**:

- **API Documentation** → @SCRIBE (primary)
  - JSDoc comments
  - API reference
  - Usage examples
- **Educational Content** → @MENTOR + @SCRIBE
  - Tutorials
  - Concept explanations
  - Learning paths
- **Architecture Docs** → @ARCHITECT + @SCRIBE
  - System design docs
  - ADRs
  - Technical specifications

**Example**:

````typescript
// @SCRIBE: Write comprehensive API documentation
/**
 * Generates boundary value tests for the given function signature.
 *
 * @SCRIBE: Ensure examples show all parameter combinations
 * @example
 * ```typescript
 * const tests = generateBoundaryTests({
 *   name: 'clamp',
 *   parameters: [
 *     { name: 'value', type: 'number' },
 *     { name: 'min', type: 'number' },
 *     { name: 'max', type: 'number' }
 *   ]
 * });
 * ```
 */
export function generateBoundaryTests(signature: FunctionSignature): TestCase[] {
  // ...
}
````

#### 4. Performance & Optimization

**When**: Optimizing code, improving throughput, or reducing latency

**Decision Tree**:

- **Algorithmic Optimization** → @VELOCITY (primary)
  - Time complexity reduction
  - Space complexity optimization
  - Sub-linear algorithms
- **System-Level Performance** → @VELOCITY + @CORE
  - Memory layout
  - CPU cache optimization
  - Parallel processing
- **Profiling & Analysis** → @VELOCITY + @SENTRY
  - Performance measurement
  - Bottleneck identification
  - Monitoring setup

**Example**:

```typescript
// @VELOCITY: Optimize for streaming with O(1) memory
// Need: Generator pattern, lazy evaluation
export function* generateTestCases(typeSpace: TypeSpace): Generator<TestCase, void, unknown> {
  // @VELOCITY: Use Bloom filter for O(1) duplicate detection
  const seen = new BloomFilter(10000, 0.01);

  for (const value of boundaryValues(typeSpace)) {
    if (!seen.has(value)) {
      seen.add(value);
      yield createTestCase(value);
    }
  }
}
```

---

## 🗺️ Code Area Mapping

### `packages/core/src/type-space/`

**Purpose**: Type system implementation, type lattice, type universe

**Primary Agent**: @AXIOM
**Rationale**: Requires deep mathematical understanding of type theory, lattice structures, and formal semantics

**When to Invoke**:

- Implementing type inference algorithms
- Computing type relationships (subtyping, union, intersection)
- Verifying type soundness properties
- Designing constraint-based type refinement

**Secondary Agent**: @VELOCITY
**Rationale**: Type operations are on hot paths; performance critical

**Example Code Areas**:

```
type-space/
├── type-lattice.ts         → @AXIOM (primary), @VELOCITY (performance)
├── type-universe.ts        → @AXIOM (primary)
├── special-values.ts       → @AXIOM + @VELOCITY (boundary computation)
└── primitive-spaces/
    ├── number-space.ts     → @AXIOM (numerical analysis)
    ├── string-space.ts     → @AXIOM (formal language theory)
    └── boolean-space.ts    → @AXIOM (boolean algebra)
```

**Inline Comment Examples**:

```typescript
// @AXIOM: Verify this implements a valid partial order
export class TypeLattice {
  // @AXIOM: Prove reflexivity, antisymmetry, transitivity
  isSubtype(a: TypeNode, b: TypeNode): boolean {
    // ...
  }

  // @AXIOM: Ensure this computes the least upper bound (supremum)
  // @VELOCITY: Optimize with memoization for repeated queries
  leastUpperBound(a: TypeNode, b: TypeNode): TypeNode {
    // ...
  }
}
```

---

### `packages/core/src/constraint-solver/`

**Purpose**: SMT solving, constraint generation, Z3 integration

**Primary Agent**: @AXIOM
**Rationale**: Constraint solving is deeply mathematical (satisfiability, logic)

**Secondary Agent**: @VELOCITY
**Rationale**: Constraint solving can be expensive; optimization critical

**Example Code Areas**:

```
constraint-solver/
├── constraint-solver.ts    → @AXIOM (primary), @VELOCITY (caching)
├── constraint-builder.ts   → @AXIOM (logic formulation)
└── theories/
    ├── arithmetic.ts       → @AXIOM (number theory)
    ├── strings.ts          → @AXIOM (string constraints)
    └── boolean.ts          → @AXIOM (propositional logic)
```

**Inline Comment Examples**:

```typescript
// @AXIOM: Formulate constraint in SMT-LIB format
// @VELOCITY: Consider incremental solving for performance
export async function solveConstraints(
  constraints: Constraint[]
): Promise<Result<Solution, ConstraintSolvingError>> {
  // @AXIOM: Ensure satisfiability check is sound and complete
  const solver = await Z3Solver.create();

  // @VELOCITY: Batch constraints for better Z3 performance
  for (const constraint of constraints) {
    solver.add(constraint);
  }

  return await solver.check();
}
```

---

### `packages/core/src/test-generation/`

**Purpose**: Test case generation, assertion building, template engine

**Primary Agent**: @ECLIPSE
**Rationale**: Core testing expertise, meta-testing philosophy

**Secondary Agent**: @APEX
**Rationale**: Software engineering best practices, design patterns

**Example Code Areas**:

```
test-generation/
├── test-generator.ts       → @ECLIPSE (primary), @APEX (design)
├── assertion-builder.ts    → @ECLIPSE (assertions), @APEX (patterns)
├── template-engine.ts      → @APEX (primary), @ECLIPSE (test quality)
└── templates/
    ├── vitest.template.ts  → @ECLIPSE (test framework expertise)
    └── jest.template.ts    → @ECLIPSE (test framework expertise)
```

**Inline Comment Examples**:

```typescript
// @ECLIPSE: Ensure generated tests achieve complete boundary coverage
export function generateBoundaryTests(signature: FunctionSignature): TestCase[] {
  // @ECLIPSE: Apply equivalence partitioning
  const partitions = partitionInputSpace(signature);

  // @ECLIPSE: Select representative values from each partition
  const testCases = partitions.flatMap(p => selectBoundaryValues(p));

  return testCases;
}

// @APEX: Implement builder pattern for test case construction
export class TestCaseBuilder {
  // @ECLIPSE: Validate test case completeness
  build(): TestCase {
    // ...
  }
}
```

---

### `packages/core/src/parser/`

**Purpose**: Source code parsing, AST manipulation, type inference

**Primary Agent**: @APEX
**Rationale**: Standard compiler frontend techniques, software engineering

**Secondary Agent**: @CORE
**Rationale**: Low-level parsing, performance-critical

**Tertiary Agent**: @AXIOM
**Rationale**: Type inference requires type theory knowledge

**Example Code Areas**:

```
parser/
├── index.ts                → @APEX (orchestration)
├── tree-sitter/
│   └── typescript-parser.ts → @CORE (low-level parsing), @APEX (integration)
└── type-inference/
    ├── type-inferencer.ts   → @AXIOM (primary), @APEX (implementation)
    └── constraint-gen.ts    → @AXIOM (constraint formulation)
```

**Inline Comment Examples**:

```typescript
// @APEX: Implement visitor pattern for AST traversal
export class TypeInferencer implements ASTVisitor {
  // @AXIOM: Apply Hindley-Milner algorithm with constraints
  inferExpressionType(expr: Expression): Result<TypeNode, TypeError> {
    // @AXIOM: Generate unification constraints
    const constraints = this.collectConstraints(expr);

    // @AXIOM: Solve constraints to infer principal type
    return this.unify(constraints);
  }
}

// @CORE: Optimize parsing with incremental updates
// @VELOCITY: Consider caching parsed ASTs
export function parseSource(source: string): Result<AST, ParseError> {
  // ...
}
```

---

### `packages/smt-solver/`

**Purpose**: Z3 WASM wrapper, SMT-LIB encoding, solver interface

**Primary Agent**: @AXIOM
**Rationale**: Formal logic, satisfiability theory

**Secondary Agent**: @VELOCITY
**Rationale**: Z3 calls can be expensive; caching and optimization crucial

**Example Code Areas**:

```
smt-solver/
├── z3-wrapper.ts           → @AXIOM (primary), @VELOCITY (caching)
├── constraint-solver.ts    → @AXIOM (logic formulation)
└── theories/
    └── *.ts                → @AXIOM (each theory requires formal expertise)
```

**Inline Comment Examples**:

```typescript
// @AXIOM: Encode TypeScript types in SMT-LIB format
export function encodeType(type: TypeNode): SMTExpression {
  // @AXIOM: Map TypeScript type system to first-order logic
  switch (type.kind) {
    case 'number':
      return encodeNumberType(type);
    case 'string':
      return encodeStringType(type);
    // ...
  }
}

// @VELOCITY: Implement incremental solving for performance
export class Z3Solver {
  private solver: Z3.Solver;
  // @VELOCITY: Cache unsatisfiable core computations
  private coreCache = new Map<string, Constraint[]>();

  // ...
}
```

---

### `apps/vscode/`

**Purpose**: VS Code extension for NSTG

**Primary Agent**: @APEX
**Rationale**: Extension development, VS Code API expertise

**Secondary Agent**: @CANVAS
**Rationale**: UI/UX design for extension interface

**Example Code Areas**:

```
apps/vscode/
├── src/
│   ├── commands/           → @APEX (command implementation)
│   ├── providers/          → @APEX (IntelliSense, code actions)
│   ├── views/              → @CANVAS (primary), @APEX (implementation)
│   └── services/           → @APEX (business logic)
└── media/                  → @CANVAS (icons, CSS)
```

**Inline Comment Examples**:

```typescript
// @APEX: Implement VS Code command for test generation
export async function generateTestsCommand(context: vscode.ExtensionContext): Promise<void> {
  // @CANVAS: Show user-friendly progress notification
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Generating tests...',
    },
    async progress => {
      // ...
    }
  );
}
```

---

### `apps/web/`

**Purpose**: Web dashboard for test generation visualization

**Primary Agent**: @CANVAS
**Rationale**: UI/UX design, accessibility, responsive design

**Secondary Agent**: @APEX
**Rationale**: Frontend engineering, state management

**Example Code Areas**:

```
apps/web/
├── src/
│   ├── components/         → @CANVAS (primary), @APEX (React patterns)
│   ├── pages/              → @CANVAS (UI), @APEX (routing)
│   └── api/                → @SYNAPSE (API design), @APEX (implementation)
└── styles/                 → @CANVAS (CSS, design system)
```

**Inline Comment Examples**:

```typescript
// @CANVAS: Ensure WCAG 2.1 AA compliance for accessibility
export function TestCoverageVisualization({ data }: Props) {
  // @CANVAS: Use colorblind-friendly palette
  const colors = {
    covered: '#2E7D32',
    uncovered: '#C62828',
    partial: '#F57C00',
  };

  return (
    // @CANVAS: Add ARIA labels for screen readers
    <div role="region" aria-label="Test coverage visualization">
      {/* ... */}
    </div>
  );
}
```

---

## 🔄 Multi-Agent Collaboration Patterns

### Pattern 1: Type System + Performance

**Agents**: @AXIOM (lead) + @VELOCITY (support)

**When**: Implementing type system features with performance requirements

**Example**:

```typescript
// @AXIOM: Design mathematically sound type lattice
// @VELOCITY: Optimize for O(1) lookup with hash consing
export class TypeLattice {
  // @VELOCITY: Use interning/hash consing for type identity
  private typeCache = new Map<string, TypeNode>();

  // @AXIOM: Implement partial order relation
  // @VELOCITY: Memoize results for repeated queries
  private subtypeCache = new Map<string, boolean>();

  isSubtype(a: TypeNode, b: TypeNode): boolean {
    // @AXIOM: Check structural subtyping rules
    // @VELOCITY: Return cached result if available
    const key = `${a.id}:${b.id}`;
    if (this.subtypeCache.has(key)) {
      return this.subtypeCache.get(key)!;
    }

    const result = this.computeSubtype(a, b);
    this.subtypeCache.set(key, result);
    return result;
  }
}
```

### Pattern 2: Testing + Type Theory

**Agents**: @ECLIPSE (lead) + @AXIOM (support)

**When**: Designing property-based tests with formal guarantees

**Example**:

```typescript
// @ECLIPSE: Design comprehensive property-based test suite
// @AXIOM: Formulate mathematical properties to test
describe('TypeInference', () => {
  // @AXIOM: Property: Type inference is sound
  // (if inferred type T, then expression has type T)
  it('should satisfy soundness property', () => {
    fc.assert(
      fc.property(arbitraryExpression, expr => {
        const inferredType = inferType(expr);
        // @AXIOM: Check type preservation theorem
        return checkType(expr, inferredType);
      })
    );
  });

  // @AXIOM: Property: Type inference is principal
  // (inferred type is most general)
  it('should infer principal types', () => {
    // @ECLIPSE: Generate diverse test cases
    fc.assert(
      fc.property(arbitraryExpression, expr => {
        const inferredType = inferType(expr);
        // @AXIOM: Verify principality
        return isPrincipalType(expr, inferredType);
      })
    );
  });
});
```

### Pattern 3: Architecture + Testing

**Agents**: @ARCHITECT (lead) + @ECLIPSE (support)

**When**: Designing system architecture with testability in mind

**Example**:

```typescript
// @ARCHITECT: Design plugin architecture for extensibility
// @ECLIPSE: Ensure architecture supports easy testing
export interface TestGenerationStrategy {
  readonly name: string;
  canGenerate(signature: FunctionSignature): boolean;
  generate(signature: FunctionSignature): TestCase[];
}

// @ECLIPSE: Plugin pattern enables isolated testing
export class StrategyRegistry {
  private strategies = new Map<string, TestGenerationStrategy>();

  // @ARCHITECT: Dependency injection for testability
  register(strategy: TestGenerationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  // @ECLIPSE: Easy to mock in tests
  generate(signature: FunctionSignature): TestCase[] {
    // ...
  }
}
```

---

## 📋 Decision Flowchart

```
START: Need to write/modify code in NSTG
│
├─ Is it type system related?
│  ├─ Yes → @AXIOM (primary)
│  │        └─ Is performance critical? → Add @VELOCITY
│  └─ No → Continue
│
├─ Is it test generation/testing?
│  ├─ Yes → @ECLIPSE (primary)
│  │        ├─ Property-based? → Add @AXIOM
│  │        └─ Standard tests? → Add @APEX
│  └─ No → Continue
│
├─ Is it performance-critical?
│  ├─ Yes → @VELOCITY (primary)
│  │        └─ Complex algorithm? → Add @APEX
│  └─ No → Continue
│
├─ Is it UI/UX?
│  ├─ Yes → @CANVAS (primary)
│  │        └─ Add @APEX for implementation
│  └─ No → Continue
│
├─ Is it API design or integration?
│  ├─ Yes → @SYNAPSE (primary)
│  │        └─ Add @APEX for implementation
│  └─ No → Continue
│
├─ Is it documentation?
│  ├─ Yes → @SCRIBE (primary)
│  │        └─ Educational? → Add @MENTOR
│  └─ No → Continue
│
└─ Default: @APEX (general software engineering)
```

---

## ✅ Validation Checklist

Before finalizing agent selection, verify:

- [ ] **Primary agent matches code area** (use mapping above)
- [ ] **Secondary agent addresses specific concern** (performance, testing, etc.)
- [ ] **Inline comments clearly state what's needed** (not just agent name)
- [ ] **Multiple agents don't conflict** (collaborating, not competing)
- [ ] **Invocation is specific enough** (not just "@AXIOM: help")

**Good Examples**:

```typescript
// ✅ @AXIOM: Verify this type lattice satisfies partial order axioms
// ✅ @VELOCITY: Optimize for O(1) lookup using hash consing
// ✅ @ECLIPSE: Design property-based tests covering all edge cases
```

**Bad Examples**:

```typescript
// ❌ @AXIOM: make this better
// ❌ @VELOCITY: optimize
// ❌ @ECLIPSE: add tests
```

---

_Generated by @TENSOR → Part of Phase 1.2 (Custom Copilot Instructions)_
