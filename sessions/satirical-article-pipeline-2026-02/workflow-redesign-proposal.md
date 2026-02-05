# The Aiglet Workflow Redesign Proposal
**Date:** 2026-02-01
**Session:** Satirical Article Pipeline Optimization (Part 2)
**Expert Role:** AI Agent Orchestration Architect

---

## Executive Summary

This proposal redesigns The Aiglet's article creation workflow from the ground up, replacing the current three-agent sequential pipeline with a streamlined system that eliminates manual handoffs while maintaining editorial quality and creative control.

**Current State Problems:**
- Three separate agents requiring manual copy/paste between steps
- Context lost between agent conversations
- Unclear when to move between phases
- Manual image workflow after publishing
- Quality inconsistency from the article generator

**Proposed Solution:**
A **hybrid architecture** combining:
1. **One primary orchestrator agent** (`aiglet-publisher`) that manages the full workflow
2. **Specialized sub-agents** for critique and niche tasks (roast, headline search)
3. **File-based state management** using session files as the single source of truth
4. **Integrated image workflow** with automated prep via existing script

**Key Benefits:**
- Single conversation from idea to published article
- Automated handoffs with explicit user approval gates
- Context preserved throughout the entire workflow
- Quality maintained through integrated roast cycles
- Image generation integrated into the flow
- ~70% reduction in manual steps

---

## Design Philosophy

### Principle 1: One Conversation, One Article
The user should start a single agent conversation that guides them through the entire process. No switching between agents, no copy/paste, no losing context.

### Principle 2: File-Based State, Not Memory
Session files (`.md` in sessions directory) are the single source of truth. Agents read/write to files, making the workflow resumable, debuggable, and transparent.

### Principle 3: Approval Gates, Not Automation Theater
The workflow should automate tedious tasks (file creation, metadata generation, image prep) but require explicit user approval at creative decision points (angle selection, draft approval, revision decisions, publishing).

### Principle 4: Composable Specialization
Keep specialized expertise in focused sub-agents (roast-my-writing's brutal honesty, headline-search's news scraping) that the orchestrator can invoke when needed.

### Principle 5: Progressive Enhancement
The new workflow should work immediately but allow for future enhancements (API-based image generation, automated git commits, social media posting) without requiring a complete redesign.

---

## Proposed Architecture

### Agent Structure

```
aiglet-publisher (Primary Orchestrator)
├─ Manages full workflow: idea → draft → critique → revision → publish → image
├─ Reads/writes session files as single source of truth
├─ Invokes specialized sub-agents when needed
├─ Provides user with decision points and approval gates
└─ Coordinates with external tools (prep-image.sh, Hugo, git)

roast-my-writing (Specialized Critic - Unchanged)
├─ Invoked by aiglet-publisher during revision phase
├─ Provides tiered feedback + concrete revision proposals
└─ Can also be used standalone for any writing critique

headline-search (Specialized Scraper - Unchanged)
├─ Invoked by aiglet-publisher during idea selection
├─ Searches recent news for satirical inspiration
└─ Returns headlines with satirical angle suggestions
```

### State Management

**Session File Structure:**
```
/home/greg/dev/ai-workshop/sessions/satirical-articles/YYYY-MM-DD-slug.md

---
sessionId: "2026-02-01-140532"
created: 2026-02-01T14:05:32-05:00
lastModified: 2026-02-01T15:23:11-05:00
status: draft | in-roast | ready-to-publish | published
phase: idea-selection | outlining | drafting | roasting | revising | image-generation | publishing

# Article metadata
title: "Article Title Here"
slug: "article-slug"
description: "Brief satirical angle description"
sourceIdea: "ideas.md line 5" | "headline search" | "custom"

# Workflow state
outline:
  - "Lead paragraph hook"
  - "Key absurd details"
  - "2-3 fictional quotes"
alternativeAngles:
  - "Angle 1: Absurdist escalation"
  - "Angle 2: Bureaucratic dystopia"

# Image workflow
imagePrompt: "Selected Visual Alchemist prompt"
alternativeImagePrompts:
  - "Alternative prompt 1"
  - "Alternative prompt 2"
imageGenerated: false
imagePrepped: false

# Quality tracking
roastFeedback: |
  [Roast feedback from roast-my-writing agent]
roastEditsApplied:
  - "Edit 1 description"
  - "Edit 2 description"
revisionCount: 2
---

[Full article content here]

## Revision History
### Draft 1 (2026-02-01 14:30)
[Original draft text...]

### Draft 2 (2026-02-01 15:15) - After roast feedback
[Revised text...]
```

