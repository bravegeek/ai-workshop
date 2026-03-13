import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Presbyopia } from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Presbyopia", () => {
  test("init runs both modules by default", () => {
    document.body.innerHTML = `<button id="btn">ok</button><p id="p" style="font-size:10px">text</p>`;
    const p = new Presbyopia().init();

    expect(document.getElementById("pres-tt-styles")).not.toBeNull();
    expect(document.getElementById("p")!.style.getPropertyValue("font-size")).toBe("16px");

    p.destroy();
  });

  test("fontFloor: false disables font module", () => {
    document.body.innerHTML = `<p id="p" style="font-size:10px">text</p>`;
    const p = new Presbyopia({ fontFloor: false }).init();
    expect(document.getElementById("p")!.getAttribute("data-pres-ff")).toBeNull();
    p.destroy();
  });

  test("tapTargets: false disables tap module", () => {
    document.body.innerHTML = `<button id="btn">ok</button>`;
    const p = new Presbyopia({ tapTargets: false }).init();
    expect(document.getElementById("pres-tt-styles")).toBeNull();
    p.destroy();
  });

  test("custom options are passed through", () => {
    document.body.innerHTML = `<p id="p" style="font-size:17px">text</p>`;
    const p = new Presbyopia({ fontFloor: 20 }).init();
    expect(document.getElementById("p")!.style.getPropertyValue("font-size")).toBe("20px");
    p.destroy();
  });

  test("destroy cleans up all modules", () => {
    document.body.innerHTML = `<button id="btn">ok</button><p id="p" style="font-size:10px">text</p>`;
    const p = new Presbyopia().init();
    p.destroy();

    expect(document.getElementById("pres-tt-styles")).toBeNull();
    expect(document.getElementById("p")!.getAttribute("data-pres-ff")).toBeNull();
  });
});
