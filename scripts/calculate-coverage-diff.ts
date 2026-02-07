#!/usr/bin/env tsx

/**
 * @fileoverview Calculate Coverage Improvement for Meta-Testing
 *
 * Compares baseline coverage (before meta-tests) with post-meta-test coverage
 * to accurately measure the impact of generated meta-tests on overall test coverage.
 *
 * **Purpose:**
 * - Read baseline and meta-test coverage summaries
 * - Calculate precise percentage improvement
 * - Generate detailed diff reports by package
 * - Identify which meta-tests contributed most to improvement
 * - Validate threshold achievement
 *
 * **Algorithm:**
 * ```
 * improvement = (meta_coverage - baseline_coverage) / baseline_coverage × 100
 * ```
 *
 * @author NSTG Development Team
 * @version 1.0.0
 * @license Dual License (AGPL-3.0 for personal use, Commercial license available)
 *
 * @example
 * ```bash
 * # Calculate diff from default locations
 * pnpm coverage:diff
 *
 * # Custom coverage files
 * pnpm coverage:diff --baseline coverage/baseline-coverage-summary.json --meta coverage/meta-coverage-summary.json
 *
 * # With threshold validation
 * pnpm coverage:diff --threshold 5
 * ```
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Coverage data structure from coverage-summary.json
 */
interface CoverageData {
  total: CoverageMetrics;
  [filePath: string]: CoverageMetrics;
}

/**
 * Coverage metrics for lines, statements, functions, branches
 */
interface CoverageMetrics {
  lines: MetricDetails;
  statements: MetricDetails;
  functions: MetricDetails;
  branches: MetricDetails;
}

/**
 * Detailed metric information
 */
interface MetricDetails {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

/**
 * Coverage improvement result
 */
interface CoverageImprovement {
  baseline: number;
  meta: number;
  improvement: number;
  improvementPct: number;
  thresholdMet: boolean;
  threshold: number;
}

/**
 * Package-level coverage comparison
 */
interface PackageDiff {
  package: string;
  baseline: number;
  meta: number;
  improvement: number;
  improvementPct: number;
  linesAdded: number;
  linesCovered: number;
}

/**
 * Complete coverage diff report
 */
interface CoverageDiffReport {
  timestamp: string;
  overall: CoverageImprovement;
  byPackage: PackageDiff[];
  byMetric: {
    lines: CoverageImprovement;
    statements: CoverageImprovement;
    functions: CoverageImprovement;
    branches: CoverageImprovement;
  };
  topContributors: Array<{
    package: string;
    improvementPct: number;
  }>;
}

// ============================================================================
// Coverage Diff Calculator
// ============================================================================

/**
 * Main coverage diff calculator class
 */
class CoverageDiffCalculator {
  private baselinePath: string;
  private metaPath: string;
  private threshold: number;

  constructor(
    baselinePath: string = 'coverage/baseline-coverage-summary.json',
    metaPath: string = 'coverage/meta-coverage-summary.json',
    threshold: number = 5
  ) {
    this.baselinePath = resolve(process.cwd(), baselinePath);
    this.metaPath = resolve(process.cwd(), metaPath);
    this.threshold = threshold;
  }

