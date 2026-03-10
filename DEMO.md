# which-claude Demo

## Basic Usage

```bash
npx which-claude
```

**Output:**

```
which-claude · Email tone classifier · 3 cases

┌────────┬─────────┬────────┬────────┬───────────┐
│ Model  │ Quality │ Avg ms │ Tokens │ Cost / 1K │
├────────┼─────────┼────────┼────────┼───────────┤
│ Haiku  │   3/3   │   507  │  181   │  $0.061   │
├────────┼─────────┼────────┼────────┼───────────┤
│ Sonnet │   3/3   │  1161  │  184   │  $0.232   │
└────────┴─────────┴────────┴────────┴───────────┘

✅ Use HAIKU
   All models scored 3/3. Haiku saves 74% vs Sonnet with no quality loss.
```

**Key Insight:** Both models perform perfectly, but Haiku is 74% cheaper!

---

## Cost Projection

```bash
npx which-claude --project 10000
```

**Output:**

```
📊 Cost projection at 10,000 calls/day:

  Haiku    $18/month            ($220/year)
  Sonnet   $70/month            ($835/year)

  💰 Haiku saves $51/month ($615/year) vs Sonnet
```

**Key Insight:** At scale, choosing the right model saves thousands per year.

---

## Thinking Mode Analysis

```bash
npx which-claude --config example.yaml
```

**Output:**

```
which-claude · Support ticket classifier · 5 cases

┌────────┬─────────┬────────┬────────┬───────────┐
│ Model  │ Quality │ Avg ms │ Tokens │ Cost / 1K │
├────────┼─────────┼────────┼────────┼───────────┤
│ Sonnet │   5/5   │  1053  │  442   │  $0.440   │
├────────┼─────────┼────────┼────────┼───────────┤
│ Opus   │   5/5   │  2200  │  512   │  $3.252   │
└────────┴─────────┴────────┴────────┴───────────┘

✅ Use SONNET
   All models scored 5/5. Sonnet saves 86% vs Opus with no quality loss.

💡 Thinking mode analysis:
   Sonnet: 0.6 → 1.0 (+67%) with thinking
   Cost increase: +$0.22 per 1K calls
   Consider enabling thinking for improved quality.
```

**Key Insight:** Thinking mode dramatically improves quality for complex classification tasks.

---

## Prompt Caching Savings

```bash
npx which-claude --analyze-caching
```

**Output (with long system prompt):**

```
💾 Prompt caching opportunity:

   System prompt: 1174 tokens (cacheable)

   Haiku    Without cache: $2.06/1K
            With cache:    $1.22/1K (41% savings)

   Sonnet   Without cache: $5.37/1K
            With cache:    $2.20/1K (59% savings)

   Enable by adding cache_control to system prompt:
   system:
     - type: text
       text: "Your prompt..."
       cache_control: { type: "ephemeral" }
```

**Key Insight:** Long system prompts benefit significantly from caching.

---

## Quick Reference

```bash
npx which-claude --quick-ref
```

**Output:**

```
📈 Cost at scale:

  ├─ 1K/day   Haiku $2/mo   Sonnet $7/mo
  ├─ 10K/day  Haiku $18/mo   Sonnet $70/mo
  └─ 100K/day Haiku $183/mo   Sonnet $696/mo
```

**Key Insight:** Instantly see cost implications at different scales.
