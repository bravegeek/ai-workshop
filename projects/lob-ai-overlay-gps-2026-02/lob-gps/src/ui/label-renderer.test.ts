import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { show } from "./label-renderer.js";

function makeShadowRoot(): ShadowRoot {
  const host = document.createElement("div");
  return host.attachShadow({ mode: "open" });
}

function mockRect(
  overrides: Partial<DOMRect> = {},
): DOMRect {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    right: 0,
    bottom: 0,
    toJSON() {},
    ...overrides,
  } as DOMRect;
}

describe("LabelRenderer", () => {
  let target: HTMLElement;
  let root: ShadowRoot;
  let ac: AbortController;

  beforeEach(() => {
    target = document.createElement("div");
    document.body.appendChild(target);
    root = makeShadowRoot();
    ac = new AbortController();

    // Default viewport
    vi.stubGlobal("innerWidth", 1024);
    vi.stubGlobal("innerHeight", 768);
  });

  afterEach(() => {
    target.remove();
    ac.abort();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("show() creates a .lob-label div with the label text", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    show(target, "Field Name", root, ac.signal);

    const label = root.querySelector(".lob-label");
    expect(label).not.toBeNull();
    expect(label).toBeInstanceOf(HTMLDivElement);
    expect(label!.textContent).toBe("Field Name");
  });

  test("label has position: fixed and pointer-events: none", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    show(target, "Test", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    expect(label.style.position).toBe("fixed");
    expect(label.style.pointerEvents).toBe("none");
  });

  test("label positioned below target by default (top = targetRect.bottom + 8)", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    // We need to intercept the label's getBoundingClientRect too.
    // Override createElement to spy on the label when it's created.
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === "div") {
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
          mockRect({ width: 80, height: 24 }),
        );
      }
      return el;
    });

    show(target, "Below", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    expect(label.style.top).toBe("148px"); // 140 + 8
  });

  test("label centered horizontally relative to target", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === "div") {
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
          mockRect({ width: 80, height: 24 }),
        );
      }
      return el;
    });

    show(target, "Centered", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    // left = 200 + (120 - 80) / 2 = 200 + 20 = 220
    expect(label.style.left).toBe("220px");
  });

  test("vertical flip: label moves above target when it would clip below viewport", () => {
    vi.stubGlobal("innerHeight", 200);

    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 150, left: 200, width: 120, height: 40, bottom: 190, right: 320 }),
    );

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === "div") {
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
          mockRect({ width: 80, height: 24 }),
        );
      }
      return el;
    });

    show(target, "Flipped", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    // top = 150 - 24 - 8 = 118
    expect(label.style.top).toBe("118px");
  });

  test("horizontal clamp: label near left edge is clamped to minimum margin", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 5, width: 20, height: 40, bottom: 140, right: 25 }),
    );

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === "div") {
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
          mockRect({ width: 80, height: 24 }),
        );
      }
      return el;
    });

    show(target, "Left Edge", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    // Calculated left = 5 + (20 - 80) / 2 = 5 - 30 = -25 → clamped to 8
    expect(label.style.left).toBe("8px");
  });

  test("horizontal clamp: label near right edge is clamped to maximum margin", () => {
    vi.stubGlobal("innerWidth", 400);

    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 350, width: 40, height: 40, bottom: 140, right: 390 }),
    );

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === "div") {
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue(
          mockRect({ width: 80, height: 24 }),
        );
      }
      return el;
    });

    show(target, "Right Edge", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    // Calculated left = 350 + (40 - 80) / 2 = 350 - 20 = 330
    // 330 + 80 = 410 > 400 - 8 = 392 → clamped to 400 - 8 - 80 = 312
    expect(label.style.left).toBe("312px");
  });

  test("RTL layout: label has direction: rtl and text-align: right", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    // Mock getComputedStyle to return rtl direction
    const origGetComputedStyle = window.getComputedStyle;
    vi.stubGlobal("getComputedStyle", (el: Element, pseudoElt?: string | null) => {
      const style = origGetComputedStyle(el, pseudoElt);
      if (el === document.documentElement) {
        return { ...style, direction: "rtl" } as CSSStyleDeclaration;
      }
      return style;
    });

    show(target, "RTL Label", root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    expect(label.style.direction).toBe("rtl");
    expect(label.style.textAlign).toBe("right");
  });

  test("label removed on abort signal", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    show(target, "Removable", root, ac.signal);

    const label = root.querySelector(".lob-label");
    expect(label).not.toBeNull();

    ac.abort();

    expect(root.querySelector(".lob-label")).toBeNull();
  });

  test("label text content matches input string exactly", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, left: 200, width: 120, height: 40, bottom: 140, right: 320 }),
    );

    const text = "  Exact <Match> & \"Test\"  ";
    show(target, text, root, ac.signal);

    const label = root.querySelector(".lob-label") as HTMLElement;
    expect(label.textContent).toBe(text);
  });
});
