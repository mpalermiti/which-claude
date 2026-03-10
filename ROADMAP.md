# which-claude Roadmap

## Pre-Launch (v1.0) — Required for solid first release

### 1. Fix .env on second line bug
- **Why**: Current .env parsing broke when key was on separate line
- **Effort**: 5 min
- **Impact**: Prevents user frustration on setup

### 2. Add shebang to compiled output
- **Why**: `npx which-claude` needs executable dist/index.js
- **Effort**: 5 min
- **Impact**: Core UX — tool won't run via npx without this

### 3. Test with real API call
- **Why**: Haven't validated end-to-end flow yet (blocked on credits)
- **Effort**: 10 min once credits added
- **Impact**: Critical — could reveal runtime bugs

### 4. Improve error messages
- **Why**: Current errors are raw (e.g., "400 credit balance too low")
- **Effort**: 20 min
- **Impact**: Better DX, fewer confused users
- **Changes**:
  - Wrap API errors with helpful context
  - Add link to console.anthropic.com/settings/billing on credit errors
  - Better config validation errors (show which case failed, why)

### 5. Add cost estimate to dry-run
- **Why**: "Estimated cost depends on prompt/response length" is vague
- **Effort**: 30 min
- **Impact**: Users want to know "will this cost $0.10 or $10?"
- **Approach**: Calculate based on average system prompt + input tokens

### 6. README polish
- **Why**: First impression on GitHub/npm
- **Effort**: 30 min
- **Changes**:
  - Add demo GIF/screenshot of output table
  - Clarify when to use which-claude vs promptfoo
  - Add "Who this is for" section (indie builders, API cost optimization)
  - Link to example configs in repo

---

## Post-Launch (v1.1) — Quick wins after validation

### 7. Thinking mode comparison
- **Why**: Mentioned in README but not implemented
- **Effort**: 2 hours
- **Impact**: High — "should I enable thinking?" is a real question
- **Approach**:
  - When `thinking: auto`, run Sonnet/Opus twice (with/without)
  - Compare scores, show delta in output
  - Recommend enabling if quality gap > 0.3 and cost increase acceptable

### 8. Verbose mode improvements
- **Why**: Current verbose output shows responses but hard to read
- **Effort**: 1 hour
- **Impact**: Debugging model disagreements is core use case
- **Changes**:
  - Truncate long outputs (show first 100 chars + "...")
  - Color-code correct/incorrect responses
  - Show what judge scored each response (for criteria cases)

### 9. JSON output mode
- **Why**: Already in CLI flags but not fully implemented
- **Effort**: 30 min
- **Impact**: CI/CD integration, scripting

---

## Future (v1.2+) — Deeper features, wait for demand

### 10. Batch mode
- **Why**: 50% cost savings for large test suites
- **Effort**: 3-4 hours (new Anthropic Batch API integration)
- **Impact**: High for users with >100 test cases
- **Flag**: `--batch` (submit all cases, poll for results)

### 11. Prompt caching analysis
- **Why**: Caching can save 90% on input tokens
- **Effort**: 2-3 hours
- **Impact**: Medium — only valuable if system prompt is long
- **Approach**:
  - Calculate savings if system prompt were cached
  - Show in recommendation: "With caching: Haiku saves 85% vs 71%"

### 12. Watch mode
- **Why**: Re-run on config changes during prompt iteration
- **Effort**: 1-2 hours
- **Impact**: Medium — nice for active development
- **Flag**: `--watch`

### 13. Historical tracking
- **Why**: "Did my prompt get better/worse over time?"
- **Effort**: 4-5 hours (SQLite setup, migration logic)
- **Impact**: Low priority — feature creep risk
- **Approach**: Save results to `.which-claude/history.db`, show trends

### 14. Cost projection
- **Why**: "At 10k calls/day, Haiku saves $X/month"
- **Effort**: 1 hour
- **Impact**: Medium — helps justify tier choice to stakeholders
- **Flag**: `--project 10000` (num daily calls)

### 15. Multi-provider support
- **Why**: Compare Claude vs GPT vs Gemini
- **Effort**: 8+ hours (breaks current architecture)
- **Impact**: High but risky — becomes promptfoo competitor
- **Decision**: Wait for demand signal. If users ask for this repeatedly, consider. Otherwise, stay focused on Claude.

---

## Non-Goals (Explicitly saying no)

- **Web dashboard** — Defeats "one command" simplicity
- **Hosted service** — User owns their API key, no middleman
- **Complex eval metrics** (RAG, hallucination detection, etc.) — Use promptfoo/DeepEval for that
- **Prompt optimization suggestions** — Out of scope, focus on model selection

---

## Prioritization Logic

**Pre-Launch (1-6)**: Must-haves for credible v1.0
**Post-Launch (7-9)**: Quick wins if users care
**Future (10-15)**: Build only if validated by user requests

**Philosophy**: Ship minimal, useful, focused tool. Resist feature creep. Let user feedback pull features, don't push them.

---

## Launch Checklist

- [ ] Items 1-6 complete
- [ ] Test with real API calls (3+ configs)
- [ ] README has demo GIF
- [ ] GitHub repo public
- [ ] npm publish (check package name availability first)
- [ ] Post Show HN
- [ ] Post r/ClaudeAI
- [ ] Tweet with @AnthropicAI tag
- [ ] Monitor GitHub issues for first 2 weeks

---

## Success Metrics

**Week 1**: 50+ npm downloads
**Week 2**: 100+ npm downloads, 1+ GitHub issue
**Month 1**: 500+ npm downloads, 5+ stars

If these hit, invest in v1.1. If not, park the project and move on.
