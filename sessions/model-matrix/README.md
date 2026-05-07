# OpenRouter Open-Weight Model Matrix

Decision guide for coding, creative writing, and research — tuned for web/fullstack, systems/infra, and prose.

Last reviewed: May 2026. All models open-weight, all available via [OpenRouter](https://openrouter.ai). Pricing per 1M tokens (input/output).

---

## Coding

| Task | Model | Reason | Cost |
|------|-------|--------|------|
| Architecture, new features, hard bugs | DeepSeek V4 Pro | Best open coding model, 1.6T params, 1M ctx | $0.43/$0.87 |
| Quick edits, boilerplate, simple fixes | Qwen3 Coder 480B | Specialized MoE, zero cost, fast | FREE |
| Full codebase refactors, system design | GLM 5.1 | Leads SWE-bench Pro, 200K ctx | $0.60/free |
| Debugging, tracing logic, subtle bugs | DeepSeek R1 0528 | Reasoning-first, explains its thinking | $0.50/free |
| Greenfield code generation | Poolside Laguna M.1 | Built for pure code gen, fast | FREE |
| Systems/infra, config, pipelines | DeepSeek V3.2 Speciale | Max reasoning variant, free output | $0.40/free |
| Fast iteration, low latency needed | Mistral Small 4 | Unified coding + general, snappy | $0.15/$0.60 |

### Alternatives

| Model | Strengths | Cost |
|-------|-----------|------|
| DeepSeek V4 Flash | Cheaper V4 for straightforward tasks, 1M ctx | $0.14/$0.28 |
| Qwen3 Coder Next | Newest Qwen coding release | $0.12/$0.80 |
| Moonshot Kimi K2.6 | 1T params, agent swarms, long-context coding | $0.74/free |

---

## Creative Writing

| Task | Model | Reason | Cost |
|------|-------|--------|------|
| Fiction, prose, voice-heavy writing | Hermes 4 405B | Best open creative model, free | FREE |
| Literary style, nuanced tone, poetry | Mistral Medium 3.5 | 128B dense = better prose consistency than MoEs | N/A |
| Long-form narrative, novel-length | Hermes 4 405B + DeepSeek V4 Pro | Hermes for voice, V4 for structural help | FREE + cheap |
| Brainstorming, prompts, ideation | MiniMax M2.7 | Strong for autonomous/creative tasks, free output | $0.30/free |
| Fast drafts, outlines, quick prose | Hermes 4 70B | Smaller Hermes, still strong voice | $0.13/$0.40 |

---

## Research

| Task | Model | Reason | Cost |
|------|-------|--------|------|
| Deep analysis, complex reasoning chains | DeepSeek V3.2 Speciale | Max chain-of-thought, free output | $0.40/free |
| Long document QA, paper analysis | Llama 4 Maverick | 1M context window, MoE | $0.15/$0.60 |
| Academic research, reproducible results | OLMo 3.1 32B | Apache 2.0, fully open, reproducible | $0.20/$0.60 |
| Multi-step research with tool use | GLM 5.1 | Designed for long-horizon agentic tasks | $0.60/free |
| Casual research, quick synthesis | DeepSeek V4 Flash | Fast, cheap, 1M ctx | $0.14/$0.28 |

---

## Quick-Reference Shortcut

| Situation | Reach for |
|-----------|-----------|
| Half-awake at 2am, just need code to work | Qwen3 Coder 480B (free) |
| Doing serious architecture | DeepSeek V4 Pro |
| Stuck on a bug for 30+ min | DeepSeek R1 0528 |
| Writing a scene that needs to feel right | Hermes 4 405B |
| Reading a 150-page spec | Llama 4 Maverick |
| Generating boilerplate/CRUD | Poolside Laguna M.1 (free) |
| "Just make it good, I don't care how" | DeepSeek V4 Pro |

---

## Estimated Monthly Cost

Using this split (70% coding, 20% writing, 10% research), with free models handling roughly half of prompts: **~$2–4/month** vs a $20/month subscription.

---

## Model Directory

| Model | Family | Context | Input 1M | Output 1M |
|-------|--------|---------|----------|-----------|
| DeepSeek V4 Pro | DeepSeek | 1M | $0.43 | $0.87 |
| DeepSeek V4 Flash | DeepSeek | 1M | $0.14 | $0.28 |
| DeepSeek R1 0528 | DeepSeek | 164K | $0.50 | FREE |
| DeepSeek V3.2 Speciale | DeepSeek | 164K | $0.40 | FREE |
| Qwen3 Coder 480B | Qwen | 262K | FREE | FREE |
| Qwen3 Coder Next | Qwen | 262K | $0.12 | $0.80 |
| GLM 5.1 | Z.ai | 203K | $0.60 | FREE |
| Llama 4 Maverick | Meta | 1M | $0.15 | $0.60 |
| Poolside Laguna M.1 | Poolside | 131K | FREE | FREE |
| Mistral Small 4 | Mistral | 262K | $0.15 | $0.60 |
| Mistral Medium 3.5 | Mistral | 262K | N/A | N/A |
| Hermes 4 405B | Nous | 131K | FREE | FREE |
| Hermes 4 70B | Nous | 131K | $0.13 | $0.40 |
| MiniMax M2.7 | MiniMax | 197K | $0.30 | FREE |
| OLMo 3.1 32B | AllenAI | 66K | $0.20 | $0.60 |
