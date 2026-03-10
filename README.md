# which-claude

Find the right Claude model for your prompt. One command, all three models, clear recommendation.

```
npx which-claude
```

## The Problem

Every Claude API builder hits the same question: "Is Haiku good enough, or do I need Sonnet?" The answer is always "test it" — but nobody does because the setup is disproportionate to the question.

`which-claude` makes model selection empirical. Define your prompt and a few test cases. Get a comparison table with a recommendation in seconds.

## Quick Start

```bash
npx which-claude
```

Looks for `which-claude.yaml` in the current directory. Or specify a file:

```bash
npx which-claude --config path/to/config.yaml
```

Requires `ANTHROPIC_API_KEY` in your environment.

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

## CLI Flags

```
npx which-claude [options]

Options:
  --config, -c     Path to config file (default: ./which-claude.yaml)
  --verbose, -v    Show per-case results for each model
  --json           Output results as JSON (for scripting/CI)
  --models, -m     Override models to test (e.g., -m haiku,sonnet)
  --dry-run        Validate config and show estimated cost without running
  --no-recommend   Skip the recommendation, just show the table
```

## License

MIT
