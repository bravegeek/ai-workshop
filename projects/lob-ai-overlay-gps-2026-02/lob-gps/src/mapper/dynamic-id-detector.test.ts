import { describe, it, expect } from "vitest";
import { isDynamicId, normalizeString } from "./dynamic-id-detector.js";

describe("dynamic-id-detector", () => {
  describe("isDynamicId", () => {
    it("classifies Ember patterns as dynamic", () => {
      expect(isDynamicId("ember123")).toBe(true);
      expect(isDynamicId("ember-id-7721-a")).toBe(true);
      expect(isDynamicId("ember-456")).toBe(true);
    });

    it("classifies GUID patterns as dynamic", () => {
      expect(isDynamicId("a1b2c3d4-e5f6-4789-a1b2-c3d4e5f6a1b2")).toBe(true);
      expect(isDynamicId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("classifies numeric suffix 4+ digits as dynamic", () => {
      expect(isDynamicId("field_8832")).toBe(true);
      expect(isDynamicId("input-row-4200")).toBe(true);
      expect(isDynamicId("item-12345")).toBe(true);
    });

    it("classifies human-authored IDs as stable", () => {
      expect(isDynamicId("save-btn")).toBe(false);
      expect(isDynamicId("acc_id_input")).toBe(false);
      expect(isDynamicId("header")).toBe(false);
      expect(isDynamicId("section-1")).toBe(false); // < 4 digits
    });

    it("classifies Angular patterns as dynamic", () => {
      expect(isDynamicId("_ngcontent-c21")).toBe(true);
      expect(isDynamicId("cdk-overlay-0")).toBe(true);
      expect(isDynamicId("mat-input-3")).toBe(true);
    });

    it("classifies React/Downshift/other framework patterns as dynamic", () => {
      expect(isDynamicId(":r0:")).toBe(true); // React useId
      expect(isDynamicId("ui-id-1")).toBe(true); // jQuery UI
      expect(isDynamicId("rc-select-0")).toBe(true); // rc-component
      expect(isDynamicId("downshift-0-input")).toBe(true); // Downshift
    });

    it("respects allowlist overrides", () => {
      const config = {
        dynamicIdAllowlist: ["^ember-id-stable$"],
      };
      // Matches ember-* but allowlisted
      expect(isDynamicId("ember-id-stable", config)).toBe(false);
    });

    it("respects denylist overrides", () => {
      const config = {
        dynamicIdDenylist: ["^stable-but-blocked$"],
      };
      expect(isDynamicId("stable-but-blocked", config)).toBe(true);
    });

    it("allowlist takes precedence over denylist", () => {
      const config = {
        dynamicIdAllowlist: ["^conflict$"],
        dynamicIdDenylist: ["^conflict$"],
      };
      expect(isDynamicId("conflict", config)).toBe(false);
    });
  });

  describe("normalizeString", () => {
    it("strips dynamic IDs from strings", () => {
      expect(normalizeString("btn-ember123")).toBe("btn-");
      expect(normalizeString("item-a1b2c3d4-e5f6-4789-a1b2-c3d4e5f6a1b2")).toBe("item-");
    });

    it("strips long numeric suffixes", () => {
      expect(normalizeString("field_8832")).toBe("field_");
    });

    it("leaves stable strings untouched", () => {
      expect(normalizeString("save-btn")).toBe("save-btn");
      expect(normalizeString("section-1")).toBe("section-1");
    });
  });
});
