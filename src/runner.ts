// Concurrent API calls with rate limiting

import Anthropic from '@anthropic-ai/sdk';
import { Config, ModelName, ModelResult, CaseResult } from './types.js';
import { PRICING } from './pricing.js';
import { getDefaultOptions } from './config.js';
import { evaluateCase } from './evaluator.js';

interface RunOptions {
  models: ModelName[];
  temperature: number;
  max_tokens: number;
  thinking: boolean;
}

export async function runCase(
  client: Anthropic,
  config: Config,
  caseInput: string,
  options: RunOptions
): Promise<ModelResult[]> {
  const results: ModelResult[] = [];

  // Run all models concurrently for this case
  const promises = options.models.map(async (model) => {
    const start = Date.now();

    // Build request params
    const params: any = {
      model: PRICING[model].apiModelId,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      messages: [
        {
          role: 'user',
          content: caseInput,
        },
      ],
      system: config.system,
    };

    // Add thinking parameter if enabled (requires extended_thinking feature)
    if (options.thinking) {
      params.thinking = { type: 'enabled', budget_tokens: 2000 };
    }

    const response = await client.messages.create(params);

    const latency = Date.now() - start;

    // Extract text content
    let output = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        output += block.text;
      }
    }

    return {
      model,
      output: output.trim(),
      latency,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      thinking: options.thinking,
    };
  });

  results.push(...(await Promise.all(promises)));
  return results;
}

export async function runAllCases(
  client: Anthropic,
  config: Config
): Promise<CaseResult[]> {
  const defaults = getDefaultOptions();
  const opts = { ...defaults, ...config.options };

  const caseResults: CaseResult[] = [];

  // Determine judge model (strongest model being tested)
  const judgeModel: ModelName = opts.models.includes('opus')
    ? 'opus'
    : opts.models.includes('sonnet')
    ? 'sonnet'
    : 'haiku';

  // Determine if we should test thinking mode
  const shouldTestThinking = opts.thinking === 'auto' &&
    (opts.models.includes('sonnet') || opts.models.includes('opus'));

  // Determine default thinking mode for main run
  const defaultThinking = opts.thinking === 'on' || shouldTestThinking;

  // Run each case with default settings
  for (let i = 0; i < config.cases.length; i++) {
    const testCase = config.cases[i];

    const results = await runCase(client, config, testCase.input, {
      models: opts.models,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      thinking: defaultThinking,
    });

    const scores = await evaluateCase(client, testCase, results, judgeModel);

    caseResults.push({
      caseIndex: i,
      input: testCase.input,
      expected: testCase.expect,
      results,
      scores,
    });
  }

  return caseResults;
}

// Run cases with thinking mode comparison
export async function runAllCasesWithThinkingComparison(
  client: Anthropic,
  config: Config
): Promise<{ withThinking: CaseResult[]; withoutThinking: CaseResult[] }> {
  const defaults = getDefaultOptions();
  const opts = { ...defaults, ...config.options };

  // Filter to only models that support thinking
  const thinkingModels = opts.models.filter((m) => m === 'sonnet' || m === 'opus');

  if (thinkingModels.length === 0) {
    // No models support thinking, return empty comparison
    const main = await runAllCases(client, config);
    return { withThinking: main, withoutThinking: [] };
  }

  // Determine judge model
  const judgeModel: ModelName = opts.models.includes('opus')
    ? 'opus'
    : opts.models.includes('sonnet')
    ? 'sonnet'
    : 'haiku';

  const withThinking: CaseResult[] = [];
  const withoutThinking: CaseResult[] = [];

  // Run each case twice - with and without thinking
  for (let i = 0; i < config.cases.length; i++) {
    const testCase = config.cases[i];

    // Run with thinking
    const resultsWithThinking = await runCase(client, config, testCase.input, {
      models: thinkingModels,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      thinking: true,
    });

    const scoresWithThinking = await evaluateCase(
      client,
      testCase,
      resultsWithThinking,
      judgeModel
    );

    withThinking.push({
      caseIndex: i,
      input: testCase.input,
      expected: testCase.expect,
      results: resultsWithThinking,
      scores: scoresWithThinking,
    });

    // Run without thinking
    const resultsWithoutThinking = await runCase(client, config, testCase.input, {
      models: thinkingModels,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      thinking: false,
    });

    const scoresWithoutThinking = await evaluateCase(
      client,
      testCase,
      resultsWithoutThinking,
      judgeModel
    );

    withoutThinking.push({
      caseIndex: i,
      input: testCase.input,
      expected: testCase.expect,
      results: resultsWithoutThinking,
      scores: scoresWithoutThinking,
    });
  }

  return { withThinking, withoutThinking };
}
