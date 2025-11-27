# GEMINI.md

This file provides guidance to Gemini Code when working with code in this repository.

## Repository Structure

This is a **multi-project workshop directory** that contains various independent projects, each in its own subdirectory. Projects may include:
- Code-based projects (applications, libraries, scripts)
- Non-code projects (documentation, research notes, diagrams)
- Experiments and prototypes
- Workshop exercises and tutorials

## Directory Structure

### AI/LLM-Focused Directories

- **`prompts/`** - Prompt templates, examples, experiments, system prompts, and few-shot examples
- **`personas/`** - AI personas, character definitions, role-specific instructions, and personality configurations
- **`agents/`** - AI agent implementations, configurations, and autonomous agent systems
- **`workflows/`** - Multi-step AI workflows, chains, orchestration patterns, and complex task flows
- **`fine-tuning/`** - Datasets, configurations, and scripts for model fine-tuning
- **`embeddings/`** - Vector databases, embedding experiments, and semantic search implementations
- **`rag/`** - Retrieval Augmented Generation (RAG) implementations and knowledge base projects

## Organization

Each project lives in its own top-level directory within this workspace. Projects are self-contained and may have different:
- Technologies and languages
- Build systems and tooling
- Documentation approaches
- Purposes and goals

## Working with Projects

When working on a specific project:
1. Navigate to the project's directory
2. Check for project-specific documentation (README.md, docs/, etc.)
3. Look for standard configuration files (package.json, requirements.txt, Makefile, etc.) to understand build/test commands
4. Each project is independent - don't assume shared dependencies or conventions across projects

## Notes

- The repository uses `main` as the default branch
- The `.gemini/settings.local.json` file contains Gemini Code IDE permissions configuration
