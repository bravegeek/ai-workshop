import { describe, test, expect } from "vitest";
import { resolveConfig, extractMapperConfig, extractTelemetryConfig, extractEngineConfig, extractUIConfig } from "./config-resolver.js";
import type { LobGPSConfig } from "./types.js";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  maxSuggestions: 3,
  curatedPaths: [],
  telemetryProvider: null,
  storageCap: 1_048_576,
  namespace: "lob-gps:telemetry",
  useFingerprinting: false,
  dynamicIdDenylist: [],
  dynamicIdAllowlist: [],
  maxAncestorDepth: 5,
  miniMapAnchor: "bottom-right",
  zIndex: undefined,
  killSwitch: "Ctrl+Shift+K",
  debug: false,
  onError: undefined,
  errorThreshold: 5,
  errorWindowMs: 10_000,
} as const;

// ─── resolveConfig ─────────────────────────────────────────────────────────────

describe("resolveConfig", () => {
  test("returns all defaults when called with empty object", () => {
    const result = resolveConfig({});
    expect(result.maxSuggestions).toBe(DEFAULTS.maxSuggestions);
    expect(result.curatedPaths).toEqual(DEFAULTS.curatedPaths);
    expect(result.telemetryProvider).toBe(DEFAULTS.telemetryProvider);
    expect(result.storageCap).toBe(DEFAULTS.storageCap);
    expect(result.namespace).toBe(DEFAULTS.namespace);
    expect(result.useFingerprinting).toBe(DEFAULTS.useFingerprinting);
    expect(result.dynamicIdDenylist).toEqual(DEFAULTS.dynamicIdDenylist);
    expect(result.dynamicIdAllowlist).toEqual(DEFAULTS.dynamicIdAllowlist);
    expect(result.maxAncestorDepth).toBe(DEFAULTS.maxAncestorDepth);
    expect(result.miniMapAnchor).toBe(DEFAULTS.miniMapAnchor);
    expect(result.zIndex).toBe(DEFAULTS.zIndex);
    expect(result.killSwitch).toBe(DEFAULTS.killSwitch);
    expect(result.debug).toBe(DEFAULTS.debug);
    expect(result.onError).toBe(DEFAULTS.onError);
    expect(result.errorThreshold).toBe(DEFAULTS.errorThreshold);
    expect(result.errorWindowMs).toBe(DEFAULTS.errorWindowMs);
  });

  test("merges partial overrides with defaults", () => {
    const config: LobGPSConfig = { maxSuggestions: 5 };
    const result = resolveConfig(config);
    expect(result.maxSuggestions).toBe(5);
    // All other fields remain at defaults
    expect(result.curatedPaths).toEqual(DEFAULTS.curatedPaths);
    expect(result.telemetryProvider).toBe(DEFAULTS.telemetryProvider);
    expect(result.storageCap).toBe(DEFAULTS.storageCap);
    expect(result.namespace).toBe(DEFAULTS.namespace);
    expect(result.useFingerprinting).toBe(DEFAULTS.useFingerprinting);
    expect(result.dynamicIdDenylist).toEqual(DEFAULTS.dynamicIdDenylist);
    expect(result.dynamicIdAllowlist).toEqual(DEFAULTS.dynamicIdAllowlist);
    expect(result.maxAncestorDepth).toBe(DEFAULTS.maxAncestorDepth);
    expect(result.miniMapAnchor).toBe(DEFAULTS.miniMapAnchor);
    expect(result.zIndex).toBe(DEFAULTS.zIndex);
    expect(result.killSwitch).toBe(DEFAULTS.killSwitch);
    expect(result.debug).toBe(DEFAULTS.debug);
    expect(result.onError).toBe(DEFAULTS.onError);
    expect(result.errorThreshold).toBe(DEFAULTS.errorThreshold);
    expect(result.errorWindowMs).toBe(DEFAULTS.errorWindowMs);
  });

  test("preserves provided values without modifying them", () => {
    const onError = (e: Error) => void e;
    const denylist = ["^uuid-", "^react-"];
    const allowlist = ["^my-stable-id"];
    const config: LobGPSConfig = {
      maxSuggestions: 10,
      storageCap: 2_097_152,
      namespace: "custom:namespace",
      useFingerprinting: true,
      dynamicIdDenylist: denylist,
      dynamicIdAllowlist: allowlist,
      maxAncestorDepth: 3,
      miniMapAnchor: "top-left",
      zIndex: 9999,
      killSwitch: "Ctrl+Alt+G",
      debug: true,
      onError,
      errorThreshold: 10,
      errorWindowMs: 30_000,
    };
    const result = resolveConfig(config);
    expect(result.maxSuggestions).toBe(10);
    expect(result.storageCap).toBe(2_097_152);
    expect(result.namespace).toBe("custom:namespace");
    expect(result.useFingerprinting).toBe(true);
    expect(result.dynamicIdDenylist).toBe(denylist);
    expect(result.dynamicIdAllowlist).toBe(allowlist);
    expect(result.maxAncestorDepth).toBe(3);
    expect(result.miniMapAnchor).toBe("top-left");
    expect(result.zIndex).toBe(9999);
    expect(result.killSwitch).toBe("Ctrl+Alt+G");
    expect(result.debug).toBe(true);
    expect(result.onError).toBe(onError);
    expect(result.errorThreshold).toBe(10);
    expect(result.errorWindowMs).toBe(30_000);
  });

  test("multiple calls with different inputs produce independent results", () => {
    const result1 = resolveConfig({ maxSuggestions: 1, debug: true });
    const result2 = resolveConfig({ maxSuggestions: 7, namespace: "other:ns" });
    const result3 = resolveConfig({});

    expect(result1.maxSuggestions).toBe(1);
    expect(result1.debug).toBe(true);
    expect(result1.namespace).toBe(DEFAULTS.namespace);

    expect(result2.maxSuggestions).toBe(7);
    expect(result2.debug).toBe(false);
    expect(result2.namespace).toBe("other:ns");

    expect(result3.maxSuggestions).toBe(DEFAULTS.maxSuggestions);
    expect(result3.debug).toBe(false);
    expect(result3.namespace).toBe(DEFAULTS.namespace);
  });
});

