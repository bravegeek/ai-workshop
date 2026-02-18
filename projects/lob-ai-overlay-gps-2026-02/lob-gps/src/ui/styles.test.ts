import { describe, test, expect } from "vitest";
import { createStylesheet, STYLES_CSS } from "./styles.js";

describe("styles", () => {
  test("STYLES_CSS is a non-empty string", () => {
    expect(typeof STYLES_CSS).toBe("string");
    expect(STYLES_CSS.length).toBeGreaterThan(0);
  });

  test("contains pulse keyframes", () => {
    expect(STYLES_CSS).toContain("@keyframes lob-pulse-glow");
  });

  test("contains lob-pulse class", () => {
    expect(STYLES_CSS).toContain(".lob-pulse");
  });

  test("contains lob-label class with dark background", () => {
    expect(STYLES_CSS).toContain(".lob-label");
    expect(STYLES_CSS).toContain("#1a1a2e");
  });

  test("contains lob-minimap class", () => {
    expect(STYLES_CSS).toContain(".lob-minimap");
  });

  test("contains reduced-motion media query disabling animations", () => {
    expect(STYLES_CSS).toContain("prefers-reduced-motion: reduce");
    expect(STYLES_CSS).toContain("animation: none");
  });

  test("contains print media query hiding host", () => {
    expect(STYLES_CSS).toContain("@media print");
    expect(STYLES_CSS).toContain("display: none");
  });

  test("label styles have minimum 12px font size", () => {
    expect(STYLES_CSS).toMatch(/font-size:\s*12px/);
  });

  test("label styles have white text for WCAG AA contrast", () => {
    expect(STYLES_CSS).toContain("#ffffff");
  });

  test("contains host reset with all: initial", () => {
    expect(STYLES_CSS).toContain("all: initial");
  });

  test("createStylesheet returns a CSSStyleSheet", () => {
    const sheet = createStylesheet();
    expect(sheet).toBeInstanceOf(CSSStyleSheet);
  });

  test("createStylesheet populates rules", () => {
    const sheet = createStylesheet();
    expect(sheet.cssRules.length).toBeGreaterThan(0);
  });
});