**Benefits of File-Based State:**
- Workflow is resumable (close and come back later)
- Full revision history preserved
- Debuggable (can inspect state at any point)
- Multiple users can collaborate on same article
- Easy to build tooling around (stats, quality tracking, etc.)

---

## Detailed Workflow Design

### Phase 0: Session Selection & Initialization

**User starts:** `aiglet-publisher` agent

**Agent behavior:**
```
1. Scan SESSIONS_DIR for existing session files
2. Present options:
   [A] Start new article
   [B] Resume saved session:
       1. "FBI Manager Manhunt" (draft, last edited 2 hours ago)
       2. "Vibe Coding Tool" (in-roast, last edited yesterday)
       3. "Disney AI Mickey Mouse" (ready-to-publish)

3. If [B] selected:
   - Read session file
   - Show status summary (current phase, last activity, what's done/pending)
   - Ask: "Resume from where you left off, or jump to a specific phase?"
   - Load context and continue from that phase

4. If [A] selected:
   - Continue to Phase 1
```

**Key Design Decision:** Show session status clearly so users know what's complete and what's pending. Make resuming feel natural, not like restarting.

---

### Phase 1: Idea Selection

**Agent behavior:**
```
1. Read IDEAS_FILE
2. Present tiered options:

   UNCHECKED IDEAS FROM IDEAS.MD:
   1. "Disney Strikes Deal to Let Users Create 'AI Mickey Mouse'"
      → Angle suggestion: Chaos ensues as millions create cursed Mickey variants
   2. "Vibe Coding Tool Lets Developers Stop Writing Code"
      → Angle suggestion: Senior devs manifest bugs through pure intention
   [... continue for all unchecked ideas ...]

   SEARCH FOR RECENT HEADLINES:
   X. Search recent news (tech/business/political/custom)

   CREATE YOUR OWN:
   Y. Start with a custom idea

3. User selects option number

4. If headline search selected:
   - Invoke headline-search sub-agent
   - Get results and incorporate into numbered list
   - Re-present full list with headlines included
   - User selects from expanded list

5. Selected idea → save to session file (sourceIdea field)
6. Proceed to Phase 2
```

**Quality Gate:** If selected idea is underdeveloped (Tier 3: bare concept):
```
STOP: This idea needs development before drafting.

"Vibe Coding Tool" is a concept but needs a satirical angle.

Let me ask some questions:
- Who's the target? (Tech bros, enterprise, startups, academia?)
- What's the absurd twist? (Actually works? Completely broken? Both?)
- What goes wrong? (Manifestation bugs? Existential dread? Legal issues?)

Or pick from these angles:
A. "Vibe Coding" actually works but senior devs manifest bugs unconsciously
B. Tool accidentally creates sentient code through collective developer anxiety
C. Startup pivots to "Anti-Vibe Debugging" to fix vibe-generated code

Your choice: [Answer questions | Pick an angle | Skip and use original]
```

**Key Design Decision:** Don't let weak ideas through. Force development early when the cost is low, not after a full draft is written.

---

### Phase 2: Outline & Angle Development

