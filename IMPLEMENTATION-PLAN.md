# Implementation Plan: Items 10, 11, 12, 14

## 10. Batch Mode (3-4 hours)

### Goal
Use Anthropic's Batch API for 50% cost savings on large test suites (>100 cases).

### Technical Approach

**Phase 1: Batch submission** (1.5 hours)
- Create `src/batch.ts` module
- Format requests for Batch API:
  ```typescript
  {
    custom_id: `case-${i}-${model}`,
    params: {
      model: modelId,
      max_tokens: 1024,
      messages: [...]
    }
  }
  ```
- Submit batch via `client.batches.create()`
- Store batch ID

**Phase 2: Polling & retrieval** (1 hour)
- Poll batch status every 5 seconds
- Show progress: `⏳ Batch processing: 45/100 complete`
- When `status: 'ended'`, download results
- Parse JSONL results back into `ModelResult[]` format

**Phase 3: Integration** (30 min)
- Add `--batch` flag to CLI
- Modify `runAllCases()` to detect batch mode
- Route to `runAllCasesViaBatch()` instead
- Rest of pipeline (evaluation, recommendation) unchanged

**Phase 4: UX improvements** (30 min)
- Show estimated wait time (batches typically 10-30 min)
- Add `--batch-id <id>` to resume checking existing batch
- Store batch submissions in `.which-claude/batches.json` for recovery

### Edge Cases
- Batch fails mid-process → retry individual failed requests
- User Ctrl+C → save batch ID, allow resume
- Rate limits → batch API has different limits, handle separately

### Files to Create/Modify
- **New**: `src/batch.ts` (batch submission, polling, parsing)
- **Modify**: `src/index.ts` (add --batch flag, route logic)
- **Modify**: `src/runner.ts` (export shared request formatting)

---

## 11. Prompt Caching Analysis (2-3 hours)

### Goal
Show how much users could save if they enabled prompt caching for system prompts.

### Technical Approach

**Phase 1: Caching calculation** (1 hour)
- Add caching pricing to `src/pricing.ts`:
  ```typescript
  export const CACHE_PRICING = {
    write: 0.30,  // per MTok (25% of base input)
    read: 0.03,   // per MTok (90% discount)
  };
  ```
- Calculate cache savings:
  - System prompt tokens → cached (write once, read N times)
  - Input tokens → not cached
  - Show: "Without cache: $X, With cache: $Y (Z% savings)"

**Phase 2: Cache-aware cost projection** (45 min)
- Detect if system prompt is "cacheable" (>1024 tokens = worthwhile)
- Add to dry-run output:
  ```
  💡 Caching opportunity:
     System prompt: 1,843 tokens
     Without caching: $0.0049 per call
     With caching: $0.0012 per call (76% savings)
     Enable: Add cache_control breakpoints to system prompt
  ```

**Phase 3: Show cache breakpoint suggestion** (45 min)
- Generate example config showing where to add cache_control:
  ```yaml
  system:
    - type: text
      text: "Your long system prompt here..."
      cache_control: { type: "ephemeral" }
  ```
- Show in recommendation if system prompt >1024 tokens

**Phase 4: Optional cache simulation** (30 min)
- Add `--simulate-cache` flag
- Actually test with cache_control enabled
- Compare real costs (cache writes/reads) vs without cache
- Show measured savings

### Files to Create/Modify
- **Modify**: `src/pricing.ts` (add cache pricing constants)
- **New**: `src/caching.ts` (cache analysis logic)
- **Modify**: `src/output.ts` (add caching recommendation to dry-run)
- **Modify**: `src/recommender.ts` (include cache savings in recommendation)

---

## 12. Watch Mode (1-2 hours)

### Goal
Re-run tests automatically when config file changes (for prompt iteration).

### Technical Approach

**Phase 1: File watching** (30 min)
- Use Node's built-in `fs.watch()` or `chokidar` library
- Watch the config file path
- Debounce changes (500ms) to avoid multiple triggers during save

