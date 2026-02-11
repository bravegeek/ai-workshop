import { describe, it, expect, beforeEach } from "vitest";
import { Window } from "happy-dom";
import { generatePageFingerprint, fnv1a } from "./page-fingerprint.js";

describe("page-fingerprint", () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document as unknown as Document;
    // Mock global document and window for fingerprinting logic
    (global as any).document = document;
    (global as any).window = window;
  });

  describe("fnv1a", () => {
    it("produces deterministic 8-character hex hash", () => {
      const input = "test-input";
      const hash1 = fnv1a(input);
      const hash2 = fnv1a(input);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[0-9a-f]{8}$/);
    });

    it("produces different hashes for different inputs", () => {
      expect(fnv1a("input1")).not.toBe(fnv1a("input2"));
    });
  });

  describe("generatePageFingerprint", () => {
    it("extracts semantic anchors and hashes them", () => {
      document.title = "Page Title";
      document.body.innerHTML = `
        <header>
          <h1>Main Heading</h1>
        </header>
        <nav>
          <ul>
            <li class="active">Current Nav</li>
          </ul>
        </nav>
        <main>
          <h2>Sub Section</h2>
        </main>
      `;

      const fingerprint = generatePageFingerprint();
      expect(fingerprint).toMatch(/^[0-9a-f]{8}$/);
    });

    it("ignores hidden elements and PII patterns", () => {
      document.body.innerHTML = `
        <h1>Safe Heading</h1>
        <h2 style="display: none">Hidden Heading</h2>
        <h3>Welcome, Greg!</h3> <!-- Should be filtered by PII pattern -->
        <p>Email: greg@example.com</p> <!-- Not a heading, but check filtering if we used it -->
      `;

      const f1 = generatePageFingerprint();
      
      document.body.innerHTML = `<h1>Safe Heading</h1>`;
      const f2 = generatePageFingerprint();

      // Should be identical because Hidden and PII headings were ignored
      expect(f1).toBe(f2);
    });

    it("is noise-resistant", () => {
      document.body.innerHTML = `<h1>Main</h1>`;
      const f1 = generatePageFingerprint();

      document.body.innerHTML = `
        <h1>Main</h1>
        <div class="noise" id="MSG_ID_1234">Random Message</div>
      `;
      const f2 = generatePageFingerprint();

      expect(f1).toBe(f2);
    });

    it("sorts anchors deterministically", () => {
      document.body.innerHTML = `<h1>A</h1><h2>B</h2>`;
      const f1 = generatePageFingerprint();

      document.body.innerHTML = `<h2>B</h2><h1>A</h1>`;
      const f2 = generatePageFingerprint();

      expect(f1).toBe(f2);
    });
  });
});
