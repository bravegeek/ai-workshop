import { describe, test, expect, vi, beforeEach } from "vitest";

// ─── Module Mocks ──────────────────────────────────────────────────────────

const { constructorOrder } = vi.hoisted(() => ({
  constructorOrder: [] as string[],
}));

vi.mock("../mapper/index.js", () => ({
  Mapper: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    constructorOrder.push("Mapper");
    this.on = vi.fn();
    this.off = vi.fn();
    this.observe = vi.fn();
    this.teardown = vi.fn();
  }),
}));

vi.mock("../telemetry/index.js", () => ({
  Telemetry: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    constructorOrder.push("Telemetry");
    this.record = vi.fn();
    this.query = vi.fn(() => []);
    this.flush = vi.fn();
    this.teardown = vi.fn();
  }),
}));

vi.mock("../telemetry/local-storage-provider.js", () => ({
  LocalStorageProvider: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.record = vi.fn();
    this.query = vi.fn(() => []);
    this.flush = vi.fn();
  }),
}));

vi.mock("../engine/index.js", () => ({
  Engine: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    constructorOrder.push("Engine");
    this.query = vi.fn(() => []);
  }),
}));

vi.mock("../ui/index.js", () => ({
  OverlayUI: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    constructorOrder.push("OverlayUI");
    this.render = vi.fn();
    this.teardown = vi.fn();
  }),
}));

vi.mock("./kill-switch.js", () => ({
  parseCombo: vi.fn(() => ({ ctrl: true, shift: true, alt: false, meta: false, key: "K" })),
  attach: vi.fn(),
  matchesEvent: vi.fn(),
}));

