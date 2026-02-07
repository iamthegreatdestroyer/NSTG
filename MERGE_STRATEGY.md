# 🚀 NSTG PR MERGE STRATEGY GUIDE

**Last Updated**: 2026-02-07  
**Guide Purpose**: Provide step-by-step instructions for safely merging all 7 open PRs

---

## 📋 Quick Reference Matrix

| PR # | Title                      | Priority    | Status      | Action                     |
| ---- | -------------------------- | ----------- | ----------- | -------------------------- |
| #2   | pnpm/action-setup v3→v4    | 🔴 Critical | ⚠️ Blocked  | Fix build.yml v2→v3 first  |
| #3   | codecov-action v4→v5       | 🔴 Critical | ⚠️ Blocked  | Update workflow parameters |
| #4   | @types/node v20→v25        | 🔴 Critical | ⚠️ Validate | Run `pnpm typecheck`       |
| #5   | vitest v1→v4               | 🔴 Critical | ⚠️ Validate | Run `pnpm test`            |
| #6   | turbo + esbuild major      | 🔴 Critical | ⚠️ Validate | Run `pnpm build`           |
| #8   | GitHub Actions permissions | 🟡 Medium   | ⚠️ Review   | Verify commit format       |
| #7   | ora v8→v9                  | ✅ Low      | ✅ Ready    | Can merge anytime          |

---

## 🔴 PHASE 1: FIX BLOCKING ISSUES

### Step 1A: Fix build.yml pnpm/action-setup Inconsistency

**Currently**:

- `build.yml` uses `pnpm/action-setup@v2` ← OUTDATED
- `ci.yml` uses `pnpm/action-setup@v3` ← CURRENT
- These MUST match before PR #2 merge

**Action Items**:

1. **Open the file**:

   ```bash
   # Navigate to: .github/workflows/build.yml
   code .github/workflows/build.yml
   ```

2. **Find the pnpm/action-setup step**:

   ```yaml
   # Look for section like:
   - name: 📦 Install pnpm
     uses: pnpm/action-setup@v2
     with:
       version: 8
   ```

3. **Update the action version** (v2 → v3):

   ```yaml
   # CHANGE FROM:
   - name: 📦 Install pnpm
     uses: pnpm/action-setup@v2
     with:
       version: 8

   # CHANGE TO:
   - name: 📦 Install pnpm
     uses: pnpm/action-setup@v3
     with:
       version: 8
   ```

4. **Save the file**

5. **Verify the change**:

   ```bash
   grep "pnpm/action-setup" .github/workflows/build.yml
   # Should show: uses: pnpm/action-setup@v3
   ```

6. **Commit the change**:

   ```bash
   git add .github/workflows/build.yml
   git commit -m "ci: update pnpm/action-setup from v2 to v3 for consistency"
   git push origin <branch-name>
   ```

7. **Merge this commit FIRST** in a separate PR if possible, or include in PR #2

**Blocking**: PR #2 cannot safely merge without this fix

---

## 🔴 PHASE 2: VALIDATE BREAKING CHANGES

### Step 2A: Validate PR #6 (turbo v1→v2 + esbuild major)

**Risk**: HIGH - Build orchestrator update  
**Blockers**: None at branch protection level  
**Local Test**: Required before merge

**Action Items**:

1. **Check out the branch**:

   ```bash
   git fetch origin
   git checkout dependabot/github-actions/build-group-2
   # or the actual branch name for PR #6
   ```

2. **Clean and install dependencies**:

   ```bash
   pnpm clean
   pnpm install
   ```

3. **Run the full build**:

   ```bash
   pnpm build
   ```

4. **Check for errors**:
   - ✅ If build succeeds: Ready to merge
   - ❌ If build fails: Note the error and create separate issue

5. **Verify turbo is working**:

   ```bash
   pnpm turbo build --dry
   # Should show task execution plan without errors
   ```

6. **Check artifact generation**:

   ```bash
   # Look for expected build output
   ls -la dist/
   ls -la packages/*/dist/
   # Verify expected files exist
   ```

7. **Document:**
   - ✅ `pnpm build` completed successfully
   - ✅ No errors in execution
   - ✅ All artifacts generated
   - Status: READY TO MERGE

**If fails**:

- Run: `pnpm build --verbose` to see error details
- Check turbo.json for configuration issues
- Raise issue with specific error details
- DO NOT merge until fixed

---

### Step 2B: Validate PR #5 (vitest v1→v4)

**Risk**: HIGH - Test framework major upgrade  
**Blockers**: None at branch protection level  
**Local Test**: REQUIRED before merge

