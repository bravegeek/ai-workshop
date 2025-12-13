# Tasks: Resource Automation & Live Counters

**Input**: Design documents from `/specs/001-resource-automation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests are included as this is Phase 2+ development (per Constitution requirement). Tests validate specifications and catch regressions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project structure (from plan.md):
- Source: `/home/greg/dev/ai-workshop/projects/cosmos-and-chaos-2025-11/src/`
- Tests: `/home/greg/dev/ai-workshop/projects/cosmos-and-chaos-2025-11/tests/`
- Vanilla JavaScript ES6+ modules, no build step

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure extensions for Phase 2

- [X] T001 [P] Add Phase 2 resource types (data, biomass, nanites) to src/js/state.js GameState.resources
- [X] T002 [P] Initialize resource accumulators object in src/js/state.js GameState constructor
- [X] T003 [P] Initialize card accumulators object in src/js/state.js GameState constructor
- [X] T004 [P] Initialize productionRates object in src/js/state.js GameState constructor
- [X] T005 [P] Initialize efficiencies object in src/js/state.js GameState constructor

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement addResourceAccurate(type, amount) method in src/js/state.js
- [X] T007 Implement getTrueResourceValue(type) method in src/js/state.js
- [X] T008 Implement calculateCardEfficiency(cardId) method in src/js/state.js
- [X] T009 Implement getCardStatusLED(cardId) method in src/js/state.js
- [X] T010 [P] Create formatNumber(num) utility function in src/js/utils.js
- [X] T011 [P] Write unit tests for accumulator logic in tests/accumulators.test.js
- [X] T012 [P] Write unit tests for efficiency calculation in tests/efficiency.test.js
- [X] T013 [P] Write unit tests for formatNumber utility in tests/utils.test.js
- [X] T014 Extend SaveManager.serialize() to include resourceAccumulators in src/js/save.js
- [X] T015 Extend SaveManager.deserialize() to restore resourceAccumulators in src/js/save.js
- [X] T016 Add inputRequirements field to all card configs in src/js/cards.js CARD_CONFIGS
- [X] T017 Add outputs array field to all card configs in src/js/cards.js CARD_CONFIGS
- [X] T018 Add baseRate field to automated card configs in src/js/cards.js CARD_CONFIGS

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Watch Resources Accumulate (Priority: P1) 🎯 MVP

**Goal**: Implement automatic resource production so cards produce resources without manual clicking

**Independent Test**: Place a Tier 1 card on the grid, wait a few seconds, observe that the production counter increases automatically without any player interaction

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T019 [P] [US1] Write unit test for updateCardProduction() in tests/production.test.js
- [X] T020 [P] [US1] Write unit test for ProductionLoop.tick() in tests/production.test.js
- [X] T021 [P] [US1] Write unit test for card production buffer flushing in tests/production.test.js

### Implementation for User Story 1

- [X] T022 [P] [US1] Create production.js module with updateCardProduction(cardId, deltaTime) function in src/js/production.js
- [X] T023 [US1] Create ProductionLoop class with start(), stop(), tick() methods in src/js/production.js
- [X] T024 [US1] Implement delta time calculation and clamping in ProductionLoop.tick() in src/js/production.js
- [X] T025 [US1] Implement production buffer accumulation logic in updateCardProduction() in src/js/production.js
- [X] T026 [US1] Implement buffer-to-global-resource flushing in updateCardProduction() in src/js/production.js
- [X] T027 [US1] Emit card:produced event when flushing production in updateCardProduction() in src/js/production.js
- [X] T028 [US1] Initialize ProductionLoop in src/js/main.js initGame() function
- [X] T029 [US1] Start production loop after DOM ready in src/js/main.js
- [X] T030 [US1] Add automated flag to card state initialization in src/js/state.js
- [X] T031 [US1] Implement startAutomation(cardId) method in src/js/state.js
- [X] T032 [US1] Run tests for User Story 1 to validate production system works

**Checkpoint**: At this point, User Story 1 should be fully functional - cards auto-produce resources and counters accumulate

---

## Phase 4: User Story 2 - Monitor Card Health Status (Priority: P2)

**Goal**: Display visual LED indicators showing card efficiency (green/yellow/red) based on input availability

**Independent Test**: Modify available resources to change card efficiency, observe that LED color changes from green → yellow → red as efficiency crosses thresholds

### Tests for User Story 2

- [X] T033 [P] [US2] Write unit test for LED color thresholds (80%, 40%) in tests/efficiency.test.js
- [X] T034 [P] [US2] Write unit test for base producer LED always green in tests/efficiency.test.js
- [X] T035 [P] [US2] Write unit test for LED updates when efficiency changes in tests/display.test.js

### Implementation for User Story 2

- [X] T036 [P] [US2] Add status LED HTML element to card rendering in src/js/cards.js renderCard()
- [X] T037 [P] [US2] Add status LED CSS styles (.status-led, .green, .yellow, .red) in src/css/cards.css
- [X] T038 [US2] Create DisplayUpdateManager class with updateRates in src/js/display.js
- [X] T039 [US2] Implement DisplayUpdateManager.shouldUpdate(tier, timestamp) in src/js/display.js
- [X] T040 [US2] Implement DisplayUpdateManager.updateCardDisplay(cardId) to update LED in src/js/display.js
- [X] T041 [US2] Implement DisplayUpdateManager.startUpdateLoop() with RAF in src/js/display.js
- [X] T042 [US2] Register all cards with DisplayUpdateManager in src/js/main.js
- [X] T043 [US2] Add data-card-id attribute to card DOM elements in src/js/cards.js
- [X] T044 [US2] Subscribe to card:efficiency:changed event to update LED in src/js/display.js
- [X] T045 [US2] Run tests for User Story 2 to validate LED system works

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - cards produce AND show visual health

---

## Phase 5: User Story 3 - Understand Resource Flow (Priority: P2)

**Goal**: Display I/O indicators on card edges showing which resources are produced/consumed and connection status

**Independent Test**: Place two cards with matching I/O adjacent to each other, verify that indicators highlight the connection; move cards apart, verify connection indicators turn off

### Tests for User Story 3

- [ ] T046 [P] [US3] Write unit test for getAdjacentCells(row, col) in tests/grid.test.js
- [ ] T047 [P] [US3] Write unit test for areCardsConnected(cardA, cardB) in tests/grid.test.js
- [ ] T048 [P] [US3] Write unit test for I/O indicator connection detection in tests/grid.test.js

### Implementation for User Story 3

- [ ] T049 [P] [US3] Implement getAdjacentCells(row, col) function in src/js/grid.js
- [ ] T050 [P] [US3] Implement areCardsConnected(cardA, cardB) function in src/js/grid.js
- [ ] T051 [US3] Implement getConnectedNeighbors(card) function in src/js/grid.js
- [ ] T052 [US3] Add I/O indicator HTML elements to card rendering in src/js/cards.js
- [ ] T053 [US3] Add I/O indicator CSS styles (.card-io-indicator, positions, .connected) in src/css/cards.css
- [ ] T054 [US3] Add pulse animation for connected indicators in src/css/cards.css
- [ ] T055 [US3] Implement updateIOIndicators(cardId) to detect and highlight connections in src/js/cards.js
- [ ] T056 [US3] Call updateIOIndicators() when cards are placed/moved in src/js/grid.js
- [ ] T057 [US3] Add ioIndicators array to card state in src/js/state.js
- [ ] T058 [US3] Run tests for User Story 3 to validate I/O indicator system works

**Checkpoint**: All three user stories (US1, US2, US3) should now work independently - production, LEDs, and I/O indicators all functional

---

## Phase 6: User Story 4 - Track Multiple Resource Types (Priority: P3)

**Goal**: Extend system to track 5 distinct resource types (Ore, Energy, Data, Biomass, Nanites) with separate counters

**Independent Test**: Create cards that produce different resource types, verify each resource tracks separately in the global resource panel and card counters

### Tests for User Story 4

- [ ] T059 [P] [US4] Write unit test for multiple resource type tracking in tests/resources.test.js
- [ ] T060 [P] [US4] Write unit test for resource aggregation across multiple producers in tests/resources.test.js
- [ ] T061 [P] [US4] Write unit test for cross-resource consumption (ore+energy → metal) in tests/production.test.js

### Implementation for User Story 4

- [ ] T062 [P] [US4] Add global resource display panel HTML in src/index.html
- [ ] T063 [P] [US4] Add resource display CSS styles in src/css/layout.css
- [ ] T064 [US4] Implement DisplayUpdateManager.updateResourceDisplay() in src/js/display.js
- [ ] T065 [US4] Add data-resource attributes to resource display elements in src/index.html
- [ ] T066 [US4] Update card configs with multiple input requirements (e.g., ore+energy) in src/js/cards.js
- [ ] T067 [US4] Verify efficiency calculation handles multiple input types in src/js/state.js
- [ ] T068 [US4] Update formatNumber() to handle large values (K/M/B notation) in src/js/utils.js
- [ ] T069 [US4] Apply formatNumber() to all resource displays in src/js/display.js
- [ ] T070 [US4] Subscribe to resource:changed events to update global display in src/js/display.js
- [ ] T071 [US4] Run tests for User Story 4 to validate multi-resource tracking works

**Checkpoint**: All user stories should now be independently functional with full multi-resource support

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T072 [P] Add counter update rate configuration (primary/secondary/tertiary) to DisplayUpdateManager in src/js/display.js
- [ ] T073 [P] Implement DisplayUpdateManager.registerCard(cardId, tier) for configurable rates in src/js/display.js
- [ ] T074 [P] Add smooth CSS transitions for counter value changes in src/css/cards.css
- [ ] T075 [P] Add hover tooltips for efficiency details on status LEDs in src/js/display.js
- [ ] T076 [P] Add tooltip CSS styles (.efficiency-tooltip) in src/css/cards.css
- [ ] T077 Update SaveManager to persist cardAccumulators and productionRates in src/js/save.js
- [ ] T078 Add migration logic for old saves without accumulators in src/js/save.js
- [ ] T079 [P] Add CSS variables for LED colors (--led-green, --led-yellow, --led-red) in src/css/variables.css
- [ ] T080 [P] Add CSS variables for resource colors in src/css/variables.css
- [ ] T081 Performance test: Verify 60 FPS with 25 cards producing (DevTools Performance tab) - includes validation that fast production rates (e.g., 100/sec) work correctly with 2Hz counter throttling without loss of accuracy
- [ ] T082 Performance test: Verify resource accuracy <1% error after 10 minutes
- [ ] T083 [P] Run full test suite (npm test) and ensure all tests pass
- [ ] T084 Manual test: Follow quickstart.md validation checklist
- [ ] T085 [P] Update CLAUDE.md with Phase 2 implementation notes
- [ ] T086 Create git commit with all Phase 2 changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 (independently testable)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2 (independently testable)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Parallel tasks ([P]) can run simultaneously within same phase
- Sequential tasks must complete in order
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: All 5 tasks can run in parallel (different object fields)
- **Phase 2 Foundational**: Tests (T011, T012, T013) can run in parallel after core methods exist
- **Once Foundational completes**: All 4 user stories can start in parallel (if team capacity allows)
- **Within US1**: T019, T020, T021 (tests) can run in parallel; T022, T030, T031 can run in parallel
- **Within US2**: T033, T034, T035 (tests) can run in parallel; T036, T037 can run in parallel
- **Within US3**: T046, T047, T048 (tests) can run in parallel; T049, T050, T052, T053 can run in parallel
- **Within US4**: T059, T060, T061 (tests) can run in parallel; T062, T063, T064 can run in parallel
- **Phase 7 Polish**: Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for updateCardProduction() in tests/production.test.js"
Task: "Write unit test for ProductionLoop.tick() in tests/production.test.js"
Task: "Write unit test for card production buffer flushing in tests/production.test.js"

# After core methods exist, launch parallel implementation tasks:
Task: "Create production.js module with updateCardProduction(cardId, deltaTime) function in src/js/production.js"
Task: "Add automated flag to card state initialization in src/js/state.js"
Task: "Implement startAutomation(cardId) method in src/js/state.js"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Write unit test for LED color thresholds (80%, 40%) in tests/efficiency.test.js"
Task: "Write unit test for base producer LED always green in tests/efficiency.test.js"
Task: "Write unit test for LED updates when efficiency changes in tests/display.test.js"

# Launch HTML and CSS tasks together:
Task: "Add status LED HTML element to card rendering in src/js/cards.js renderCard()"
Task: "Add status LED CSS styles (.status-led, .green, .yellow, .red) in src/css/cards.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T018) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T019-T032)
4. **STOP and VALIDATE**: Test User Story 1 independently - place Tier 1 card, verify auto-production
5. Deploy/demo if ready - you now have an idle game!

**MVP Deliverable**: Cards automatically produce resources - the core idle game mechanic works

### Incremental Delivery

1. Complete Setup + Foundational (T001-T018) → Foundation ready
2. Add User Story 1 (T019-T032) → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 (T033-T045) → Test independently → Deploy/Demo (visual feedback added)
4. Add User Story 3 (T046-T058) → Test independently → Deploy/Demo (strategic depth added)
5. Add User Story 4 (T059-T071) → Test independently → Deploy/Demo (economic complexity added)
6. Add Polish (T072-T086) → Final validation → Production release

**Each story adds value without breaking previous stories**

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) + Foundational (Phase 2) together (T001-T018)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T019-T032) - Core idle mechanic
   - **Developer B**: User Story 2 (T033-T045) - Visual indicators
   - **Developer C**: User Story 3 (T046-T058) - I/O indicators
3. Stories complete and integrate independently
4. All developers converge on User Story 4 (T059-T071) together (extends US1)
5. Team completes Polish (T072-T086) together

---

## Task Summary

**Total Tasks**: 86
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 13 tasks (BLOCKS all stories)
- **Phase 3 (US1 - Auto Production)**: 14 tasks (MVP!)
- **Phase 4 (US2 - Status LEDs)**: 13 tasks
- **Phase 5 (US3 - I/O Indicators)**: 13 tasks
- **Phase 6 (US4 - Multi Resources)**: 13 tasks
- **Phase 7 (Polish)**: 15 tasks

**Parallel Opportunities**: 38 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- US1: Place Tier 1 card → wait → observe counter increases automatically
- US2: Change resource availability → observe LED color changes (green/yellow/red)
- US3: Place adjacent cards with matching I/O → observe connection highlighting
- US4: Produce different resource types → verify separate tracking in global panel

**Suggested MVP Scope**: Setup + Foundational + User Story 1 (T001-T032, 32 tasks total)

**Estimated MVP Time**: 8-12 hours (per quickstart.md)

**Full Feature Time**: 20-30 hours (all 86 tasks)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are REQUIRED per Constitution Principle VI (Testability & Maintainability)
- Verify tests fail before implementing (TDD)
- Commit after each logical group of tasks
- Stop at any checkpoint to validate story independently
- Constitution requirement: Maintain 60 FPS with 25+ cards (validate with T081)
- Constitution requirement: Resource accuracy <1% (validate with T082)

---

**Tasks Status**: Ready for implementation
**Next Step**: Begin with Phase 1 (Setup) tasks T001-T005
**MVP Path**: Complete T001-T032 for working idle game mechanic