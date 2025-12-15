# Tier Upgrade System - Brainstorming Session

**Date**: 2025-12-14
**Framework**: CRI Strategic Brainstorming (Context, Role, Interview)
**Expert Role**: Game Economy + UX Designer (Hybrid)
**Status**: Pre-Specification Research

---

## Session Summary

This brainstorming session explored the design of a tier upgrade system for Cosmos and Chaos, focusing on unlocking automation (Tier 0→1) and creating a scalable progression framework through Tier 5 with Wonder/Dread branching at Tier 3.

---

## Context

### Current Game State
- **Phase 2 Complete**: Auto-production system with 60 FPS production loop
- **8 Core Cards**: Extractor, Processor, Reactor, Synthesizer, Lab, Biomass Harvester, Nano-Assembler, Archive
- **Current Tier**: All cards at Tier 0 (manual clicking only)
- **Technical Foundation**:
  - `gameState.startAutomation(cardId)` method exists
  - Cards have `automated` flag (defaults false)
  - Production at configured `baseRate` when automated
  - 7 resource types: ore, metal, energy, science, data, biomass, nanites

### Design Goal
Create a tier upgrade system that:
1. Lets players spend resources to upgrade Tier 0 → Tier 1
2. Unlocks automation when reaching Tier 1
3. Feels rewarding and creates good progression pacing
4. Scales to support future tiers (2, 3, 4, 5)
5. Works well for idle/incremental game design patterns

### Future Vision
- **Tier 0**: Manual clicking only
- **Tier 1**: Basic automation unlocked
- **Tier 2**: Enhanced production rates
- **Tier 3**: Wonder/Dread philosophical fork (critical decision point)
- **Tier 4-5**: Advanced specialization and exotic resources
- **Matter Fluidity**: At 75% Resonance, resources become interchangeable within tiers

---

## Interview Insights

### 1. Player Progression Pacing
**Decision**: **Fast unlock (2-5 minutes)**

**Rationale**:
- Hook players quickly by letting them experience automation early
- Build real strategic depth into Tiers 2-5 rather than gating Tier 1
- First card automated in ~2-3 minutes of manual clicking
- Full set of 8 cards automated in ~5-10 minutes
- Creates immediate positive feedback loop

**Design Implications**:
- Tier 0→1 costs must be achievable through manual clicking in 2-5 min
- First upgrade should feel accessible, not grindy
- Tutorial/onboarding can introduce automation concept quickly
- Later tiers provide the long-term engagement depth

---

### 2. Card Unlock Strategy
**Decision**: **Resource-gated tiers (soft guidance)**

**Rationale**:
- No hard prerequisites or forced linear progression
- Resource costs naturally guide optimal unlock order
- Feels organic and player-driven rather than restrictive
- Players can experiment and make choices
- Economic design teaches production chain relationships

**Design Pattern**:
```
Extractor (T0→1): 50 ore
  ↓ (produces metal)
Processor (T0→1): 30 ore + 20 metal
  ↓ (produces refined resources)
Advanced cards: Require outputs from earlier cards
```

**Example Flow**:
1. Player manually clicks to gather 50 ore
2. Upgrades Extractor to Tier 1 (first automation!)
3. Extractor produces metal automatically
4. Player saves for Processor (needs ore + metal)
5. Natural progression emerges from resource availability

**Benefits**:
- Player agency preserved
- No "locked" UI states to design
- Costs communicate progression path
- Supports multiple valid strategies

---

### 3. Visual Feedback & Upgrade Interface
**Decision**: **Hybrid approach (progress hints + upgrade modal)**

**Rationale**:
- Ambient awareness through subtle progress indicators
- Detailed modal makes upgrade moment feel important
- Balances "always visible" feedback with deliberate decision-making
- Supports both active and idle play styles

**UI Components**:

**A. Card Progress Hints (Ambient)**:
- **Glow intensity**: Increases as player approaches upgrade cost
  - 0-25% of cost: No glow
  - 25-50%: Faint glow
  - 50-75%: Medium glow
  - 75-100%: Strong glow/pulse
- **Corner icon/badge**: Shows current tier + upgrade availability
  - Example: "T0 → T1" badge appears when affordable
- **Color coding**: Shifts from red (far) → yellow (close) → green (ready)

**B. Upgrade Modal (Detailed)**:
- Triggered by clicking card or upgrade button
- **Shows**:
  - Current tier and stats
  - Next tier benefits preview
  - Resource costs breakdown with progress bars
  - "Can afford" / "Need X more" status
  - Confirmation button (disabled until affordable)
