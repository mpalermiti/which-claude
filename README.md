# which-claude

**Find the right Claude model for your prompt. One command, all three models, clear recommendation.**

```bash
npx which-claude
```

Stop guessing which Claude tier to use. Test your actual prompt against Haiku, Sonnet, and Opus — get quality comparison, cost analysis, and a clear recommendation in **under 60 seconds**.

## Why This Matters

Choosing the wrong Claude tier costs you:
- **Too expensive:** Opus for simple tasks → $10K+/year wasted
- **Too cheap:** Haiku for complex logic → poor user experience, lost customers
- **Too slow:** Manual testing → hours of dev time

**Real example:** A support ticket classifier ran on Opus for 6 months at 10K requests/day. Switching to Haiku (which scored identically) saved **$10,122/year**. Total testing time with which-claude: 45 seconds.

## Features

- ✅ **Empirical comparison** — Test your prompt on Haiku, Sonnet, Opus
- ✅ **Cost analysis** — See exactly what you'll pay at scale
- ✅ **Thinking mode detection** — Know if extended thinking improves quality
- ✅ **Prompt caching recommendations** — Identify 40-60% savings opportunities
- ✅ **Watch mode** — Auto-rerun on config changes during iteration
- ✅ **Zero setup** — `npx which-claude`, no installation required

## Installation

**No installation needed** — run via npx:

```bash
npx which-claude
```

Or install globally:

```bash
npm install -g which-claude
which-claude
```

## Quick Start

1. **Set your API key:**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   # Or create .env file: echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
   ```

2. **Create a config file** (`which-claude.yaml`):
   ```yaml
   name: "My classifier"
   system: "Classify as: positive, negative, neutral"
   cases:
     - input: "I love this!"
       expect: "positive"
     - input: "This is terrible"
       expect: "negative"
   ```

3. **Run it:**
   ```bash
   npx which-claude
   ```

## Demo

```
which-claude · Email tone classifier · 3 cases

┌────────┬─────────┬────────┬────────┬───────────┐
│ Model  │ Quality │ Avg ms │ Tokens │ Cost / 1K │
├────────┼─────────┼────────┼────────┼───────────┤
│ Haiku  │   3/3   │   507  │  181   │  $0.061   │
│ Sonnet │   3/3   │  1161  │  184   │  $0.232   │
└────────┴─────────┴────────┴────────┴───────────┘

✅ Use HAIKU
   All models scored 3/3. Haiku saves 74% vs Sonnet.
```

**Cost / 1K** = cost per 1,000 API calls at this token usage.

**Key insight:** Both models perform perfectly, but Haiku is 74% cheaper!

## Config Format

### Structured output (classification, extraction, JSON)

```yaml
# which-claude.yaml
name: "Ticket classifier"

system: |
  You are a support ticket classifier. Respond with exactly one label:
  account_access, billing, technical, feature_request, other

cases:
  - input: "I can't log in to my account"
    expect: "account_access"
  - input: "How do I upgrade my plan?"
    expect: "billing"
  - input: "Your API is returning 500 errors on the /users endpoint"
    expect: "technical"
  - input: "Can you add dark mode?"
    expect: "feature_request"
  - input: "I love your product, just wanted to say thanks"
    expect: "other"
```

### Generative output (summaries, rewrites, chat)

```yaml
name: "Email summarizer"

system: |
  Summarize the following email in 1-2 sentences. Be concise and capture
  the key action item if one exists.

cases:
  - input: |
      Hi team, just a heads up that the Q3 board deck is due Friday.
      Sarah will own slides 1-10, Mike has 11-20. Please have drafts
      in the shared drive by Thursday EOD so I can do a final pass.
    criteria: "Should mention the Friday deadline and the draft-by-Thursday ask"
  - input: |
      Following up on our call — legal approved the vendor contract
      with the amendments we discussed. I'll send the redline tomorrow
      for your signature. No further changes needed on our end.
    criteria: "Should mention legal approval and upcoming signature request"
```

### Options

```yaml
name: "My task"
system: "..."

# Optional configuration
options:
  models: [haiku, sonnet, opus]       # Default: all three
  temperature: 0                       # Default: 0 (deterministic)
  max_tokens: 1024                     # Default: 1024
  runs: 1                              # Default: 1. Set >1 to measure consistency
  thinking: auto                       # Default: auto. Options: auto, on, off
                                       # "auto" tests with and without on Sonnet/Opus
                                       # and reports if thinking improves results

