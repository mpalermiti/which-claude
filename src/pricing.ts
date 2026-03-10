// Anthropic pricing table (as of January 2025)
// https://www.anthropic.com/pricing

import { ModelName } from './types.js';

export interface ModelPricing {
  inputPerMTok: number; // Price per million input tokens
  outputPerMTok: number; // Price per million output tokens
  apiModelId: string;
}

export const PRICING: Record<ModelName, ModelPricing> = {
  haiku: {
    inputPerMTok: 0.80,
    outputPerMTok: 4.00,
    apiModelId: 'claude-haiku-4-5-20251001',
  },
  sonnet: {
    inputPerMTok: 3.00,
    outputPerMTok: 15.00,
    apiModelId: 'claude-sonnet-4-6',
  },
  opus: {
    inputPerMTok: 15.00,
    outputPerMTok: 75.00,
    apiModelId: 'claude-opus-4-6',
  },
};

export function calculateCost(
  model: ModelName,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMTok;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMTok;
  return inputCost + outputCost;
}

export function calculateCostPer1k(
  model: ModelName,
  totalInputTokens: number,
  totalOutputTokens: number,
  numCalls: number
): number {
  const totalCost = calculateCost(model, totalInputTokens, totalOutputTokens);
  return (totalCost / numCalls) * 1000;
}

export function projectMonthlyCost(
  costPer1k: number,
  dailyCallVolume: number
): number {
  const dailyCost = (costPer1k / 1000) * dailyCallVolume;
  return dailyCost * 30;
}

export function projectAnnualCost(
  costPer1k: number,
  dailyCallVolume: number
): number {
  return projectMonthlyCost(costPer1k, dailyCallVolume) * 12;
}

export interface CostProjection {
  dailyVolume: number;
  model: ModelName;
  costPer1k: number;
  dailyCost: number;
  monthlyCost: number;
  annualCost: number;
}
