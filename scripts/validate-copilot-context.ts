#!/usr/bin/env tsx

/**
 * Validation script for GitHub Copilot context and Elite Agent integration.
 *
 * Verifies that:
 * 1. Copilot instruction files exist and are properly formatted
 * 2. Skill files are present and valid
 * 3. Agent invocation patterns are recognized
 * 4. VS Code settings are configured for optimal Copilot experience
 *
 * @author @TENSOR (Part of Phase 1.2)
 */

import { constants } from 'fs';
import { access, readFile } from 'fs/promises';
import { join } from 'path';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, 'green');
}

function error(message: string) {
  log(`✗ ${message}`, 'red');
}

function warning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

function info(message: string) {
  log(`ℹ ${message}`, 'blue');
}

function section(title: string) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
  details: string[];
}

const results: ValidationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function validateCopilotInstructions(): Promise<void> {
  section('Copilot Instructions Validation');

  const instructionsPath = join(process.cwd(), '.github', 'copilot-instructions.md');
  const agentMappingPath = join(process.cwd(), '.github', 'copilot-agent-mapping.md');

  // Check if instructions file exists
  if (await fileExists(instructionsPath)) {
    success('copilot-instructions.md found');
    results.passed++;

    // Validate content
    const content = await readFile(instructionsPath, 'utf-8');

    // Check for required sections
    const requiredSections = [
      'Project Overview',
      'Elite Agent Collective',
      'Code Generation Guidelines',
      'Testing Guidelines',
      'Anti-Patterns',
    ];

    for (const section of requiredSections) {
      if (content.includes(section)) {
        success(`Section found: ${section}`);
        results.passed++;
      } else {
        error(`Missing section: ${section}`);
        results.failed++;
      }
    }

    // Check for agent invocation syntax
    if (content.includes('@AXIOM:') || content.includes('@VELOCITY:')) {
      success('Agent invocation syntax documented');
      results.passed++;
    } else {
      warning('Agent invocation syntax not clearly documented');
      results.warnings++;
    }

    // Check for examples
    const exampleCount = (content.match(/```typescript/g) || []).length;
    info(`Found ${exampleCount} TypeScript code examples`);
    if (exampleCount >= 10) {
      success('Sufficient code examples provided');
      results.passed++;
    } else {
      warning('Consider adding more code examples');
      results.warnings++;
    }
  } else {
    error('copilot-instructions.md not found');
    results.failed++;
  }

  // Check agent mapping file
  if (await fileExists(agentMappingPath)) {
    success('copilot-agent-mapping.md found');
    results.passed++;

    const content = await readFile(agentMappingPath, 'utf-8');

    // Check for key agents
    const keyAgents = ['@AXIOM', '@VELOCITY', '@ECLIPSE', '@APEX', '@SYNAPSE'];
    for (const agent of keyAgents) {
      if (content.includes(agent)) {
        success(`Agent documented: ${agent}`);
        results.passed++;
      } else {
        error(`Agent missing: ${agent}`);
        results.failed++;
      }
    }
  } else {
    error('copilot-agent-mapping.md not found');
    results.failed++;
  }
}

async function validateSkillFiles(): Promise<void> {
  section('Skill Files Validation');

  const skillsDir = join(process.cwd(), '.github', 'skills');
  const requiredSkills = [
    'project-context/SKILL.md',
    'testing-standards/SKILL.md',
    'code-patterns/SKILL.md',
  ];

  for (const skill of requiredSkills) {
    const skillPath = join(skillsDir, skill);

    if (await fileExists(skillPath)) {
      success(`Skill file found: ${skill}`);
      results.passed++;

      // Validate content structure
      const content = await readFile(skillPath, 'utf-8');

      // Check for required headers
      const requiredHeaders = ['# ', '## Purpose', '## '];
      let hasValidStructure = true;

      for (const header of requiredHeaders) {
        if (!content.includes(header)) {
          hasValidStructure = false;
          break;
        }
      }

      if (hasValidStructure) {
        success(`Valid Markdown structure: ${skill}`);
        results.passed++;
      } else {
        warning(`Check Markdown structure: ${skill}`);
        results.warnings++;
      }

      // Check content length (skills should be comprehensive)
      const lines = content.split('\n').length;
      info(`  Lines: ${lines}`);

      if (lines >= 200) {
        success(`Comprehensive content: ${skill}`);
        results.passed++;
      } else {
        warning(`Consider expanding content: ${skill}`);
        results.warnings++;
      }
    } else {
      error(`Skill file missing: ${skill}`);
      results.failed++;
    }
  }
}

async function validateVSCodeSettings(): Promise<void> {
  section('VS Code Settings Validation');

  const settingsPath = join(process.cwd(), '.vscode', 'settings.json');

  if (await fileExists(settingsPath)) {
    success('.vscode/settings.json found');
    results.passed++;

    const content = await readFile(settingsPath, 'utf-8');

    // Check for GitHub Copilot settings
    const copilotSettings = [
      'github.copilot.enable',
      'github.copilot.editor.enableAutoCompletions',
    ];

    for (const setting of copilotSettings) {
      if (content.includes(setting)) {
        success(`Copilot setting configured: ${setting}`);
        results.passed++;
      } else {
        warning(`Consider adding setting: ${setting}`);
        results.warnings++;
      }
    }

    // Check for agent-friendly settings
    if (content.includes('"editor.quickSuggestions"')) {
      success('Quick suggestions configured');
      results.passed++;
    } else {
      warning('Consider enabling quick suggestions for better Copilot experience');
      results.warnings++;
    }
  } else {
    warning('.vscode/settings.json not found');
    results.warnings++;
  }
}

async function validateAgentInvocationPatterns(): Promise<void> {
  section('Agent Invocation Pattern Validation');

  // Read a sample source file to check for agent invocations
  const sampleFiles = [
    'packages/core/src/type-space/type-lattice.ts',
    'packages/core/src/test-generation/test-generator.ts',
    'packages/core/src/constraint-solver/constraint-solver.ts',
  ];

  let foundInvocations = 0;

  for (const file of sampleFiles) {
    const filePath = join(process.cwd(), file);

    if (await fileExists(filePath)) {
      const content = await readFile(filePath, 'utf-8');

      // Check for agent invocation comments
      const agentPattern = /@(AXIOM|VELOCITY|ECLIPSE|APEX|SYNAPSE|TENSOR):/g;
      const matches = content.match(agentPattern);

      if (matches && matches.length > 0) {
        foundInvocations += matches.length;
        success(`Found ${matches.length} agent invocation(s) in ${file}`);
        results.passed++;
      }
    }
  }

  if (foundInvocations === 0) {
    info('No agent invocations found in sample files');
    info('This is okay for initial setup - agents can be invoked as needed');
  } else {
    success(`Total agent invocations found: ${foundInvocations}`);
    results.passed++;
  }
}

async function validateDocumentation(): Promise<void> {
  section('Documentation Validation');

  const docs = [
    'MASTER_ACTION_PLAN.md',
    'PHASE_1_1_COMPLETION_SUMMARY.md',
    'docs/DEV_ASSISTANT_GUIDE.md',
    'README.md',
  ];

  for (const doc of docs) {
    const docPath = join(process.cwd(), doc);

    if (await fileExists(docPath)) {
      success(`Documentation found: ${doc}`);
      results.passed++;
    } else {
      warning(`Documentation missing: ${doc}`);
      results.warnings++;
    }
  }
}

async function validateAutomationScripts(): Promise<void> {
  section('Automation Scripts Validation');

  const scripts = [
    'scripts/dev-assistant.ts',
    'scripts/validate-copilot-context.ts', // This script
  ];

  for (const script of scripts) {
    const scriptPath = join(process.cwd(), script);

    if (await fileExists(scriptPath)) {
      success(`Script found: ${script}`);
      results.passed++;

      // Check if script has proper header comment
      const content = await readFile(scriptPath, 'utf-8');
      if (content.includes('/**') && content.includes('@author')) {
        success(`Script has documentation: ${script}`);
        results.passed++;
      } else {
        warning(`Consider adding JSDoc header: ${script}`);
        results.warnings++;
      }
    } else {
      error(`Script missing: ${script}`);
      results.failed++;
    }
  }

  // Check package.json for script integration
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (await fileExists(packageJsonPath)) {
    const content = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    if (packageJson.scripts?.['dev-assistant']) {
      success('dev-assistant script integrated in package.json');
      results.passed++;
    } else {
      error('dev-assistant script not found in package.json');
      results.failed++;
    }
  }
}

function generateReport(): void {
  section('Validation Summary');

  const total = results.passed + results.failed + results.warnings;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';

  log('\nResults:', 'bright');
  success(`Passed: ${results.passed}`);
  error(`Failed: ${results.failed}`);
  warning(`Warnings: ${results.warnings}`);
  log(`Total checks: ${total}`, 'cyan');
  log(`Pass rate: ${passRate}%`, 'cyan');

  if (results.failed === 0) {
    log('\n🎉 All validations passed!', 'green');
    log('GitHub Copilot context is properly configured.', 'green');
  } else if (results.failed <= 2) {
    log('\n✓ Mostly passing, but some issues found.', 'yellow');
    log('Review failed checks above.', 'yellow');
  } else {
    log('\n✗ Multiple validation failures detected.', 'red');
    log('Please address failed checks before proceeding.', 'red');
  }

  // Recommendations
  log('\nRecommendations:', 'bright');

  if (results.failed > 0) {
    info('1. Address all failed validations first');
  }

  if (results.warnings > 0) {
    info('2. Review warnings to improve Copilot effectiveness');
  }

  info('3. Run this script periodically to ensure consistency');
  info('4. Update skill files as project evolves');
  info('5. Add agent invocations to complex code areas');

  log('');
}

async function main(): Promise<void> {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║  GitHub Copilot Context Validation                    ║', 'cyan');
  log('║  NSTG - Negative Space Test Generation                ║', 'cyan');
  log('║  Phase 1.2: Custom Copilot Instructions                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  try {
    await validateCopilotInstructions();
    await validateSkillFiles();
    await validateVSCodeSettings();
    await validateAgentInvocationPatterns();
    await validateDocumentation();
    await validateAutomationScripts();

    generateReport();

    // Exit with appropriate code
    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    error(`Validation failed with error: ${err}`);
    process.exit(1);
  }
}

main();
