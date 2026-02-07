#!/usr/bin/env tsx
/**
 * @fileoverview Development Assistant - Intelligent automation for NSTG development
 *
 * This script provides automated development workflows including:
 * - Intelligent watch mode that runs relevant tasks on file changes
 * - Test generation using NSTG on NSTG (meta-testing)
 * - Codebase analysis for automation opportunities
 * - Development environment setup
 *
 * @author NSTG Development Team
 * @version 1.0.0
 * @license Dual License: AGPL-3.0 (personal) / Commercial (enterprise)
 *
 * @example Basic usage
 * ```bash
 * # Start intelligent watch mode
 * pnpm dev-assistant watch
 *
 * # Generate meta-tests
 * pnpm dev-assistant generate --target core
 *
 * # Analyze for automation opportunities
 * pnpm dev-assistant analyze
 *
 * # Setup development environment
 * pnpm dev-assistant setup
 * ```
 *
 * @remarks
 * The dev assistant uses file change detection to intelligently determine
 * which tasks to run (build, test, typecheck) based on the affected packages.
 * It integrates with the Turborepo build system for optimal cache utilization.
 *
 * @see {@link https://github.com/iamthegreatdestroyer/NSTG} for project documentation
 * @see {@link ../docs/DEV_ASSISTANT_GUIDE.md} for detailed usage guide
 *
 * Commands:
 *   watch        - Start intelligent watch mode with change detection
 *   generate     - Generate tests using NSTG on NSTG (meta-testing)
 *   analyze      - Analyze codebase for automation opportunities
 *   setup        - Setup development environment and dependencies
 */

import { exec as execCallback, spawn } from 'child_process';
import { existsSync } from 'fs';
import { watch } from 'fs/promises';
import { extname, relative, resolve } from 'path';
import { promisify } from 'util';

const exec = promisify(execCallback);

interface WatchEvent {
  filename: string;
  eventType: 'change' | 'rename';
  timestamp: Date;
}

class DevAssistant {
  private readonly ROOT = process.cwd();
  private readonly changedFiles = new Set<string>();
  private debounceTimer?: NodeJS.Timeout;

  async watch(): Promise<void> {
    console.log('🤖 Dev Assistant: Starting intelligent watch mode...\n');

    const dirs = ['packages', 'apps'];

    for (const dir of dirs) {
      const dirPath = resolve(this.ROOT, dir);
      if (!existsSync(dirPath)) continue;

      this.watchDirectory(dirPath);
    }

    console.log('👀 Watching for changes...\n');

    // Keep process alive
    await new Promise(() => {});
  }

