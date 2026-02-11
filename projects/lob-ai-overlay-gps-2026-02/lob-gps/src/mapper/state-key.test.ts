import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateStateKey } from "./state-key.js";

describe("state-key", () => {
  beforeEach(() => {
    // Mock window.location
    vi.stubGlobal("location", {
      origin: "https://app.example.com",
      pathname: "/dashboard",
    });
  });

  it("produces URL::selector StateKey by default", () => {
    const selector = "#save-btn";
    const key = generateStateKey(selector as any);
    expect(key).toBe("https://app.example.com/dashboard::#save-btn");
  });

  it("produces URL:: StateKey for empty action (initial load)", () => {
    const key = generateStateKey("");
    expect(key).toBe("https://app.example.com/dashboard::");
  });

  it("produces fingerprint::selector when enabled", () => {
    // We need to mock generatePageFingerprint or the DOM
    vi.mock("./page-fingerprint.js", async (importOriginal) => {
      const actual = await importOriginal<any>();
      return {
        ...actual,
        generatePageFingerprint: vi.fn().mockReturnValue("a3f2c1b0"),
      };
    });

    const config = { useFingerprinting: true };
    const key = generateStateKey("#save-btn" as any, config);
    expect(key).toBe("a3f2c1b0::#save-btn");
  });
});
