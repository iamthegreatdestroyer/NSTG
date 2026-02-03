# NSTG Project Initialization: Autonomous Scaffolding Directive
## Master Prompt for GitHub Copilot Agent Mode

---

## 🎯 MISSION DIRECTIVE

You are the **Lead Architect Agent** for the Negative Space Test Generation (NSTG) project. You have been granted **MAXIMUM AUTONOMY** to design, scaffold, and implement the complete project infrastructure. Execute with the decisiveness and precision of a senior principal engineer who has built testing frameworks at scale.

**Repository:** `https://github.com/iamthegreatdestroyer/NSTG.git`
**Author:** Stevo (sgbilod / iamthegreatdestroyer)
**License Strategy:** Dual-license (AGPL-3.0 open source + Commercial tiers)

---

## 📋 PROJECT SPECIFICATION

### What NSTG Does
Negative Space Test Generation is a **behavioral negative space analysis system** that:
1. Analyzes the **type space** of functions to find inputs that are valid but unhandled
2. Uses **SMT constraint solving** to generate inputs in the "negative space"
3. Identifies **implicit invariants** the code assumes but doesn't enforce
4. Generates **boundary condition tests** at type edges (NaN, MAX_INT, empty strings)
5. Detects **temporal assumptions** and resource state boundaries
6. Produces **property-based tests** that explore unexplored regions systematically

### Core Innovation: Negative Space Imaging for Code
Traditional test generation focuses on **what code does** (positive space). NSTG applies Negative Space Imaging principles to discover **what code doesn't handle**:

```
Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)

Where:
- Universe(TypeSignature) = All valid inputs according to type system
- Observable_Behavior = Inputs exercised by existing tests + static analysis
- Negative_Space = The "dark matter" of untested valid inputs
```

### The Problem NSTG Solves
**73% of production bugs** occur in conditions developers never considered:
- IEEE 754 special values (NaN, Infinity, -0)
- Unicode edge cases (zero-width chars, RTL markers)
- Timing assumptions (concurrent access, stale data)
- Resource boundaries (memory limits, connection pools)
- Null propagation paths
- Integer overflow at boundaries

---

## 🏗️ AUTONOMOUS EXECUTION PROTOCOL

### Phase 1: Repository Structure [EXECUTE IMMEDIATELY]

Create the following monorepo structure using **Turborepo** for build orchestration:

```
NSTG/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous integration
│   │   ├── release.yml               # Semantic release automation
│   │   ├── security.yml              # Dependency scanning
│   │   └── nightly-fuzz.yml          # Nightly fuzzing runs
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── config.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── dependabot.yml
│
├── apps/
│   ├── cli/                          # CLI application (Node.js/TypeScript)
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── analyze.ts        # nstg analyze <file> - Analyze negative space
│   │   │   │   ├── generate.ts       # nstg generate <file> - Generate tests
│   │   │   │   ├── fuzz.ts           # nstg fuzz <file> - Directed fuzzing
│   │   │   │   ├── report.ts         # nstg report - Coverage report
│   │   │   │   ├── watch.ts          # nstg watch - Continuous analysis
│   │   │   │   └── init.ts           # nstg init - Initialize config
│   │   │   ├── formatters/
│   │   │   │   ├── jest.ts           # Jest test output
│   │   │   │   ├── vitest.ts         # Vitest test output
│   │   │   │   ├── pytest.ts         # Pytest test output
│   │   │   │   ├── mocha.ts          # Mocha test output
│   │   │   │   └── generic.ts        # Generic assertion format
│   │   │   ├── reporters/
│   │   │   │   ├── terminal.ts       # Rich terminal output
│   │   │   │   ├── json.ts           # JSON output
│   │   │   │   ├── html.ts           # HTML report generation
│   │   │   │   └── sarif.ts          # SARIF for IDE integration
│   │   │   └── index.ts              # CLI entry point (Commander.js)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── vscode/                       # VS Code Extension
│   │   ├── src/
│   │   │   ├── extension.ts          # Extension activation
│   │   │   ├── providers/
│   │   │   │   ├── negative-space-lens.ts  # CodeLens for untested paths
│   │   │   │   ├── diagnostic-provider.ts  # Diagnostics for gaps
│   │   │   │   ├── hover-provider.ts       # Type space info on hover
│   │   │   │   └── quick-fix-provider.ts   # Generate test quick fixes
│   │   │   ├── commands/
│   │   │   │   ├── analyze-function.ts
│   │   │   │   ├── generate-tests.ts
│   │   │   │   ├── show-type-space.ts
│   │   │   │   └── explore-boundaries.ts
│   │   │   ├── views/
│   │   │   │   ├── negative-space-tree.ts  # Sidebar tree view
│   │   │   │   ├── type-space-webview.ts   # Visual type space explorer
│   │   │   │   └── boundary-explorer.ts    # Boundary condition browser
│   │   │   └── services/
│   │   │       └── nstg-client.ts          # Communicates with core engine
│   │   ├── media/
│   │   │   ├── icons/
│   │   │   └── styles/
│   │   ├── package.json              # Extension manifest
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── web/                          # Web dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/
│   │   │   │   │   ├── analyze/route.ts
│   │   │   │   │   └── generate/route.ts
│   │   │   │   ├── dashboard/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── type-space-visualizer/
│   │   │   │   ├── boundary-heatmap/
│   │   │   │   └── test-generator/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── jest-plugin/                  # Jest integration plugin
│       ├── src/
│       │   ├── index.ts
│       │   ├── transformer.ts
│       │   ├── reporter.ts
│       │   └── matchers/
│       │       ├── boundary-matchers.ts
│       │       └── invariant-matchers.ts
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── core/                         # Core NSTG Engine (TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts              # Public API exports
│   │   │   ├── engine/
│   │   │   │   ├── nstg-engine.ts    # Main orchestration class
│   │   │   │   ├── analyzer.ts       # Code analysis pipeline
│   │   │   │   └── generator.ts      # Test generation coordinator
│   │   │   ├── type-space/
│   │   │   │   ├── type-universe.ts      # Type universe construction
│   │   │   │   ├── type-extractor.ts     # Extract types from AST
│   │   │   │   ├── type-lattice.ts       # Type lattice operations
│   │   │   │   ├── primitive-spaces.ts   # Primitive type spaces
│   │   │   │   │   ├── number-space.ts   # Number type space (incl. IEEE 754)
│   │   │   │   │   ├── string-space.ts   # String type space (incl. Unicode)
│   │   │   │   │   ├── boolean-space.ts  # Boolean space
│   │   │   │   │   └── null-space.ts     # Null/undefined space
│   │   │   │   ├── composite-spaces.ts   # Object/Array/Union spaces
│   │   │   │   └── special-values.ts     # Special value registry
│   │   │   ├── negative-space/
│   │   │   │   ├── space-calculator.ts   # Negative space computation
│   │   │   │   ├── coverage-tracker.ts   # Track observed behavior
│   │   │   │   ├── gap-detector.ts       # Find coverage gaps
│   │   │   │   └── boundary-walker.ts    # Walk type boundaries
│   │   │   ├── constraint-solver/
│   │   │   │   ├── smt-bridge.ts         # Z3/SMT-LIB interface
│   │   │   │   ├── constraint-builder.ts # Build constraints from code
│   │   │   │   ├── model-generator.ts    # Generate satisfying models
│   │   │   │   └── solver-pool.ts        # Solver instance pooling
│   │   │   ├── invariant-detector/
│   │   │   │   ├── invariant-miner.ts    # Mine implicit invariants
│   │   │   │   ├── precondition-inference.ts  # Infer preconditions
│   │   │   │   ├── postcondition-inference.ts # Infer postconditions
│   │   │   │   └── loop-invariants.ts    # Loop invariant detection
│   │   │   ├── test-generator/
│   │   │   │   ├── generator.ts          # Main test generator
│   │   │   │   ├── boundary-tests.ts     # Boundary condition tests
│   │   │   │   ├── invariant-tests.ts    # Invariant violation tests
│   │   │   │   ├── property-tests.ts     # Property-based tests
│   │   │   │   ├── resource-tests.ts     # Resource exhaustion tests
│   │   │   │   ├── temporal-tests.ts     # Timing/ordering tests
│   │   │   │   └── templates/
│   │   │   │       ├── jest.hbs
│   │   │   │       ├── vitest.hbs
│   │   │   │       ├── pytest.hbs
│   │   │   │       └── mocha.hbs
│   │   │   ├── parser/
│   │   │   │   ├── code-parser.ts        # Abstract parser interface
│   │   │   │   ├── tree-sitter/
│   │   │   │   │   ├── typescript-parser.ts
│   │   │   │   │   ├── python-parser.ts
│   │   │   │   │   ├── rust-parser.ts
│   │   │   │   │   ├── java-parser.ts
│   │   │   │   │   └── parser-registry.ts
│   │   │   │   └── type-inference/
│   │   │   │       ├── typescript-types.ts
│   │   │   │       ├── python-types.ts
│   │   │   │       └── flow-types.ts
│   │   │   ├── analysis/
│   │   │   │   ├── control-flow.ts       # Control flow graph
│   │   │   │   ├── data-flow.ts          # Data flow analysis
│   │   │   │   ├── call-graph.ts         # Call graph construction
│   │   │   │   ├── path-explorer.ts      # Execution path enumeration
│   │   │   │   └── symbolic-executor.ts  # Lightweight symbolic execution
│   │   │   ├── fuzzer/
│   │   │   │   ├── directed-fuzzer.ts    # Entropy-guided fuzzing
│   │   │   │   ├── mutation-engine.ts    # Input mutation strategies
│   │   │   │   ├── corpus-manager.ts     # Test corpus management
│   │   │   │   └── coverage-feedback.ts  # Coverage-guided feedback
│   │   │   └── types/
│   │   │       ├── type-space.ts         # Type space types
│   │   │       ├── negative-space.ts     # Negative space types
│   │   │       ├── test-case.ts          # Generated test types
│   │   │       ├── constraint.ts         # Constraint types
│   │   │       └── config.ts             # Configuration types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── smt-solver/                   # SMT Solver Wrapper
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── z3-wrapper.ts         # Z3 WASM wrapper
│   │   │   ├── smtlib-generator.ts   # SMT-LIB format generation
│   │   │   ├── model-parser.ts       # Parse solver models
│   │   │   └── theories/
│   │   │       ├── integers.ts       # Integer theory
│   │   │       ├── reals.ts          # Real number theory
│   │   │       ├── bitvectors.ts     # Bitvector theory
│   │   │       ├── strings.ts        # String theory
│   │   │       └── arrays.ts         # Array theory
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── boundary-catalog/             # Boundary Value Catalog
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── javascript/
│   │   │   │   ├── number-boundaries.ts   # Number.MAX_SAFE_INTEGER, NaN, etc.
│   │   │   │   ├── string-boundaries.ts   # Empty, unicode, length limits
│   │   │   │   ├── array-boundaries.ts    # Empty, sparse, length limits
│   │   │   │   ├── date-boundaries.ts     # Epoch, invalid dates
│   │   │   │   └── object-boundaries.ts   # null, undefined, prototype
│   │   │   ├── python/
│   │   │   │   ├── numeric-boundaries.ts
│   │   │   │   ├── string-boundaries.ts
│   │   │   │   └── collection-boundaries.ts
│   │   │   ├── common/
│   │   │   │   ├── ieee754.ts             # IEEE 754 special values
│   │   │   │   ├── unicode.ts             # Unicode edge cases
│   │   │   │   └── temporal.ts            # Time-related boundaries
│   │   │   └── catalog.ts                 # Main catalog interface
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── shared/                       # Shared types and utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── utils/
│   │   │       ├── set-operations.ts
│   │   │       ├── type-guards.ts
│   │   │       └── async.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── package.json
│
├── boundary-data/                    # Boundary value databases
│   ├── ieee754.json                  # IEEE 754 special values
│   ├── unicode-edge-cases.json       # Unicode boundaries
│   ├── integer-boundaries.json       # Integer limits by language
│   ├── string-boundaries.json        # String edge cases
│   └── temporal-boundaries.json      # Date/time boundaries
│
├── docs/
│   ├── architecture.md               # System architecture
│   ├── negative-space-theory.md      # Negative space concepts
│   ├── type-space-model.md           # Type space modeling
│   ├── constraint-solving.md         # SMT solving approach
│   ├── api-reference.md              # API documentation
│   ├── cli-reference.md              # CLI commands
│   ├── vscode-extension.md           # Extension usage
│   ├── test-framework-integration.md # Framework integrations
│   └── commercial-licensing.md       # Commercial license info
│
├── scripts/
│   ├── setup.sh                      # Initial setup script
│   ├── download-z3.ts                # Z3 WASM downloader
│   ├── benchmark.ts                  # Performance benchmarking
│   └── generate-boundary-data.ts     # Boundary data generator
│
├── examples/
│   ├── basic-analysis/
│   ├── jest-integration/
│   ├── vitest-integration/
│   ├── pytest-integration/
│   └── custom-boundaries/
│
├── test-fixtures/
│   ├── functions/
│   │   ├── simple-validators/        # Simple validation functions
│   │   ├── string-processors/        # String manipulation
│   │   ├── numeric-calculators/      # Math functions
│   │   ├── data-transformers/        # Data transformation
│   │   └── async-handlers/           # Async functions
│   ├── expected-tests/               # Expected generated tests
│   └── boundary-cases/               # Boundary case examples
│
├── benchmarks/
│   ├── datasets/
│   │   ├── real-world-functions/
│   │   └── synthetic-functions/
│   ├── results/
│   └── run-benchmarks.ts
│
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root package.json (workspaces)
├── pnpm-workspace.yaml               # PNPM workspace config
├── tsconfig.json                     # Root TypeScript config
├── .eslintrc.js                      # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore
├── .nvmrc                            # Node version
├── LICENSE                           # AGPL-3.0 license
├── LICENSE-COMMERCIAL.md             # Commercial license terms
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── README.md                         # Project overview
```

