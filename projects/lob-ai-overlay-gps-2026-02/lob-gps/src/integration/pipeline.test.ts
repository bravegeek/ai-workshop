import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Pipeline } from "./pipeline.js";
import { resolveConfig } from "./config-resolver.js";
import type { StateChangeEvent, StateKey } from "../mapper/types.js";
import type { Suggestion, NormalizedSelector } from "../engine/types.js";
import { SuggestionSource } from "../engine/types.js";

function makeEvent(newKey = "main::#btn"): StateChangeEvent {
  return {
    previousStateKey: "main::" as StateKey,
    newStateKey: newKey as StateKey,
    trigger: "CHILD_LIST" as any,
    timestamp: 1000,
  };
}

function makeSuggestion(label = "Click here"): Suggestion {
  return {
    selector: "#btn" as NormalizedSelector,
    label,
    confidence: 0.9,
    source: SuggestionSource.PREDICTED,
    avgDwellTime: 500,
  };
}

function createMocks() {
  const handlers = new Map<string, Function>();
  const mapper = {
    on: vi.fn((event: string, cb: Function) => handlers.set(event, cb)),
    off: vi.fn((event: string, _cb: Function) => handlers.delete(event)),
    _emit(event: string, data: unknown) {
      handlers.get(event)?.(data);
    },
  };
  const telemetry = { record: vi.fn() };
  const engine = { query: vi.fn(() => [] as Suggestion[]) };
  const ui = { render: vi.fn() };
  const errorReporter = vi.fn();
  const config = resolveConfig({});

  return { mapper, telemetry, engine, ui, errorReporter, config };
}