// ─── extractMapperConfig ───────────────────────────────────────────────────────

describe("extractMapperConfig", () => {
  test("returns mapper fields from a resolved config with defaults", () => {
    const resolved = resolveConfig({});
    const mapperConfig = extractMapperConfig(resolved);
    expect(mapperConfig).toEqual({
      useFingerprinting: false,
      dynamicIdDenylist: [],
      dynamicIdAllowlist: [],
      maxAncestorDepth: 5,
    });
  });

  test("returns mapper fields from a resolved config with overrides", () => {
    const denylist = ["^dynamic-"];
    const allowlist = ["^stable-"];
    const resolved = resolveConfig({
      useFingerprinting: true,
      dynamicIdDenylist: denylist,
      dynamicIdAllowlist: allowlist,
      maxAncestorDepth: 8,
    });
    const mapperConfig = extractMapperConfig(resolved);
    expect(mapperConfig).toEqual({
      useFingerprinting: true,
      dynamicIdDenylist: denylist,
      dynamicIdAllowlist: allowlist,
      maxAncestorDepth: 8,
    });
  });

  test("does not include non-mapper fields", () => {
    const resolved = resolveConfig({ maxSuggestions: 5, debug: true });
    const mapperConfig = extractMapperConfig(resolved);
    expect("maxSuggestions" in mapperConfig).toBe(false);
    expect("debug" in mapperConfig).toBe(false);
    expect("telemetryProvider" in mapperConfig).toBe(false);
    expect("miniMapAnchor" in mapperConfig).toBe(false);
  });
});

// ─── extractTelemetryConfig ────────────────────────────────────────────────────