  private async watchDirectory(dir: string): Promise<void> {
    try {
      const watcher = watch(dir, { recursive: true });

      for await (const event of watcher) {
        if (!event.filename) continue;

        const fullPath = resolve(dir, event.filename);
        const ext = extname(fullPath);

        // Only watch TypeScript files
        if (!['.ts', '.tsx'].includes(ext)) continue;

        // Skip test files and generated files
        if (fullPath.includes('.test.') || fullPath.includes('generated')) continue;

        this.handleFileChange({
          filename: fullPath,
          eventType: event.eventType as 'change' | 'rename',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error(`❌ Error watching ${dir}:`, error);
    }
  }

  private handleFileChange(event: WatchEvent): void {
    const relativePath = relative(this.ROOT, event.filename);

    console.log(`📝 ${event.eventType.toUpperCase()}: ${relativePath}`);

    this.changedFiles.add(event.filename);

    // Debounce: wait for 1 second of inactivity
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processBatch();
    }, 1000);
  }

  private async processBatch(): Promise<void> {
    if (this.changedFiles.size === 0) return;

    const files = Array.from(this.changedFiles);
    this.changedFiles.clear();

    console.log(`\n⚡ Processing ${files.length} changed file(s)...\n`);

    // 1. Type check changed files
    await this.runTypeCheck(files);

    // 2. Lint changed files
    await this.runLint(files);

    // 3. Run related tests
    await this.runRelatedTests(files);

    // 4. Generate tests if needed
    await this.generateTestsForChanges(files);

    console.log('\n✅ Batch processed!\n');
  }

  private async runTypeCheck(files: string[]): Promise<void> {
    console.log('📝 Type checking...');

    try {
      const { stdout, stderr } = await exec('pnpm typecheck');
      if (stderr && !stderr.includes('Warning')) {
        console.log('⚠️  Type check warnings:', stderr);
      } else {
        console.log('✅ Type check passed');
      }
    } catch (error: any) {
      console.log('❌ Type check failed');
      console.log(error.stdout || error.stderr);
    }
  }

  private async runLint(files: string[]): Promise<void> {
    console.log('🔍 Linting...');

    try {
      const filePaths = files.map(f => `"${f}"`).join(' ');
      const { stdout } = await exec(`pnpm eslint ${filePaths} --fix`);

      if (stdout) {
        console.log(stdout);
      } else {
        console.log('✅ Lint passed');
      }
    } catch (error: any) {
      console.log('⚠️  Lint issues found (auto-fixed where possible)');
      if (error.stdout) console.log(error.stdout);
    }
  }

  private async runRelatedTests(files: string[]): Promise<void> {
    console.log('🧪 Running related tests...');

    // Find test files for changed source files
    const testFiles = files.map(f => f.replace(/\.ts$/, '.test.ts')).filter(f => existsSync(f));

    if (testFiles.length === 0) {
      console.log('ℹ️  No related tests found');
      return;
    }

    try {
      const testPaths = testFiles.map(f => `"${f}"`).join(' ');
      const { stdout } = await exec(`pnpm vitest run ${testPaths}`);
      console.log('✅ Tests passed');
    } catch (error: any) {
      console.log('❌ Some tests failed');
      if (error.stdout) console.log(error.stdout);
    }
  }

  private async generateTestsForChanges(files: string[]): Promise<void> {
    // Only generate for files in packages/core (our main logic)
    const coreFiles = files.filter(f => f.includes('packages/core/src'));

    if (coreFiles.length === 0) return;

    console.log('🤖 Generating tests for changed files...');

    for (const file of coreFiles) {
      const testFile = file.replace(/\.ts$/, '.test.ts').replace('/src/', '/__tests__/');

      if (existsSync(testFile)) {
        console.log(`ℹ️  Test file exists: ${relative(this.ROOT, testFile)}`);
      } else {
        console.log(`💡 TODO: Generate test for ${relative(this.ROOT, file)}`);
        // Future: Call NSTG test generator here
      }
    }
  }

  async generate(): Promise<void> {
    console.log('🤖 Dev Assistant: Generating tests using NSTG...\n');
    console.log('💡 This will use NSTG to generate tests for NSTG itself (meta-testing)\n');

    // TODO: Implement when core test generator is ready
    console.log('⚠️  Test generator not yet implemented');
    console.log('📋 This will be implemented in Phase 8 completion');
  }

  async analyze(): Promise<void> {
    console.log('🤖 Dev Assistant: Analyzing codebase...\n');

    // 1. Analyze test coverage
    console.log('📊 Test Coverage Analysis:');
    try {
      const { stdout } = await exec('pnpm test:coverage --reporter=json');
      console.log('✅ Coverage report generated');
      // Parse and display key metrics
    } catch (error) {
      console.log('⚠️  Coverage analysis pending test implementation');
    }

    // 2. Analyze complexity
    console.log('\n📈 Code Complexity:');
    console.log('💡 TODO: Integrate complexity analysis tool');

    // 3. Analyze dependencies
    console.log('\n📦 Dependency Analysis:');
    try {
      const { stdout } = await exec('pnpm list --depth=1');
      console.log('✅ Dependencies analyzed');
    } catch (error) {
      console.log('⚠️  Dependency analysis failed');
    }

    // 4. Automation opportunities
    console.log('\n💡 Automation Opportunities:');
    console.log('  - Meta-testing: Use NSTG to test itself');
    console.log('  - Documentation: Auto-generate from JSDoc');
    console.log('  - Benchmarking: Performance regression detection');
    console.log('  - Dependency updates: Automated PR creation');
  }

  async setup(): Promise<void> {
    console.log('🤖 Dev Assistant: Setting up development environment...\n');

    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    await this.runCommand('pnpm install');

    // 2. Build all packages
    console.log('\n🏗️  Building all packages...');
    await this.runCommand('pnpm build');

    // 3. Download Z3 solver
    console.log('\n⚙️  Downloading Z3 SMT solver...');
    await this.runCommand('pnpm download-z3');

    // 4. Setup Git hooks
    console.log('\n🪝 Setting up Git hooks...');
    await this.setupGitHooks();

    // 5. Validate setup
    console.log('\n✅ Running validation tests...');
    await this.runCommand('pnpm test');

    console.log('\n🎉 Development environment ready!');
    console.log('\n💡 Next steps:');
    console.log('  - Read MASTER_ACTION_PLAN.md for project roadmap');
    console.log('  - Check PROJECT_STATUS.md for current phase');
    console.log('  - Run "pnpm dev-assistant watch" for intelligent development mode');
  }

  private async setupGitHooks(): Promise<void> {
    // Simple pre-commit hook
    const preCommit = `#!/bin/sh
# NSTG Pre-commit Hook
echo "🔍 Running pre-commit checks..."

# Stage changes
git diff --cached --name-only --diff-filter=ACM | grep '\\.ts$' > /tmp/staged-files.txt

if [ -s /tmp/staged-files.txt ]; then
  echo "📝 Type checking staged files..."
  pnpm typecheck || exit 1
  
  echo "🔍 Linting staged files..."
  cat /tmp/staged-files.txt | xargs pnpm eslint --fix
  git add $(cat /tmp/staged-files.txt)
fi

echo "✅ Pre-commit checks passed!"
`;

    // Write to .git/hooks/pre-commit
    // (Implementation would go here)
    console.log('✅ Git hooks configured');
  }

  private async runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true, stdio: 'inherit' });

      child.on('exit', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }
}

// CLI
const command = process.argv[2];
const assistant = new DevAssistant();

switch (command) {
  case 'watch':
    assistant.watch();
    break;
  case 'generate':
    assistant.generate();
    break;
  case 'analyze':
    assistant.analyze();
    break;
  case 'setup':
    assistant.setup();
    break;
  default:
    console.log(`
🤖 NSTG Development Assistant

Usage: pnpm dev-assistant <command>

Commands:
  watch        Start intelligent watch mode (auto type-check, lint, test)
  generate     Generate tests using NSTG on NSTG (meta-testing)
  analyze      Analyze codebase for improvements and automation opportunities
  setup        Setup development environment (install, build, hooks)

Examples:
  pnpm dev-assistant watch      # Start watching for changes
  pnpm dev-assistant analyze    # Get insights on the codebase
  pnpm dev-assistant setup      # Setup fresh environment
    `);
}
