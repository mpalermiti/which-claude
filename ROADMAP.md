# which-claude Roadmap

## v1.0.2 (SHIPPED) — March 11, 2026

**Bug fix release**
- Fixed recommendation text showing incorrect score (1/2 instead of 3/3)
- Fixed savings calculation (was showing ~0% instead of actual percentage)
- Fixed comparison model in output (was showing "vs haiku" instead of "vs sonnet")

## v1.0 (SHIPPED) — March 2026

All pre-launch and post-launch features complete!

### ✅ Shipped in v1.0

**Pre-Launch Features (1-6):**
1. ✅ .env handling with dotenv
2. ✅ Shebang preserved in compiled output
3. ✅ Real API testing validated
4. ✅ Enhanced error messages (credits, auth, rate limits)
5. ✅ Cost estimates in dry-run mode
6. ✅ README polish with demo examples

**Post-Launch Features (7-9):**
7. ✅ Thinking mode comparison (auto mode tests with/without)
8. ✅ Verbose mode improvements (color-coded, latency, better formatting)
9. ✅ JSON output mode (full per-case results)

**Advanced Features (11, 12, 14):**
11. ✅ Prompt caching analysis (`--analyze-caching`) — shows 40-60% savings
12. ✅ Watch mode (`--watch`) — auto-rerun on config changes
14. ✅ Cost projection (`--project`, `--quick-ref`) — monthly/annual savings

**Results:**
- 13/14 planned features shipped
- Real-world tested with live API
- GitHub repo: https://github.com/mpalermiti/which-claude
- Ready for npm publish

---

## v1.1 (Planned) — When Anthropic SDK adds Batch API

### 10. Batch mode (STUBBED, waiting for SDK)
- **Status**: Infrastructure in place, waiting for `@anthropic-ai/sdk` to add `client.messages.batches`
- **Why**: 50% cost savings for large test suites via Anthropic Batch API
- **Impact**: High for users with >100 test cases
- **Flags**: `--batch`, `--batch-id <id>`
- **Implementation**: `src/batch.ts` ready, currently throws "SDK not yet available" error

---

## Future (v1.2+) — User-driven features

### 13. Historical tracking
- **Why**: "Did my prompt get better/worse over time?"
- **Effort**: 4-5 hours (SQLite setup, migration logic)
- **Impact**: Low priority — feature creep risk
- **Decision**: Only build if users request it repeatedly

### 15. Multi-provider support
- **Why**: Compare Claude vs GPT vs Gemini
- **Effort**: 8+ hours (breaks current architecture)
- **Impact**: High but risky — becomes promptfoo competitor
- **Decision**: Wait for demand signal. If users ask for this repeatedly, consider. Otherwise, stay focused on Claude.

---

## Prioritization Logic

**Pre-Launch (1-6)**: Must-haves for credible v1.0
**Post-Launch (7-9)**: Quick wins if users care
**Future (10-15)**: Build only if validated by user requests

**Philosophy**: Ship minimal, useful, focused tool. Resist feature creep. Let user feedback pull features, don't push them.

---

## Launch Checklist

- [x] Items 1-14 complete (13/14, batch mode deferred)
- [x] Test with real API calls (validated with live Anthropic API)
- [x] README has demo examples (DEMO.md + inline examples)
- [x] GitHub repo public (https://github.com/mpalermiti/which-claude)
- [x] npm package name confirmed available ("which-claude")
- [ ] npm publish (pending user login)
- [ ] Post Show HN
- [ ] Post r/ClaudeAI
- [ ] Tweet with @AnthropicAI tag
- [ ] Monitor GitHub issues for first 2 weeks

---

## Success Metrics (v1.0)

**Week 1**: 50+ npm downloads
**Week 2**: 100+ npm downloads, 1+ GitHub issue/star
**Month 1**: 500+ npm downloads, 10+ stars

**If metrics hit**: Invest in v1.1 (batch mode) + v1.2 features based on user requests
**If metrics miss**: Tool still serves original purpose (personal use for Amby/Glosignal model selection)
