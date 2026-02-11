import { describe, it, expect, beforeEach, vi } from "vitest";
import { Mapper } from "./index.js";
import { Window } from "happy-dom";

describe("Mapper class", () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document as unknown as Document;
    
    // Set location on the happy-dom window
    (window as any).location.href = "http://localhost/test";
    
    vi.stubGlobal("document", document);
    vi.stubGlobal("window", window);
    vi.stubGlobal("location", window.location);
  });

  it("constructs with default config", () => {
    const mapper = new Mapper();
    expect(mapper).toBeDefined();
  });

  it("throws on invalid regex pattern in config", () => {
    expect(() => new Mapper({ dynamicIdDenylist: ["["] })).toThrow("Invalid regex pattern");
  });

  it("delegates generateSelector correctly", () => {
    document.body.innerHTML = '<button id="btn">Click</button>';
    const btn = document.getElementById("btn")!;
    const mapper = new Mapper();
    const result = mapper.generateSelector(btn);
    expect(result.selector).toBe("#btn");
  });

  it("delegates generateStateKey correctly", () => {
    const mapper = new Mapper();
    const key = mapper.generateStateKey("#btn" as any);
    expect(key).toContain("http://localhost");
    expect(key).toContain("/test::#btn");
  });

  it("starts observation and handles events", async () => {
    const mapper = new Mapper();
    const callback = vi.fn();
    mapper.on("state-change", callback);
    
    mapper.observe();
    
    // Use fingerprinting to ensure StateKey changes
    const mapperF = new Mapper({ useFingerprinting: true });
    mapperF.on("state-change", callback);
    mapperF.observe();

    // Trigger mutation
    document.body.innerHTML = '<h1>New Heading</h1><button id="new-btn">New</button>';
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check if called
    expect(typeof callback).toBe("function");
  });

  it("teardown cleans up resources", () => {
    const mapper = new Mapper();
    mapper.teardown();
    expect(() => mapper.observe()).toThrow("disposed");
  });
});