describe("Pipeline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Full Cycle ──────────────────────────────────────────────────────────

  describe("full cycle", () => {
    test("calls telemetry.record, engine.query, ui.render in order", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());

      expect(telemetry.record).toHaveBeenCalledOnce();
      expect(engine.query).toHaveBeenCalledOnce();
      expect(ui.render).toHaveBeenCalledOnce();

      // Verify order via invocation order
      const callOrder: string[] = [];
      telemetry.record.mockImplementation(() => callOrder.push("telemetry"));
      engine.query.mockImplementation(() => { callOrder.push("engine"); return []; });
      ui.render.mockImplementation(() => callOrder.push("ui"));

      vi.advanceTimersByTime(100);
      mapper._emit("state-change", makeEvent());
      expect(callOrder).toEqual(["telemetry", "engine", "ui"]);
    });

    test("passes engine results to ui.render", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const suggestions = [makeSuggestion("Go here"), makeSuggestion("Or here")];
      engine.query.mockReturnValue(suggestions);

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());
      expect(ui.render).toHaveBeenCalledWith(suggestions);
    });

    test("passes newStateKey to engine.query", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent("page::#submit"));
      expect(engine.query).toHaveBeenCalledWith("page::#submit");
    });

    test("calls telemetry.record with newStateKey", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent("page::#submit"));
      expect(telemetry.record).toHaveBeenCalledOnce();
      expect(telemetry.record.mock.calls[0][0]).toBe("page::#submit");
    });
  });

  // ─── Leading-Edge Debounce ───────────────────────────────────────────────

  describe("leading-edge debounce", () => {
    test("first event executes immediately", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledOnce();
    });

    test("second event within 100ms is dropped", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(1); // still 1
    });

    test("event after 100ms executes", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(2);
    });

    test("multiple events during cooldown are all dropped", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(1);

      // Fire 5 events during cooldown
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(10);
        mapper._emit("state-change", makeEvent());
      }
      expect(engine.query).toHaveBeenCalledTimes(1); // still 1

      // After cooldown, next event executes
      vi.advanceTimersByTime(100);
      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Per-Step Error Isolation ────────────────────────────────────────────

  describe("per-step error isolation", () => {
    test("telemetry.record throw does not prevent engine.query", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      telemetry.record.mockImplementation(() => {
        throw new Error("Telemetry failed");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());

      expect(engine.query).toHaveBeenCalledOnce();
      expect(ui.render).toHaveBeenCalledOnce();
    });

    test("engine.query throw passes empty suggestions to ui.render", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());

      expect(ui.render).toHaveBeenCalledWith([]);
    });

    test("ui.render throw is caught silently", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      ui.render.mockImplementation(() => {
        throw new Error("UI failed");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      // Should not throw
      expect(() => mapper._emit("state-change", makeEvent())).not.toThrow();
    });

    test("errorReporter is called for each step failure", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      telemetry.record.mockImplementation(() => {
        throw new Error("Telemetry boom");
      });
      engine.query.mockImplementation(() => {
        throw new Error("Engine boom");
      });
      ui.render.mockImplementation(() => {
        throw new Error("UI boom");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());

      expect(errorReporter).toHaveBeenCalledTimes(3);
      expect(errorReporter.mock.calls[0][0].message).toBe("Telemetry boom");
      expect(errorReporter.mock.calls[1][0].message).toBe("Engine boom");
      expect(errorReporter.mock.calls[2][0].message).toBe("UI boom");
    });

    test("non-Error thrown is wrapped in Error", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      telemetry.record.mockImplementation(() => {
        throw "string error"; // eslint-disable-line no-throw-literal
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());
      expect(errorReporter.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  // ─── AbortController ────────────────────────────────────────────────────

  describe("AbortController cancellation", () => {
    test("stop() aborts the active cycle controller", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      mapper._emit("state-change", makeEvent());

      // After a cycle, an AbortController exists. stop() should abort it.
      pipeline.stop();

      // Verify no further processing happens
      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(1); // still just 1 from before stop
    });
  });

  // ─── Start/Stop Lifecycle ────────────────────────────────────────────────

  describe("start/stop lifecycle", () => {
    test("start subscribes to mapper state-change", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });

      pipeline.start();
      expect(mapper.on).toHaveBeenCalledWith("state-change", expect.any(Function));
    });

    test("stop unsubscribes from mapper state-change", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });

      pipeline.start();
      pipeline.stop();
      expect(mapper.off).toHaveBeenCalledWith("state-change", expect.any(Function));
    });

    test("events after stop are not processed", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });

      pipeline.start();
      pipeline.stop();

      mapper._emit("state-change", makeEvent());
      expect(engine.query).not.toHaveBeenCalled();
    });

    test("stop clears debounce timer", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });

      pipeline.start();
      mapper._emit("state-change", makeEvent()); // gate closes
      pipeline.stop();

      // Restart — gate should be open again
      pipeline.start();
      mapper._emit("state-change", makeEvent());
      expect(engine.query).toHaveBeenCalledTimes(2); // both calls executed
    });

    test("start is idempotent", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });

      pipeline.start();
      pipeline.start(); // second call is no-op
      expect(mapper.on).toHaveBeenCalledTimes(1);
    });

    test("stop is idempotent", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });

      pipeline.start();
      pipeline.stop();
      pipeline.stop(); // second call is no-op
      expect(mapper.off).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Auto-Disable ────────────────────────────────────────────────────────

  describe("auto-disable", () => {
    test("5 consecutive errors within 10s triggers onAutoDisable", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const onAutoDisable = vi.fn();
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter, onAutoDisable });
      pipeline.start();

      for (let i = 0; i < 5; i++) {
        mapper._emit("state-change", makeEvent());
        vi.advanceTimersByTime(100); // reopen debounce gate
      }

      expect(onAutoDisable).toHaveBeenCalledOnce();
    });

    test("fewer than 5 consecutive errors does not trigger onAutoDisable", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const onAutoDisable = vi.fn();
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter, onAutoDisable });
      pipeline.start();

      for (let i = 0; i < 4; i++) {
        mapper._emit("state-change", makeEvent());
        vi.advanceTimersByTime(100);
      }

      expect(onAutoDisable).not.toHaveBeenCalled();
    });

    test("errors spread over more than 10s do not trigger onAutoDisable", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const onAutoDisable = vi.fn();
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter, onAutoDisable });
      pipeline.start();

      // First 3 errors within window
      for (let i = 0; i < 3; i++) {
        mapper._emit("state-change", makeEvent());
        vi.advanceTimersByTime(100);
      }

      // Advance past the 10s error window
      vi.advanceTimersByTime(11_000);

      // 2 more errors — window resets so consecutiveErrors only reaches 2
      for (let i = 0; i < 2; i++) {
        mapper._emit("state-change", makeEvent());
        vi.advanceTimersByTime(100);
      }

      expect(onAutoDisable).not.toHaveBeenCalled();
    });

    test("error counter resets after a successful cycle", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      const onAutoDisable = vi.fn();

      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter, onAutoDisable });
      pipeline.start();

      // 3 errors
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });
      for (let i = 0; i < 3; i++) {
        mapper._emit("state-change", makeEvent());
        vi.advanceTimersByTime(100);
      }

      // 1 successful cycle resets the counter
      engine.query.mockReturnValue([]);
      mapper._emit("state-change", makeEvent());
      vi.advanceTimersByTime(100);

      // 3 more errors — counter starts from 1 again, never reaches 5
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });
      for (let i = 0; i < 3; i++) {
        mapper._emit("state-change", makeEvent());
        vi.advanceTimersByTime(100);
      }

      expect(onAutoDisable).not.toHaveBeenCalled();
    });

    test("does not crash when onAutoDisable is not provided", () => {
      const { mapper, telemetry, engine, ui, errorReporter, config } = createMocks();
      engine.query.mockImplementation(() => {
        throw new Error("Engine failed");
      });

      // No onAutoDisable passed
      const pipeline = new Pipeline({ mapper, telemetry, engine, ui, config, errorReporter });
      pipeline.start();

      expect(() => {
        for (let i = 0; i < 5; i++) {
          mapper._emit("state-change", makeEvent());
          vi.advanceTimersByTime(100);
        }
      }).not.toThrow();
    });
  });
});
