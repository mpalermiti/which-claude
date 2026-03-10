// Batch API support for 50% cost savings

import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk';
import { Config, CaseResult, ModelResult, ModelName } from './types.js';
import { PRICING } from './pricing.js';
import { evaluateCase } from './evaluator.js';
import { getDefaultOptions } from './config.js';

interface BatchRequest {
  custom_id: string;
  params: {
    model: string;
    max_tokens: number;
    temperature: number;
    messages: Array<{ role: string; content: string }>;
    system?: string;
  };
}

export async function runAllCasesViaBatch(
  client: Anthropic,
  config: Config
): Promise<CaseResult[]> {
  // TODO: Batch API not yet available in current Anthropic SDK version
  // Will be implemented when SDK is updated with batches support
  throw new Error(
    'Batch API not yet available. Update @anthropic-ai/sdk to latest version once batches are supported.'
  );
}

export async function resumeBatch(
  client: Anthropic,
  batchId: string
): Promise<void> {
  // TODO: Batch API not yet available in current Anthropic SDK version
  throw new Error(
    'Batch API not yet available. Update @anthropic-ai/sdk to latest version once batches are supported.'
  );
}
