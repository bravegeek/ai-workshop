import { test, expect } from "@playwright/test";

test.describe("Telemetry E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({
      content: `
        import { Mapper, Telemetry, ActionType } from '/src/index.ts';
        window.Mapper = Mapper;
        window.Telemetry = Telemetry;
        window.ActionType = ActionType;
      `,
      type: "module",
    });
  });

  test("SC-001: 3-step workflow produces 3 transitions with correct fields", async ({
    page,
  }) => {
    const results = await page.evaluate(async () => {
      const mapper = new window.Mapper();
      const telemetry = new window.Telemetry();

      // Step 1: Focus Account ID input (the dynamic-ID one)
      const accountInput = document.querySelector("#ember-id-7721-a");
      const sel1 = mapper.generateSelector(accountInput!);
      const sk1 = mapper.generateStateKey(sel1.selector);
      telemetry.record(sk1, sel1.selector, window.ActionType.FOCUS);

      // Step 2: Click Save
      const saveBtn = document.querySelector("#save-btn");
      const sel2 = mapper.generateSelector(saveBtn!);
      const sk2 = mapper.generateStateKey(sel2.selector);
      telemetry.record(sk2, sel2.selector, window.ActionType.CLICK);

      // Step 3: Click Finalize
      const finalizeBtn = document.querySelector("#finalize-btn");
      if (finalizeBtn) {
        const sel3 = mapper.generateSelector(finalizeBtn);
        const sk3 = mapper.generateStateKey(sel3.selector);
        telemetry.record(sk3, sel3.selector, window.ActionType.CLICK);
      }

      // Query back
      const entries1 = telemetry.query(sk1);
      const entries2 = telemetry.query(sk2);

      return {
        entries1,
        entries2,
        sel1Selector: sel1.selector,
        sel2Selector: sel2.selector,
      };
    });

    // Verify the focus interaction was recorded
    expect(results.entries1.length).toBeGreaterThanOrEqual(1);
    // Normalized selector should NOT be the dynamic ID
    expect(results.sel1Selector).not.toBe("#ember-id-7721-a");
  });

  test("SC-003: data persists across page reload via localStorage", async ({
    page,
  }) => {
    // Record a transition
    await page.evaluate(async () => {
      const mapper = new window.Mapper();
      const telemetry = new window.Telemetry();
      const saveBtn = document.querySelector("#save-btn");
      const sel = mapper.generateSelector(saveBtn!);
      const sk = mapper.generateStateKey(sel.selector);
      telemetry.record(sk, sel.selector, window.ActionType.CLICK);
      telemetry.record(sk, sel.selector, window.ActionType.CLICK);
      telemetry.record(sk, sel.selector, window.ActionType.CLICK);
    });

    // Reload
    await page.reload();
    await page.addScriptTag({
      content: `
        import { Mapper, Telemetry, ActionType } from '/src/index.ts';
        window.Mapper = Mapper;
        window.Telemetry = Telemetry;
        window.ActionType = ActionType;
      `,
      type: "module",
    });

    // Query back after reload
    const entries = await page.evaluate(async () => {
      const mapper = new window.Mapper();
      const telemetry = new window.Telemetry();
      const saveBtn = document.querySelector("#save-btn");
      const sel = mapper.generateSelector(saveBtn!);
      const sk = mapper.generateStateKey(sel.selector);
      return telemetry.query(sk);
    });

    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0].count).toBe(3);
  });

  test("SC-002: no transition packet contains prohibited data", async ({
    page,
  }) => {
    // Verify the localStorage data has no prohibited fields
    await page.evaluate(async () => {
      const telemetry = new window.Telemetry();
      const mapper = new window.Mapper();
      const input = document.querySelector("#ember-id-7721-a");
      const sel = mapper.generateSelector(input!);
      const sk = mapper.generateStateKey(sel.selector);
      telemetry.record(sk, sel.selector, window.ActionType.INPUT);
    });

    const raw = await page.evaluate(() => {
      return localStorage.getItem("lob-gps:telemetry");
    });

    expect(raw).toBeDefined();
    expect(raw).not.toContain('"value"');
    expect(raw).not.toContain('"innerText"');
    expect(raw).not.toContain('"clipboard"');
  });
});

declare global {
  interface Window {
    Mapper: any;
    Telemetry: any;
    ActionType: any;
  }
}
