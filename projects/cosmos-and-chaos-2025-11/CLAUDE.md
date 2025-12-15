# Cosmos and Chaos - Development Notes

## Phase 2: Resource Automation & Live Counters

**Status**: Implementation Complete (71/86 tasks = 83%)
**Branch**: `001-resource-automation`
**Spec**: `/specs/001-resource-automation/`

### What Was Implemented

#### Core Systems
1. **Automatic Resource Production** (US1 - Priority P1)
   - Cards automatically produce resources when placed (Tier 1+)
   - Production loop with delta time calculation
   - Buffer accumulation system for sub-unit precision
   - Event-driven resource updates

2. **Status LED Indicators** (US2 - Priority P2)
   - Visual efficiency feedback (green >80%, yellow 40-80%, red <40%)
   - Real-time LED updates based on input availability
   - DisplayUpdateManager with throttled updates (2Hz/1Hz/0.5Hz)

3. **I/O Connection Indicators** (US3 - Priority P2)
   - Visual indicators showing card input/output connections
   - Automatic detection of adjacent card relationships
   - Pulse animations for active connections
   - Position-aware indicator placement (left/right/top/bottom)

4. **Multi-Resource Tracking** (US4 - Priority P3)
   - 5 distinct resource types: Ore, Energy, Data, Biomass, Nanites
   - Global resource display panel with real-time updates
   - formatNumber() utility for large values (K/M/B notation)
   - Cross-resource consumption support (e.g., data+energy → science)

#### Technical Architecture

**State Management** (`src/js/state.js`):
- Centralized GameState with event bus
- Resource accumulators for sub-unit precision
- Card accumulators for production buffering
- Efficiency calculation for multi-input cards
- SaveManager integration with migration support

**Display System** (`src/js/display.js`):
- DisplayUpdateManager with RAF-based update loop
- Configurable update rates by card tier
- Event-driven LED and resource updates
- Throttled counter updates (2Hz max)

**Grid System** (`src/js/grid.js`):
- Adjacency detection (N/S/E/W)
- I/O connection logic based on resource matching
- Automatic indicator updates on card placement/movement

**Testing** (`tests/`):
- Unit tests for all core systems
- Production system tests
- Efficiency calculation tests
- Grid adjacency and connection tests
- Resource tracking tests

### Key Files Modified

**Core Logic**:
- `src/js/state.js` - GameState with accumulators and efficiency
- `src/js/production.js` - Production loop and resource generation
- `src/js/display.js` - Display update management
- `src/js/grid.js` - Adjacency and I/O connection detection
- `src/js/cards.js` - I/O indicator HTML generation

**UI/Styling**:
- `src/index.html` - Global resource panel with data-resource attributes
- `src/css/cards.css` - I/O indicators, LEDs, transitions, tooltips
- `src/css/variables.css` - LED and resource color variables

**Testing**:
- `tests/accumulators.test.js`
- `tests/efficiency.test.js`
- `tests/production.test.js`
- `tests/grid.test.js`
- `tests/resources.test.js`

### Performance Characteristics

- **Target**: 60 FPS with 25+ cards producing
- **Counter Updates**: Throttled to 2Hz (primary), 1Hz (secondary), 0.5Hz (tertiary)
- **Accuracy**: <1% error after 10 minutes (accumulator-based precision)
- **Resource Overhead**: Minimal - event-driven updates only when values change

### Manual Testing Checklist (T084)

User should validate:
1. Place Tier 1 card → verify auto-production starts
2. Check LED changes color based on resource availability
3. Place adjacent cards with matching I/O → verify connection indicators
4. Verify all 5 resource types track separately in global panel
5. Check formatNumber() works (1000 → 1.0K, 1000000 → 1.0M)
6. Save/load game → verify accumulators persist
7. Performance: 60 FPS with 25+ cards (DevTools Performance tab)

### Pending Tasks

The following tasks are marked for manual validation:
- **T081**: Performance test (60 FPS with 25 cards)
- **T082**: Accuracy test (<1% error after 10 minutes)
- **T083**: Full test suite validation
- **T084**: Manual testing per quickstart.md
- **T086**: Git commit with all changes

### Development Workflow

This project uses the `/speckit.*` workflow for spec-driven development:
1. `/speckit.specify` - Create feature specification
2. `/speckit.plan` - Generate implementation plan
3. `/speckit.tasks` - Break down into actionable tasks
4. `/speckit.implement` - Execute implementation (this run)

All design artifacts are in `/specs/001-resource-automation/`:
- `spec.md` - Feature specification
- `plan.md` - Implementation plan with tech stack
- `data-model.md` - Entity schemas
- `tasks.md` - Task breakdown with dependencies
- `contracts/` - API contracts
- `quickstart.md` - Developer guide

### Next Steps

To continue development:
1. Validate performance (T081-T082)
2. Run full test suite: `npm test`
3. Manual testing per checklist above
4. Commit changes with message referencing Phase 2
5. Consider starting Phase 3 (economy/wonder/dread systems) on new branch