### Phase 2: Configuration Files [EXECUTE IMMEDIATELY AFTER STRUCTURE]

Generate production-grade configurations:

#### `package.json` (root)
```json
{
  "name": "nstg-monorepo",
  "version": "0.0.0",
  "private": true,
  "description": "Negative Space Test Generation - Behavioral negative space analysis for automated test generation",
  "author": "Stevo <sgbilod@proton.me>",
  "license": "AGPL-3.0-or-later",
  "repository": {
    "type": "git",
    "url": "https://github.com/iamthegreatdestroyer/NSTG.git"
  },
  "homepage": "https://github.com/iamthegreatdestroyer/NSTG",
  "bugs": {
    "url": "https://github.com/iamthegreatdestroyer/NSTG/issues"
  },
  "keywords": [
    "test-generation",
    "negative-space",
    "property-based-testing",
    "boundary-testing",
    "smt-solver",
    "constraint-solving",
    "static-analysis",
    "fuzzing",
    "type-space",
    "invariant-detection"
  ],
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "lint:fix": "turbo lint:fix",
    "test": "turbo test",
    "test:coverage": "turbo test:coverage",
    "test:generated": "turbo test:generated",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install",
    "release": "changeset publish",
    "version": "changeset version",
    "benchmark": "tsx scripts/benchmark.ts",
    "download-z3": "tsx scripts/download-z3.ts"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@types/node": "^20.10.0",
    "eslint": "^8.56.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.0",
    "tsx": "^4.7.0",
    "turbo": "^1.12.0",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

#### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "*.vsix"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "lint:fix": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "test:coverage": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "test:generated": {
      "dependsOn": ["build"],
      "outputs": ["generated-tests/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Download Z3 WASM
        run: pnpm download-z3

      - name: Build
        run: pnpm build

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm typecheck

      - name: Test
        run: pnpm test:coverage

      - name: Test Generated Tests
        run: pnpm test:generated

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/core/coverage/lcov.info
          fail_ci_if_error: false

  nightly-fuzz:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Run fuzzing campaign
        run: pnpm nstg fuzz --duration 3600 --corpus ./fuzzing-corpus
        timeout-minutes: 70
```

### Phase 3: Core Package Implementation [EXECUTE SYSTEMATICALLY]

#### `packages/core/src/index.ts` - Public API
```typescript
/**
 * NSTG - Negative Space Test Generation
 * Behavioral negative space analysis for automated test generation
 * 
 * @packageDocumentation
 * @module @nstg/core
 * @license AGPL-3.0-or-later
 * 
 * Commercial licensing available at https://github.com/iamthegreatdestroyer/NSTG
 */

// Main Engine
export { NSTGEngine, type NSTGEngineConfig } from './engine/nstg-engine';
export { Analyzer } from './engine/analyzer';
export { TestGenerator } from './engine/generator';

// Type Space
export { TypeUniverse } from './type-space/type-universe';
export { TypeExtractor } from './type-space/type-extractor';
export { TypeLattice } from './type-space/type-lattice';
export { NumberSpace } from './type-space/primitive-spaces/number-space';
export { StringSpace } from './type-space/primitive-spaces/string-space';
export { SpecialValues } from './type-space/special-values';

// Negative Space
export { NegativeSpaceCalculator } from './negative-space/space-calculator';
export { CoverageTracker } from './negative-space/coverage-tracker';
export { GapDetector } from './negative-space/gap-detector';
export { BoundaryWalker } from './negative-space/boundary-walker';

// Constraint Solver
export { SMTBridge } from './constraint-solver/smt-bridge';
export { ConstraintBuilder } from './constraint-solver/constraint-builder';
export { ModelGenerator } from './constraint-solver/model-generator';

// Invariant Detection
export { InvariantMiner } from './invariant-detector/invariant-miner';
export { PreconditionInference } from './invariant-detector/precondition-inference';
export { PostconditionInference } from './invariant-detector/postcondition-inference';

// Test Generation
export { BoundaryTestGenerator } from './test-generator/boundary-tests';
export { InvariantTestGenerator } from './test-generator/invariant-tests';
export { PropertyTestGenerator } from './test-generator/property-tests';
export { ResourceTestGenerator } from './test-generator/resource-tests';
export { TemporalTestGenerator } from './test-generator/temporal-tests';

// Fuzzing
export { DirectedFuzzer } from './fuzzer/directed-fuzzer';
export { MutationEngine } from './fuzzer/mutation-engine';

// Types
export type { 
  TypeSpace, 
  TypeBoundary, 
  TypeRegion,
  PrimitiveType,
  CompositeType 
} from './types/type-space';

export type { 
  NegativeSpace, 
  CoverageGap,
  BoundaryCondition,
  UntestedRegion 
} from './types/negative-space';

export type { 
  GeneratedTest, 
  TestCase,
  TestSuite,
  TestFramework 
} from './types/test-case';

export type { 
  Constraint,
  SMTModel,
  SolverResult 
} from './types/constraint';

export type { NSTGConfig } from './types/config';

// Utilities
export { createNSTG } from './factory';
export { version } from './version';
```

