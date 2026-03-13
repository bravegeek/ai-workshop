import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { TapTargets } from "../src/tap-targets";

function setBody(html: string) {
  document.body.innerHTML = html;
}

describe("TapTargets", () => {
  let tt: TapTargets;

  beforeEach(() => {
    tt = new TapTargets({ minPx: 44 });
  });

  afterEach(() => {
    tt.destroy();
    document.body.innerHTML = "";
  });

  test("injects stylesheet on init", () => {
    setBody(`<button>ok</button>`);
    tt.init();
    expect(document.getElementById("pres-tt-styles")).not.toBeNull();
  });

  test("removes stylesheet on destroy", () => {
    setBody(`<button>ok</button>`);
    tt.init();
    tt.destroy();
    expect(document.getElementById("pres-tt-styles")).toBeNull();
  });

  test("adds class to small button", () => {
    // happy-dom returns 0,0 for getBoundingClientRect by default —
    // zero dimensions are below the 44px threshold, so the class should be added.
    setBody(`<button id="btn">x</button>`);
    tt.init();
    expect(document.getElementById("btn")!.classList.contains("pres-tt")).toBe(true);
  });

  test("adds class to small link", () => {
    setBody(`<a href="#" id="lnk">x</a>`);
    tt.init();
    expect(document.getElementById("lnk")!.classList.contains("pres-tt")).toBe(true);
  });

  test("removes class on destroy", () => {
    setBody(`<button id="btn">x</button>`);
    tt.init();
    tt.destroy();
    expect(document.getElementById("btn")!.classList.contains("pres-tt")).toBe(false);
  });

  test("does not duplicate stylesheet on multiple init calls", () => {
    setBody(`<button>ok</button>`);
    tt.init();
    tt.init();
    const sheets = document.querySelectorAll("#pres-tt-styles");
    expect(sheets.length).toBe(1);
  });

  test("picks up dynamically added small targets", async () => {
    setBody(`<div id="container"></div>`);
    tt.init();

    const btn = document.createElement("button");
    btn.id = "dynamic";
    document.getElementById("container")!.appendChild(btn);

    await new Promise((r) => setTimeout(r, 0));

    expect(document.getElementById("dynamic")!.classList.contains("pres-tt")).toBe(true);
  });

  test("handles role=button elements", () => {
    setBody(`<div role="button" id="rb">click</div>`);
    tt.init();
    expect(document.getElementById("rb")!.classList.contains("pres-tt")).toBe(true);
  });
});
