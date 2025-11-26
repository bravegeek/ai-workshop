# Satirical Article Agent - Design Session

**Date:** November 16, 2025
**Project:** satirical-article
**Type:** AI Agent Design (Content Creation & Workflow Automation)

## Session Summary

This session designed a creative muse agent for The Aiglet satirical news website that guides users through the complete workflow from ideation to publication-ready Hugo files. The agent serves as a collaborative creative partner, offering suggestions, alternatives, and creative nudges at every phase while automating the technical aspects of article creation.

## Context

**User Need:**
The user maintains The Aiglet (https://theaiglet.top/), a satirical news website built with Hugo. The current workflow for creating and publishing articles involves multiple manual steps:
- Coming up with ideas/headlines
- Writing article content with AI assistance
- Generating image prompts
- Creating images with AI
- Manually creating dated directories
- Manually creating index.md files with frontmatter
- Filling in metadata fields
- Saving images
- Running Hugo server to preview

**Key Requirements:**
- Streamline the entire article creation process
- Maintain The Aiglet's satirical voice and quality
- Act as a creative guide, not just a task executor
- Provide alternatives and suggestions at every step
- Handle Hugo file structure and frontmatter generation
- Track ideas and manage workflow

## Expert Role Adopted

**Role:** Creative Writing Coach & Workflow Automation Specialist

This role combined understanding of:
- Satirical writing techniques and The Aiglet's voice
- Hugo static site generator architecture
- Creative ideation and brainstorming methods
- Editorial workflow design
- User experience in creative processes
- Content management systems

## Interview Insights

Through the design process, we established:

### 1. Agent as Creative Muse

**Decision:** Position agent as collaborative creative partner, not just executor

**Rationale:**
- Creative work benefits from suggestions and alternatives
- Users get stuck and need creative nudges
- Multiple options spark better ideas
- Explaining comedic techniques helps users learn
- Makes the process more engaging and educational

**Implementation:**
- Offer alternative satirical angles at every phase
- Suggest specific jokes and enhancements
- Explain visual approaches for images
- Provide multiple headline/tag/description options
- Reference successful satire styles
- Ask questions to spark creativity

### 2. Six-Phase Workflow

**Decision:** Structured but flexible six-phase process

**Phases Designed:**
1. **Idea Selection** - Present ideas, headlines, and custom options together
2. **Description & Outline** - Create plan with alternative angles
3. **Full Article Generation** - Write complete satirical article
4. **Image Prompt Generation** - Create 2 options at a time with style explanations
5. **Hugo File Creation** - Generate all files and metadata
6. **Idea Tracking** - Mark completed ideas in tracking file

**Rationale:**
- Breaks complex task into manageable steps
- Each phase has clear approval point
- User maintains creative control throughout
- Natural checkpoints prevent wasted work
- Allows iteration at any stage

### 3. Ideas File Management

**Decision:** Centralized markdown checklist for idea tracking

**Format:**
```markdown
# Article Ideas

## Unchecked Ideas
- [ ] Idea title - Brief description

## Completed Ideas
- [x] Published idea - Description
```

**Location:** `/home/greg/dev/ai-workshop/projects/satirical-article-agent-2025-11/ideas.md`

**Functionality:**
- Track unchecked ideas ready to write
- Mark ideas as completed when used
- Add new ideas created during sessions
- Optionally track headline-sourced ideas

### 4. Idea Selection Presentation

**Decision:** Present all options together with creative suggestions

**Options Offered:**
1. **Unchecked Ideas from ideas.md** - With satirical twist suggestions
2. **Top 5 Recent Headlines** - From last 3 days with absurd angle suggestions
3. **Create Your Own** - Option to create completely new idea

**Format:**
- All options numbered sequentially (1, 2, 3...)
- Each with creative satirical suggestion
- Easy selection by number

**Example:**
```
1. Tech CEO Announces "Mandatory Fun" Policy
   → Suggestion: "but the CEO is actually three interns in a trench coat"

2. [Recent headline: Google Invests $40B in Data Centers]
   → Suggestion: "but the servers are powered by unpaid AI chatbots"

3. Create your own idea
```

### 5. Creative Alternatives at Every Phase

**Decision:** Always offer 2-3 alternative approaches before finalizing

**Phase 2 (Outline):**
- Suggest different satirical angles
- Reference similar successful satire
- Explain trade-offs of each approach

**Phase 3 (Article):**
- Suggest specific joke enhancements
- Offer punchier headline alternatives
- Mention comedic techniques used

**Phase 4 (Images):**
- Explain visual approach of each option
- Suggest alternative styles (editorial cartoon, photorealistic, etc.)
- Reference successful visual satire styles

**Phase 5 (Metadata):**
- Suggest alternative headlines
- Offer additional tag options
- Provide punchier description variations

### 6. Hugo Integration

**Decision:** Full automation of Hugo file structure and frontmatter

**Generated Elements:**
- Directory: `YYYY-MM-DD-slug/`
- File: `index.md` with TOML frontmatter
- Metadata: date, title, slug, image filename, alt text, tags, description, img-prompt

**Frontmatter Template:**
```toml
+++
date = 'YYYY-MM-DDTHH:MM:SS-04:00'
type = 'posts'
draft = false
title = 'Article Title Here'
slug = 'article-slug-here'
image = 'image-filename.jpg'
alt = 'Alt text description'
tags = ['tag1', 'tag2', 'tag3']
description = "Brief description here"
img-prompt = 'The full selected image prompt here'
+++
```

**Target Location:** `/home/greg/dev/theaiglet/content/posts/`

### 7. Image Prompt Workflow

**Decision:** Iterative selection with multiple options

**Process:**
1. Generate 2 different image prompts
2. Explain visual approach of each
3. User can:
   - Choose Option 1
   - Choose Option 2
   - Request two more different prompts (repeat)
   - Try different style (suggest alternatives)

**Rationale:**
- Two options prevent decision paralysis
- Explanations help users understand visual thinking
- Iteration allows exploration of different styles
- Style alternatives spark creative ideas

### 8. Voice and Style Guidelines

**Decision:** Match The Aiglet's satirical voice

**Characteristics:**
- Biting satire and absurdist humor
- Sharp social commentary
- News article format (lead paragraph, quotes, details)
- Professional news tone with ridiculous content
- 400-600 words typically
- Location line in ALL CAPS (e.g., "**WASHINGTON, D.C.**")

**Satire Principles:**
- Punch up, not down
- Target power, policy, absurdity
- Keep it almost plausible
- Use deadpan delivery
- Escalate absurdity throughout

## Research Plan

**Research Type:** Workflow Automation & Content Strategy

**Analysis Performed:**
- Examined existing Aiglet articles for style and structure
- Analyzed Hugo theme (quint) frontmatter requirements
- Studied The Aiglet's content patterns
- Reviewed satirical writing best practices
- Mapped current manual workflow steps

**Key Research Questions Explored:**

1. **What makes The Aiglet's satire effective?**
   - Professional news tone creates believability
   - Absurdity escalates throughout article
   - Quotes from "officials" add authenticity
   - Specific details make ridiculous scenarios concrete
   - Deadpan delivery maximizes impact

2. **What Hugo elements are required?**
   - TOML frontmatter format
   - Specific fields: date, type, draft, title, slug, image, alt, tags, description, img-prompt
   - Directory structure: dated directories with index.md
   - Image files in same directory as index.md

3. **Where do creative blocks occur?**
   - Initial ideation (blank page problem)
   - Finding the right satirical angle
   - Balancing humor with message
   - Creating compelling images
   - Writing effective headlines

4. **How to maintain creative control while automating?**
   - Approval points at each phase
   - Always offer alternatives, never force direction
   - Allow iteration and revision at any stage
   - User makes final decisions on all creative elements
   - Agent suggests, user selects

5. **What makes a good creative muse?**
   - Offers options without overwhelming
   - Explains reasoning behind suggestions
   - Sparks ideas through "what if" scenarios
   - References examples and techniques
   - Balances guidance with user autonomy

## Agent Design Features

### Core Workflow

**Phase 1: Idea Selection**
1. Read ideas.md file
2. Search recent headlines (last 3 days)
3. Present all options together with satirical suggestions
4. User selects by number or creates new idea

**Phase 2: Description & Outline**
1. Create brief description (1-2 sentences)
2. Create short outline (3-5 bullet points)
3. Offer 2-3 alternative satirical angles
4. Show all options together
5. Ask: "Should I change anything, or try an alternative angle?"
6. Iterate until approved

**Phase 3: Full Article Generation**
1. Generate complete satirical article in The Aiglet's style
2. Study example article structure for reference
3. Offer 2-3 specific joke/quote enhancements
4. Present article with enhancement suggestions
5. Ask: "Use suggestions, make changes, or approve?"
6. Iterate until approved

**Phase 4: Image Prompt Generation**
1. Analyze article's satirical tone
2. Generate 2 different image prompts
3. Explain visual approach of each option
4. Offer alternative style suggestions
5. User selects option, requests more, or tries different style
6. Repeat until user selects a prompt

**Phase 5: Hugo File Creation**
1. Generate all required metadata
2. Offer alternative headlines, tags, descriptions
3. Show metadata and ask for approval
4. Create directory structure
5. Create index.md with frontmatter
6. Add article content below frontmatter
7. Inform user of file paths and next steps

**Phase 6: Idea Tracking**
1. Mark selected idea as checked in ideas.md
2. Add new ideas if created during session
3. Optionally track headline-sourced ideas

### Creative Muse Features

**Continuous Suggestions:**
- Never just execute - always offer alternatives
- Explain why suggestions might work
- Reference similar successful examples
- Use "what if" scenarios to spark ideas
- Ask questions to explore possibilities

**Educational Approach:**
- Mention comedic techniques used
- Explain satire principles
- Reference The Onion, The Aiglet archives
- Teach through examples
- Build user's satirical writing skills

**Flexibility:**
- Allow deviation from workflow
- Accommodate user preferences
- Iterate as many times as needed
- No pressure to use suggestions
- User maintains full creative control

## Next Steps

### Implementation
1. ✅ Agent design completed (satirical-article.md)
2. ✅ Test run completed (Google Deep Research article)
3. ✅ Ideas file created and structured
4. Deploy agent to .claude/agents/ for actual use
5. Test with real article publication to The Aiglet
6. Refine based on practical usage

### Usage Guidelines
- Agent ready to use for article creation
- Can start from ideas.md, headlines, or custom topics
- Full workflow or individual phases as needed
- Test article demonstrates successful workflow
- Image generation still manual (agent provides prompts)

### Quality Assurance
- Agent maintains The Aiglet's voice consistently
- Suggestions are creative and relevant
- Alternatives spark genuine ideas
- Hugo files generated correctly
- Workflow feels collaborative, not mechanical

## Project Files

All documentation is saved in:
**`/home/greg/dev/ai-workshop/projects/satirical-article-agent-2025-11/`**

**Files Created:**
1. `satirical-article.md` - Complete agent design and implementation guide
2. `ideas.md` - Idea tracking checklist
3. `test-article-google-deep-research.md` - Test run documentation
4. `session.md` - This file, documenting the design session and decisions
5. `session.meta.md` - Metadata, reasoning, and transparency documentation (to be created)

## Key Takeaways

**Unique Value Proposition:**
This agent transforms article creation from a series of manual tasks into a collaborative creative journey. By acting as a muse rather than just a tool, it enhances creativity while handling technical automation.

**Design Philosophy:**
- Creative collaboration over mechanical execution
- Options and alternatives over single paths
- Education and skill-building over pure automation
- User control over agent control
- Playful exploration over rigid workflow

**Success Criteria:**
- Users feel creatively supported, not constrained
- Article quality matches or exceeds manual workflow
- Process is enjoyable and engaging
- Hugo files generated correctly every time
- Users learn satire techniques through usage
- Workflow saves significant time

**Innovation:**
- Combines creative coaching with workflow automation
- Positions AI as collaborative partner
- Maintains human creative control throughout
- Educates while automating
- Makes technical tasks invisible

---

*This agent design was created through a structured brainstorming and design process, focusing on workflow efficiency, creative support, and maintaining The Aiglet's satirical voice.*