#### `packages/core/src/type-space/type-universe.ts` - Type Universe Construction
```typescript
/**
 * Type Universe
 * 
 * Constructs the complete universe of valid inputs for a function
 * based on its type signature. This represents all possible inputs
 * that the type system considers valid.
 */

import type { 
  TypeSpace, 
  TypeBoundary, 
  TypeRegion,
  PrimitiveType,
  CompositeType 
} from '../types/type-space';
import { NumberSpace } from './primitive-spaces/number-space';
import { StringSpace } from './primitive-spaces/string-space';
import { SpecialValues } from './special-values';

export interface FunctionSignature {
  name: string;
  parameters: ParameterType[];
  returnType: TypeDescriptor;
  genericParams?: GenericParameter[];
}

export interface ParameterType {
  name: string;
  type: TypeDescriptor;
  optional: boolean;
  defaultValue?: unknown;
}

export interface TypeDescriptor {
  kind: 'primitive' | 'union' | 'intersection' | 'object' | 'array' | 'tuple' | 'function' | 'generic';
  value: PrimitiveType | UnionType | ObjectType | ArrayType | TupleType | GenericType;
}

export interface UnionType {
  members: TypeDescriptor[];
}

export interface ObjectType {
  properties: Record<string, PropertyType>;
  index?: IndexSignature;
}

export interface PropertyType {
  type: TypeDescriptor;
  optional: boolean;
  readonly: boolean;
}

export interface ArrayType {
  elementType: TypeDescriptor;
  minLength?: number;
  maxLength?: number;
}

export interface TupleType {
  elements: TypeDescriptor[];
  restElement?: TypeDescriptor;
}

export interface GenericType {
  name: string;
  constraint?: TypeDescriptor;
}

export interface GenericParameter {
  name: string;
  constraint?: TypeDescriptor;
  default?: TypeDescriptor;
}

export interface IndexSignature {
  keyType: 'string' | 'number' | 'symbol';
  valueType: TypeDescriptor;
}

export class TypeUniverse {
  private readonly numberSpace: NumberSpace;
  private readonly stringSpace: StringSpace;
  private readonly specialValues: SpecialValues;

  constructor() {
    this.numberSpace = new NumberSpace();
    this.stringSpace = new StringSpace();
    this.specialValues = new SpecialValues();
  }

  /**
   * Construct the type universe for a function signature
   */
  constructUniverse(signature: FunctionSignature): TypeSpace {
    const parameterSpaces = signature.parameters.map(param => 
      this.constructParameterSpace(param)
    );

    return {
      signature,
      parameters: parameterSpaces,
      totalCardinality: this.estimateCardinality(parameterSpaces),
      boundaries: this.extractBoundaries(parameterSpaces),
      regions: this.partitionIntoRegions(parameterSpaces),
    };
  }

  /**
   * Construct type space for a single parameter
   */
  private constructParameterSpace(param: ParameterType): TypeRegion {
    const space = this.constructTypeSpace(param.type);
    
    return {
      name: param.name,
      type: param.type,
      space,
      boundaries: this.getBoundaries(param.type),
      optional: param.optional,
      defaultValue: param.defaultValue,
    };
  }

  /**
   * Construct space for a type descriptor
   */
  private constructTypeSpace(type: TypeDescriptor): Set<unknown> | TypeRegion[] {
    switch (type.kind) {
      case 'primitive':
        return this.constructPrimitiveSpace(type.value as PrimitiveType);
      
      case 'union':
        return this.constructUnionSpace(type.value as UnionType);
      
      case 'object':
        return this.constructObjectSpace(type.value as ObjectType);
      
      case 'array':
        return this.constructArraySpace(type.value as ArrayType);
      
      case 'tuple':
        return this.constructTupleSpace(type.value as TupleType);
      
      default:
        return new Set();
    }
  }

  /**
   * Construct space for primitive types
   */
  private constructPrimitiveSpace(primitive: PrimitiveType): Set<unknown> {
    switch (primitive) {
      case 'number':
        return this.numberSpace.getAllValues();
      
      case 'string':
        return this.stringSpace.getAllValues();
      
      case 'boolean':
        return new Set([true, false]);
      
      case 'null':
        return new Set([null]);
      
      case 'undefined':
        return new Set([undefined]);
      
      case 'bigint':
        return this.numberSpace.getBigIntBoundaries();
      
      case 'symbol':
        return new Set([Symbol('test'), Symbol.for('test')]);
      
      default:
        return new Set();
    }
  }

  /**
   * Construct space for union types
   */
  private constructUnionSpace(union: UnionType): TypeRegion[] {
    return union.members.map((member, index) => ({
      name: `union_member_${index}`,
      type: member,
      space: this.constructTypeSpace(member),
      boundaries: this.getBoundaries(member),
      optional: false,
    }));
  }

  /**
   * Construct space for object types
   */
  private constructObjectSpace(obj: ObjectType): TypeRegion[] {
    const regions: TypeRegion[] = [];
    
    for (const [key, prop] of Object.entries(obj.properties)) {
      regions.push({
        name: key,
        type: prop.type,
        space: this.constructTypeSpace(prop.type),
        boundaries: this.getBoundaries(prop.type),
        optional: prop.optional,
      });
    }
    
    return regions;
  }

  /**
   * Construct space for array types
   */
  private constructArraySpace(arr: ArrayType): Set<unknown> {
    const elementSpace = this.constructTypeSpace(arr.elementType);
    const boundaries = new Set<unknown>();
    
    // Empty array
    boundaries.add([]);
    
    // Single element arrays with boundary values
    if (elementSpace instanceof Set) {
      for (const value of elementSpace) {
        boundaries.add([value]);
      }
    }
    
    // Length boundaries
    if (arr.minLength !== undefined) {
      boundaries.add(Array(arr.minLength).fill(null));
    }
    if (arr.maxLength !== undefined) {
      boundaries.add(Array(arr.maxLength).fill(null));
      boundaries.add(Array(arr.maxLength + 1).fill(null)); // Over limit
    }
    
    // Sparse array
    const sparse: unknown[] = [];
    sparse[100] = null;
    boundaries.add(sparse);
    
    return boundaries;
  }

  /**
   * Construct space for tuple types
   */
  private constructTupleSpace(tuple: TupleType): Set<unknown> {
    const boundaries = new Set<unknown>();
    
    // Cartesian product of element boundaries (limited)
    const elementBoundaries = tuple.elements.map(el => 
      Array.from(this.constructTypeSpace(el) instanceof Set 
        ? this.constructTypeSpace(el) as Set<unknown>
        : new Set())
    );
    
    // Generate boundary combinations
    const combinations = this.cartesianProduct(elementBoundaries);
    for (const combo of combinations.slice(0, 100)) { // Limit combinations
      boundaries.add(combo);
    }
    
    return boundaries;
  }

  /**
   * Get boundaries for a type
   */
  private getBoundaries(type: TypeDescriptor): TypeBoundary[] {
    const boundaries: TypeBoundary[] = [];
    
    if (type.kind === 'primitive') {
      const primitive = type.value as PrimitiveType;
      
      if (primitive === 'number') {
        boundaries.push(...this.numberSpace.getBoundaries());
      } else if (primitive === 'string') {
        boundaries.push(...this.stringSpace.getBoundaries());
      }
    }
    
    return boundaries;
  }

  /**
   * Extract all boundaries from parameter spaces
   */
  private extractBoundaries(paramSpaces: TypeRegion[]): TypeBoundary[] {
    const boundaries: TypeBoundary[] = [];
    
    for (const param of paramSpaces) {
      boundaries.push(...param.boundaries);
    }
    
    return boundaries;
  }

  /**
   * Partition type space into testable regions
   */
  private partitionIntoRegions(paramSpaces: TypeRegion[]): TypeRegion[] {
    // For now, return parameter spaces as regions
    // Future: Sophisticated partitioning based on code paths
    return paramSpaces;
  }

  /**
   * Estimate cardinality of combined type space
   */
  private estimateCardinality(paramSpaces: TypeRegion[]): number | 'infinite' {
    let total = 1;
    
    for (const param of paramSpaces) {
      if (param.space instanceof Set) {
        total *= param.space.size;
      } else {
        return 'infinite'; // Object/array spaces are infinite
      }
      
      if (total > Number.MAX_SAFE_INTEGER) {
        return 'infinite';
      }
    }
    
    return total;
  }

  /**
   * Cartesian product of arrays (limited)
   */
  private cartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];
    
    const [first, ...rest] = arrays;
    const restProduct = this.cartesianProduct(rest);
    
    const result: T[][] = [];
    for (const item of first.slice(0, 10)) { // Limit per dimension
      for (const restCombo of restProduct.slice(0, 10)) {
        result.push([item, ...restCombo]);
      }
    }
    
    return result;
  }
}
```