import { Mapper } from "../mapper/index.js";
import { Telemetry } from "../telemetry/index.js";
import { Engine } from "../engine/index.js";
import { OverlayUI } from "../ui/index.js";
import { LobGPS } from "./index.js";

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("LobGPS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    constructorOrder.length = 0;
  });

  // ── Constructor ──────────────────────────────────────────────────────────

  describe("constructor", () => {
    test("isActive is true after construction", () => {
      const gps = new LobGPS();
      expect(gps.isActive).toBe(true);
    });

    test("version returns package version", () => {
      const gps = new LobGPS();
      expect(gps.version).toBe("0.1.0");
    });

    test("errors returns empty array initially", () => {
      const gps = new LobGPS();
      expect(gps.errors).toEqual([]);
    });

    test("creates modules in order: Telemetry → Mapper → Engine → OverlayUI", () => {
      new LobGPS();
      expect(constructorOrder).toEqual(["Telemetry", "Mapper", "Engine", "OverlayUI"]);
    });

    test("creates all four module instances", () => {
      new LobGPS();
      expect(vi.mocked(Mapper)).toHaveBeenCalledOnce();
      expect(vi.mocked(Telemetry)).toHaveBeenCalledOnce();
      expect(vi.mocked(Engine)).toHaveBeenCalledOnce();
      expect(vi.mocked(OverlayUI)).toHaveBeenCalledOnce();
    });

    test("calls mapper.observe() after initialization", () => {
      new LobGPS();
      const mapperInstance = vi.mocked(Mapper).mock.instances[0] as unknown as Record<string, ReturnType<typeof vi.fn>>;
      expect(mapperInstance.observe).toHaveBeenCalledOnce();
    });
  });

  // ── disable() ────────────────────────────────────────────────────────────

  describe("disable()", () => {
    test("sets isActive to false", () => {
      const gps = new LobGPS();
      gps.disable();
      expect(gps.isActive).toBe(false);
    });

    test("tears down mapper", () => {
      const gps = new LobGPS();
      gps.disable();

      const mapperInstance = vi.mocked(Mapper).mock.instances[0] as unknown as Record<string, ReturnType<typeof vi.fn>>;
      expect(mapperInstance.teardown).toHaveBeenCalled();
    });

    test("tears down UI", () => {
      const gps = new LobGPS();
      gps.disable();

      const uiInstance = vi.mocked(OverlayUI).mock.instances[0] as unknown as Record<string, ReturnType<typeof vi.fn>>;
      expect(uiInstance.teardown).toHaveBeenCalled();
    });

    test("does NOT tear down telemetry (FR-014)", () => {
      const gps = new LobGPS();
      gps.disable();

      const telemetryInstance = vi.mocked(Telemetry).mock.instances[0] as unknown as Record<string, ReturnType<typeof vi.fn>>;
      expect(telemetryInstance.teardown).not.toHaveBeenCalled();
    });

    test("is a no-op when already disabled", () => {
      const gps = new LobGPS();
      gps.disable();
      gps.disable(); // no-op
      expect(gps.isActive).toBe(false);
    });

    test("is a no-op when torn down", () => {
      const gps = new LobGPS();
      gps.teardown();
      gps.disable(); // no-op
      expect(gps.isActive).toBe(false);
    });
  });

  // ── enable() ─────────────────────────────────────────────────────────────

  describe("enable()", () => {
    test("restores isActive to true after disable", () => {
      const gps = new LobGPS();
      gps.disable();
      gps.enable();
      expect(gps.isActive).toBe(true);
    });

    test("recreates modules on enable", () => {
      const gps = new LobGPS();
      gps.disable();

      vi.clearAllMocks();
      gps.enable();

      expect(vi.mocked(Mapper)).toHaveBeenCalledOnce();
      expect(vi.mocked(Engine)).toHaveBeenCalledOnce();
      expect(vi.mocked(OverlayUI)).toHaveBeenCalledOnce();
    });

    test("does NOT recreate telemetry on enable (FR-014)", () => {
      const gps = new LobGPS();
      gps.disable();

      vi.clearAllMocks();
      gps.enable();

      expect(vi.mocked(Telemetry)).not.toHaveBeenCalled();
    });

    test("is a no-op when already active", () => {
      const gps = new LobGPS();
      const callCount = vi.mocked(Mapper).mock.calls.length;

      gps.enable(); // no-op
      expect(vi.mocked(Mapper).mock.calls.length).toBe(callCount);
    });

    test("is a no-op when torn down", () => {
      const gps = new LobGPS();
      gps.teardown();
      gps.enable(); // no-op
      expect(gps.isActive).toBe(false);
    });
  });

  // ── teardown() ───────────────────────────────────────────────────────────

  describe("teardown()", () => {
    test("sets isActive to false", () => {
      const gps = new LobGPS();
      gps.teardown();
      expect(gps.isActive).toBe(false);
    });

    test("tears down telemetry (unlike disable)", () => {
      const gps = new LobGPS();
      gps.teardown();

      const telemetryInstance = vi.mocked(Telemetry).mock.instances[0] as unknown as Record<string, ReturnType<typeof vi.fn>>;
      expect(telemetryInstance.teardown).toHaveBeenCalled();
    });

    test("enable() is a no-op after teardown", () => {
      const gps = new LobGPS();
      gps.teardown();
      gps.enable();
      expect(gps.isActive).toBe(false);
    });

    test("is idempotent", () => {
      const gps = new LobGPS();
      gps.teardown();
      gps.teardown(); // no-op
      expect(gps.isActive).toBe(false);
    });

    test("works from DISABLED state", () => {
      const gps = new LobGPS();
      gps.disable();
      gps.teardown();
      expect(gps.isActive).toBe(false);
      gps.enable(); // no-op after teardown
      expect(gps.isActive).toBe(false);
    });
  });

  // ── configure() ──────────────────────────────────────────────────────────

  describe("configure()", () => {
    test("is a no-op when disabled", () => {
      const gps = new LobGPS();
      gps.disable();
      gps.configure({ maxSuggestions: 10 });
      // No error thrown
    });

    test("is a no-op when torn down", () => {
      const gps = new LobGPS();
      gps.teardown();
      gps.configure({ maxSuggestions: 10 });
      // No error thrown
    });

    test("merged config takes effect on next enable cycle", () => {
      const gps = new LobGPS();
      gps.configure({ maxSuggestions: 10 });
      gps.disable();

      vi.clearAllMocks();
      gps.enable();

      // Engine should be constructed with the updated maxSuggestions
      const engineCall = vi.mocked(Engine).mock.calls[0][0] as unknown as Record<string, unknown>;
      expect(engineCall.maxSuggestions).toBe(10);
    });

    test("custom config is passed to modules at init", () => {
      new LobGPS({
        maxSuggestions: 7,
        miniMapAnchor: "top-left",
      });

      const engineCall = vi.mocked(Engine).mock.calls[0][0] as unknown as Record<string, unknown>;
      expect(engineCall.maxSuggestions).toBe(7);

      const uiCall = vi.mocked(OverlayUI).mock.calls[0][0] as Record<string, unknown>;
      expect(uiCall.miniMapAnchor).toBe("top-left");
    });
  });

  // ── errors ───────────────────────────────────────────────────────────────

  describe("errors", () => {
    test("reportError adds to error buffer", () => {
      const gps = new LobGPS();
      const err = new Error("test error");
      gps.reportError(err);
      expect(gps.errors).toEqual([err]);
    });

    test("multiple errors appear in order", () => {
      const gps = new LobGPS();
      const err1 = new Error("first");
      const err2 = new Error("second");
      gps.reportError(err1);
      gps.reportError(err2);
      expect(gps.errors).toEqual([err1, err2]);
    });

    test("onError callback is called when configured", () => {
      const onError = vi.fn();
      const gps = new LobGPS({ onError });
      const err = new Error("test");
      gps.reportError(err);
      expect(onError).toHaveBeenCalledWith(err);
    });

    test("onError callback throw is silenced", () => {
      const onError = vi.fn().mockImplementation(() => {
        throw new Error("callback failed");
      });
      const gps = new LobGPS({ onError });
      expect(() => gps.reportError(new Error("test"))).not.toThrow();
    });

    test("debug mode logs to console.warn", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const gps = new LobGPS({ debug: true });
      const err = new Error("debug error");
      gps.reportError(err);
      expect(warnSpy).toHaveBeenCalledWith("[LobGPS]", err);
      warnSpy.mockRestore();
    });
  });

  // ── disable/enable cycle ─────────────────────────────────────────────────

  describe("disable/enable cycle", () => {
    test("full cycle: active → disabled → active", () => {
      const gps = new LobGPS();
      expect(gps.isActive).toBe(true);

      gps.disable();
      expect(gps.isActive).toBe(false);

      gps.enable();
      expect(gps.isActive).toBe(true);
    });

    test("error buffer persists across disable/enable", () => {
      const gps = new LobGPS();
      gps.reportError(new Error("before disable"));
      gps.disable();
      gps.enable();
      expect(gps.errors.length).toBe(1);
    });
  });
});