  /**
   * Calculate coverage diff and generate report
   */
  async calculate(): Promise<CoverageDiffReport> {
    console.log('📊 Calculating Coverage Improvement\n');
    console.log('═'.repeat(60));

    // Load coverage data
    console.log('\n📥 Loading coverage data...');
    const baseline = this.loadCoverageData(this.baselinePath, 'baseline');
    const meta = this.loadCoverageData(this.metaPath, 'meta-test');

    if (!baseline || !meta) {
      throw new Error('Failed to load coverage data');
    }

    console.log('   ✓ Baseline coverage loaded');
    console.log('   ✓ Meta-test coverage loaded\n');

    // Calculate overall improvement
    console.log('📈 Calculating overall improvement...');
    const overall = this.calculateImprovement(
      baseline.total.lines.pct,
      meta.total.lines.pct,
      this.threshold
    );

    console.log(`   Baseline:    ${overall.baseline.toFixed(2)}%`);
    console.log(`   Meta-test:   ${overall.meta.toFixed(2)}%`);
    console.log(
      `   Improvement: +${overall.improvement.toFixed(2)}% (${overall.improvementPct.toFixed(2)}% increase)`
    );
    console.log(
      `   Threshold:   ${overall.threshold}% - ${overall.thresholdMet ? '✅ MET' : '❌ NOT MET'}\n`
    );

    // Calculate by metric type
    console.log('📊 Breakdown by metric type...');
    const byMetric = {
      lines: this.calculateImprovement(
        baseline.total.lines.pct,
        meta.total.lines.pct,
        this.threshold
      ),
      statements: this.calculateImprovement(
        baseline.total.statements.pct,
        meta.total.statements.pct,
        this.threshold
      ),
      functions: this.calculateImprovement(
        baseline.total.functions.pct,
        meta.total.functions.pct,
        this.threshold
      ),
      branches: this.calculateImprovement(
        baseline.total.branches.pct,
        meta.total.branches.pct,
        this.threshold
      ),
    };

    console.log(
      `   Lines:       ${byMetric.lines.baseline.toFixed(2)}% → ${byMetric.lines.meta.toFixed(2)}% (+${byMetric.lines.improvement.toFixed(2)}%)`
    );
    console.log(
      `   Statements:  ${byMetric.statements.baseline.toFixed(2)}% → ${byMetric.statements.meta.toFixed(2)}% (+${byMetric.statements.improvement.toFixed(2)}%)`
    );
    console.log(
      `   Functions:   ${byMetric.functions.baseline.toFixed(2)}% → ${byMetric.functions.meta.toFixed(2)}% (+${byMetric.functions.improvement.toFixed(2)}%)`
    );
    console.log(
      `   Branches:    ${byMetric.branches.baseline.toFixed(2)}% → ${byMetric.branches.meta.toFixed(2)}% (+${byMetric.branches.improvement.toFixed(2)}%)\n`
    );

    // Calculate by package
    console.log('📦 Analyzing by package...');
    const byPackage = this.calculatePackageDiffs(baseline, meta);

    const topContributors = byPackage
      .sort((a, b) => b.improvementPct - a.improvementPct)
      .slice(0, 5);

    console.log('   Top 5 improvements:');
    topContributors.forEach((pkg, idx) => {
      console.log(
        `   ${idx + 1}. ${pkg.package}: +${pkg.improvement.toFixed(2)}% (${pkg.improvementPct.toFixed(2)}% increase)`
      );
    });
    console.log('');

    // Generate report
    const report: CoverageDiffReport = {
      timestamp: new Date().toISOString(),
      overall,
      byPackage,
      byMetric,
      topContributors: topContributors.map(p => ({
        package: p.package,
        improvementPct: p.improvementPct,
      })),
    };

    // Save report
    const reportPath = resolve(process.cwd(), 'coverage/coverage-diff-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Report saved: ${reportPath}\n`);

    // Print summary
    this.printSummary(report);

    return report;
  }

  /**
   * Load coverage data from JSON file
   */
  private loadCoverageData(path: string, label: string): CoverageData | null {
    if (!existsSync(path)) {
      console.error(`   ❌ ${label} coverage file not found: ${path}`);
      return null;
    }

    try {
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      return data;
    } catch (error) {
      console.error(`   ❌ Failed to parse ${label} coverage: ${error}`);
      return null;
    }
  }

  /**
   * Calculate improvement between two coverage percentages
   */
  private calculateImprovement(
    baseline: number,
    meta: number,
    threshold: number
  ): CoverageImprovement {
    const improvement = meta - baseline;
    const improvementPct = baseline > 0 ? (improvement / baseline) * 100 : 0;
    const thresholdMet = improvement >= threshold;

    return {
      baseline,
      meta,
      improvement,
      improvementPct,
      thresholdMet,
      threshold,
    };
  }

  /**
   * Calculate package-level coverage diffs
   */
  private calculatePackageDiffs(baseline: CoverageData, meta: CoverageData): PackageDiff[] {
    const diffs: PackageDiff[] = [];

    // Get all package paths (exclude 'total')
    const baselinePackages = Object.keys(baseline).filter(key => key !== 'total');
    const metaPackages = Object.keys(meta).filter(key => key !== 'total');
    const allPackages = [...new Set([...baselinePackages, ...metaPackages])];

    for (const pkg of allPackages) {
      const baselineCov = baseline[pkg]?.lines.pct || 0;
      const metaCov = meta[pkg]?.lines.pct || 0;
      const improvement = metaCov - baselineCov;
      const improvementPct = baselineCov > 0 ? (improvement / baselineCov) * 100 : 0;

      const baselineLines = baseline[pkg]?.lines.total || 0;
      const metaLines = meta[pkg]?.lines.total || 0;
      const linesAdded = metaLines - baselineLines;

      const baselineCovered = baseline[pkg]?.lines.covered || 0;
      const metaCovered = meta[pkg]?.lines.covered || 0;
      const linesCovered = metaCovered - baselineCovered;

      diffs.push({
        package: pkg,
        baseline: baselineCov,
        meta: metaCov,
        improvement,
        improvementPct,
        linesAdded,
        linesCovered,
      });
    }

    return diffs.sort((a, b) => b.improvement - a.improvement);
  }

  /**
   * Print formatted summary
   */
  private printSummary(report: CoverageDiffReport): void {
    console.log('═'.repeat(60));
    console.log('📊 Coverage Improvement Summary\n');

    console.log('Overall Coverage:');
    console.log(
      `  ${report.overall.baseline.toFixed(2)}% → ${report.overall.meta.toFixed(2)}% (+${report.overall.improvement.toFixed(2)}%)\n`
    );

    console.log('Threshold Validation:');
    const status = report.overall.thresholdMet ? '✅ PASSED' : '❌ FAILED';
    console.log(`  Required: ${report.overall.threshold}%`);
    console.log(`  Achieved: ${report.overall.improvement.toFixed(2)}%`);
    console.log(`  Status: ${status}\n`);

    console.log('Top Contributors:');
    report.topContributors.forEach((contrib, idx) => {
      console.log(`  ${idx + 1}. ${contrib.package}: +${contrib.improvementPct.toFixed(2)}%`);
    });

    console.log('\n═'.repeat(60));

    if (!report.overall.thresholdMet) {
      console.log('\n⚠️  Coverage improvement below threshold!');
      console.log('💡 Review meta-test report for recommendations to close gaps.\n');
    } else {
      console.log('\n✅ Meta-testing successfully improved coverage!\n');
    }
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  let baselinePath = 'coverage/baseline-coverage-summary.json';
  let metaPath = 'coverage/meta-coverage-summary.json';
  let threshold = 5;

  const baselineIdx = args.indexOf('--baseline');
  if (baselineIdx !== -1 && args[baselineIdx + 1]) {
    baselinePath = args[baselineIdx + 1];
  }

  const metaIdx = args.indexOf('--meta');
  if (metaIdx !== -1 && args[metaIdx + 1]) {
    metaPath = args[metaIdx + 1];
  }

  const thresholdIdx = args.indexOf('--threshold');
  if (thresholdIdx !== -1 && args[thresholdIdx + 1]) {
    threshold = parseFloat(args[thresholdIdx + 1]);
  }

  return { baselinePath, metaPath, threshold };
}

/**
 * Main execution
 */
async function main() {
  try {
    const { baselinePath, metaPath, threshold } = parseArgs();

    const calculator = new CoverageDiffCalculator(baselinePath, metaPath, threshold);
    const report = await calculator.calculate();

    // Exit with error if threshold not met
    if (!report.overall.thresholdMet) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Coverage diff calculation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CoverageDiffCalculator, type CoverageDiffReport, type CoverageImprovement };
