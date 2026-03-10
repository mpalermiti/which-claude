// Recommendation logic based on results

import { ModelSummary, CaseResult, ModelName } from './types.js';
import { calculateCostPer1k } from './pricing.js';

export function buildSummaries(
  caseResults: CaseResult[],
  models: ModelName[]
): ModelSummary[] {
  const summaries: ModelSummary[] = [];

  for (const model of models) {
    let totalScore = 0;
    let totalLatency = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const caseResult of caseResults) {
      const score = caseResult.scores.get(model) || 0;
      totalScore += score;

      const result = caseResult.results.find((r) => r.model === model);
      if (result) {
        totalLatency += result.latency;
        totalInputTokens += result.inputTokens;
        totalOutputTokens += result.outputTokens;
      }
    }

    const avgLatency = totalLatency / caseResults.length;
    const totalTokens = totalInputTokens + totalOutputTokens;

    // Determine if this is exact match (0-1) or judge scoring (1-5)
    const firstCase = caseResults[0];
    const isExactMatch = firstCase.expected !== undefined;

    const summary: ModelSummary = {
      model,
      avgLatency,
      totalTokens,
      costPer1k: calculateCostPer1k(
        model,
        totalInputTokens,
        totalOutputTokens,
        caseResults.length
      ),
    };

    if (isExactMatch) {
      summary.accuracy = totalScore / caseResults.length;
    } else {
      summary.quality = totalScore / caseResults.length;
    }

    summaries.push(summary);
  }

  return summaries;
}

export function generateRecommendation(summaries: ModelSummary[]): string {
  // Sort by quality/accuracy (descending), then by cost (ascending)
  const sorted = [...summaries].sort((a, b) => {
    const scoreA = a.accuracy ?? a.quality ?? 0;
    const scoreB = b.accuracy ?? b.quality ?? 0;
    if (Math.abs(scoreA - scoreB) > 0.1) {
      return scoreB - scoreA; // Higher score first
    }
    return a.costPer1k - b.costPer1k; // Lower cost first if scores are close
  });

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const mid = sorted.length > 2 ? sorted[1] : null;

  const isExactMatch = best.accuracy !== undefined;
  const bestScore = best.accuracy ?? best.quality ?? 0;
  const worstScore = worst.accuracy ?? worst.quality ?? 0;

  // All models perform equally well → recommend cheapest
  if (Math.abs(bestScore - worstScore) < 0.1) {
    const cheapest = [...summaries].sort((a, b) => a.costPer1k - b.costPer1k)[0];
    const savings = ((best.costPer1k - cheapest.costPer1k) / best.costPer1k) * 100;
    return `✅ Use ${cheapest.model.toUpperCase()}\n   All models scored ${bestScore.toFixed(isExactMatch ? 0 : 1)}${isExactMatch ? '/' + summaries.length : '/5'}. ${cheapest.model.charAt(0).toUpperCase() + cheapest.model.slice(1)} saves ~${savings.toFixed(0)}% vs ${best.model} with no quality loss.`;
  }

  // Mid-tier offers good balance
  if (mid && bestScore - (mid.accuracy ?? mid.quality ?? 0) < 0.3) {
    const savings = ((best.costPer1k - mid.costPer1k) / best.costPer1k) * 100;
    return `⚠️  Use ${mid.model.toUpperCase()}\n   ${best.model.charAt(0).toUpperCase() + best.model.slice(1)} scores highest (${bestScore.toFixed(1)}) but ${mid.model} is close (${(mid.accuracy ?? mid.quality ?? 0).toFixed(1)}) at ~${savings.toFixed(0)}% lower cost.\n   ${worst.model.charAt(0).toUpperCase() + worst.model.slice(1)} underperforms (${worstScore.toFixed(1)}).`;
  }

  // Only top model succeeds
  return `🔴 Use ${best.model.toUpperCase()}\n   Only ${best.model} meets quality requirements (${bestScore.toFixed(1)}${isExactMatch ? '/' + summaries.length : '/5'}).\n   ${worst.model.charAt(0).toUpperCase() + worst.model.slice(1)} scored ${worstScore.toFixed(1)} — insufficient for this task.`;
}