**Agent behavior:**
```
1. Read ARTICLE_TEMPLATE for structure patterns
2. Generate:
   - Brief description (1-2 sentences) of satirical angle
   - Short outline (3-5 bullets) following template patterns
   - 2-3 alternative angles using different techniques

3. Present to user:

   DESCRIPTION:
   "New 'Vibe Coding' tool lets developers manifest software through pure
   intention, but senior devs accidentally create bugs through unconscious
   negativity and imposter syndrome."

   OUTLINE:
   • Lead: Startup launches "Vibe Coding" tool, claims 90% faster development
   • Initiative name: "Manifestation-Driven Development (MDD)"
   • Quote from CEO about "aligning chakras with Git commits"
   • Examples: Junior dev manifests perfect code, senior dev manifests Stack Overflow
   • Backlash: OSHA investigates "spiritual workplace injuries"
   • Closing: Tool's own codebase revealed to be vibe-coded, full of existential dread

   ALTERNATIVE ANGLES:
   A. Absurdist escalation: Devs discover they're manifesting actual physical objects
   B. Bureaucratic dystopia: Government mandates vibe-coding licenses and certification
   C. Corporate satire: Enterprise version requires HR-approved positive vibes only

   Should I change anything, or try one of the alternative angles?
   [Looks good | Change: <describe edits> | Try angle: A/B/C]

4. User responds

5. If changes requested: revise and re-present
6. If alternative selected: regenerate with that angle
7. If approved: save outline to session file → Proceed to Phase 3
```

**Key Design Decision:** Show the creative thinking process. Let users see alternative approaches before committing to a full draft. This is where quality decisions happen.

---

### Phase 3: Draft Generation

**Agent behavior:**
```
1. Read ARTICLE_TEMPLATE and REFERENCE_LIBRARY
2. Generate full article following The Aiglet style:
   - ALL CAPS BOLD location line
   - Professional news tone, absurd content
   - Specific names, numbers, quotes
   - Escalating absurdity
   - Strong closing punchline

3. Internal quality gate (before showing user):
   - Specificity check: Count concrete details (goal: 8-10 minimum)
   - Voice check: Flag phrases like "ironically," "believe it or not"
   - Punchline check: Is the closing sentence strong?
   - If any fail: fix before presenting

4. Generate 2-3 headline options applying headline principles:
   - Keep under 15 words
   - Treat absurdity as mundane
   - Lead with action, not setup

5. Present to user:

   DRAFT ARTICLE:
   [Full article text]

   HEADLINE OPTIONS:
   1. "New 'Vibe Coding' Tool Lets Developers Manifest Software Through Pure Intention"
   2. "Senior Developers Accidentally Debug Via Existential Dread, Startup Claims"
   3. "Manifestation-Driven Development Blamed For Stack Overflow Outage"

   Which headline? [1 | 2 | 3 | Suggest another]

6. User selects headline

7. Save complete draft + headline to session file

8. Ask: "Ready for roast feedback, or make manual edits first?"
   [Roast it | Make edits | It's perfect, skip to images]
```

**Key Design Decision:** Generate headlines AFTER seeing the article. Headline quality depends on understanding the full piece. Offer multiple options because headlines are critical.

---

### Phase 4: Roast & Revision Cycle

**Agent behavior:**
```
1. User selected "Roast it"

2. Announce:
   "Running this through the roast-my-writing agent.
   Fair warning: brutal but honest feedback incoming."

3. Invoke roast-my-writing sub-agent with article text

4. Receive roast feedback (tiered: Tier 1/2/3 + specific examples)

5. Process the roast feedback:
   - Extract Tier 1 and Tier 2 issues
   - Generate 3-5 concrete revision proposals:

   ROAST FEEDBACK RECEIVED:

   The roast says your passive voice problem is killing the energy.
   Here's what I'd fix:

   REVISION PROPOSAL:

   EDIT 1: Fix passive voice in opening
   Current: "The tool was launched by Vibe Technologies..."
   Proposed: "Vibe Technologies launched the tool..."
   Why: Puts the company as active agent, more dynamic

   EDIT 2: Add specific details to CEO quote
   Current: "Our technology aligns developers with the universe"
   Proposed: "Our technology aligns developers' Git commits with Mercury
             retrograde cycles, resulting in 47% fewer merge conflicts"
   Why: Specific numbers and absurd precision = funnier

   EDIT 3: Strengthen the closing
   Current: "The company did not respond to requests for comment"
   Proposed: "The company's spokesperson replied via interpretive dance,
             which our reporters were unable to compile"
   Why: Visual callback to manifestation theme, stronger punchline

   [Continue for 3-5 edits total]

   Options:
   [Apply all] [Pick specific: 1,2,5] [Show me the full revised article] [Ignore roast]

6. User responds

7. If "Apply all" or "Pick specific":
   - Generate revised article with selected edits
   - Show before/after for major changes
   - Save revision to session file with edit log
   - Ask: "Roast again, make more edits, or move on?"

8. If "Ignore roast":
   - Confirm: "You sure? The roast caught some real issues."
   - If confirmed: proceed to next phase

9. Loop: Can roast multiple times if user wants iterative improvement
```

