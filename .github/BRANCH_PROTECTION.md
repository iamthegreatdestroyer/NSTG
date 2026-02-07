# Branch Protection Configuration

This document describes the branch protection rules for the NSTG repository.

## Protected Branches

### Main Branch (`main`)

- **Purpose**: Production-ready code
- **Access**: Restricted to approved PRs with passing checks

### Develop Branch (`develop`)

- **Purpose**: Integration branch for features
- **Access**: Restricted to feature branches with passing checks

## Protection Rules

### Required Checks

All of the following must pass before merging:

- ✅ **Build Validation** (`build` job)
  - Node.js 18.x and 20.x compatibility
  - All packages compile without errors
- ✅ **Type Safety** (`typecheck` job)
  - TypeScript strict mode compliance
  - ESLint rules enforcement
  - Code formatting standardization

- ✅ **Test Coverage** (`test` job)
  - All unit tests pass
  - Coverage reports generated
  - No regressions

- ✅ **PR Quality Gates** (`pr-checks` job)
  - PR title format validation
  - Build size analysis
  - Code quality assessment

### Branch Settings

```yaml
# To apply these settings, go to:
# Repository Settings → Branches → Branch protection rules

main:
  require_code_reviews: 1
  require_passing_checks: true
  required_checks:
    - 'Build Validation (18.x)'
    - 'Build Validation (20.x)'
    - 'Type Checking & Lint'
    - 'Test Execution'
    - 'PR Quality Gates'
  require_branches_up_to_date: true
  require_conversation_resolution: true
  dismiss_stale_reviews: true
  require_signed_commits: false

develop:
  require_code_reviews: 1
  require_passing_checks: true
  required_checks:
    - 'Type Checking & Lint'
    - 'Build Validation (20.x)'
    - 'Test Execution'
  require_branches_up_to_date: false
  dismiss_stale_reviews: true
```

### Manual Setup Steps

Since GitHub doesn't support declarative branch protection rules in repo files yet, you must configure these manually:

1. Go to **Repository Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. For `main` branch:
   - Pattern: `main`
   - ✅ Require pull request reviews before merging (1 reviewer)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - Select required checks:
     - `Build Validation (18.x)`
     - `Build Validation (20.x)`
     - `Type Checking & Lint`
     - `Test Execution`
     - `PR Quality Gates`
   - **Save changes**

4. For `develop` branch:
   - Pattern: `develop`
   - ✅ Require pull request reviews before merging (1 reviewer)
   - ✅ Require status checks to pass before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - Select required checks:
     - `Type Checking & Lint`
     - `Build Validation (20.x)`
     - `Test Execution`
   - **Save changes**

## CI/CD Pipeline Overview

The following workflows protect code quality:

### 1. Build Validation (`build.yml`)

- **Trigger**: push to main/develop, PRs
- **Runs on**: Ubuntu latest
- **Matrix**: Node.js 18.x, 20.x
- **Status**: Required for main, required for develop

**Responsibilities**:

- Compile TypeScript
- Test monorepo build
- Verify artifact generation
- Report build diagnostics

### 2. Type Safety (`typecheck.yml`)

- **Trigger**: push to main/develop, PRs
- **Status**: Required for both branches

**Responsibilities**:

- TypeScript strict compilation
- ESLint rule enforcement
- Code formatting validation
- Lint rule compliance

### 3. Test Execution (`test.yml`)

- **Trigger**: push to main/develop, PRs
- **Status**: Required for both branches

**Responsibilities**:

- Run complete test suite
- Generate coverage reports
- Upload to Codecov
- Report test metrics

### 4. PR Quality Gates (`pr-checks.yml`)

- **Trigger**: PR open/update/reopen
- **Status**: Required for main

**Responsibilities**:

- Validate PR title format
- Run quality gate checks
- Analyze build size
- Generate quality summary

### 5. Composite CI (`ci.yml`)

- **Trigger**: push to main/develop, PRs
- **Status**: Optional (rolls up other checks)

**Responsibilities**:

- Run all checks sequentially
- Generate unified CI summary
- Overall quality gate

## Commit Message Format

Use the following format for commit messages to enable automated changelog generation:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `ci`: CI/CD configuration changes
- `perf`: Performance improvements

### Scope

Optional component/package name:

- `core`: @nstg/core package
- `smt-solver`: @nstg/smt-solver package
- `boundary-catalog`: @nstg/boundary-catalog package
- `cli`: @nstg/cli app
- `vscode`: VS Code extension

### Subject

- Imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period (.) at the end
- Maximum 50 characters

### Examples

```
feat(core): add negative space gap detection algorithm

fix(smt-solver): resolve Z3 type casting in constraint solver

docs: update Z3 integration guide with examples

test(core): add property-based tests for boundary detection

ci: configure branch protection for main branch
```

## PR Title Format

PR titles must follow this format:

```
<type>(<scope>): <description>
```

This matches commit message format. Examples:

- `feat(core): implement boundary detection`
- `fix(smt-solver): fix Z3 constraint handling`
- `docs: add CI/CD setup documentation`
- `test(cli): add integration tests`

## Workflow Maintenance

### Updating Workflows

When modifying workflow files:

1. Ensure all required checks are tested locally first
2. Submit PR with workflow changes
3. Verify workflows run successfully on PR
4. Merge to develop first for integration testing
5. After validation, open PR to main

### Local Testing

Test locally before pushing:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format checking
pnpm format:check

# Build validation
pnpm build

# Testing
pnpm test

# Coverage
pnpm test:coverage

# Full CI equivalent
pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Troubleshooting

### Workflow Not Running

- Verify branch name matches trigger pattern
- Check GitHub Actions are enabled in repository settings
- Ensure `.github/workflows/` directory exists

### Failing Checks

- Run local tests: `pnpm test`
- Check type errors: `pnpm typecheck`
- Auto-fix lint issues: `pnpm lint:fix`
- Auto-format code: `pnpm format`

### PR Can't Be Merged

- All required checks must show ✅ green status
- Must have minimum 1 approval
- Branch must be up to date with main
- All conversations must be resolved

## GitHub Actions Secrets

No secrets are currently required for Phase 2 CI/CD. If future workflows need secrets (e.g., deployment tokens), add them via:

**Repository Settings** → **Secrets and variables** → **Actions**

## Related Documentation

- [NSTG Phase 2 Delivery Report](../PHASE_2_DELIVERY.md)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
