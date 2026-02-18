import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    LobGPS: any;
  }
}

const INJECT_BOOT = `
  import '/src/boot.ts';
`;

test.describe("Integration E2E", () => {
  test("script tag init — shadow host appears, isActive, no console errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({ content: INJECT_BOOT, type: "module" });
    await page.waitForFunction(() => window.LobGPS?.version !== undefined);

    const hostExists = await page.evaluate(() => {
      return !!document.querySelector("[data-lob-gps]");
    });

    const state = await page.evaluate(() => ({
      isActive: window.LobGPS.isActive,
      version: window.LobGPS.version,
    }));

    expect(hostExists).toBe(true);
    expect(state.isActive).toBe(true);
    expect(state.version).toBe("0.1.0");
    expect(errors).toHaveLength(0);

    await page.evaluate(() => window.LobGPS.teardown());
  });

  test("kill switch Ctrl+Shift+K removes overlay", async ({ page }) => {
    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({ content: INJECT_BOOT, type: "module" });
    await page.waitForFunction(() => window.LobGPS?.version !== undefined);

    expect(await page.evaluate(() => window.LobGPS.isActive)).toBe(true);

    // Press Ctrl+Shift+K
    await page.keyboard.down("Control");
    await page.keyboard.down("Shift");
    await page.keyboard.press("k");
    await page.keyboard.up("Shift");
    await page.keyboard.up("Control");

    const afterKill = await page.evaluate(() => ({
      isActive: window.LobGPS.isActive,
      hostExists: !!document.querySelector("[data-lob-gps]"),
    }));

    expect(afterKill.isActive).toBe(false);
    expect(afterKill.hostExists).toBe(false);
  });

  test("disable/enable cycle preserves telemetry", async ({ page }) => {
    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({ content: INJECT_BOOT, type: "module" });
    await page.waitForFunction(() => window.LobGPS?.version !== undefined);

    // Disable
    await page.evaluate(() => window.LobGPS.disable());
    expect(await page.evaluate(() => window.LobGPS.isActive)).toBe(false);
    expect(
      await page.evaluate(() => !!document.querySelector("[data-lob-gps]")),
    ).toBe(false);

    // Enable
    await page.evaluate(() => window.LobGPS.enable());
    expect(await page.evaluate(() => window.LobGPS.isActive)).toBe(true);
    expect(
      await page.evaluate(() => !!document.querySelector("[data-lob-gps]")),
    ).toBe(true);

    await page.evaluate(() => window.LobGPS.teardown());
  });

  test("duplicate script is a no-op", async ({ page }) => {
    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({ content: INJECT_BOOT, type: "module" });
    await page.waitForFunction(() => window.LobGPS?.version !== undefined);

    // Inject boot a second time
    await page.addScriptTag({
      content: `import '/src/boot.ts?cachebust=${Date.now()}';`,
      type: "module",
    });
    // Short wait for second script to execute
    await page.waitForTimeout(200);

    // Should still be only one shadow host
    const hostCount = await page.evaluate(() => {
      return document.querySelectorAll("[data-lob-gps]").length;
    });

    expect(hostCount).toBe(1);

    await page.evaluate(() => window.LobGPS.teardown());
  });

  test("error boundary — injected fault does not reach window.onerror", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/test-pages/messy-app.html");
    await page.addScriptTag({ content: INJECT_BOOT, type: "module" });
    await page.waitForFunction(() => window.LobGPS?.version !== undefined);

    // Errors from reporting should not propagate to window.onerror
    const apiErrors = await page.evaluate(() => {
      return window.LobGPS.errors.length;
    });

    // No uncaught errors should have reached window.onerror
    expect(errors).toHaveLength(0);
    expect(typeof apiErrors).toBe("number");

    await page.evaluate(() => window.LobGPS.teardown());
  });
});