- **Benefits preview**:
  - "Unlocks: Automatic production at 1 ore/sec"
  - "Production rate: +50%"
  - Visual comparison of before/after

**C. Visual Feedback on Upgrade**:
- Particle burst effect (tier-appropriate color)
- Card animation (flip, glow, scale pulse)
- Sound effect (satisfying "ding" or "whoosh")
- Toast notification: "Extractor upgraded to Tier 1!"
- Update global resource panel to show new production

**Technical Integration**:
- Leverage existing DisplayUpdateManager (2Hz updates)
- Event-driven glow updates (don't recalculate every frame)
- Modal uses existing card data + upgrade config
- Reuse LED indicator patterns for glow system

---

### 4. Scaling Formula & Future-Proofing
**Decision**: **Hybrid exponential + tiered resources**

**Rationale**:
- Exponential scaling creates long-term depth (idle game standard)
- Tiered resources add qualitative progression (not just "more")
- Supports Matter Fluidity mechanic (resource interchangeability)
- Enables meaningful Wonder/Dread fork at Tier 3
- Each tier feels distinct, not just "bigger numbers"

**Resource Tier Structure**:

**Tier 0→1: Basic Resources**
- Ore (foundational, manually clickable)
- Energy (early automation unlock)
- Example costs:
  - Extractor: 50 ore
  - Reactor: 100 ore, 25 energy

**Tier 1→2: Refined Resources**
- Metal (processed from ore)
- Science (generated from data processing)
- Data (produced by specialized cards)
- Example costs:
  - Extractor: 500 ore, 200 metal
  - Lab: 300 metal, 150 science

**Tier 2→3: Advanced Resources + Wonder/Dread Branching**
- Biomass (organic/wonder path resource)
- Nanites (technological/dread path resource)
- **Critical decision point**: Player chooses philosophical alignment
- Example costs:
  - Wonder path: 5K ore, 2K metal, 1K biomass
  - Dread path: 5K ore, 2K metal, 1K nanites

**Tier 3→4+: Exotic Resources**
- Path-specific advanced resources
- Exponential costs (50K+, 500K+, 5M+)
- Multi-resource requirements (5+ types)
- Example: 100K ore, 50K metal, 25K science, 10K biomass, 5K "resonance crystals"

**Scaling Formula**:
```
Base cost per tier: 10x previous tier
Resource diversity: +1-2 new resource types per tier
Tier 0→1: ~100 total resources
Tier 1→2: ~1,000 total resources
Tier 2→3: ~10,000 total resources
Tier 3→4: ~100,000 total resources
Tier 4→5: ~1,000,000 total resources
```

**Matter Fluidity Integration** (75% Resonance):
- Within a tier, resources become interchangeable
- Example: At 75% Resonance, 1 ore ≈ 1 energy (within Tier 1)
- Simplifies late-game management
- Rewards progression system mastery

---

## Key Design Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Pacing** | Fast unlock (2-5 min) | Hook players early, depth in later tiers |
| **Unlock Strategy** | Resource-gated (soft) | Organic, player-driven, teaches through economics |
| **UI/UX** | Hybrid (hints + modal) | Ambient awareness + deliberate upgrade moment |
| **Scaling** | Exponential + tiered resources | Long-term depth + qualitative progression |
| **Resource Tiers** | Basic → Refined → Advanced → Exotic | Supports Matter Fluidity & Wonder/Dread fork |

---

## Integration with Existing Systems

### Phase 2 Foundations
- **Production Loop**: Already runs at 60 FPS with delta time
- **Automation Flag**: `card.automated` toggles production
- **Resource Tracking**: 7 resource types with global display panel
- **State Management**: `gameState.startAutomation(cardId)` ready to use

### New Systems Needed
1. **Upgrade Cost Configuration**: Define costs per card per tier
2. **Upgrade Manager**: Handle purchase validation, resource deduction, tier increment
3. **Progress Tracking**: Calculate "% toward next tier" for glow effects
4. **Upgrade Modal UI**: New component for detailed upgrade view
5. **Visual Feedback System**: Glow/pulse effects on cards
6. **Save/Load Extension**: Persist card tiers in save data

---

## Next Steps for Specification

### 1. Define Exact Tier 0→1 Costs
Create cost table for all 8 cards:
```
Extractor:          50 ore
Reactor:           100 ore, 25 energy
Processor:          75 ore, 30 metal
Synthesizer:       150 ore, 50 metal, 25 energy
Lab:               200 ore, 75 science
Biomass Harvester: 125 ore, 50 biomass
Nano-Assembler:    175 ore, 60 nanites
Archive:           100 ore, 40 data
```
*(Adjust based on manual click rates and production rates)*

### 2. Prototype Manual Click Rates
- How fast can players generate resources manually?
- What feels good for "time to first upgrade"?
- Test 2-5 minute target with actual clicking

### 3. Design Upgrade Modal Wireframe
- Layout for cost breakdown
- Benefits preview format
- Button states (disabled/enabled)
- Where modal appears (overlay, sidebar, fullscreen?)

### 4. Specify Glow/Progress Visual Design
- CSS implementation approach
- Color palette for progress states
- Animation performance considerations
- Integration with existing card CSS

### 5. Plan Tier 1→2 Costs (Preview)
- 10x scaling from Tier 0→1?
- Which refined resources required?
- Prerequisite: Must all cards be Tier 1 before any Tier 2?

### 6. Consider Wonder/Dread Fork UX (Tier 3)
- How is choice presented?
- Can it be reversed?
- Visual distinction between paths?
- Lock-in mechanics?

---

## Open Questions for Specification Phase

1. **Manual click mechanics**: How much ore per click? Does this scale?
2. **First-time upgrade tutorial**: Should first upgrade be guided/highlighted?
3. **Bulk upgrades**: Can players upgrade multiple cards at once, or one at a time?
4. **Upgrade confirmation**: Always required, or skip for low-tier upgrades?
5. **Visual tier indication**: How do players see a card's tier at a glance?
6. **Cost display format**: Show exact numbers (50 ore) or progress bars (50/50)?
7. **Refund mechanics**: Can upgrades be reversed? (Probably not for idle games)
8. **Achievement integration**: Track "first upgrade," "all Tier 1," etc.?
9. **Sound design**: Tier-specific sound effects? Volume settings?
10. **Mobile considerations**: Touch targets, modal size, glow visibility?

---

## Research Areas to Explore

Before creating the formal specification with `/speckit.specify`, consider researching:

### A. Idle Game Benchmarks
- Study upgrade systems in: Idle Miner Tycoon, Realm Grinder, Kittens Game, Universal Paperclips
- Analyze: Cost curves, upgrade pacing, visual feedback patterns
- Extract: Best practices for first-time upgrade experience

### B. Resource Economy Balancing
- Formula design for exponential growth
- Multi-resource cost balancing (when to require 2 vs 3 vs 5 resources?)
- Idle production rates vs upgrade cost ratios

### C. UX Patterns for Progress Indication
- Glow effects performance (CSS vs Canvas?)
- Progress ring/bar component libraries
- Modal vs inline upgrade patterns
- Affordance indicators (when to show locked vs grayed vs hidden)

### D. Technical Implementation
- Upgrade state management architecture
- Save/load schema for tier data
- Event system for upgrade completion
- Performance: Throttling glow calculations

### E. Tier 3 Wonder/Dread Fork Design
- Roguelike alignment systems (Hades, Slay the Spire)
- Tech tree branching patterns
- Path-specific resource design
- Balancing two divergent progression paths

---

## Success Criteria

The tier upgrade system will be successful if:

1. **Engagement**: Players upgrade first card within 2-5 minutes
2. **Clarity**: Players understand what resources are needed and why
3. **Satisfaction**: Upgrade moment feels rewarding (visual + audio feedback)
4. **Scalability**: Same system works cleanly through Tier 5
5. **Performance**: No frame rate impact from progress glow effects
6. **Intuitiveness**: No tutorial needed to understand upgrade flow
7. **Strategic depth**: Resource-gating creates interesting choices
8. **Technical integration**: Minimal refactoring of Phase 2 systems

---

## Appendix: Expert Role Context

**Role Adopted**: Game Economy + UX Designer (Hybrid)

**Expertise Applied**:
- Idle/incremental game progression systems
- Resource sink design and unlock pacing
- Visual feedback and player psychology
- Interface patterns for upgrade systems
- Balancing mathematical curves with emotional satisfaction
- Scalable tier/upgrade architecture
- Early-game engagement vs long-term retention

**Design Philosophy**:
- Fast initial hook, depth over time
- Soft guidance over hard gates
- Ambient awareness + deliberate moments
- Economic design teaches mechanics
- Visual feedback creates satisfaction
- Systems scale elegantly

---

## Document Status

**Pre-Specification Brainstorm** → Ready for `/speckit.specify` workflow

This document captures the strategic thinking and design decisions from the CRI brainstorming session. Use this as reference material when creating the formal specification, implementation plan, and task breakdown.

**Next Step**: Run `/speckit.specify` with this brainstorm as context to create structured design artifacts.

---

*Generated via CRI Strategic Brainstorming Framework*
*Session Date: 2025-12-14*
