// Shared TypeScript types for which-claude

export type ModelName = 'haiku' | 'sonnet' | 'opus';
export type MatchType = 'exact' | 'contains' | 'startsWith' | 'regex';
export type ThinkingMode = 'auto' | 'on' | 'off';

export interface TestCase {
  input: string;
  expect?: string;
  criteria?: string;
  match?: MatchType;
}

export interface ConfigOptions {
  models?: ModelName[];
  temperature?: number;
  max_tokens?: number;
  runs?: number;
  thinking?: ThinkingMode;
}

export interface Config {
  name: string;
  system: string;
  cases: TestCase[];
  options?: ConfigOptions;
}

export interface ModelResult {
  model: ModelName;
  output: string;
  latency: number; // ms
  inputTokens: number;
  outputTokens: number;
  thinking?: boolean;
}

export interface CaseResult {
  caseIndex: number;
  input: string;
  expected?: string;
  results: ModelResult[];
  scores: Map<ModelName, number>; // 0-1 for exact match, 1-5 for judge
}

export interface ModelSummary {
  model: ModelName;
  accuracy?: number; // For exact match cases (0-1)
  quality?: number; // For judge-scored cases (1-5)
  avgLatency: number;
  totalTokens: number;
  costPer1k: number;
  thinking?: boolean;
}

export interface ComparisonResult {
  configName: string;
  caseResults: CaseResult[];
  summaries: ModelSummary[];
  recommendation?: string;
}