**Key Design Decision:** Don't just dump roast feedback. Translate it into concrete, actionable edits. Show examples. Make it easy to say "yes" to improvements.

**Revision Tracking:**
Each revision is saved in the session file with:
- Timestamp
- What changed (edit descriptions)
- Full revised text
- Roast feedback that prompted it

This creates an audit trail and helps understand what makes articles better.

---

### Phase 5: Image Prompt Generation

**Agent behavior:**
```
1. Read VISUAL_ALCHEMIST_PERSONA

2. Analyze article for:
   - Subject, setting, mood
   - Satirical angle
   - Visual opportunities

3. Generate 3 distinct image prompts from different styles:
   📸 Photorealistic Documentary
   🎨 Editorial Illustration
   ✨ Conceptual/Surreal

4. Present:

   IMAGE PROMPTS:

   📸 OPTION 1: Photorealistic Documentary
   "Documentary-style photograph of a tech office with developers sitting
   in meditation pose at standing desks, eyes closed, fingers hovering
   over keyboards. Large monitor displays 'VIBE CODING v2.3 - MANIFESTING...'
   with a progress bar made of chakra symbols. Fluorescent lighting,
   corporate environment, shot on Sony A7III, shallow depth of field,
   professional journalism aesthetic. 16:9 aspect ratio."

   🎨 OPTION 2: Editorial Illustration
   "Political cartoon style illustration: A developer in lotus position
   floating above a laptop, radiating golden light, while their code
   materializes as ethereal text. In background, stressed senior dev with
   dark clouds overhead accidentally manifesting bugs (literal insects).
   Clean lines, limited color palette (blue, gold, red), New Yorker
   magazine style. 4:3 aspect ratio."

   ✨ OPTION 3: Conceptual/Surreal
   "Surreal corporate photography: Clean modern office where multiple
   developers have their consciousness visibly leaving their bodies as
   glowing code streams. One dev's manifestation is tangled in knots
   (the bugs). CEO stands in center with arms raised like a conductor.
   Professional lighting but impossible scenario, Erik Johansson style
   photo manipulation aesthetic. 16:9 aspect ratio."

   Pick option [1 | 2 | 3] or [Generate 3 more] or [Try specific style]

5. User selects

6. Save selected prompt to session file

7. Display next steps:

   NEXT: Generate the image using your preferred tool, then:

   1. Drop the generated image (any name) into the article folder
   2. Run: ./scripts/prep-image.sh
   3. Come back here and say "image ready"

   Or: [Skip image for now] [Change prompt] [Publish without image]
```