describe("extractTelemetryConfig", () => {
  test("returns telemetry fields from a resolved config with defaults", () => {
    const resolved = resolveConfig({});
    const telemetryConfig = extractTelemetryConfig(resolved);
    // telemetryProvider is null in resolved config → provider should be undefined
    expect(telemetryConfig.provider).toBeUndefined();
    expect(telemetryConfig.storageCap).toBe(1_048_576);
    expect(telemetryConfig.namespace).toBe("lob-gps:telemetry");
  });

  test("maps null telemetryProvider to undefined provider", () => {
    const resolved = resolveConfig({ telemetryProvider: undefined });
    const telemetryConfig = extractTelemetryConfig(resolved);
    expect(telemetryConfig.provider).toBeUndefined();
  });

  test("passes through a real TelemetryProvider when provided", () => {
    const fakeProvider = {
      record: () => {},
      query: () => [],
      flush: () => {},
    };
    const resolved = resolveConfig({ telemetryProvider: fakeProvider });
    const telemetryConfig = extractTelemetryConfig(resolved);
    expect(telemetryConfig.provider).toBe(fakeProvider);
  });

  test("passes through storageCap and namespace overrides", () => {
    const resolved = resolveConfig({
      storageCap: 512_000,
      namespace: "my-app:telemetry",
    });
    const telemetryConfig = extractTelemetryConfig(resolved);
    expect(telemetryConfig.storageCap).toBe(512_000);
    expect(telemetryConfig.namespace).toBe("my-app:telemetry");
  });

  test("does not include non-telemetry fields", () => {
    const resolved = resolveConfig({ maxSuggestions: 5, debug: true });
    const telemetryConfig = extractTelemetryConfig(resolved);
    expect("maxSuggestions" in telemetryConfig).toBe(false);
    expect("debug" in telemetryConfig).toBe(false);
    expect("useFingerprinting" in telemetryConfig).toBe(false);
    expect("miniMapAnchor" in telemetryConfig).toBe(false);
  });
});

// ─── extractEngineConfig ───────────────────────────────────────────────────────

describe("extractEngineConfig", () => {
  test("returns engine fields from a resolved config with defaults", () => {
    const resolved = resolveConfig({});
    const engineConfig = extractEngineConfig(resolved);
    expect(engineConfig.maxSuggestions).toBe(3);
    expect(engineConfig.curatedPaths).toEqual([]);
  });

  test("returns engine fields with overrides", () => {
    const curatedPaths = [
      {
        id: "onboarding",
        name: "Onboarding",
        steps: [],
      },
    ];
    const resolved = resolveConfig({
      maxSuggestions: 8,
      curatedPaths,
    });
    const engineConfig = extractEngineConfig(resolved);
    expect(engineConfig.maxSuggestions).toBe(8);
    expect(engineConfig.curatedPaths).toBe(curatedPaths);
  });

  test("does not include telemetryProvider (that is added by LobGPS class)", () => {
    const fakeProvider = {
      record: () => {},
      query: () => [],
      flush: () => {},
    };
    const resolved = resolveConfig({ telemetryProvider: fakeProvider });
    const engineConfig = extractEngineConfig(resolved);
    expect("telemetryProvider" in engineConfig).toBe(false);
  });

  test("does not include non-engine fields", () => {
    const resolved = resolveConfig({ debug: true, useFingerprinting: true });
    const engineConfig = extractEngineConfig(resolved);
    expect("debug" in engineConfig).toBe(false);
    expect("useFingerprinting" in engineConfig).toBe(false);
    expect("miniMapAnchor" in engineConfig).toBe(false);
    expect("storageCap" in engineConfig).toBe(false);
  });
});

// ─── extractUIConfig ───────────────────────────────────────────────────────────

describe("extractUIConfig", () => {
  test("returns UI fields from a resolved config with defaults", () => {
    const resolved = resolveConfig({});
    const uiConfig = extractUIConfig(resolved);
    expect(uiConfig.miniMapAnchor).toBe("bottom-right");
    expect(uiConfig.zIndex).toBeUndefined();
  });

  test("returns UI fields with overrides", () => {
    const resolved = resolveConfig({
      miniMapAnchor: "top-right",
      zIndex: 1000,
    });
    const uiConfig = extractUIConfig(resolved);
    expect(uiConfig.miniMapAnchor).toBe("top-right");
    expect(uiConfig.zIndex).toBe(1000);
  });

  test("accepts all valid MiniMapAnchor values", () => {
    const anchors = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
    for (const anchor of anchors) {
      const resolved = resolveConfig({ miniMapAnchor: anchor });
      const uiConfig = extractUIConfig(resolved);
      expect(uiConfig.miniMapAnchor).toBe(anchor);
    }
  });

  test("does not include non-UI fields", () => {
    const resolved = resolveConfig({ maxSuggestions: 5, debug: true });
    const uiConfig = extractUIConfig(resolved);
    expect("maxSuggestions" in uiConfig).toBe(false);
    expect("debug" in uiConfig).toBe(false);
    expect("storageCap" in uiConfig).toBe(false);
    expect("useFingerprinting" in uiConfig).toBe(false);
    expect("killSwitch" in uiConfig).toBe(false);
  });
});
