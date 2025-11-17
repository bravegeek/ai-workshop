# Satirical Article Agent - Brainstorm Session

**Date:** 2025-11-16
**Project:** The Aiglet Automation Agent
**Goal:** Create an agent to streamline the process of creating and publishing satirical articles

## Context

The Aiglet (https://theaiglet.top/) is a satirical news website built with Hugo. Currently, the process of creating and publishing articles involves multiple manual steps that could be automated.

### Current Website Structure

- **Platform:** Hugo static site generator
- **Theme:** quint
- **Content Location:** `~/dev/theaiglet/content/posts/`
- **Post Structure:** Each article is in a dated directory (e.g., `2025-05-14-smoking-on-planes/`)

### Post Components

Each post directory contains:
- `index.md` - Markdown file with frontmatter and article content
- Image file (e.g., `president-cigar.jpg`)

**Frontmatter fields:**
```toml
+++
date = '2025-05-14T23:55:06-04:00'
type = 'posts'
draft = false
title = 'Executive Order Allows Smoking on Planes, Citing "Freedom to Fume"'
slug = 'executive-order-smoking-planes'
image = 'president-cigar.jpg'
alt = 'President with a cigar standing in front of airplane'
tags = ['politics', 'humor', 'satire']
description = "A satirical news story..."
img-prompt = 'Create a satirical editorial cartoon...'
+++
```

## Current Workflow (Approximation)

1. Come up with an idea/headline
2. Use AI to write the article content
3. Generate an image prompt
4. Generate the image with AI
5. Manually create the dated directory
6. Manually create the `index.md` file
7. Fill in all frontmatter fields
8. Save the image
9. Run `hugo server` to preview

## Designed Agent Workflow

### Ideas File

**Location:** `/home/greg/dev/ai-workshop/projects/satirical-article-agent-2025-11/ideas.md` (while experimenting)

**Format:** Markdown checklist with headlines and/or descriptions

Example:
```markdown
# Article Ideas

- [ ] Executive Order Allows Smoking on Planes - Presidential decree brings back secondhand smoke at 30,000 feet
- [ ] Tech CEO Caught Smuggling Avocados
- [ ] Florida Bans Fluoride, Embraces Tooth Decay as "Natural State"
```

### Step-by-Step Workflow

#### 1. Idea Selection
Agent presents all options together with creative satirical suggestions:

**Unchecked Ideas from ideas.md:**
- Each unchecked idea is shown with creative satirical twists/angles
- Example: "Tech CEO Mandatory Fun" → "but the CEO is three interns in a trench coat"

**Top 5 Recent Headlines:**
- Headlines from last 3 days with absurd satirical angle suggestions
- Example: "Google $40B Data Centers" → "but powered by hamsters on wheels"

**Create Your Own:**
- Option to create completely new idea

All options numbered sequentially for easy selection

#### 2. Description & Outline Generation
For unchecked ideas or headlines, agent:
- Creates a brief description
- Creates a short outline of the article

#### 3. Review & Refinement
Agent asks: "Should I change anything?"
- If yes → make requested changes
- If no → proceed to full article generation

#### 4. Full Article Generation
Agent generates complete satirical article content

#### 5. Article Approval
Agent presents the full article and asks for approval

#### 6. Image Prompt Generation
After article approval, agent:
- Analyzes the article's tone
- Generates 2 image prompts that match the tone
- Presents both prompts as choices

User can:
- Choose one of the two prompts
- Request two more different prompts (repeat as needed)

#### 7. Image Generation
**TBD:** Should agent generate actual image via API, or just provide prompt for manual generation?

#### 8. Hugo File Creation
**TBD:** After image is ready, create files in `~/dev/theaiglet/content/posts/`
- Directory structure
- index.md with frontmatter
- Image file

#### 9. Idea Tracking
**TBD:**
- Mark selected ideas as checked `[x]` in ideas.md?
- Add new ideas to ideas.md when created?

### Outstanding Questions

1. **Image Generation:**
   - Call image API (DALL-E, Stable Diffusion, etc.)?
   - Or just generate prompt and user handles image creation separately?

2. **Hugo File Creation:**
   - Directory naming convention? (date + slug?)
   - Auto-generate all required fields?
   - Set as draft or published?

3. **Idea Tracking:**
   - Mark ideas as checked when used?
   - Add new ideas to ideas.md after creation?
   - Track ideas from web headlines?

4. **"Create New Idea" Flow:**
   - User manually types headline/description?
   - Or agent helps brainstorm ideas?

5. **AI Services:**
   - Use agent's own LLM for article generation?
   - Or call external API (Claude/OpenAI)?

## Technical Considerations

- Agent will need to:
  - Read/write files in the Hugo content directory
  - Generate proper frontmatter (TOML format)
  - Handle date formatting
  - Create directory structures
  - Potentially call external APIs (for AI services)
  - Potentially manage an "ideas" tracking system

## Design Principles

**The Agent as Creative Muse:**
The agent doesn't just execute tasks - it serves as a creative guide throughout the entire workflow. At every phase, it offers:
- Alternative approaches and angles
- Specific suggestions and examples
- Creative "what if" scenarios
- Explanations of comedic techniques
- References to successful satire styles
- Multiple options to choose from

**Key Refinements Made:**
1. ✅ Present ideas and headlines together with creative suggestions
2. ✅ Offer alternative satirical angles at description/outline phase
3. ✅ Suggest specific joke enhancements after article generation
4. ✅ Explain visual approaches and offer style alternatives for images
5. ✅ Suggest alternative headlines, tags, and descriptions for metadata
6. ✅ Provide workflow tips and next steps suggestions

## Next Steps

1. ✅ Clarify the ideas file format and location
2. ✅ Define the selection process
3. ✅ Map out the complete agent workflow
4. ✅ Determine which AI services to integrate
5. ✅ Design the agent architecture
6. ✅ Implement the agent
7. **Test and iterate** - Use the agent, gather feedback, refine further

## Notes

- The website already stores `img-prompt` in frontmatter, suggesting image generation is part of the workflow
- Each post is self-contained in its own directory (good for organization)
- Hugo makes it easy to preview locally before deploying