#### `packages/core/src/type-space/primitive-spaces/number-space.ts` - Number Type Space
```typescript
/**
 * Number Space
 * 
 * Defines the complete space of JavaScript number values,
 * including IEEE 754 special values and boundary conditions.
 */

import type { TypeBoundary } from '../../types/type-space';

export interface NumberBoundary {
  value: number;
  name: string;
  category: 'ieee754' | 'integer' | 'precision' | 'special';
  description: string;
  testReason: string;
}

export class NumberSpace {
  private readonly boundaries: NumberBoundary[];

  constructor() {
    this.boundaries = this.initializeBoundaries();
  }

  /**
   * Initialize all number boundary values
   */
  private initializeBoundaries(): NumberBoundary[] {
    return [
      // IEEE 754 Special Values
      {
        value: NaN,
        name: 'NaN',
        category: 'ieee754',
        description: 'Not a Number - result of undefined operations',
        testReason: 'NaN propagates through calculations and NaN !== NaN',
      },
      {
        value: Infinity,
        name: 'Infinity',
        category: 'ieee754',
        description: 'Positive infinity',
        testReason: 'Overflow behavior, division edge cases',
      },
      {
        value: -Infinity,
        name: '-Infinity',
        category: 'ieee754',
        description: 'Negative infinity',
        testReason: 'Underflow behavior, negative overflow',
      },
      {
        value: -0,
        name: '-0',
        category: 'ieee754',
        description: 'Negative zero (distinct from +0 in IEEE 754)',
        testReason: '-0 === 0 but 1/-0 === -Infinity',
      },

      // Integer Boundaries
      {
        value: 0,
        name: '0',
        category: 'integer',
        description: 'Zero',
        testReason: 'Division by zero, falsy value, array index',
      },
      {
        value: 1,
        name: '1',
        category: 'integer',
        description: 'One',
        testReason: 'Multiplicative identity, off-by-one boundary',
      },
      {
        value: -1,
        name: '-1',
        category: 'integer',
        description: 'Negative one',
        testReason: 'Sign change, array index -1 patterns',
      },
      {
        value: Number.MAX_SAFE_INTEGER,
        name: 'MAX_SAFE_INTEGER',
        category: 'integer',
        description: '2^53 - 1 = 9007199254740991',
        testReason: 'Precision loss boundary for integers',
      },
      {
        value: Number.MIN_SAFE_INTEGER,
        name: 'MIN_SAFE_INTEGER',
        category: 'integer',
        description: '-(2^53 - 1) = -9007199254740991',
        testReason: 'Negative precision loss boundary',
      },
      {
        value: Number.MAX_SAFE_INTEGER + 1,
        name: 'MAX_SAFE_INTEGER + 1',
        category: 'precision',
        description: 'First integer with precision loss',
        testReason: 'MAX_SAFE_INTEGER + 1 === MAX_SAFE_INTEGER + 2',
      },
      {
        value: Number.MAX_SAFE_INTEGER + 2,
        name: 'MAX_SAFE_INTEGER + 2',
        category: 'precision',
        description: 'Same as MAX_SAFE_INTEGER + 1 due to precision',
        testReason: 'Demonstrates precision loss',
      },

      // Float Boundaries
      {
        value: Number.MAX_VALUE,
        name: 'MAX_VALUE',
        category: 'ieee754',
        description: 'Largest positive finite number (~1.8e308)',
        testReason: 'Overflow to Infinity boundary',
      },
      {
        value: Number.MIN_VALUE,
        name: 'MIN_VALUE',
        category: 'ieee754',
        description: 'Smallest positive number (~5e-324)',
        testReason: 'Underflow to zero boundary',
      },
      {
        value: -Number.MAX_VALUE,
        name: '-MAX_VALUE',
        category: 'ieee754',
        description: 'Largest negative finite number',
        testReason: 'Negative overflow boundary',
      },
      {
        value: Number.EPSILON,
        name: 'EPSILON',
        category: 'precision',
        description: 'Smallest difference from 1 (~2.2e-16)',
        testReason: 'Floating point comparison precision',
      },

      // Common Application Boundaries
      {
        value: 2147483647,
        name: 'INT32_MAX',
        category: 'integer',
        description: '2^31 - 1 (32-bit signed int max)',
        testReason: 'Common in typed arrays, bitwise ops',
      },
      {
        value: -2147483648,
        name: 'INT32_MIN',
        category: 'integer',
        description: '-2^31 (32-bit signed int min)',
        testReason: 'Bitwise operations wrap around',
      },
      {
        value: 4294967295,
        name: 'UINT32_MAX',
        category: 'integer',
        description: '2^32 - 1 (32-bit unsigned max)',
        testReason: 'Array length limit, >>> operator',
      },
      {
        value: 255,
        name: 'UINT8_MAX',
        category: 'integer',
        description: '2^8 - 1 (byte max)',
        testReason: 'Color values, typed arrays',
      },

      // Precision Edge Cases
      {
        value: 0.1 + 0.2,
        name: '0.1 + 0.2',
        category: 'precision',
        description: '0.30000000000000004 (not 0.3)',
        testReason: 'Classic floating point precision issue',
      },
      {
        value: 0.1,
        name: '0.1',
        category: 'precision',
        description: 'Cannot be exactly represented in binary',
        testReason: 'Accumulation errors in loops',
      },

      // Special Computation Results
      {
        value: Math.PI,
        name: 'PI',
        category: 'special',
        description: 'Pi approximation',
        testReason: 'Trigonometric calculation base',
      },
      {
        value: Math.E,
        name: 'E',
        category: 'special',
        description: 'Euler\'s number',
        testReason: 'Exponential calculation base',
      },
    ];
  }

  /**
   * Get all boundary values as a Set
   */
  getAllValues(): Set<number> {
    return new Set(this.boundaries.map(b => b.value));
  }

  /**
   * Get boundaries in TypeBoundary format
   */
  getBoundaries(): TypeBoundary[] {
    return this.boundaries.map(b => ({
      value: b.value,
      name: b.name,
      description: b.description,
      category: b.category,
      testReason: b.testReason,
      type: 'number',
    }));
  }

  /**
   * Get BigInt boundary values
   */
  getBigIntBoundaries(): Set<bigint> {
    return new Set([
      0n,
      1n,
      -1n,
      BigInt(Number.MAX_SAFE_INTEGER),
      BigInt(Number.MIN_SAFE_INTEGER),
      BigInt(Number.MAX_SAFE_INTEGER) + 1n,
      BigInt(Number.MAX_SAFE_INTEGER) * 2n,
      2n ** 64n - 1n,  // UINT64_MAX
      2n ** 63n - 1n,  // INT64_MAX
      -(2n ** 63n),    // INT64_MIN
      2n ** 128n - 1n, // UINT128_MAX
      2n ** 256n - 1n, // Common in crypto
    ]);
  }

  /**
   * Get boundaries for a specific category
   */
  getBoundariesByCategory(category: NumberBoundary['category']): NumberBoundary[] {
    return this.boundaries.filter(b => b.category === category);
  }

  /**
   * Get values likely to cause issues for a specific operation
   */
  getProblematicValues(operation: 'division' | 'addition' | 'comparison' | 'bitwise'): number[] {
    switch (operation) {
      case 'division':
        return [0, -0, NaN, Infinity, -Infinity, Number.MIN_VALUE];
      
      case 'addition':
        return [
          Number.MAX_VALUE, 
          -Number.MAX_VALUE, 
          Number.MAX_SAFE_INTEGER,
          0.1, 0.2, // Precision issues
        ];
      
      case 'comparison':
        return [NaN, -0, 0, Number.EPSILON, 0.1 + 0.2];
      
      case 'bitwise':
        return [
          2147483647,  // INT32_MAX
          -2147483648, // INT32_MIN
          4294967295,  // UINT32_MAX
          NaN,         // Becomes 0
          Infinity,    // Becomes 0
        ];
      
      default:
        return Array.from(this.getAllValues());
    }
  }
}
```

