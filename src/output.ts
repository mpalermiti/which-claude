// Table rendering and output formatting

import Table from 'cli-table3';
import chalk from 'chalk';
import { ComparisonResult, CaseResult } from './types.js';

export function renderTable(result: ComparisonResult): void {
  console.log(
    chalk.bold(`\nwhich-claude · ${result.configName} · ${result.caseResults.length} cases\n`)
  );

  const table = new Table({
    head: [
      chalk.bold('Model'),
      chalk.bold('Quality'),
      chalk.bold('Avg ms'),
      chalk.bold('Tokens'),
      chalk.bold('Cost / 1K'),
    ],
    style: {
      head: ['cyan'],
    },
  });

  const isExactMatch = result.summaries[0].accuracy !== undefined;

  for (const summary of result.summaries) {
    const qualityCell = isExactMatch
      ? `${summary.accuracy! * result.caseResults.length}/${result.caseResults.length}`
      : `${summary.quality!.toFixed(1)}/5`;

    table.push([
      summary.model.charAt(0).toUpperCase() + summary.model.slice(1),
      qualityCell,
      Math.round(summary.avgLatency).toString(),
      summary.totalTokens.toString(),
      `$${summary.costPer1k.toFixed(3)}`,
    ]);
  }

  console.log(table.toString());

  if (result.recommendation) {
    console.log('\n' + result.recommendation + '\n');
  }
}

export function renderVerbose(result: ComparisonResult): void {
  console.log(chalk.bold(`\n${result.configName} - Detailed Results\n`));

  for (let i = 0; i < result.caseResults.length; i++) {
    const caseResult = result.caseResults[i];
    console.log(chalk.bold(`Case ${i + 1}:`), caseResult.input.slice(0, 80));

    for (const modelResult of caseResult.results) {
      const score = caseResult.scores.get(modelResult.model);
      const isCorrect = caseResult.expected
        ? score === 1
        : (score ?? 0) >= 4;

      const icon = isCorrect ? chalk.green('✓') : chalk.red('✗');
      const scoreText = caseResult.expected
        ? ''
        : ` (${score}/5)`;

      console.log(
        `  ${modelResult.model.padEnd(8)} "${modelResult.output.slice(0, 60)}" ${icon}${scoreText}`
      );
    }

    console.log();
  }
}

export function renderJson(result: ComparisonResult): void {
  const output = {
    name: result.configName,
    cases: result.caseResults.length,
    summaries: result.summaries.map((s) => ({
      model: s.model,
      accuracy: s.accuracy,
      quality: s.quality,
      avgLatency: Math.round(s.avgLatency),
      totalTokens: s.totalTokens,
      costPer1k: s.costPer1k,
    })),
    recommendation: result.recommendation,
  };

  console.log(JSON.stringify(output, null, 2));
}

export function renderDryRun(
  configName: string,
  numCases: number,
  models: string[]
): void {
  console.log(chalk.bold(`\n🧪 Dry run: ${configName}\n`));
  console.log(`Cases: ${numCases}`);
  console.log(`Models: ${models.join(', ')}`);
  console.log(`Total API calls: ${numCases * models.length}`);
  console.log(
    chalk.yellow('\nNote: Estimated cost depends on prompt/response length.')
  );
  console.log(chalk.dim('Run without --dry-run to execute.\n'));
}
