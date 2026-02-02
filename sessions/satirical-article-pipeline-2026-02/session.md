# Satirical Article Pipeline Optimization

**Date:** 2026-02-01
**Project:** The Aiglet Workflow Improvement
**Expert Role:** AI Agent Orchestration Architect

---

## Executive Summary

This session analyzed the multi-agent workflow for creating satirical articles for The Aiglet, identifying four primary friction points and delivering concrete solutions for each. The workflow currently uses three specialized agents (`satirical-article`, `roast-my-writing`, `hugo-publisher`) in a sequential pipeline with manual handoffs.

**Key Outcomes:**
- Image automation script to eliminate manual file renaming
- Agent coordination improvements to reduce copy/paste overhead
- Structured revision workflow to clarify roast feedback prioritization
- Quality consistency enhancements for the satirical-article agent

---

## Session Context

### The Current Workflow

The Aiglet uses a three-agent sequential pipeline:

1. **satirical-article** → Generates draft article + image prompt
2. **roast-my-writing** → Provides brutal critique with tiered feedback
3. **Manual revision** → User decides which feedback to implement
4. **hugo-publisher** → Creates Hugo file structure with frontmatter
5. **External image generation** → Produces randomly-named PNG (e.g., `random123.png`)
6. **Manual image handling** → Rename to `{slug}.jpg` and move to article folder

### Identified Friction Points

1. **Image file renaming** - Manually renaming `random123.png` → `article-slug.jpg` for each article
2. **Manual copy/paste overhead** - Moving content between agent conversations
3. **Unclear revision prioritization** - Difficulty deciding which roast feedback to implement
4. **Quality inconsistency** - Variable satirical voice/tone from the article generator

### Root Causes Discovered

- **Variable input quality:** Ideas in `ideas.md` range from detailed angles to bare one-liners
- **Guideline overload:** The `satirical-article` agent has 400+ lines of instructions with many competing priorities
- **Inconsistent scope decisions:** Published articles vary significantly in length and complexity (compare the elaborate Duolingo piece vs. the punchy microplastics article)
- **Roast workflow gap:** The roast provides tiered feedback but no clear "apply edits" mechanism

---

## Recommendations & Action Plan

### 1. IMAGE AUTOMATION SOLUTION

**Problem:** Randomly-named PNGs from external image generator need manual renaming to match article slug.

**Solution:** Create a simple automation script that watches article folders and auto-renames images.

#### Implementation Option A: Post-Drop Rename Script

Create `/home/greg/dev/theaiglet/scripts/rename-article-image.sh`:

```bash
#!/bin/bash
# Usage: rename-article-image.sh /path/to/article-folder
# Renames any .png or .jpg file in the folder to match the expected image filename

ARTICLE_DIR="$1"

if [ -z "$ARTICLE_DIR" ]; then
    echo "Usage: $0 /path/to/article-folder"
    exit 1
fi

if [ ! -d "$ARTICLE_DIR" ]; then
    echo "Error: Directory not found: $ARTICLE_DIR"
    exit 1
fi

# Read the expected image filename from index.md frontmatter
EXPECTED_IMAGE=$(grep "^image = " "$ARTICLE_DIR/index.md" | sed "s/image = '\(.*\)'/\1/")

if [ -z "$EXPECTED_IMAGE" ]; then
    echo "Error: Could not find 'image' field in frontmatter"
    exit 1
fi

# Find any .png or .jpg file in the directory (excluding the correctly named one)
RANDOM_IMAGE=$(find "$ARTICLE_DIR" -maxdepth 1 \( -name "*.png" -o -name "*.jpg" \) ! -name "$EXPECTED_IMAGE" -print -quit)

if [ -z "$RANDOM_IMAGE" ]; then
    echo "No image found to rename (or image already correctly named)"
    exit 0
fi

# Rename the file
mv "$RANDOM_IMAGE" "$ARTICLE_DIR/$EXPECTED_IMAGE"

echo "✓ Renamed: $(basename "$RANDOM_IMAGE") → $EXPECTED_IMAGE"
```

**Usage:**
```bash
# After dropping random123.png into article folder:
./scripts/rename-article-image.sh content/posts/2026-02-01-article-slug/
```

**Enhancement:** Add alias to `.bashrc` for convenience:
```bash
alias rename-img='~/dev/theaiglet/scripts/rename-article-image.sh'
```

#### Implementation Option B: Interactive Finder

For a more user-friendly approach, create `/home/greg/dev/theaiglet/scripts/fix-latest-image.sh`:

