#!/usr/bin/env node

// CLI entry point for which-claude

import { Command } from 'commander';
import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk';
import { loadConfig, getDefaultOptions } from './config.js';
import { runAllCases } from './runner.js';
import { buildSummaries, generateRecommendation } from './recommender.js';
import { renderTable, renderVerbose, renderJson, renderDryRun } from './output.js';
import { ModelName } from './types.js';

const program = new Command();

program
  .name('which-claude')
  .description('Find the right Claude model for your prompt')
  .version('0.1.0')
  .option('-c, --config <path>', 'Path to config file', './which-claude.yaml')
  .option('-v, --verbose', 'Show per-case results for each model')
  .option('--json', 'Output results as JSON')
  .option('-m, --models <models>', 'Override models to test (comma-separated)')
  .option('--dry-run', 'Validate config and show estimated cost')
  .option('--no-recommend', 'Skip recommendation')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    // Load and validate config
    const config = await loadConfig(options.config);

    // Merge options
    const defaults = getDefaultOptions();
    const modelList = options.models
      ? (options.models.split(',') as ModelName[])
      : config.options?.models || defaults.models;

    // Dry run mode
    if (options.dryRun) {
      renderDryRun(config.name, config.cases.length, modelList);
      return;
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error(
        chalk.red('Error: ANTHROPIC_API_KEY environment variable not set')
      );
      process.exit(1);
    }

    // Initialize Anthropic client
    const client = new Anthropic({ apiKey });

    // Run all test cases
    console.log(chalk.dim(`Running ${config.cases.length} cases across ${modelList.length} models...\n`));

    const caseResults = await runAllCases(client, {
      ...config,
      options: {
        ...config.options,
        models: modelList,
      },
    });

    // Build summaries
    const summaries = buildSummaries(caseResults, modelList);

    // Generate recommendation
    const recommendation = options.recommend !== false
      ? generateRecommendation(summaries)
      : undefined;

    const result = {
      configName: config.name,
      caseResults,
      summaries,
      recommendation,
    };

    // Output
    if (options.json) {
      renderJson(result);
    } else if (options.verbose) {
      renderVerbose(result);
      renderTable(result);
    } else {
      renderTable(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red('Unknown error occurred'));
    }
    process.exit(1);
  }
}

main();