cases:
  - input: "..."
    expect: "..."                      # Exact match (structured)
    criteria: "..."                    # Judge-scored (generative) — uses strongest model as judge
    match: contains                    # Optional: exact (default), contains, startsWith, regex
```

## Output

### Structured tasks

```
which-claude · Ticket classifier · 5 cases

┌──────────┬──────────┬──────────┬─────────┬──────────────┐
│ Model    │ Accuracy │  Avg ms  │ Tokens  │ Cost / 1K    │
├──────────┼──────────┼──────────┼─────────┼──────────────┤
│ Haiku    │   5/5    │   280    │   843   │   $0.005     │
│ Sonnet   │   5/5    │   710    │   901   │   $0.017     │
│ Opus     │   5/5    │  1,340   │  1,044  │   $0.031     │
└──────────┴──────────┴──────────┴─────────┴──────────────┘

✅ Recommendation: Use Haiku
   All models scored 100%. Haiku saves ~71% vs Sonnet with no quality loss.
```

### Generative tasks (judge-scored)

```
which-claude · Email summarizer · 2 cases

┌──────────┬──────────┬──────────┬─────────┬──────────────┐
│ Model    │ Quality  │  Avg ms  │ Tokens  │ Cost / 1K    │
├──────────┼──────────┼──────────┼─────────┼──────────────┤
│ Haiku    │  3.5/5   │   310    │   612   │   $0.004     │
│ Sonnet   │  4.5/5   │   780    │   701   │   $0.014     │
│ Opus     │  5.0/5   │  1,290   │   823   │   $0.028     │
└──────────┴──────────┴──────────┴─────────┴──────────────┘

⚠️ Recommendation: Use Sonnet
   Haiku missed nuance on case 2 (scored 3/5 — omitted the action item).
   Sonnet captures key details at ~50% the cost of Opus.
   Opus is strongest but the quality gap vs Sonnet is small.
```

### Thinking mode detection

When `thinking: auto`, if extended thinking meaningfully improves results on Sonnet, the output includes:

```
💡 Thinking: Sonnet + thinking scored 4.8/5 vs 4.5/5 without.
   Consider enabling thinking for this task — adds ~$0.003/call.
```

### Failure detail

When models disagree or miss cases, show what went wrong:

```
npx which-claude --verbose
```

```
Case 3: "The widget crashes when I click save on mobile Safari"
  Haiku:  "technical"  ✓
  Sonnet: "technical"  ✓
  Opus:   "technical"  ✓

Case 5: "I love your product, just wanted to say thanks"
  Haiku:  "feature_request"  ✗ (expected: "other")
  Sonnet: "other"  ✓
  Opus:   "other"  ✓
```

## CLI Reference

```bash
npx which-claude [options]

Core:
  --config, -c <path>      Config file (default: ./which-claude.yaml)
  --models, -m <models>    Override models (e.g., -m haiku,sonnet)
  --dry-run                Validate config and show estimated cost

Output:
  --verbose, -v            Show per-case results for each model
  --json                   Output as JSON (for CI/CD)
  --no-recommend           Skip recommendation, just show table

Analysis:
  --project <volume>       Show cost at daily volume (e.g., --project 10000)
  --quick-ref              Show costs at 1K/10K/100K scale
  --analyze-caching        Show prompt caching savings potential

Development:
  --watch, -w              Auto-rerun on config file changes
```

## Examples

See the [examples/](./examples) directory for more configs:
- [sentiment.yaml](./examples/sentiment.yaml) — Product review classification
- [summarization.yaml](./examples/summarization.yaml) — Meeting notes with judge scoring

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and version history.

## When NOT to use which-claude

**Use promptfoo instead if you need:**
- Multi-provider comparison (Claude vs GPT-4 vs Gemini)
- Advanced testing (RAG pipelines, agents, multi-turn conversations)
- Enterprise features (team dashboards, CI/CD integration, red-teaming)

**Use which-claude if you need:**
- Fast answer: "Is Haiku good enough or do I need Sonnet?"
- Cost projection: "What will this cost at 10K calls/day?"
- Zero setup: `npx which-claude` and get results in 60 seconds

Both tools are excellent. Promptfoo is a comprehensive testing platform. which-claude is a decision tool optimized for one question: which Claude tier to use.

## Contributing

PRs welcome. Keep the core simple — the value is in opinionated defaults, not feature count.

## License

MIT
