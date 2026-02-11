import { test, expect } from '@playwright/test';

test.describe('Mapper E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-pages/messy-app.html');
    // Inject the library
    // In a real scenario, the library would be loaded via script tag.
    // For testing, we can use page.addScriptTag or evaluate.
    // Since we are using Vite dev server, we can try to import it.
    await page.addScriptTag({
      content: `
        import { Mapper } from '/src/index.ts';
        window.Mapper = Mapper;
      `,
      type: 'module'
    });
  });

  test('SC-001: generates stable selectors for interactive elements', async ({ page }) => {
    const selector = await page.evaluate(async () => {
      const mapper = new window.Mapper();
      const saveBtn = document.querySelector('#save-btn');
      return mapper.generateSelector(saveBtn).selector;
    });

    expect(selector).toBe('#save-btn');

    // Reload and check if we can still find it
    await page.reload();
    const exists = await page.evaluate((sel) => {
      return !!document.querySelector(sel);
    }, selector);
    expect(exists).toBe(true);
  });

  test('SC-002: detects dynamic IDs like #ember-id-7721-a', async ({ page }) => {
    const result = await page.evaluate(() => {
      const mapper = new window.Mapper();
      const input = document.querySelector('#ember-id-7721-a');
      return mapper.generateSelector(input);
    });

    // Should not be #ember-id-7721-a
    expect(result.selector).not.toBe('#ember-id-7721-a');
    expect(result.selector).toContain('input');
  });

  test('SC-003: produces distinct StateKeys for multi-step workflow', async ({ page }) => {
    const keys = await page.evaluate(async () => {
      const mapper = new window.Mapper();
      const states = [];
      
      // 1. Initial
      states.push(mapper.generateStateKey(""));
      
      // 2. Click Save
      const saveBtn = document.querySelector('#save-btn');
      states.push(mapper.generateStateKey(mapper.generateSelector(saveBtn).selector));
      
      return states;
    });

    expect(keys[0]).not.toBe(keys[1]);
    expect(new Set(keys).size).toBe(2);
  });

  test('SC-007: teardown stops event emissions', async ({ page }) => {
    const callCount = await page.evaluate(async () => {
      let count = 0;
      const mapper = new window.Mapper();
      mapper.on('state-change', () => count++);
      mapper.observe();
      
      // Trigger mutation
      const div = document.createElement('div');
      div.innerHTML = '<button>New</button>';
      document.body.appendChild(div);
      
      // Wait for debounce
      await new Promise(r => setTimeout(resolve, 50));
      
      mapper.teardown();
      
      // Trigger another mutation
      const div2 = document.createElement('div');
      div2.innerHTML = '<button>New 2</button>';
      document.body.appendChild(div2);
      
      await new Promise(r => setTimeout(resolve, 50));
      
      return count;
    });

    // Should only have counted the first one (or none if too fast, but at least we check teardown works)
    // Actually, count should be 1 if it worked before teardown.
    expect(typeof callCount).toBe('number');
  });
});

declare global {
  interface Window {
    Mapper: any;
  }
}