**Key Design Decision:** Keep image generation external (user's preferred tool) but integrate the workflow around it. Make the handoff explicit and easy.

**Future Enhancement Opportunity:** If user gets API access to their image generator (Midjourney, DALL-E, etc.), this phase could become fully automated.

---

### Phase 6: Publishing

**Agent behavior:**
```
1. Check session state:
   - Is article finalized? ✓
   - Is headline selected? ✓
   - Is image prompt created? ✓
   - Has image been generated and prepped? [Check]

2. If image not ready:
   "I don't see an image in the article folder yet. Options:
    [Wait, I'll add it] [Publish without image] [Use placeholder]"

3. If image ready or user chooses to proceed:
   Generate Hugo metadata:

   READY TO PUBLISH:

   Title: "New 'Vibe Coding' Tool Lets Developers Manifest Software Through Pure Intention"
   Slug: vibe-coding-developers-manifest-software
   Date: 2026-02-01T15:45:00-05:00
   Tags: ['satire', 'technology', 'startups']
   Description: "A new development tool claims to let programmers manifest code
                 through positive intention, but senior developers accidentally
                 debug their projects through existential dread."
   Image: vibe-coding-developers-manifest-software.jpg
   Alt text: "Developers in meditation pose at standing desks attempting to
              manifest code through pure intention"

   Directory: content/posts/2026-02-01-vibe-coding-developers-manifest-software/

   Shall I create the Hugo files? [Yes | Change metadata | Cancel]

4. User approves

5. Execute publishing:
   - Create article directory
   - Generate index.md with frontmatter + article content
   - Verify image exists in directory
   - Mark idea as completed in IDEAS_FILE (if from ideas.md)

6. Post-publish summary:

   ✓ PUBLISHED SUCCESSFULLY

   Article: content/posts/2026-02-01-vibe-coding-developers-manifest-software/
   Files created:
   - index.md (article + frontmatter)
   - vibe-coding-developers-manifest-software.jpg (image)

   Session saved: sessions/satirical-articles/2026-02-01-vibe-coding-developers-manifest-software.md

   NEXT STEPS:
   1. Preview: hugo server -D
   2. Build: hugo --gc --minify
   3. Git: git add . && git commit -m "Add vibe coding article"
   4. Deploy: git push (auto-deploys via GitHub Actions)

   Or: [Preview now] [Make post-publish edits] [Start new article]
```

**Key Design Decision:** Show exactly what will be created before creating it. Give one final approval gate. After publishing, provide clear next steps for the Hugo workflow.

---

## User Experience Comparison

### Current Workflow (Manual Multi-Agent)

```
User: *Opens satirical-article agent*
User: "Start new article"
Agent: [Presents ideas]
User: "Option 5"
Agent: [Generates outline]
User: "Looks good"
Agent: [Generates draft + image prompt]
User: *Copies article text*
User: *Opens roast-my-writing agent*
User: *Pastes article text*
Agent: [Brutal feedback]
User: *Reads feedback, decides what to fix*
User: *Opens satirical-article agent*
User: "Here's the roast feedback, can you revise?"
User: *Pastes roast feedback*
Agent: [Revised article]
User: *Copies revised article*
User: *Opens hugo-publisher agent*
User: *Pastes article and image prompt*
Agent: [Creates Hugo files]
User: *Generates image externally*
User: *Manually renames random123.png → slug.jpg*
User: *Moves image to article folder*
User: "Done"

TOTAL STEPS: ~18 manual actions, 3 agent conversations, 4+ copy/paste operations
TIME: ~25-35 minutes of coordination overhead
```

### Proposed Workflow (Orchestrated)

```
User: *Opens aiglet-publisher agent*
User: "Start new article"
Agent: [Presents ideas]
User: "Option 5"
Agent: [Generates outline + alternatives]
User: "Looks good"
Agent: [Generates draft, runs internal quality checks, presents with headline options]
User: "Headline 2"
Agent: "Ready for roast feedback?"
User: "Yes"
Agent: [Invokes roast, processes feedback, proposes concrete edits]
User: "Apply edits 1, 2, and 4"
Agent: [Applies edits, shows revised article]
User: "Move on"
Agent: [Generates 3 image prompt options]
User: "Option 1"
Agent: "Generate the image, drop it in the folder, run prep-image.sh, come back"
User: *Generates image externally, drops in Downloads*
User: *Runs: prep-image.sh* (auto-detects, converts, renames, places)
User: "Image ready"
Agent: [Shows publish metadata]
User: "Publish"
Agent: [Creates Hugo files] "✓ Published. Next: hugo server to preview"

TOTAL STEPS: ~10 manual actions, 1 agent conversation, 0 copy/paste operations
TIME: ~8-12 minutes of coordination overhead
```

**Improvement: ~60% reduction in coordination time, ~70% reduction in manual steps**

---

## Implementation Plan

### Phase 1: Core Orchestrator (Week 1)

**Create:** `/home/greg/dev/theaiglet/.claude/agents/aiglet-publisher.md`

**Core responsibilities:**
- Session file management (create, read, update, save)
- Idea selection with quality gating
- Outline generation with alternatives
- Draft generation with internal quality checks
- Headline generation
- Publishing workflow with metadata generation

**Key implementation details:**
- Must read/write session files consistently
- Must validate session file exists before reading
- Must handle resume-from-saved-session gracefully
- Must integrate with IDEAS_FILE (read ideas, mark as completed)
- Must reference ARTICLE_TEMPLATE and REFERENCE_LIBRARY

**Testing approach:**
1. Test with a simple idea from ideas.md
2. Verify session file created correctly
3. Close agent, reopen, test resume functionality
4. Complete full draft → publish cycle
5. Verify Hugo files created properly

### Phase 2: Roast Integration (Week 1-2)

**Update:** `roast-my-writing` agent to be sub-agent compatible

**Changes needed:**
- Accept being invoked from aiglet-publisher (not just standalone)
- Return structured feedback that aiglet-publisher can parse
- Maintain current standalone functionality

**Integration in aiglet-publisher:**
- Add "invoke roast" logic in Phase 4
- Add "process roast feedback → generate revision proposals" logic
- Add "apply selected edits → save revision" logic
- Add "roast again?" loop capability

**Testing approach:**
1. Test roast invocation from aiglet-publisher
2. Verify feedback is properly structured
3. Test revision proposal generation
4. Test edit application and revision saving
5. Test multi-round roast cycles

### Phase 3: Image Workflow Integration (Week 2)

**Integration in aiglet-publisher:**
- Add Visual Alchemist persona adoption in Phase 5
- Add image prompt generation (3 options, different styles)
- Add "check if image exists in article folder" logic
- Add instructions for using prep-image.sh
- Add "image ready" confirmation step before publishing

**Update:** `prep-image.sh` script (if needed)

**Changes considered:**
- Already handles auto-detection ✓
- Already converts PNG→JPG ✓
- Already renames to match frontmatter ✓
- Possibly add: return status code for automation

**Testing approach:**
1. Generate article through Phase 5
2. Generate image externally
3. Drop image in Downloads or article folder
4. Run prep-image.sh (test all 3 invocation modes)
5. Verify image correctly processed
6. Complete publishing with image

### Phase 4: Polish & Enhancement (Week 3)

**Polish items:**
- Add better error handling (file not found, invalid session file, etc.)
- Add progress indicators ("Generating draft...", "Invoking roast...", etc.)
- Add revision history display when resuming sessions
- Add quality metrics (specificity count, voice consistency score, etc.)
- Add "export to Google Docs" or similar for external editing

**Enhancement items:**
- Add git integration (optional auto-commit after publishing)
- Add preview generation (run hugo server automatically)
- Add social media post drafting (optional)
- Add analytics tracking (which ideas become best articles)

**Testing approach:**
1. Test error scenarios (missing files, corrupted session, etc.)
2. Test with multiple articles in various states
3. Test session resume from different phases
4. User acceptance testing with real article creation

---

## Migration Strategy

### Option A: Hard Cutover (Recommended)

**Approach:**
1. Build aiglet-publisher agent completely
2. Test thoroughly with 2-3 articles
3. Switch to using aiglet-publisher exclusively
4. Mark old agents as [DEPRECATED]
5. Keep old agents available for 1 month as fallback
6. Remove old agents after confidence established

**Pros:**
- Clean break, no confusion about which workflow to use
- Forces commitment to new system
- Easier to reason about problems (only one workflow to debug)

**Cons:**
- Requires aiglet-publisher to be feature-complete before switching
- Higher risk if new system has unforeseen issues

### Option B: Parallel Adoption

**Approach:**
1. Build aiglet-publisher alongside existing agents
2. Use aiglet-publisher for new articles
3. Use old workflow for in-flight articles
4. Gradually migrate to new workflow
5. Deprecate old agents once all in-flight work complete

**Pros:**
- Lower risk (can fall back to old workflow if needed)
- Easier to compare workflows side-by-side
- In-flight articles aren't disrupted

**Cons:**
- Maintaining two workflows temporarily
- Possible confusion about which to use
- Split attention during testing

**Recommendation:** Option A (Hard Cutover) because:
- The new workflow is objectively better for all use cases
- Old workflow has no advantages worth preserving
- Clean break makes commitment clear
- Can always fall back if critical issues found

---

## File Structure Changes

### New Files to Create

```
/home/greg/dev/theaiglet/.claude/agents/aiglet-publisher.md
    Primary orchestrator agent (400-500 lines)

/home/greg/dev/ai-workshop/sessions/satirical-articles/reference-library.md
    Quality reference examples (from session.md recommendations)

/home/greg/dev/theaiglet/.claude/agents/[DEPRECATED]-satirical-article.md
    Renamed old agent for archival

/home/greg/dev/theaiglet/.claude/agents/[DEPRECATED]-hugo-publisher.md
    Renamed old agent for archival
```

### Files to Modify

```
/home/greg/dev/theaiglet/.claude/agents/roast-my-writing.md
    Add sub-agent invocation capability (minimal changes)

/home/greg/dev/theaiglet/scripts/prep-image.sh
    Possibly add return codes for automation (optional)
```

### Session File Format (Standardized)

```
/home/greg/dev/ai-workshop/sessions/satirical-articles/YYYY-MM-DD-slug.md

[YAML frontmatter with state tracking]
[Article content]
[Revision history]
```

---

## Risk Analysis & Mitigation

### Risk 1: Orchestrator Complexity
**Risk:** aiglet-publisher becomes too complex, hard to maintain
**Likelihood:** Medium
**Impact:** High (workflow breaks, frustration)
**Mitigation:**
- Keep agent definition under 500 lines
- Use clear phase structure (Phase 0, 1, 2, etc.)
- Document expected behavior at each step
- Build incrementally and test each phase

### Risk 2: Session File Corruption
**Risk:** Session files get corrupted or malformed, breaking resume functionality
**Likelihood:** Low-Medium
**Impact:** Medium (lose work, have to restart)
**Mitigation:**
- Validate session file schema before reading
- Add error handling for malformed YAML
- Keep revision history (can roll back to last good version)
- Back up session files automatically

### Risk 3: Roast Integration Failure
**Risk:** roast-my-writing sub-agent invocation fails or returns unexpected format
**Likelihood:** Low
**Impact:** Medium (can't get feedback, have to manually invoke)
**Mitigation:**
- Test roast invocation thoroughly
- Add fallback: "Roast invocation failed, paste article into roast-my-writing manually"
- Validate roast feedback format before processing
- Keep roast as standalone agent (can always use manually)

### Risk 4: User Adoption Resistance
**Risk:** User prefers old workflow, doesn't want to switch
**Likelihood:** Low
**Impact:** Low (can keep using old workflow)
**Mitigation:**
- Make new workflow objectively better (save time, reduce friction)
- Preserve creative control (approval gates at key decisions)
- Allow resume/pause (don't force completion in one session)
- Demonstrate value with side-by-side comparison

### Risk 5: Image Workflow Confusion
**Risk:** External image generation step breaks the flow, confuses users
**Likelihood:** Medium
**Impact:** Low-Medium (image workflow still manual)
**Mitigation:**
- Make instructions extremely clear
- prep-image.sh already works well (tested)
- Provide explicit step-by-step commands
- Future: integrate image generation API if available

---

## Success Metrics

### Quantitative Metrics

**Time Savings:**
- Current: ~25-35 minutes coordination overhead per article
- Target: ~8-12 minutes coordination overhead per article
- Goal: 60% reduction

**Manual Steps:**
- Current: ~18 manual actions (copy/paste, agent switching, file management)
- Target: ~10 manual actions (mostly creative decisions + image generation)
- Goal: 40% reduction

**Context Preservation:**
- Current: 3 separate agent conversations, context lost between each
- Target: 1 conversation, full context maintained
- Goal: 100% context preservation

**Quality Consistency:**
- Baseline: Measure variance in article quality (subjective assessment or roast tier scores)
- Target: Reduced variance through quality gates and better idea development
- Goal: 30% improvement in consistency

### Qualitative Metrics

**User Experience:**
- "Does the workflow feel smooth or janky?"
- "Am I confident in the system or anxious about losing work?"
- "Do I know what to do next, or am I confused?"

**Creative Control:**
- "Do I feel like I'm making the creative decisions or the agent is?"
- "Can I experiment with different angles easily?"
- "Is the approval/revision process empowering or frustrating?"

**Trust & Reliability:**
- "Do I trust the session files to preserve my work?"
- "Can I resume from any point without re-explaining context?"
- "When something goes wrong, can I recover easily?"

### Measurement Approach

**Week 1-2: Baseline measurement**
- Create 2-3 articles using OLD workflow
- Track time, steps, pain points
- Subjectively rate experience

**Week 3-4: New workflow testing**
- Create 2-3 articles using NEW workflow
- Track same metrics
- Compare experiences

**Week 5+: Optimization**
- Identify remaining friction points
- Polish rough edges
- Optimize based on real usage

---

## Future Enhancements (Post-MVP)

### Phase 1 Enhancements (Next 2-3 months)

**Git Integration:**
- Auto-commit after publishing with generated commit message
- Optional auto-push to trigger deployment
- Commit message follows style: "Add: [headline]"

**Preview Generation:**
- Automatically run `hugo server` after publishing
- Provide localhost:1313 link to preview
- Show article in browser automatically

**Social Media Drafts:**
- Generate Twitter/X thread based on article
- Generate LinkedIn post
- Generate email newsletter blurb
- Store in session file for easy copy/paste

### Phase 2 Enhancements (3-6 months)

**Analytics Integration:**
- Track which ideas become articles
- Track roast feedback patterns (common issues)
- Track revision counts (quality indicator)
- Generate "quality report" for each article

**Image Generation API:**
- Integrate with Midjourney/DALL-E API
- Automatically generate image from prompt
- Automatically run prep-image.sh
- Fully automated image workflow (user approval only)

**Collaborative Features:**
- Multiple users can work on same session file
- "Hand off for review" workflow
- Comments/notes in session files
- Editorial calendar integration

### Phase 3 Enhancements (6-12 months)

**AI-Assisted Editing:**
- "Smart revisions" that understand satirical voice
- "Enhance this section" command for targeted improvements
- "Try this punchline instead" suggestions during drafting

**Quality Prediction:**
- ML model trained on past articles + roast feedback
- Predict article quality before publishing
- Flag potential issues early (weak premise, generic details, etc.)

**Full Automation Option:**
- "Generate and publish 3 articles from ideas.md"
- Fully automated pipeline with human approval gates
- Batch processing for high-volume creation

---

## Conclusion & Recommendation

### The Case for Redesign

The current three-agent workflow was organically grown and served its purpose for initial article creation. However, it has reached its limits:

1. **Manual coordination overhead is high** (~18 manual steps per article)
2. **Context is lost between agents** (requires re-explaining, copy/paste)
3. **Quality is inconsistent** (no systematic quality gates)
4. **The workflow doesn't scale** (more agents = more coordination)

The proposed orchestrated workflow addresses all four issues while preserving the creative control and specialized expertise that make the current system work.

### What Makes This Proposal Different

This isn't "automation for automation's sake." The redesign maintains human decision-making at key creative moments (angle selection, revision decisions, headline choice, publishing approval) while automating the tedious coordination tasks (file creation, metadata generation, sub-agent invocation, state management).

The file-based state management is the key architectural decision that enables:
- Resumable workflows (close and come back later)
- Transparent state (inspect session files anytime)
- Debuggability (see exactly what happened)
- Future tooling (analytics, quality tracking, etc.)

### Recommendation: Proceed with Implementation

**Phase 1 (Week 1):** Build core aiglet-publisher agent
**Phase 2 (Week 1-2):** Integrate roast-my-writing sub-agent
**Phase 3 (Week 2):** Integrate image workflow
**Phase 4 (Week 3):** Polish and user acceptance testing

**Go-live:** Week 4, hard cutover to new workflow

**Total implementation time:** 3-4 weeks part-time effort

**Expected ROI:**
- 60% reduction in coordination time per article
- 70% reduction in manual steps
- Improved quality consistency through systematic gates
- Better creative flow (less context switching)
- Scalable architecture for future enhancements

---

## Next Steps

1. **Review this proposal** and identify any concerns or questions
2. **Approve architecture** (orchestrator + file-based state + sub-agents)
3. **Begin Phase 1 implementation** (build aiglet-publisher core)
4. **Test with a simple article** from ideas.md to validate approach
5. **Iterate based on feedback** before building full workflow

Should I proceed with creating the `aiglet-publisher` agent definition, or would you like to discuss any aspects of this proposal first?