#### `packages/core/src/negative-space/space-calculator.ts` - Negative Space Computation
```typescript
/**
 * Negative Space Calculator
 * 
 * Computes the "negative space" of a function - the set of valid inputs
 * according to the type system that are NOT covered by existing tests
 * or explicit handling in the code.
 * 
 * Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)
 */

import type { TypeSpace, TypeRegion, TypeBoundary } from '../types/type-space';
import type { 
  NegativeSpace, 
  CoverageGap, 
  BoundaryCondition,
  UntestedRegion 
} from '../types/negative-space';
import { TypeUniverse } from '../type-space/type-universe';
import { CoverageTracker } from './coverage-tracker';
import { GapDetector } from './gap-detector';
import { BoundaryWalker } from './boundary-walker';

export interface NegativeSpaceConfig {
  /** Include implicit type coercion in analysis */
  includeCoercion: boolean;
  /** Analyze temporal/async boundaries */
  analyzeTemporal: boolean;
  /** Analyze resource boundaries (memory, connections) */
  analyzeResources: boolean;
  /** Maximum number of regions to analyze */
  maxRegions: number;
}

const DEFAULT_CONFIG: NegativeSpaceConfig = {
  includeCoercion: true,
  analyzeTemporal: true,
  analyzeResources: true,
  maxRegions: 1000,
};

export interface ObservableBehavior {
  /** Values explicitly handled in conditionals */
  handledValues: Set<unknown>;
  /** Code paths exercised by existing tests */
  testedPaths: Set<string>;
  /** Type guards present in code */
  typeGuards: TypeGuard[];
  /** Explicit error handling */
  errorHandlers: ErrorHandler[];
}

export interface TypeGuard {
  parameter: string;
  condition: string;
  handledTypes: string[];
}

export interface ErrorHandler {
  type: 'throw' | 'return' | 'callback';
  condition?: string;
}

export class NegativeSpaceCalculator {
  private readonly config: NegativeSpaceConfig;
  private readonly typeUniverse: TypeUniverse;
  private readonly coverageTracker: CoverageTracker;
  private readonly gapDetector: GapDetector;
  private readonly boundaryWalker: BoundaryWalker;

  constructor(config: Partial<NegativeSpaceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.typeUniverse = new TypeUniverse();
    this.coverageTracker = new CoverageTracker();
    this.gapDetector = new GapDetector();
    this.boundaryWalker = new BoundaryWalker();
  }

  /**
   * Calculate the negative space for a function
   */
  calculate(
    typeSpace: TypeSpace,
    observableBehavior: ObservableBehavior
  ): NegativeSpace {
    // Step 1: Get all boundary values from type space
    const allBoundaries = this.collectAllBoundaries(typeSpace);

    // Step 2: Determine which boundaries are unhandled
    const unhandledBoundaries = this.findUnhandledBoundaries(
      allBoundaries,
      observableBehavior
    );

    // Step 3: Identify coverage gaps
    const coverageGaps = this.gapDetector.detectGaps(
      typeSpace,
      observableBehavior.testedPaths
    );

    // Step 4: Find untested regions
    const untestedRegions = this.findUntestedRegions(
      typeSpace,
      observableBehavior
    );

    // Step 5: Identify implicit invariants being violated
    const implicitInvariants = this.findImplicitInvariants(
      typeSpace,
      observableBehavior
    );

    // Step 6: Calculate negative space metrics
    const metrics = this.calculateMetrics(
      allBoundaries.length,
      unhandledBoundaries.length,
      coverageGaps.length,
      untestedRegions.length
    );

    return {
      typeSpace,
      unhandledBoundaries,
      coverageGaps,
      untestedRegions,
      implicitInvariants,
      metrics,
      recommendations: this.generateRecommendations(
        unhandledBoundaries,
        coverageGaps,
        untestedRegions
      ),
    };
  }

  /**
   * Collect all boundary values from type space
   */
  private collectAllBoundaries(typeSpace: TypeSpace): BoundaryCondition[] {
    const boundaries: BoundaryCondition[] = [];

    for (const region of typeSpace.regions) {
      for (const boundary of region.boundaries) {
        boundaries.push({
          parameter: region.name,
          boundary,
          category: this.categorizeBoundary(boundary),
          riskLevel: this.assessRiskLevel(boundary),
        });
      }

      // Add implicit boundaries based on type
      boundaries.push(...this.getImplicitBoundaries(region));
    }

    return boundaries;
  }

  /**
   * Find boundaries not explicitly handled in code
   */
  private findUnhandledBoundaries(
    allBoundaries: BoundaryCondition[],
    observableBehavior: ObservableBehavior
  ): BoundaryCondition[] {
    return allBoundaries.filter(boundary => {
      // Check if value is explicitly handled
      if (observableBehavior.handledValues.has(boundary.boundary.value)) {
        return false;
      }

      // Check if type guard covers this boundary
      for (const guard of observableBehavior.typeGuards) {
        if (guard.parameter === boundary.parameter) {
          if (this.typeGuardHandles(guard, boundary)) {
            return false;
          }
        }
      }

      // Boundary is not handled
      return true;
    });
  }

  /**
   * Find untested regions in type space
   */
  private findUntestedRegions(
    typeSpace: TypeSpace,
    observableBehavior: ObservableBehavior
  ): UntestedRegion[] {
    const regions: UntestedRegion[] = [];

    for (const region of typeSpace.regions) {
      const coverage = this.coverageTracker.getRegionCoverage(
        region,
        observableBehavior.testedPaths
      );

      if (coverage < 0.5) { // Less than 50% coverage
        regions.push({
          region,
          coverage,
          missingInputs: this.generateMissingInputs(region, observableBehavior),
          suggestedTests: this.suggestTestsForRegion(region),
        });
      }
    }

    return regions;
  }

  /**
   * Find implicit invariants the code assumes
   */
  private findImplicitInvariants(
    typeSpace: TypeSpace,
    observableBehavior: ObservableBehavior
  ): ImplicitInvariant[] {
    const invariants: ImplicitInvariant[] = [];

    // Check for missing null checks
    for (const region of typeSpace.regions) {
      if (this.couldBeNullish(region) && !this.hasNullCheck(region, observableBehavior)) {
        invariants.push({
          type: 'non-null',
          parameter: region.name,
          assumption: `${region.name} is assumed to be non-null/undefined`,
          risk: 'high',
          suggestedTest: `expect(() => fn(null)).toThrow()`,
        });
      }

      // Check for array non-empty assumptions
      if (this.isArrayType(region) && !this.hasEmptyCheck(region, observableBehavior)) {
        invariants.push({
          type: 'non-empty-array',
          parameter: region.name,
          assumption: `${region.name} is assumed to be non-empty`,
          risk: 'medium',
          suggestedTest: `expect(() => fn([])).toHandleGracefully()`,
        });
      }

      // Check for number range assumptions
      if (this.isNumberType(region) && !this.hasRangeCheck(region, observableBehavior)) {
        invariants.push({
          type: 'number-range',
          parameter: region.name,
          assumption: `${region.name} is assumed to be in valid range`,
          risk: 'medium',
          suggestedTest: `expect(() => fn(NaN)).toHandleGracefully()`,
        });
      }
    }

    return invariants;
  }

  /**
   * Get implicit boundaries based on type
   */
  private getImplicitBoundaries(region: TypeRegion): BoundaryCondition[] {
    const implicit: BoundaryCondition[] = [];

    // If type allows null/undefined, add those boundaries
    if (region.optional) {
      implicit.push({
        parameter: region.name,
        boundary: { value: undefined, name: 'undefined', description: 'Optional parameter omitted', category: 'special', testReason: 'Optional handling', type: 'undefined' },
        category: 'nullish',
        riskLevel: 'high',
      });
    }

    // Add coercion boundaries if enabled
    if (this.config.includeCoercion) {
      implicit.push(...this.getCoercionBoundaries(region));
    }

    return implicit;
  }

  /**
   * Get boundaries related to type coercion
   */
  private getCoercionBoundaries(region: TypeRegion): BoundaryCondition[] {
    const boundaries: BoundaryCondition[] = [];

    // Values that coerce to expected type but may cause issues
    if (this.isNumberType(region)) {
      boundaries.push(
        {
          parameter: region.name,
          boundary: { value: '123', name: 'numeric string', description: 'String that coerces to number', category: 'coercion', testReason: 'Implicit coercion', type: 'string' },
          category: 'coercion',
          riskLevel: 'medium',
        },
        {
          parameter: region.name,
          boundary: { value: true, name: 'boolean true', description: 'Boolean coerces to 1', category: 'coercion', testReason: 'Implicit coercion', type: 'boolean' },
          category: 'coercion',
          riskLevel: 'low',
        }
      );
    }

    return boundaries;
  }

  /**
   * Categorize a boundary
   */
  private categorizeBoundary(boundary: TypeBoundary): string {
    return boundary.category;
  }

  /**
   * Assess risk level of a boundary
   */
  private assessRiskLevel(boundary: TypeBoundary): 'critical' | 'high' | 'medium' | 'low' {
    // IEEE 754 special values are critical
    if (boundary.category === 'ieee754') {
      if (boundary.name === 'NaN' || boundary.name.includes('Infinity')) {
        return 'critical';
      }
    }

    // Precision boundaries are high risk
    if (boundary.category === 'precision') {
      return 'high';
    }

    // Integer boundaries are medium risk
    if (boundary.category === 'integer') {
      if (boundary.name.includes('MAX') || boundary.name.includes('MIN')) {
        return 'high';
      }
      return 'medium';
    }

    return 'low';
  }

  /**
   * Check if type guard handles a boundary
   */
  private typeGuardHandles(guard: TypeGuard, boundary: BoundaryCondition): boolean {
    // Simple heuristic - check if guard condition mentions the value
    const valueStr = String(boundary.boundary.value);
    return guard.condition.includes(valueStr) || 
           guard.condition.includes(boundary.boundary.name);
  }

  /**
   * Generate missing input values for a region
   */
  private generateMissingInputs(
    region: TypeRegion,
    observableBehavior: ObservableBehavior
  ): unknown[] {
    const missing: unknown[] = [];
    
    if (region.space instanceof Set) {
      for (const value of region.space) {
        if (!observableBehavior.handledValues.has(value)) {
          missing.push(value);
        }
      }
    }

    return missing.slice(0, 20); // Limit to 20 suggestions
  }

  /**
   * Suggest tests for a region
   */
  private suggestTestsForRegion(region: TypeRegion): string[] {
    const suggestions: string[] = [];

    for (const boundary of region.boundaries.slice(0, 5)) {
      suggestions.push(
        `test('handles ${boundary.name}', () => { fn(${JSON.stringify(boundary.value)}); })`
      );
    }

    return suggestions;
  }

  /**
   * Calculate negative space metrics
   */
  private calculateMetrics(
    totalBoundaries: number,
    unhandledBoundaries: number,
    coverageGaps: number,
    untestedRegions: number
  ): NegativeSpaceMetrics {
    const boundaryHandlingRate = totalBoundaries > 0 
      ? (totalBoundaries - unhandledBoundaries) / totalBoundaries 
      : 1;

    return {
      totalBoundaries,
      unhandledBoundaries,
      boundaryHandlingRate,
      coverageGaps,
      untestedRegions,
      negativeSpaceRatio: unhandledBoundaries / Math.max(totalBoundaries, 1),
      riskScore: this.calculateRiskScore(unhandledBoundaries, coverageGaps),
    };
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(unhandled: number, gaps: number): number {
    return Math.min(100, (unhandled * 5) + (gaps * 10));
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    unhandledBoundaries: BoundaryCondition[],
    coverageGaps: CoverageGap[],
    untestedRegions: UntestedRegion[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Critical boundaries first
    const critical = unhandledBoundaries.filter(b => b.riskLevel === 'critical');
    if (critical.length > 0) {
      recommendations.push({
        priority: 'critical',
        type: 'boundary',
        message: `${critical.length} critical boundary conditions are unhandled`,
        items: critical.map(b => b.boundary.name),
      });
    }

    // Coverage gaps
    if (coverageGaps.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'coverage',
        message: `${coverageGaps.length} code paths have no test coverage`,
        items: coverageGaps.map(g => g.description),
      });
    }

    // Untested regions
    if (untestedRegions.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'region',
        message: `${untestedRegions.length} type regions are under-tested`,
        items: untestedRegions.map(r => r.region.name),
      });
    }

    return recommendations;
  }

  // Type checking helpers
  private couldBeNullish(region: TypeRegion): boolean {
    return region.optional || region.type.kind === 'union';
  }

  private hasNullCheck(region: TypeRegion, behavior: ObservableBehavior): boolean {
    return behavior.typeGuards.some(
      g => g.parameter === region.name && 
           (g.condition.includes('null') || g.condition.includes('undefined'))
    );
  }

  private isArrayType(region: TypeRegion): boolean {
    return region.type.kind === 'array';
  }

  private hasEmptyCheck(region: TypeRegion, behavior: ObservableBehavior): boolean {
    return behavior.typeGuards.some(
      g => g.parameter === region.name && g.condition.includes('length')
    );
  }

  private isNumberType(region: TypeRegion): boolean {
    return region.type.kind === 'primitive' && region.type.value === 'number';
  }

  private hasRangeCheck(region: TypeRegion, behavior: ObservableBehavior): boolean {
    return behavior.typeGuards.some(
      g => g.parameter === region.name && 
           (g.condition.includes('isNaN') || g.condition.includes('isFinite'))
    );
  }
}

export interface ImplicitInvariant {
  type: string;
  parameter: string;
  assumption: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  suggestedTest: string;
}

export interface NegativeSpaceMetrics {
  totalBoundaries: number;
  unhandledBoundaries: number;
  boundaryHandlingRate: number;
  coverageGaps: number;
  untestedRegions: number;
  negativeSpaceRatio: number;
  riskScore: number;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'boundary' | 'coverage' | 'region' | 'invariant';
  message: string;
  items: string[];
}
```