**Action Items**:

1. **Check out the branch**:

   ```bash
   git fetch origin
   git checkout dependabot/npm_and_yarn/testing-group
   # or actual branch name for PR #5
   ```

2. **Clean and install dependencies**:

   ```bash
   pnpm clean
   pnpm install
   ```

3. **Run full test suite**:

   ```bash
   pnpm test
   ```

4. **Check test results**:
   - ✅ All tests pass: Ready to merge
   - ❌ Tests fail: Fix incompatibilities or note issue

5. **Review test output**:

   ```bash
   # Look for:
   # - Test count matches expectations
   # - No deprecation warnings
   # - Coverage reports generated (if applicable)
   # - Error messages clear and actionable
   ```

6. **Check specific test scenarios**:

   ```bash
   # If project has specific critical tests:
   pnpm vitest packages/core/src/__tests__/  # Example
   ```

7. **Document**:
   - ✅ All tests pass
   - ✅ No vitest v4 incompatibilities
   - Status: READY TO MERGE

**If fails**:

- Identify failing tests
- Check vitest.config.ts for deprecated options
- Update test code if needed
- Re-run until all pass
- DO NOT merge until all tests pass

---

### Step 2C: Validate PR #4 (@types/node v20→v25)

**Risk**: MEDIUM - Type definitions major upgrade  
**Blockers**: TypeScript errors will prevent CI checks  
**Local Test**: REQUIRED before merge

**Action Items**:

