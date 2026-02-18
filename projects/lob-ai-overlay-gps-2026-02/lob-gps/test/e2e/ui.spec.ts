import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __lobUI: any;
    OverlayUI: any;
    SuggestionSource: any;
  }
}

const INJECT_SCRIPT = `
  import { OverlayUI } from '/src/ui/index.ts';
  import { SuggestionSource } from '/src/engine/types.ts';
  window.OverlayUI = OverlayUI;
  window.SuggestionSource = SuggestionSource;
`;

function makeSuggestion(
  selector: string,
  label: string,
  source: "curated" | "predicted" = "curated",
) {
  return { selector, label, confidence: 1.0, source, avgDwellTime: 0 };
}

test.describe("UI Module E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({ content: INJECT_SCRIPT, type: "module" });
    // Wait for module to load
    await page.waitForFunction(() => window.OverlayUI !== undefined);
  });

  test("shadow host appears on messy-app.html with no console errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
    });

    const hostExists = await page.evaluate(() => {
      return !!document.querySelector("[data-lob-gps]");
    });

    expect(hostExists).toBe(true);
    expect(errors).toHaveLength(0);

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("shadow host has open shadow root", async ({ page }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
    });

    const hasOpenShadow = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      return host?.shadowRoot?.mode === "open";
    });

    expect(hasOpenShadow).toBe(true);

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("pulse on #save-btn is visually positioned correctly (SC-002)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Step 1: Save",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    // Wait for pulse element to appear in shadow root
    const pulseRect = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const pulse = host?.shadowRoot?.querySelector(".lob-pulse");
      if (!pulse) return null;
      const rect = (pulse as HTMLElement).getBoundingClientRect();
      return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
    });

    const btnRect = await page.evaluate(() => {
      const btn = document.querySelector("#save-btn");
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
    });

    expect(pulseRect).not.toBeNull();
    expect(btnRect).not.toBeNull();

    // Pulse should overlap the button (within a few pixels tolerance)
    expect(Math.abs(pulseRect!.top - btnRect!.top)).toBeLessThan(5);
    expect(Math.abs(pulseRect!.left - btnRect!.left)).toBeLessThan(5);
    expect(Math.abs(pulseRect!.width - btnRect!.width)).toBeLessThan(5);
    expect(Math.abs(pulseRect!.height - btnRect!.height)).toBeLessThan(5);

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("click passes through pulse to button (pointer-events: none, FR-015)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Click through test",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    // Verify pulse exists
    const hasPulse = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      return !!host?.shadowRoot?.querySelector(".lob-pulse");
    });
    expect(hasPulse).toBe(true);

    // Click the save button through the pulse
    await page.click("#save-btn");

    // After clicking save, the button text should change (the messy-app script does this)
    const btnText = await page.textContent("#save-btn");
    expect(btnText).toBe("Saving...");

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("label displays suggestion text and is readable (SC-004)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Step 1: Save your changes",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    const labelText = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const label = host?.shadowRoot?.querySelector(".lob-label");
      return label?.textContent ?? null;
    });

    expect(labelText).toBe("Step 1: Save your changes");

    // Verify label styles (readable font, min 12px)
    const labelStyle = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const label = host?.shadowRoot?.querySelector(".lob-label") as HTMLElement;
      if (!label) return null;
      const cs = getComputedStyle(label);
      return {
        fontSize: parseFloat(cs.fontSize),
        color: cs.color,
        pointerEvents: cs.pointerEvents,
      };
    });

    expect(labelStyle).not.toBeNull();
    expect(labelStyle!.fontSize).toBeGreaterThanOrEqual(12);
    expect(labelStyle!.pointerEvents).toBe("none");

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("prefers-reduced-motion: reduce shows static highlight (SC-005)", async ({
    page,
  }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Reduced motion test",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    // Verify pulse has no animation (animation: none from CSS media query)
    const animationName = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const pulse = host?.shadowRoot?.querySelector(".lob-pulse") as HTMLElement;
      if (!pulse) return null;
      return getComputedStyle(pulse).animationName;
    });

    expect(animationName).toBe("none");

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("teardown() removes all overlay elements (SC-006)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Teardown test",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    // Verify elements exist
    const beforeTeardown = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      return {
        hostExists: !!host,
        hasPulse: !!host?.shadowRoot?.querySelector(".lob-pulse"),
        hasLabel: !!host?.shadowRoot?.querySelector(".lob-label"),
      };
    });
    expect(beforeTeardown.hostExists).toBe(true);

    // Teardown
    const childCountBefore = await page.evaluate(
      () => document.body.children.length,
    );
    await page.evaluate(() => window.__lobUI.teardown());

    const afterTeardown = await page.evaluate(() => {
      return {
        hostExists: !!document.querySelector("[data-lob-gps]"),
        childCount: document.body.children.length,
      };
    });

    expect(afterTeardown.hostExists).toBe(false);
    expect(afterTeardown.childCount).toBe(childCountBefore - 1);
  });

  test("mini-map renders with suggestion entries", async ({ page }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Step 1: Save",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
        {
          selector: "#acc_id_input",
          label: "Frequently used (42%)",
          confidence: 0.42,
          source: "predicted",
          avgDwellTime: 1200,
        },
      ]);
    });

    const miniMapInfo = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const panel = host?.shadowRoot?.querySelector(".lob-minimap");
      if (!panel) return null;
      const entries = panel.querySelectorAll('[role="listitem"]');
      return {
        entryCount: entries.length,
        hasRole: panel.getAttribute("role"),
        ariaLabel: panel.getAttribute("aria-label"),
      };
    });

    expect(miniMapInfo).not.toBeNull();
    expect(miniMapInfo!.entryCount).toBe(2);
    expect(miniMapInfo!.hasRole).toBe("complementary");
    expect(miniMapInfo!.ariaLabel).toBe("Navigation suggestions");

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("mini-map collapse/expand toggle (FR-025)", async ({ page }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Toggle test",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    // Find toggle button in shadow DOM
    const toggleInfo = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const toggle = host?.shadowRoot?.querySelector(
        '[aria-label="Collapse suggestions"]',
      ) as HTMLElement;
      if (!toggle) return null;
      return {
        exists: true,
        role: toggle.getAttribute("role"),
      };
    });

    expect(toggleInfo).not.toBeNull();
    expect(toggleInfo!.role).toBe("button");

    // Click collapse
    await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const toggle = host?.shadowRoot?.querySelector(
        '[aria-label="Collapse suggestions"]',
      ) as HTMLElement;
      toggle.click();
    });

    const isCollapsed = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const panel = host?.shadowRoot?.querySelector(".lob-minimap");
      return panel?.classList.contains("collapsed");
    });

    expect(isCollapsed).toBe(true);

    await page.evaluate(() => window.__lobUI.teardown());
  });

  test("keyboard navigation on mini-map entries (SC-008)", async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.__lobUI = new window.OverlayUI();
      window.__lobUI.render([
        {
          selector: "#save-btn",
          label: "Keyboard nav test",
          confidence: 1.0,
          source: "curated",
          avgDwellTime: 0,
        },
      ]);
    });

    // Verify entries have tabindex="0"
    const entryInfo = await page.evaluate(() => {
      const host = document.querySelector("[data-lob-gps]");
      const entries = host?.shadowRoot?.querySelectorAll('[role="listitem"]');
      if (!entries || entries.length === 0) return null;
      return {
        count: entries.length,
        tabindex: entries[0].getAttribute("tabindex"),
      };
    });

    expect(entryInfo).not.toBeNull();
    expect(entryInfo!.tabindex).toBe("0");

    await page.evaluate(() => window.__lobUI.teardown());
  });
});