```bash
#!/bin/bash
# Automatically finds the most recent article and renames any stray image

POSTS_DIR="/home/greg/dev/theaiglet/content/posts"

# Find the most recently modified article directory
LATEST_ARTICLE=$(find "$POSTS_DIR" -maxdepth 1 -type d -name "20*" -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)

if [ -z "$LATEST_ARTICLE" ]; then
    echo "No articles found"
    exit 1
fi

echo "Latest article: $(basename "$LATEST_ARTICLE")"

# Run the rename script on it
~/dev/theaiglet/scripts/rename-article-image.sh "$LATEST_ARTICLE"
```

**Usage:**
```bash
# Just drop the image and run:
./scripts/fix-latest-image.sh
```

#### Implementation Option C: File Watcher (Advanced)

For fully automated watching, use `inotifywait`:

```bash
#!/bin/bash
# Watch for new images and auto-rename

POSTS_DIR="/home/greg/dev/theaiglet/content/posts"

inotifywait -m -r -e create --format '%w%f' "$POSTS_DIR" | while read NEWFILE
do
    if [[ "$NEWFILE" =~ \.(png|jpg|jpeg)$ ]]; then
        ARTICLE_DIR=$(dirname "$NEWFILE")
        echo "New image detected in: $ARTICLE_DIR"
        ~/dev/theaiglet/scripts/rename-article-image.sh "$ARTICLE_DIR"
    fi
done
```

**Recommendation:** Start with **Option B** (fix-latest-image.sh) for immediate productivity gains with minimal setup.

---

### 2. REDUCE COPY/PASTE OVERHEAD

**Problem:** Manual content transfer between agent conversations breaks flow.

**Solution:** Implement session continuity and file-based handoffs.

#### Solution A: Enhanced Agent Coordination via Shared Session Files

Modify the agent workflow to use a shared session file that all agents can read/write:

