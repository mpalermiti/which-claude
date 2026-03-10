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

  // Run each case
  for (let i = 0; i < config.cases.length; i++) {
    const testCase = config.cases[i];

    // Determine thinking mode for this run
    const useThinking = opts.thinking === 'on' ||
                        (opts.thinking === 'auto' && (opts.models.includes('sonnet') || opts.models.includes('opus')));

    const results = await runCase(client, config, testCase.input, {
      models: opts.models,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      thinking: useThinking,
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

  // If thinking is 'auto', also test without thinking on sonnet/opus
  // and compare results (to be implemented in a future iteration)

  return caseResults;
}