#### `packages/core/src/test-generator/boundary-tests.ts` - Boundary Test Generation
```typescript
/**
 * Boundary Test Generator
 * 
 * Generates tests specifically targeting boundary conditions
 * identified through negative space analysis.
 */

import type { BoundaryCondition } from '../types/negative-space';
import type { GeneratedTest, TestCase, TestFramework } from '../types/test-case';
import { NumberSpace } from '../type-space/primitive-spaces/number-space';
import { StringSpace } from '../type-space/primitive-spaces/string-space';

export interface BoundaryTestConfig {
  /** Target test framework */
  framework: TestFramework;
  /** Include explanation comments */
  includeComments: boolean;
  /** Group tests by boundary category */
  groupByCategory: boolean;
  /** Custom assertion style */
  assertionStyle: 'expect' | 'assert' | 'should';
}

const DEFAULT_CONFIG: BoundaryTestConfig = {
  framework: 'jest',
  includeComments: true,
  groupByCategory: true,
  assertionStyle: 'expect',
};

export class BoundaryTestGenerator {
  private readonly config: BoundaryTestConfig;
  private readonly numberSpace: NumberSpace;
  private readonly stringSpace: StringSpace;

  constructor(config: Partial<BoundaryTestConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.numberSpace = new NumberSpace();
    this.stringSpace = new StringSpace();
  }

  /**
   * Generate boundary tests for a function
   */
  generate(
    functionName: string,
    boundaries: BoundaryCondition[],
    functionCode: string
  ): GeneratedTest {
    const testCases: TestCase[] = [];

    // Group by category if configured
    if (this.config.groupByCategory) {
      const grouped = this.groupByCategory(boundaries);
      
      for (const [category, categoryBoundaries] of Object.entries(grouped)) {
        testCases.push(...this.generateCategoryTests(
          functionName,
          category,
          categoryBoundaries
        ));
      }
    } else {
      testCases.push(...boundaries.map(b => 
        this.generateSingleTest(functionName, b)
      ));
    }

    return {
      functionName,
      framework: this.config.framework,
      testCases,
      imports: this.generateImports(),
      setup: this.generateSetup(functionName, functionCode),
      teardown: this.generateTeardown(),
    };
  }

  /**
   * Group boundaries by category
   */
  private groupByCategory(
    boundaries: BoundaryCondition[]
  ): Record<string, BoundaryCondition[]> {
    const grouped: Record<string, BoundaryCondition[]> = {};

    for (const boundary of boundaries) {
      const category = boundary.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(boundary);
    }

    return grouped;
  }

  /**
   * Generate tests for a category of boundaries
   */
  private generateCategoryTests(
    functionName: string,
    category: string,
    boundaries: BoundaryCondition[]
  ): TestCase[] {
    return boundaries.map(boundary => 
      this.generateSingleTest(functionName, boundary, category)
    );
  }

  /**
   * Generate a single boundary test
   */
  private generateSingleTest(
    functionName: string,
    boundary: BoundaryCondition,
    category?: string
  ): TestCase {
    const testName = this.generateTestName(boundary);
    const input = this.serializeValue(boundary.boundary.value);
    const expectedBehavior = this.inferExpectedBehavior(boundary);
    
    let assertion: string;
    let comment: string;

    switch (expectedBehavior) {
      case 'should-throw':
        assertion = this.generateThrowAssertion(functionName, input);
        comment = `// ${boundary.boundary.name}: Expected to throw for invalid input`;
        break;
      
      case 'should-handle-gracefully':
        assertion = this.generateGracefulAssertion(functionName, input);
        comment = `// ${boundary.boundary.name}: Should handle gracefully without crashing`;
        break;
      
      case 'should-return-specific':
        assertion = this.generateReturnAssertion(functionName, input, boundary);
        comment = `// ${boundary.boundary.name}: Should return specific value for boundary`;
        break;
      
      default:
        assertion = this.generateNoThrowAssertion(functionName, input);
        comment = `// ${boundary.boundary.name}: Should not throw`;
    }

    const code = this.config.includeComments 
      ? `${comment}\n    ${assertion}`
      : assertion;

    return {
      name: testName,
      code,
      boundary,
      category: category ?? boundary.category,
      riskLevel: boundary.riskLevel,
      description: boundary.boundary.testReason,
    };
  }

  /**
   * Generate test name from boundary
   */
  private generateTestName(boundary: BoundaryCondition): string {
    const paramName = boundary.parameter;
    const boundaryName = boundary.boundary.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    
    return `handles ${paramName} with ${boundaryName}`;
  }

  /**
   * Serialize a value for test code
   */
  private serializeValue(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (Number.isNaN(value as number)) return 'NaN';
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    if (Object.is(value, -0)) return '-0';
    if (typeof value === 'bigint') return `${value}n`;
    if (typeof value === 'symbol') return `Symbol('${(value as symbol).description}')`;
    if (typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) {
      if (this.isSparseArray(value)) {
        return this.serializeSparseArray(value);
      }
      return `[${value.map(v => this.serializeValue(v)).join(', ')}]`;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Check if array is sparse
   */
  private isSparseArray(arr: unknown[]): boolean {
    for (let i = 0; i < arr.length; i++) {
      if (!(i in arr)) return true;
    }
    return false;
  }

  /**
   * Serialize sparse array
   */
  private serializeSparseArray(arr: unknown[]): string {
    const entries: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) {
        entries.push(`[${i}]: ${this.serializeValue(arr[i])}`);
      }
    }
    return `(() => { const arr = []; ${entries.map(e => `arr${e}`).join('; ')}; arr.length = ${arr.length}; return arr; })()`;
  }

  /**
   * Infer expected behavior for a boundary
   */
  private inferExpectedBehavior(
    boundary: BoundaryCondition
  ): 'should-throw' | 'should-handle-gracefully' | 'should-return-specific' | 'should-not-throw' {
    const { value, name } = boundary.boundary;

    // NaN typically should be handled gracefully or throw
    if (Number.isNaN(value as number)) {
      return 'should-handle-gracefully';
    }

    // Infinity values need explicit handling
    if (value === Infinity || value === -Infinity) {
      return 'should-handle-gracefully';
    }

    // Null/undefined for non-optional params should throw
    if (value === null || value === undefined) {
      return 'should-throw';
    }

    // Empty arrays/strings might need special handling
    if ((Array.isArray(value) && value.length === 0) || value === '') {
      return 'should-handle-gracefully';
    }

    return 'should-not-throw';
  }

  /**
   * Generate assertion that expects throw
   */
  private generateThrowAssertion(functionName: string, input: string): string {
    switch (this.config.assertionStyle) {
      case 'assert':
        return `assert.throws(() => ${functionName}(${input}))`;
      case 'should':
        return `(() => ${functionName}(${input})).should.throw()`;
      default:
        return `expect(() => ${functionName}(${input})).toThrow()`;
    }
  }

  /**
   * Generate assertion for graceful handling
   */
  private generateGracefulAssertion(functionName: string, input: string): string {
    switch (this.config.assertionStyle) {
      case 'assert':
        return `assert.doesNotThrow(() => ${functionName}(${input}))`;
      case 'should':
        return `(() => ${functionName}(${input})).should.not.throw()`;
      default:
        return `expect(() => ${functionName}(${input})).not.toThrow()`;
    }
  }

  /**
   * Generate assertion for specific return value
   */
  private generateReturnAssertion(
    functionName: string, 
    input: string,
    boundary: BoundaryCondition
  ): string {
    // For now, just check it doesn't throw - more sophisticated inference later
    return this.generateGracefulAssertion(functionName, input);
  }

  /**
   * Generate assertion that expects no throw
   */
  private generateNoThrowAssertion(functionName: string, input: string): string {
    return this.generateGracefulAssertion(functionName, input);
  }

  /**
   * Generate imports for test file
   */
  private generateImports(): string[] {
    switch (this.config.framework) {
      case 'jest':
        return []; // Jest globals are available
      case 'vitest':
        return ["import { describe, test, expect } from 'vitest'"];
      case 'mocha':
        return [
          "import { describe, it } from 'mocha'",
          "import { expect } from 'chai'",
        ];
      case 'pytest':
        return ['import pytest'];
      default:
        return [];
    }
  }

  /**
   * Generate setup code
   */
  private generateSetup(functionName: string, functionCode: string): string {
    return `// Function under test
${functionCode}`;
  }

  /**
   * Generate teardown code
   */
  private generateTeardown(): string {
    return ''; // No teardown needed for boundary tests
  }

  /**
   * Render complete test file
   */
  renderTestFile(generatedTest: GeneratedTest): string {
    const { functionName, testCases, imports, setup } = generatedTest;
    
    let output = '';

    // Imports
    if (imports.length > 0) {
      output += imports.join('\n') + '\n\n';
    }

    // Setup
    if (setup) {
      output += setup + '\n\n';
    }

    // Test suite
    output += `describe('${functionName} - Negative Space Boundary Tests', () => {\n`;

    // Group by category
    const byCategory = this.groupTestsByCategory(testCases);
    
    for (const [category, tests] of Object.entries(byCategory)) {
      output += `\n  describe('${this.formatCategoryName(category)}', () => {\n`;
      
      for (const test of tests) {
        const testKeyword = this.config.framework === 'mocha' ? 'it' : 'test';
        output += `\n    ${testKeyword}('${test.name}', () => {\n`;
        output += `      ${test.code}\n`;
        output += `    });\n`;
      }
      
      output += `  });\n`;
    }

    output += `});\n`;

    return output;
  }

  /**
   * Group test cases by category
   */
  private groupTestsByCategory(tests: TestCase[]): Record<string, TestCase[]> {
    const grouped: Record<string, TestCase[]> = {};

    for (const test of tests) {
      const category = test.category ?? 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(test);
    }

    return grouped;
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(category: string): string {
    return category
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
```

### Phase 4: CLI Application [EXECUTE AFTER CORE]

#### `apps/cli/src/index.ts`
```typescript
#!/usr/bin/env node
/**
 * NSTG CLI - Negative Space Test Generation Command Line Interface
 * 
 * @license AGPL-3.0-or-later
 */

import { Command } from 'commander';
import { version } from '@nstg/core';
import { analyzeCommand } from './commands/analyze';
import { generateCommand } from './commands/generate';
import { fuzzCommand } from './commands/fuzz';
import { reportCommand } from './commands/report';
import { watchCommand } from './commands/watch';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('nstg')
  .description('Negative Space Test Generation - Find what your tests miss')
  .version(version)
  .option('-v, --verbose', 'Enable verbose output')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--no-color', 'Disable colored output');

program.addCommand(analyzeCommand);
program.addCommand(generateCommand);
program.addCommand(fuzzCommand);
program.addCommand(reportCommand);
program.addCommand(watchCommand);
program.addCommand(initCommand);

program.parse();
```

#### `apps/cli/src/commands/generate.ts`
```typescript
/**
 * Generate command - Generate tests from negative space analysis
 */

import { Command } from 'commander';
import { NSTGEngine, BoundaryTestGenerator, type GeneratedTest } from '@nstg/core';
import ora from 'ora';
import chalk from 'chalk';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join, basename } from 'path';

export const generateCommand = new Command('generate')
  .description('Generate tests targeting negative space')
  .argument('<file>', 'Source file to analyze')
  .option('-o, --output <path>', 'Output file path (default: <file>.nstg.test.ts)')
  .option('-f, --framework <framework>', 'Test framework (jest|vitest|mocha|pytest)', 'jest')
  .option('--function <name>', 'Specific function to analyze')
  .option('--all-functions', 'Generate tests for all exported functions')
  .option('--boundary-only', 'Generate only boundary tests')
  .option('--invariant-only', 'Generate only invariant tests')
  .option('--include-coercion', 'Include type coercion tests', true)
  .option('--dry-run', 'Show generated tests without writing')
  .option('--append', 'Append to existing test file')
  .action(async (file: string, options) => {
    const spinner = ora('Initializing NSTG engine...').start();
    
    try {
      const engine = await NSTGEngine.create({
        includeCoercion: options.includeCoercion,
      });

      spinner.text = `Analyzing ${file}...`;
      const analysis = await engine.analyzeFile(file, {
        functionName: options.function,
        allFunctions: options.allFunctions,
      });

      if (analysis.functions.length === 0) {
        spinner.fail('No functions found to analyze');
        process.exit(1);
      }

      spinner.text = `Found ${analysis.functions.length} function(s), generating tests...`;

      const generator = new BoundaryTestGenerator({
        framework: options.framework,
        includeComments: true,
        groupByCategory: true,
      });

      const generatedTests: GeneratedTest[] = [];

      for (const func of analysis.functions) {
        const negativeSpace = await engine.calculateNegativeSpace(func);
        
        // Generate boundary tests
        if (!options.invariantOnly) {
          const boundaryTests = generator.generate(
            func.name,
            negativeSpace.unhandledBoundaries,
            func.code
          );
          generatedTests.push(boundaryTests);
        }

        // Generate invariant tests
        if (!options.boundaryOnly && negativeSpace.implicitInvariants.length > 0) {
          // TODO: InvariantTestGenerator
        }
      }

      // Render test files
      const testContent = generatedTests
        .map(test => generator.renderTestFile(test))
        .join('\n\n');

      // Summary
      const totalTests = generatedTests.reduce(
        (sum, t) => sum + t.testCases.length, 
        0
      );

      spinner.succeed(`Generated ${totalTests} tests for ${analysis.functions.length} function(s)`);

      if (options.dryRun) {
        console.log(chalk.cyan('\n--- Generated Tests ---\n'));
        console.log(testContent);
        console.log(chalk.cyan('\n--- End Generated Tests ---\n'));
      } else {
        const outputPath = options.output ?? generateOutputPath(file, options.framework);
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, testContent);
        console.log(chalk.green(`✓ Written to ${outputPath}`));
      }

      // Print summary
      printSummary(analysis, generatedTests);

    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

function generateOutputPath(inputFile: string, framework: string): string {
  const base = basename(inputFile, '.ts').replace('.js', '');
  const ext = framework === 'pytest' ? '.py' : '.ts';
  return join(dirname(inputFile), '__tests__', `${base}.nstg.test${ext}`);
}

function printSummary(analysis: any, generatedTests: GeneratedTest[]): void {
  console.log(chalk.bold('\n📊 Generation Summary\n'));

  for (const test of generatedTests) {
    console.log(chalk.cyan(`  ${test.functionName}:`));
    
    // Group by risk level
    const byCritical = test.testCases.filter(t => t.riskLevel === 'critical').length;
    const byHigh = test.testCases.filter(t => t.riskLevel === 'high').length;
    const byMedium = test.testCases.filter(t => t.riskLevel === 'medium').length;
    const byLow = test.testCases.filter(t => t.riskLevel === 'low').length;

    if (byCritical > 0) console.log(chalk.red(`    🔴 Critical: ${byCritical} tests`));
    if (byHigh > 0) console.log(chalk.yellow(`    🟠 High: ${byHigh} tests`));
    if (byMedium > 0) console.log(chalk.blue(`    🟡 Medium: ${byMedium} tests`));
    if (byLow > 0) console.log(chalk.gray(`    ⚪ Low: ${byLow} tests`));

    console.log();
  }

  console.log(chalk.dim('Run the generated tests to discover unhandled edge cases.'));
}
```

### Phase 5: VS Code Extension [EXECUTE AFTER CLI]

#### `apps/vscode/package.json`
```json
{
  "name": "nstg-vscode",
  "displayName": "NSTG - Negative Space Test Generation",
  "description": "Find what your tests miss - Generate tests for unhandled edge cases",
  "version": "0.0.1",
  "publisher": "iamthegreatdestroyer",
  "repository": {
    "type": "git",
    "url": "https://github.com/iamthegreatdestroyer/NSTG.git"
  },
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Testing",
    "Linters",
    "Other"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "nstg.analyzeFunction",
        "title": "NSTG: Analyze Function"
      },
      {
        "command": "nstg.generateTests",
        "title": "NSTG: Generate Tests"
      },
      {
        "command": "nstg.showTypeSpace",
        "title": "NSTG: Show Type Space"
      },
      {
        "command": "nstg.exploreBoundaries",
        "title": "NSTG: Explore Boundaries"
      },
      {
        "command": "nstg.showNegativeSpace",
        "title": "NSTG: Show Negative Space Report"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "nstgNegativeSpace",
          "name": "Negative Space"
        }
      ]
    },
    "menus": {
      "editor/context": [
        {
          "command": "nstg.analyzeFunction",
          "when": "editorTextFocus && resourceLangId =~ /typescript|javascript|python/",
          "group": "nstg@1"
        },
        {
          "command": "nstg.generateTests",
          "when": "editorTextFocus && resourceLangId =~ /typescript|javascript|python/",
          "group": "nstg@2"
        }
      ]
    },
    "configuration": {
      "title": "NSTG",
      "properties": {
        "nstg.framework": {
          "type": "string",
          "default": "jest",
          "enum": ["jest", "vitest", "mocha", "pytest"],
          "description": "Default test framework for generated tests"
        },
        "nstg.showCodeLens": {
          "type": "boolean",
          "default": true,
          "description": "Show negative space indicators as CodeLens"
        },
        "nstg.showDiagnostics": {
          "type": "boolean",
          "default": true,
          "description": "Show diagnostics for unhandled boundaries"
        },
        "nstg.includeCoercion": {
          "type": "boolean",
          "default": true,
          "description": "Include type coercion boundaries in analysis"
        },
        "nstg.autoAnalyze": {
          "type": "boolean",
          "default": false,
          "description": "Automatically analyze files on save"
        }
      }
    },
    "colors": [
      {
        "id": "nstg.boundaryHighlight",
        "description": "Highlight color for unhandled boundaries",
        "defaults": { "dark": "#ff6b6b40", "light": "#dc354540" }
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "pnpm run build",
    "build": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node",
    "watch": "pnpm run build --watch",
    "package": "vsce package --no-dependencies",
    "publish": "vsce publish --no-dependencies"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@vscode/vsce": "^2.22.0",
    "esbuild": "^0.19.0"
  },
  "dependencies": {
    "@nstg/core": "workspace:*"
  }
}
```

---

## 🚀 EXECUTION INSTRUCTIONS

### IMMEDIATE ACTIONS (Execute in Order):

1. **Clone & Initialize**
   ```bash
   git clone https://github.com/iamthegreatdestroyer/NSTG.git
   cd NSTG
   pnpm install
   ```

2. **Create Complete Directory Structure**
   Generate all directories and placeholder files as specified above.

3. Download Z3 WASM

bash   pnpm download-z3

Generate All Configuration Files
Create every config file with production-ready settings.
Implement Core NSTG Engine
Build out packages/core with:

Type space modeling
Negative space calculator
Boundary catalog
SMT solver integration


Build CLI Application
Implement all commands in apps/cli.
Create VS Code Extension
Set up extension structure in apps/vscode.
Build Boundary Catalog
Populate packages/boundary-catalog with comprehensive boundary values.
Write Comprehensive Tests
Create test suites with known boundary test fixtures.
Generate Documentation
Write all markdown documentation files.

AUTONOMY PARAMETERS

DO NOT ask for confirmation on standard architectural decisions
DO use TypeScript strict mode throughout
DO implement error handling and logging from the start
DO add JSDoc comments with boundary examples
DO create meaningful git commits after each phase
DO run linting and type checking before committing
DO include comprehensive boundary value catalogs
PRIORITIZE working code over perfect code (iterate later)

QUALITY GATES
Before marking any phase complete:

 All files compile without errors
 ESLint passes with no warnings
 Boundary tests for IEEE 754 special values pass
 Generated tests are syntactically valid
 README accurately describes current state


📊 SUCCESS METRICS
The scaffolding is complete when:

pnpm install succeeds
pnpm build produces outputs for all packages
pnpm test runs boundary catalog tests
pnpm lint passes
nstg analyze --help shows command help
VS Code extension loads without errors
Sample function generates valid boundary tests


🔐 LICENSING BOILERPLATE
Include at the top of every source file:
typescript/**
 * NSTG - Negative Space Test Generation
 * Copyright (C) 2026 Stevo (sgbilod)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Commercial licensing available at https://github.com/iamthegreatdestroyer/NSTG
 * 
 * @license AGPL-3.0-or-later
 */

📐 CONCEPTUAL FOUNDATIONS REFERENCE
Negative Space Imaging Principle
Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)

Where:
- Universe = All inputs valid according to type system
- Observable_Behavior = Inputs explicitly handled or tested
- Negative_Space = Untested valid inputs (the "dark matter")
Type Space Hierarchy
Type_Universe
├── Primitive_Types
│   ├── number (IEEE 754 space)
│   │   ├── Special: NaN, ±Infinity, -0
│   │   ├── Boundaries: MAX_SAFE_INTEGER, MIN_VALUE, EPSILON
│   │   └── Precision: 0.1 + 0.2 ≠ 0.3
│   ├── string (Unicode space)
│   │   ├── Empty: ""
│   │   ├── Unicode: ZWJ, RTL markers, surrogates
│   │   └── Length: MAX_STRING_LENGTH
│   ├── boolean: {true, false}
│   └── nullish: {null, undefined}
├── Composite_Types
│   ├── Array (element_type × length_space)
│   ├── Object (property_space)
│   └── Union (member₁ ∪ member₂ ∪ ...)
└── Special_Spaces
    ├── Temporal (timing assumptions)
    └── Resource (memory, connections)
Boundary Classification
┌─────────────────────────────────────────────────────────────┐
│ Risk Level │ Category     │ Examples                       │
├─────────────────────────────────────────────────────────────┤
│ CRITICAL   │ IEEE 754     │ NaN, Infinity, -0              │
│ HIGH       │ Precision    │ MAX_SAFE_INTEGER + 1, 0.1+0.2  │
│ HIGH       │ Nullish      │ null, undefined (when invalid) │
│ MEDIUM     │ Boundaries   │ Empty string, empty array      │
│ MEDIUM     │ Integer      │ INT32_MAX, UINT8_MAX           │
│ LOW        │ Coercion     │ "123" → 123, true → 1          │
└─────────────────────────────────────────────────────────────┘
SMT Constraint Generation Pattern
// For function: function divide(a: number, b: number): number
// SMT Constraints:

(declare-const a Real)
(declare-const b Real)

; Type space constraints
(assert (is-number a))
(assert (is-number b))

; Negative space query: Find inputs NOT in observed behavior
(assert (not (or
  ; Observed: b > 0 handled
  (> b 0)
  ; Observed: b < 0 handled  
  (< b 0)
)))

; This will find: b = 0, b = NaN, etc.
(check-sat)
(get-model)

🗂️ BOUNDARY DATA FILES
boundary-data/ieee754.json
json{
  "special_values": [
    { "value": "NaN", "js": "NaN", "description": "Not a Number" },
    { "value": "+Infinity", "js": "Infinity", "description": "Positive infinity" },
    { "value": "-Infinity", "js": "-Infinity", "description": "Negative infinity" },
    { "value": "-0", "js": "-0", "description": "Negative zero" }
  ],
  "precision_boundaries": [
    { "name": "MAX_SAFE_INTEGER", "value": 9007199254740991 },
    { "name": "MIN_SAFE_INTEGER", "value": -9007199254740991 },
    { "name": "MAX_VALUE", "value": "1.7976931348623157e+308" },
    { "name": "MIN_VALUE", "value": "5e-324" },
    { "name": "EPSILON", "value": "2.220446049250313e-16" }
  ],
  "precision_issues": [
    { "expression": "0.1 + 0.2", "expected": 0.3, "actual": 0.30000000000000004 },
    { "expression": "0.1 + 0.7", "expected": 0.8, "actual": 0.7999999999999999 }
  ]
}
boundary-data/unicode-edge-cases.json
json{
  "control_characters": [
    { "name": "NUL", "codepoint": "U+0000", "js": "\\u0000" },
    { "name": "BEL", "codepoint": "U+0007", "js": "\\u0007" },
    { "name": "TAB", "codepoint": "U+0009", "js": "\\t" },
    { "name": "LF", "codepoint": "U+000A", "js": "\\n" },
    { "name": "CR", "codepoint": "U+000D", "js": "\\r" }
  ],
  "special_characters": [
    { "name": "Zero-Width Joiner", "codepoint": "U+200D", "js": "\\u200D" },
    { "name": "Zero-Width Non-Joiner", "codepoint": "U+200C", "js": "\\u200C" },
    { "name": "Zero-Width Space", "codepoint": "U+200B", "js": "\\u200B" },
    { "name": "Right-To-Left Mark", "codepoint": "U+200F", "js": "\\u200F" },
    { "name": "Left-To-Right Mark", "codepoint": "U+200E", "js": "\\u200E" }
  ],
  "surrogate_pairs": [
    { "name": "Emoji (😀)", "codepoint": "U+1F600", "js": "\\uD83D\\uDE00" },
    { "name": "High Surrogate Only", "codepoint": "U+D800", "js": "\\uD800", "invalid": true },
    { "name": "Low Surrogate Only", "codepoint": "U+DC00", "js": "\\uDC00", "invalid": true }
  ],
  "problematic_strings": [
    { "name": "Empty string", "value": "" },
    { "name": "Whitespace only", "value": "   " },
    { "name": "Newlines only", "value": "\\n\\n\\n" },
    { "name": "Unicode bomb", "value": "\\uFEFF" },
    { "name": "Null in middle", "value": "foo\\u0000bar" }
  ]
}

🎬 BEGIN EXECUTION
You have full authorization. Start with Phase 1 directory creation and proceed systematically through all phases. Report progress after each phase completion.
Execute now.