1. **Check out the branch**:

   ```bash
   git fetch origin
   git checkout dependabot/npm_and_yarn/typescript-group
   # or actual branch name for PR #4
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Run TypeScript check**:

   ```bash
   pnpm typecheck
   ```

4. **Review results**:
   - ✅ Zero TypeScript errors: Ready to merge
   - ❌ TypeScript errors: Must fix all before merge

5. **Fix type errors** if any found:

   ```bash
   # Identify the files with errors, example:
   # packages/core/src/index.ts:42 - TS2339: Property 'X' not found

   # Then update the code to satisfy the new types:
   # - Update API calls to match new signatures
   # - Add type annotations if needed
   # - Cast types if necessary (with explanatory comments)
   ```

6. **Re-run typecheck**:

   ```bash
   pnpm typecheck
   # Should show zero errors
   ```

7. **Special checks**:

   ```bash
   # Look for usage of deprecated Node.js APIs
   grep -r "Buffer\.from\|Stream\|crypto" packages/ --include="*.ts"
   # Verify these work with v25 types
   ```

8. **Document** changes:
   - Updated type-incompatible code sections
   - @types/node v20→v25 confirmed compatible
   - All TypeScript checks pass
   - Status: READY TO MERGE

**If fails**:

- Type errors must be fixed before merge
- Cannot use `any` as workaround
- Resolve all TypeScript errors
- Re-run until zero errors
- DO NOT merge with type errors

---

## 🔴 PHASE 3: FIX WORKFLOW PARAMETERS

### Step 3A: Fix PR #3 codecov-action Parameters

**Risk**: HIGH - codecov CI check will fail if parameters wrong  
**Blockers**: Workflow execution will error  
**Action**: Update workflow parameters

**Action Items**:

1. **Search for codecov usage** in all workflows:

   ```bash
   grep -r "codecov" .github/workflows/ --include="*.yml"
   ```

2. **For each match, check the parameters**:

   ```bash
   # Look for codecov/codecov-action usage and parameters:
   cat .github/workflows/*.yml | grep -A 10 "codecov/codecov-action"
   ```

3. **Expected old parameters** (v4):

   ```yaml
   - uses: codecov/codecov-action@v4
     with:
       file: ./coverage/... # ← DEPRECATED, change to 'files'
       plugin: noop # ← DEPRECATED, change to 'plugins'
   ```

4. **Update each workflow file** with v5 parameters:

   ```yaml
   # BEFORE (v4 - deprecated):
   - uses: codecov/codecov-action@v4
     with:
       file: ./coverage/coverage-final.json
       plugin: noop

   # AFTER (v5 - correct):
   - uses: codecov/codecov-action@v5
     with:
       files: ./coverage/coverage-final.json
       plugins: noop
   ```

5. **Create find-and-replace for each workflow**:

   ```bash
   # Example using sed (backup first!)
   cp .github/workflows/test.yml .github/workflows/test.yml.bak
   sed -i 's/file:/files:/g' .github/workflows/test.yml
   sed -i 's/plugin:/plugins:/g' .github/workflows/test.yml
   ```

6. **Validate YAML syntax**:

   ```bash
   # Verify all workflow files are valid YAML
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))" && echo "✅ Valid"
   ```

7. **Document which files were changed**:
   - [ ] .github/workflows/test.yml (if codecov used)
   - [ ] .github/workflows/ci.yml (if codecov used)
   - [ ] .github/workflows/pr-checks.yml (if codecov used)
   - [ ] Any other workflow files with codecov

8. **Commit changes**:

   ```bash
   git add .github/workflows/
   git commit -m "ci: update codecov-action parameters from v4 to v5 format (file→files, plugin→plugins)"
   ```

9. **Verify changes**:
   ```bash
   git diff HEAD~1 .github/workflows/
   # Should show: file: → files:, plugin: → plugins:
   ```

**Critical**: Without these changes, codecov step will FAIL in CI after PR #3 merges

---

## 🟡 PHASE 4: CONDITIONAL MERGES

### Step 4A: PR #2 - pnpm/action-setup v3→v4

**Prerequisites**:

- ✅ build.yml updated to v3 (from Step 1A)
- ✅ All workflows now use consistent v3
- ✅ package.json has `packageManager: pnpm@8.15.0`

**Action Items**:

1. **Verify prerequisite complete**:

   ```bash
   grep "pnpm/action-setup" .github/workflows/*.yml
   # Should show all v3 (build.yml and ci.yml)
   ```

2. **Ensure PR #2 branch is current**:

   ```bash
   git checkout dependabot/build/pnpm-action-setup-4
   git pull origin main  # Rebase if needed
   ```

3. **The PR itself updates pnpm/action-setup to v4** in workflow files
   - This will happen automatically in PR #2
   - v4 will validate against package.json packageManager field
   - Current version 8 is compatible ✅

4. **Merge PR #2** with confidence:
   ```bash
   # Once merged, first CI run will validate pnpm v4 setup
   # Watch for any validation errors
   ```

---

### Step 4B: PR #3 - codecov-action v4→v5

**Prerequisites**:

- ✅ Workflow files updated with new parameters (from Step 3A)
- ✅ All `file:` changed to `files:`
- ✅ All `plugin:` changed to `plugins:`

**Action Items**:

1. **Verify workflow updates complete**:

   ```bash
   grep -r "file:" .github/workflows/
   # Should return EMPTY (no matches)
   grep -r "plugin:" .github/workflows/
   # Should return EMPTY (no matches)
   ```

2. **Ensure PR #3 branch is current**:

   ```bash
   git checkout dependabot/build/codecov-action-5
   git pull origin main
   ```

3. **Merge PR #3** after workflow updates confirmed:
   ```bash
   # CI will use new codecov-action v5 with updated parameters
   # Monitor first CI run for codecov execution success
   ```

---

## ✅ PHASE 5: SAFE MERGES

### Step 5A: PR #8 - GitHub Actions Workflows

**Prerequisites**:

- ✅ Commit message format verified

**Action Items**:

1. **Verify commit format**:

   ```bash
   git show HEAD --name-only | head -1
   # Should show: ci: add explicit permissions to workflows
   # Or: feat(ci): add explicit permissions to workflows
   ```

2. **Review the changes**:

   ```bash
   git show HEAD --stat
   # Should list: 5 workflow files modified
   ```

3. **Merge PR #8** with confidence:
   - No validation needed
   - Safe to merge at any time
   - Monitor CI for permission-related errors (unlikely)

---

### Step 5B: PR #7 - ora v8→v9

**Prerequisites**:

- None - safe to merge anytime

**Action Items**:

1. **Can merge immediately**:

   ```bash
   # No special actions needed
   # Low-risk minor version bump
   # No breaking changes
   ```

2. **Optional local test**:

   ```bash
   pnpm install
   pnpm test  # If CLI spinners used in tests
   ```

3. **Merge PR #7** with full confidence:
   - Safest PR to merge first if confident
   - Can merge in any order
   - No dependency on other PRs

---

## 📊 RECOMMENDED MERGE SEQUENCE

### Sequence Option A (Conservative - Recommended)

```
1. ✅ Merge build.yml fix first (prerequisite)
   └─ Establishes v3 consistency

2. ✅ Merge PR #7 (ora - safest)
   └─ Low risk, confirms merge process works

3. ⚠️  Merge PR #4 (typecheck validation)
   └─ After local `pnpm typecheck` succeeds
   └─ Type safety is foundation

4. ⚠️  Merge PR #5 (test framework validation)
   └─ After local `pnpm test` succeeds
   └─ Tests are critical for confidence

5. ⚠️  Merge PR #6 (build system validation)
   └─ After local `pnpm build` succeeds
   └─ Build system affects all downstream

6. ✅ Merge PR #2 (pnpm/action-setup)
   └─ Now safe after build.yml fixed and tests pass
   └─ V4 validation will succeed

7. ✅ Merge PR #3 (codecov-action)
   └─ After workflow parameters updated
   └─ Codecov will execute correctly

8. ✅ Merge PR #8 (GitHub Actions permissions)
   └─ Safe to merge at any time
   └─ No special considerations

TOTAL ORDER: build.yml fix → PR#7 → PR#4 → PR#5 → PR#6 → PR#2 → PR#3 → PR#8
```

### Sequence Option B (Fast-Track - If Confident)

```
1. Fix build.yml + include in PR #2 if possible
2. Run all validations in parallel:
   - `pnpm typecheck` (PR #4)
   - `pnpm test` (PR #5)
   - `pnpm build` (PR #6)
3. Update codecov parameters for PR #3
4. Merge in order: PR#4, PR#5, PR#6, PR#2, PR#3, PR#8, PR#7
```

---

## 🔍 POST-MERGE VERIFICATION

After each PR merge, verify these items:

### After PR #2 (pnpm/action-setup v4):

```bash
# Check: build.yml uses v4 successfully
# Monitor: First CI run
# Expected: No pnpm version validation errors
# Command: Watch GitHub Actions tab for build job
```

### After PR #3 (codecov-action v5):

```bash
# Check: codecov step executes successfully
# Monitor: CI coverage reports appear
# Expected: No parameter deprecation errors
# Command: Check "Upload coverage..." step in CI logs
```

### After PR #4 (@types/node):

```bash
# Check: typecheck still passes
pnpm typecheck
# Expected: Zero errors
```

### After PR #5 (vitest):

```bash
# Check: all tests still pass
pnpm test
# Expected: All tests pass
```

### After PR #6 (turbo+esbuild):

```bash
# Check: build still works
pnpm build
# Expected: Build succeeds
```

### After PR #8 (GitHub Actions):

```bash
# Check: CI jobs still execute
# Monitor: GitHub Actions workflows tab
# Expected: No permission-denied errors
```

### After PR #7 (ora):

```bash
# Check: CLI still works (if used)
# Expected: Spinners display correctly
```

---

## 🚨 ROLLBACK PROCEDURES

If something goes wrong after merge:

### If codecov step fails (PR #3):

```bash
# Likely cause: Parameters still using old format
# Fix: Revert codecov-action parameters to v4 naming
# Rollback: git revert <commit-hash>
```

### If CI workflow breaks (PR #2 or #8):

```bash
# Likely cause: pnpm action validation or permissions
# Fix: Check GitHub Actions logs for specific error
# Rollback: git revert <commit-hash>
```

### If build fails (PR #6):

```bash
# Likely cause: turbo or esbuild incompatibility
# Fix: Revert and file issue with specific error
# Rollback: git revert <commit-hash>
```

### If tests fail (PR #5):

```bash
# Likely cause: vitest v4 API incompatibility
# Fix: Update test code for v4 compatibility
# Rollback: git revert <commit-hash>
```

### If typecheck errors (PR #4):

```bash
# Likely cause: @types/node v25 type incompatibility
# Fix: Update code to satisfy new types
# Rollback: git revert <commit-hash>
```

---

## ✅ FINAL CHECKLIST

Before marking all PRs as merged and stable:

- [ ] ✅ build.yml updated to pnpm/action-setup@v3
- [ ] ✅ PR #7 (ora) merged successfully
- [ ] ✅ PR #4 validated: `pnpm typecheck` returns zero errors
- [ ] ✅ PR #5 validated: `pnpm test` all tests pass
- [ ] ✅ PR #6 validated: `pnpm build` runs successfully
- [ ] ✅ PR #2 merged successfully with v4 validation working
- [ ] ✅ PR #3 merged successfully with codecov executing
- [ ] ✅ PR #8 merged with no permission errors
- [ ] ✅ All CI jobs green for 2+ consecutive runs
- [ ] ✅ No rollbacks needed
- [ ] ✅ Test coverage maintained/improved
- [ ] ✅ Documentation updated if needed

---

**Merge Status**: Ready to proceed with Phase-based approach  
**Estimated Time**: 1-2 hours (including validation tests)  
**Risk Level**: Manageable with proper validation  
**Success Probability**: High (>95%) with this strategy