**Phase 2: Clear & re-run** (30 min)
- On file change:
  1. Clear console (`console.clear()`)
  2. Show: `🔄 Detected change, re-running...`
  3. Re-load config
  4. Re-run tests
  5. Display results
- Handle config validation errors gracefully (show error, keep watching)

**Phase 3: CLI integration** (15 min)
- Add `--watch` flag
- Modify main loop to stay alive:
  ```typescript
  if (options.watch) {
    console.log(chalk.dim('👀 Watching for changes... (Ctrl+C to stop)\n'));
    watchConfigFile(options.config, () => runTests());
  }
  ```

**Phase 4: UX improvements** (15 min)
- Show timestamp of each run
- Show what changed (if parseable)
- Add visual separator between runs
- Graceful shutdown on Ctrl+C

### Files to Create/Modify
- **New**: `src/watch.ts` (file watching logic)
- **Modify**: `src/index.ts` (add --watch flag, watch loop)
- **Add dependency**: `chokidar` (better cross-platform file watching)

---

## 14. Cost Projection (1 hour)

### Goal
Show monthly/annual cost savings at scale: "At 10K calls/day, Haiku saves $X/month vs Sonnet."

### Technical Approach

**Phase 1: Projection calculation** (20 min)
- Add to `src/pricing.ts`:
  ```typescript
  export function projectMonthlyCost(
    costPer1k: number,
    dailyCallVolume: number
  ): number {
    const dailyCost = (costPer1k / 1000) * dailyCallVolume;
    return dailyCost * 30;
  }
  ```

**Phase 2: CLI flag** (10 min)
- Add `--project <volume>` flag
- Parse volume (e.g., `--project 10000` = 10K calls/day)
- Calculate for each model

**Phase 3: Output rendering** (20 min)
- Add to table or recommendation:
  ```
  📊 Cost projection at 10,000 calls/day:
     Haiku:  $610/month  ($7,320/year)
     Sonnet: $2,320/month ($27,840/year)

     💰 Haiku saves $1,710/month ($20,520/year) vs Sonnet
  ```

**Phase 4: Smart defaults** (10 min)
- If no `--project` flag, suggest based on common volumes:
  - 1K/day = small side project
  - 10K/day = medium SaaS
  - 100K/day = large production app
- Show quick reference table:
  ```
  Cost at scale:
  ├─ 1K/day:   Haiku $61/mo   Sonnet $232/mo
  ├─ 10K/day:  Haiku $610/mo  Sonnet $2,320/mo
  └─ 100K/day: Haiku $6,100/mo Sonnet $23,200/mo
  ```

### Files to Create/Modify
- **Modify**: `src/pricing.ts` (add projection functions)
- **Modify**: `src/output.ts` (render projection table)
- **Modify**: `src/index.ts` (add --project flag)

---

## Priority Order (if doing sequentially)

1. **#14 Cost Projection** (1 hour) — Easiest, high impact for justifying choices
2. **#12 Watch Mode** (1-2 hours) — Great DX for prompt iteration
3. **#11 Prompt Caching** (2-3 hours) — Medium complexity, real savings
4. **#10 Batch Mode** (3-4 hours) — Most complex, niche use case (wait for demand)

## Total Effort
- **All 4 features**: 7.5-10 hours
- **Just #14, #12, #11**: 4.5-6 hours (skip batch mode for now)

## Recommendation

**Ship v1.0 now, add #14 and #12 in v1.1 based on user feedback.**

These are the two features most likely to get requested:
- Cost projection helps sell the tool internally ("Look how much we'll save!")
- Watch mode makes the tool sticky for daily use

Batch mode and caching are optimization features — wait to see if users with large test suites or long system prompts actually materialize.

---

## Next Steps

Which approach:
1. **Build all 4 now** (~8 hours) before launch
2. **Build #14 + #12** (~2 hours) and ship
3. **Skip all, ship v1.0** as-is, add based on demand

Your call.
