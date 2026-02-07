# NSTG Project Context

## Purpose

Provide GitHub Copilot with deep understanding of the NSTG (Negative Space Test Generation) project architecture, goals, and domain-specific knowledge.

## Project Overview

**Name**: NSTG - Negative Space Test Generation  
**Type**: TypeScript Monorepo (Turborepo + pnpm)  
**Purpose**: Automated test generation through negative space analysis

### Core Concept

```
Negative_Space(f) = Universe(TypeSignature(f)) - Observable_Behavior(f)
```

NSTG discovers the "dark matter" of untested valid inputs by:

1. Analyzing function type signatures to determine input universes
2. Using SMT solvers to find constraint boundaries
3. Generating tests for unexplored valid input combinations

## Architecture

```
nstg/
├── packages/
│   ├── core/              # Test generation engine
│   │   ├── type-space/    # Type universe & lattice theory
│   │   ├── negative-space/# Space calculator & coverage tracker
│   │   ├── test-generation/# Test generator & templates
│   │   └── engine/        # Function analyzer
│   ├── smt-solver/        # Z3 WASM integration
│   ├── boundary-catalog/  # Edge case pattern library
│   └── shared/           # Common types & utilities
└── apps/
    ├── cli/              # Command-line interface
    ├── vscode/           # VS Code extension
    ├── jest-plugin/      # Jest integration
    └── web/              # Next.js web interface
```

## Domain Terminology

| Term                    | Definition                                        |
| ----------------------- | ------------------------------------------------- |
| **Negative Space**      | Valid inputs not covered by existing tests        |
| **Type Universe**       | Complete set of all possible values for a type    |
| **Type Lattice**        | Hierarchical type relationships (subtyping)       |
| **Boundary Values**     | Edge cases at domain boundaries                   |
| **Constraint Solving**  | Using SMT solver to find valid input combinations |
| **Observable Behavior** | Tested execution paths and inputs                 |

## Key Technologies

- **TypeScript 5.3.3** - Strict mode, NodeNext modules
- **Turborepo 1.12.0** - Monorepo orchestration
- **Vitest** - Fast unit testing
- **Z3 WASM** - SMT constraint solving
- **Tree-sitter** - Fast, incremental parsing

## Coding Standards

### Type Safety

- Always use strict TypeScript mode
- Prefer interfaces over type aliases for object shapes
- Use branded types for domain values
- Avoid `any` - use `unknown` with type guards

### Error Handling

```typescript
// Preferred: Result type pattern
type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

// Avoid throwing in pure functions
// Use Result type or Option type instead
```

### Function Design

- Pure functions whenever possible
- Single responsibility principle
- Maximum 3 parameters (use options object for more)
- Document edge cases and assumptions in JSDoc

### Testing Approach

- Arrange-Act-Assert pattern
- One assertion per test (generally)
- Test names describe behavior, not implementation
- Include negative test cases

## Package Dependencies

- `core` depends on: `shared`, `smt-solver`, `boundary-catalog`
- `apps/*` depend on: `core` and relevant packages
- No circular dependencies allowed

## Build & Development

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Development mode (watch)
pnpm dev

# Type checking
pnpm typecheck
```

## Elite Agent Mappings

When working on different areas, invoke appropriate agents:

- **Type system code** → @AXIOM (mathematical foundations)
- **Performance optimization** → @VELOCITY (sub-linear algorithms)
- **Test generation** → @ECLIPSE (testing expertise)
- **SMT solver integration** → @AXIOM + @CIPHER
- **CLI/UX** → @APEX (software engineering)
- **VS Code extension** → @APEX + @CANVAS

## Current Focus

**Phase 8: Type Space Implementation**

- Implementing type universe and lattice structures
- Building primitive type space analyzers
- Creating the foundation for constraint solving

## Constraints & Decisions

1. **No runtime dependencies**: Core package should be dependency-light
2. **Browser compatibility**: Z3 via WASM only
3. **Streaming results**: Support incremental test generation
4. **Language agnostic**: Architecture should support multiple languages (start with TypeScript/JavaScript)

## Anti-Patterns to Avoid

- ❌ Mocking the SMT solver (use fixtures instead)
- ❌ Hardcoding type hierarchies (build dynamically)
- ❌ Synchronous file I/O in hot paths
- ❌ Premature optimization in test generation
- ❌ Global state in the core engine

## Future Vision

- Multi-language support (Python, Go, Rust, etc.)
- Distributed test generation
- Machine learning for pattern recognition
- IDE integrations beyond VS Code
- Cloud-based constraint solving

## Resources

- Mathematical foundations: Type theory, lattice theory, SMT solving
- Similar projects: QuickCheck, Hypothesis, fast-check
- Academic papers: See `docs/references/`

## Development Workflows

### Adding New Type Spaces

1. Create primitive space in `packages/core/src/type-space/primitive-spaces/`
2. Extend `TypeUniverse` to recognize new type
3. Add boundary patterns to `packages/boundary-catalog/`
4. Write property-based tests with fast-check
5. Document in `docs/type-spaces/`

### Implementing New Boundary Patterns

1. Research pattern in academic literature
2. Add to appropriate category in `boundary-catalog`
3. Implement pattern matcher with regex or AST analysis
4. Add test cases covering edge cases
5. Update catalog documentation

### Extending SMT Solver Integration

1. Define new theory in `packages/smt-solver/src/theories/`
2. Implement constraint generation for theory
3. Add Z3 encoding logic
4. Test with SMT-LIB2 format validation
5. Benchmark solving performance

## Common Development Tasks

### Running Specific Package Tests

```bash
# Test only core package
pnpm --filter @nstg/core test

# Test with coverage
pnpm --filter @nstg/core test:coverage

# Watch mode for specific package
pnpm --filter @nstg/core test:watch
```

### Building for Production

```bash
# Clean build (removes dist/ folders)
pnpm clean && pnpm build

# Type checking before build
pnpm typecheck && pnpm build

# Linting and formatting
pnpm lint:fix && pnpm format
```

### Debugging Tips

- Use `console.log()` with `[PACKAGE_NAME]` prefix for clarity
- Enable VS Code debugger with launch configurations in `.vscode/launch.json`
- Set breakpoints in TypeScript files (source maps enabled)
- Use `vitest --inspect-brk` for debugging tests
- Check Z3 solver output in browser console for WASM issues

## Project Metrics

- **Target Test Coverage**: 90-95% for core packages, 80-85% for apps
- **Build Time Target**: < 30 seconds for full monorepo build
- **Type Check Time**: < 10 seconds
- **Test Suite Time**: < 5 seconds (unit tests)

## Performance Considerations

- Type space calculations use sub-linear algorithms (O(log n) where possible)
- SMT solving is the primary bottleneck (use caching aggressively)
- Tree-sitter parsing is incremental (leverage for performance)
- Property-based test generation uses streaming to avoid memory issues
- Benchmark critical paths regularly (use `pnpm bench`)
