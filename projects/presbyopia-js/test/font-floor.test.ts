import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { FontFloor } from "../src/font-floor";

function setBody(html: string) {
  document.body.innerHTML = html;
}

describe("FontFloor", () => {
  let ff: FontFloor;

  beforeEach(() => {
    ff = new FontFloor({ floorPx: 16 });
  });

  afterEach(() => {
    ff.destroy();
    document.body.innerHTML = "";
  });

  test("bumps element below floor up to floor", () => {
    setBody(`<p id="t" style="font-size: 11px">small text</p>`);
    ff.init();
    const el = document.getElementById("t")!;
    expect(el.style.getPropertyValue("font-size")).toBe("16px");
  });

  test("leaves elements at or above floor untouched", () => {
    setBody(`<p id="t" style="font-size: 18px">fine text</p>`);
    ff.init();
    const el = document.getElementById("t")!;
    expect(el.getAttribute("data-pres-ff")).toBeNull();
  });

  test("marks overridden elements with data attribute", () => {
    setBody(`<span id="t" style="font-size: 10px">tiny</span>`);
    ff.init();
    expect(document.getElementById("t")!.getAttribute("data-pres-ff")).toBe("1");
  });

  test("restores elements on destroy", () => {
    setBody(`<p id="t" style="font-size: 11px">small</p>`);
    ff.init();
    ff.destroy();
    const el = document.getElementById("t")!;
    expect(el.style.getPropertyValue("font-size")).toBe("");
    expect(el.getAttribute("data-pres-ff")).toBeNull();
  });

  test("picks up dynamically added small-font elements", async () => {
    setBody(`<div id="container"></div>`);
    ff.init();

    const p = document.createElement("p");
    p.style.fontSize = "10px";
    p.id = "dynamic";
    document.getElementById("container")!.appendChild(p);

    // MutationObserver fires asynchronously
    await new Promise((r) => setTimeout(r, 0));

    expect(document.getElementById("dynamic")!.style.getPropertyValue("font-size")).toBe("16px");
  });

  test("respects custom floor value", () => {
    const custom = new FontFloor({ floorPx: 20 });
    setBody(`<p id="t" style="font-size: 17px">medium</p>`);
    custom.init();
    expect(document.getElementById("t")!.style.getPropertyValue("font-size")).toBe("20px");
    custom.destroy();
  });
});