**Step 1:** Update `satirical-article` agent to save working drafts to:
```
/home/greg/dev/ai-workshop/sessions/satirical-articles/YYYY-MM-DD-slug.md
```
(This already exists in the workflow - ensure it's consistently used)

**Step 2:** Update `roast-my-writing` agent to:
- Accept file paths as input (not just pasted text)
- Save roast feedback directly into the session file as a new section

**Step 3:** Update `hugo-publisher` agent to:
- Read from session files directly
- Prompt: "Which saved session should I publish?" and list available sessions

**Implementation:** Add this to the start of `roast-my-writing` agent instructions:

```markdown
## Input Modes

You can accept writing in two ways:

1. **Direct paste** - User pastes text directly into conversation
2. **File path** - User provides a path to a markdown file

If the user provides a file path:
- Read the file
- Extract the article content (below the YAML frontmatter)
- Roast it normally
- Offer to save the roast feedback back into the file as a new section: `## Roast Feedback`

Example:
"Want me to save this roast feedback to the session file? I can add it as a new section so you have everything in one place."
```

**Benefit:** Eliminates copy/paste. Entire workflow becomes:
1. Start `satirical-article` → saves to session file
2. Start `roast-my-writing` with file path → reads file, roasts it, saves feedback back
3. Edit the session file manually or ask `satirical-article` to revise
4. Start `hugo-publisher` with file path → publishes directly

#### Solution B: Single-Agent Orchestrator

Create a new meta-agent: `article-workflow` that coordinates all three agents internally:

```markdown
---
name: article-workflow
description: Orchestrates the full satirical article creation workflow (ideation → draft → roast → revision → publish)
---

You manage the complete article creation workflow by internally coordinating:
- satirical-article (draft generation)
- roast-my-writing (critique)
- hugo-publisher (publishing)

Your workflow:
1. Start satirical-article process (idea selection → draft)
2. Automatically invoke roast-my-writing on the draft
3. Present roast feedback and proposed edits to user
4. Apply approved edits
5. Automatically invoke hugo-publisher to publish
6. Handle image workflow (provide prompts for image generation and file rename commands)

Users interact with ONE agent that manages the whole pipeline.
```

**Trade-off Analysis:**
- **Pro:** Eliminates all copy/paste, single conversation handles everything
- **Con:** More complex to build, harder to debug individual agent issues
- **Recommendation:** Try Solution A first (file-based handoffs) before building the orchestrator

---

### 3. IMPROVE REVISION PRIORITIZATION

**Problem:** `roast-my-writing` provides tiered feedback (Tier 1/2/3) but doesn't translate it into actionable edits.

**Solution:** Add a "revision proposal" phase to the roast workflow.

#### Enhancement to `roast-my-writing` Agent

Add this new section after the tiered feedback:

```markdown
### Step 5: Propose Specific Revisions

After delivering the tiered roast, generate a concrete revision plan:

**Format:**
```
---

## Revision Action Plan

Based on the Tier 1 and Tier 2 issues, here's what I'd change:

**EDIT 1: [Brief description]**
Location: [Paragraph/sentence identifier]
Current: "[exact text to replace]"
Proposed: "[new text]"
Why: [explain how this fixes the roast feedback]

**EDIT 2: [Brief description]**
Location: [Paragraph/sentence identifier]
Current: "[exact text to replace]"
Proposed: "[new text]"
Why: [explain how this fixes the roast feedback]

[Continue for 3-5 most impactful edits]
```

Then ask: "Want me to apply all these edits, pick specific ones, or ignore them?"

If user approves:
- Generate the fully revised article with all edits applied
- Show before/after for each major change
- Save the revised version if working with a file
```

**Benefit:** Transforms vague feedback ("passive voice everywhere") into specific, actionable changes ("Change line 3 from X to Y").

#### Create a Review Checklist Template

Add to the `satirical-article` agent's self-review process:

```markdown
## Pre-Roast Self-Review Checklist

Before sending to roast-my-writing, run this internal quality check:

**Voice & Tone:**
- [ ] Uses deadpan journalistic delivery (not over-explaining the joke)
- [ ] Maintains professional news tone with absurd content
- [ ] No "winking" at the reader or breaking the fourth wall

**Specificity:**
- [ ] Includes specific names, numbers, and concrete details
- [ ] Avoids generic descriptions ("nice," "good," "interesting")
- [ ] Contains 2-3 believable fictional quotes with attributions

**Structure:**
- [ ] Opens with ALL CAPS BOLD location
- [ ] Lead paragraph establishes premise cleanly
- [ ] Escalating absurdity through middle sections
- [ ] Strong closing punchline or callback

**Technical:**
- [ ] Active voice dominates (minimal "was done by" constructions)
- [ ] Sentence rhythm varies (mix of short punchy and longer flowing)
- [ ] Headline follows principles (under 15 words, treats absurdity as mundane)

If any checklist items fail, revise before proceeding to roast phase.
```

**Implementation:** Add this checklist to the end of Phase 3 (Full Article Generation) in the `satirical-article` agent.

---

### 4. QUALITY CONSISTENCY IMPROVEMENTS

**Problem:** Variable quality in satirical voice/tone from the article generator.

**Solution:** Multi-pronged approach targeting input quality, guideline clarity, and reference examples.

#### Solution A: Improve Input Quality from Ideas File

**Enhancement to `satirical-article` agent Phase 1:**

When presenting ideas from `ideas.md`, assess their development level:

```markdown
## Idea Quality Assessment (Internal)

When reading ideas.md, categorize each idea:

**Tier 1: Fully Developed** - Includes satirical angle, specific details, or clear premise
Example: "USDA Recommends 3-5 Servings of Microplastics Per Meal - Embracing inevitable reality"

**Tier 2: Partial Development** - Has premise but needs angle development
Example: "Congress Accidentally Bans Santa Claus"

**Tier 3: Bare Concept** - Just a topic or one-liner
Example: "Vibe Coding Tool"

When user selects a Tier 3 idea:
1. STOP and develop it first
2. Ask clarifying questions: "What's the satirical angle? Who are the stakeholders? What's the absurd twist?"
3. Present 2-3 developed angle options
4. Get user buy-in before drafting

This prevents "garbage in, garbage out" from underdeveloped ideas.
```

**Benefit:** Ensures every article starts with a strong foundation regardless of initial idea quality.

#### Solution B: Create a Living Reference Library

Build a quality reference document that grows over time:

**Create:** `/home/greg/dev/ai-workshop/sessions/satirical-articles/reference-library.md`

```markdown
# The Aiglet Reference Library

## Excellent Examples (Study These)

### Microplastics Article (2026-01-17)
**Why it works:**
- Punchy, focused premise
- Devastating final beat ("He took a bite. A small piece of plastic wrap came with it.")
- Specific details (credit card serving size, 15-25 grams daily)
- Resigned, deadpan bureaucratic tone

**Key techniques:**
- Embracing the absurd premise without irony
- Using specific measurements to heighten absurdity
- Visual comedy in the final scene

### Duolingo Owl Article (2026-02-01)
**Why it works:**
- International scope with specific jurisdictions listed
- Escalating charges (harassment → aggressive digital lurking)
- Expert quotes that sound real but are absurd
- Perfect closing joke (automated notification response)

**Key techniques:**
- Treating cartoon mascot as serious diplomatic entity
- Multiple stakeholder perspectives
- Bullet-pointed charges for comedy rhythm

## Voice Guidelines (Distilled)

**DO:**
- Write like AP News covering something insane
- Use specific numbers, names, job titles
- Let absurdity speak for itself
- Include fictional experts with credentials
- End with a sharp visual or callback

**DON'T:**
- Explain the joke or wink at the reader
- Use generic adjectives ("crazy," "weird," "ridiculous")
- Break the fourth wall
- Punch down at vulnerable groups
- Over-complicate the premise

## Headline Formula

**Pattern that works:**
[Authority Figure/Institution] + [Mundane Bureaucratic Action] + [Absurd Object/Outcome]

Examples:
✓ "USDA Recommends 3-5 Servings Of Microplastics Per Meal"
✓ "UN Grants Duolingo Owl Diplomatic Immunity"
✓ "FBI Demands To Speak With Antifa's Manager"

**Anti-pattern:**
✗ Long setup + explanation
✗ "You Won't Believe What Happened Next" clickbait
✗ Proper nouns front-loaded
```

**Update `satirical-article` agent to reference this:**

Add to Phase 3 (Full Article Generation):
```markdown
Before generating the article:
1. Read `/home/greg/dev/ai-workshop/sessions/satirical-articles/reference-library.md`
2. Identify which example article is most similar in scope/style to current idea
3. Apply those techniques to this draft
```

#### Solution C: Reduce Guideline Overload

The current `satirical-article` agent has 400+ lines of instructions. Simplify with a "core principles" summary:

**Add this at the very top of the agent definition:**

```markdown
## CORE PRINCIPLES (Read These First)

If you remember nothing else, remember this:

1. **Voice = Deadpan News Covering Absurdity**
   Write like AP News but the event is insane. Never acknowledge the insanity.

2. **Specificity > Everything**
   Names, numbers, quotes, job titles, locations. Generic = unfunny.

3. **Structure = Lead → Escalation → Punchline**
   Open with premise, escalate through middle, end sharp.

4. **Let Absurdity Speak**
   Don't explain the joke. Trust the reader.

5. **Reference the Template**
   When in doubt, look at reference-library.md examples.

Everything below expands on these five principles.
```

**Benefit:** Gives the AI a clear hierarchy - if it gets overwhelmed by details, fall back to core principles.

#### Solution D: Add Quality Gates

Add explicit quality checks at key points:

**After draft generation (Phase 3), add:**

```markdown
### Internal Quality Gate (Before Showing User)

Before presenting the draft, verify:

1. **Specificity check:** Count concrete details (names, numbers, quotes)
   - Goal: Minimum 8-10 specific details in a 400-600 word article
   - If under 8: Add more specific details before showing user

2. **Voice consistency check:** Scan for voice breaks
   - Flag: Any phrases like "believe it or not," "surprisingly," "ironically"
   - Flag: Adjectives like "crazy," "bizarre," "unbelievable"
   - If found: Rewrite in deadpan news voice

3. **Punchline check:** Does the closing sentence land?
   - Test: Remove the last sentence. Is the article weaker? (Should be YES)
   - If closing is weak: Generate 2-3 alternative closing options

If any check fails, fix it before presenting to user.
```

---

## Implementation Priority

### Phase 1: Quick Wins (Implement This Week)
1. **Image automation script** (Option B: fix-latest-image.sh) - 30 minutes
2. **Add revision proposal to roast-my-writing** - 1 hour
3. **Create reference-library.md** with existing examples - 1 hour

### Phase 2: Medium-Term Improvements (Next 2 Weeks)
4. **File-based handoffs** between agents - 2-3 hours
5. **Pre-roast self-review checklist** in satirical-article - 1 hour
6. **Idea quality assessment** in Phase 1 - 1 hour

### Phase 3: Long-Term Optimizations (Next Month)
7. **Quality gates** in article generation - 2 hours
8. **Core principles summary** at top of agent - 30 minutes
9. **Consider building article-workflow orchestrator** - 4-6 hours (optional)

---

## Expected Outcomes

### Immediate Benefits (Phase 1)
- **Zero manual image renaming** - Script handles it automatically
- **Clearer revision decisions** - Roast provides specific edits, not just feedback
- **Quality baseline established** - Reference library sets clear examples

### Medium-Term Benefits (Phase 2)
- **50% reduction in copy/paste overhead** - File-based handoffs eliminate most manual transfers
- **More consistent article quality** - Idea assessment prevents weak inputs from producing weak outputs
- **Faster revision cycles** - Self-review checklist catches issues before roasting

### Long-Term Benefits (Phase 3)
- **Automated quality control** - Quality gates ensure every article meets baseline standards
- **Reduced cognitive load** - Core principles provide clear decision framework
- **Potential full automation** - Orchestrator could handle end-to-end workflow with minimal user intervention

---

## Next Steps

1. **Review these recommendations** and identify which solutions resonate most
2. **Choose a starting point** (recommend Phase 1: Quick Wins)
3. **Implement image automation script** first for immediate productivity gain
4. **Test file-based handoffs** on next article to validate the approach
5. **Build reference library** as you publish more articles (iterative improvement)

Would you like me to help implement any of these solutions, or do you have questions about specific recommendations?
