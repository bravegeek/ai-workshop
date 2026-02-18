import { describe, test, expect } from "vitest";
import { ErrorBuffer } from "./error-buffer.js";

describe("ErrorBuffer", () => {
  test("starts empty", () => {
    const buf = new ErrorBuffer();
    expect(buf.size).toBe(0);
    expect(buf.toArray()).toEqual([]);
  });

  test("push increases size", () => {
    const buf = new ErrorBuffer();
    buf.push(new Error("a"));
    expect(buf.size).toBe(1);
    buf.push(new Error("b"));
    expect(buf.size).toBe(2);
  });

  test("toArray returns errors in insertion order", () => {
    const buf = new ErrorBuffer();
    const e1 = new Error("first");
    const e2 = new Error("second");
    const e3 = new Error("third");
    buf.push(e1);
    buf.push(e2);
    buf.push(e3);
    const result = buf.toArray();
    expect(result[0]).toBe(e1);
    expect(result[1]).toBe(e2);
    expect(result[2]).toBe(e3);
  });

  test("toArray returns a copy, not the internal array", () => {
    const buf = new ErrorBuffer();
    buf.push(new Error("x"));
    const arr1 = buf.toArray();
    const arr2 = buf.toArray();
    expect(arr1).not.toBe(arr2);
    arr1.push(new Error("injected"));
    expect(buf.size).toBe(1);
  });

  test("caps at 100 entries", () => {
    const buf = new ErrorBuffer();
    for (let i = 0; i < 105; i++) {
      buf.push(new Error(`error ${i}`));
    }
    expect(buf.size).toBe(100);
  });

  test("FIFO eviction: first 5 dropped after 105 pushes", () => {
    const buf = new ErrorBuffer();
    const errors: Error[] = [];
    for (let i = 0; i < 105; i++) {
      const e = new Error(`error ${i}`);
      errors.push(e);
      buf.push(e);
    }
    const result = buf.toArray();
    expect(result).not.toContain(errors[0]);
    expect(result).not.toContain(errors[1]);
    expect(result).not.toContain(errors[2]);
    expect(result).not.toContain(errors[3]);
    expect(result).not.toContain(errors[4]);
    expect(result[0]).toBe(errors[5]);
    expect(result[99]).toBe(errors[104]);
  });

  test("wrap-around preserves chronological order in toArray", () => {
    const buf = new ErrorBuffer();
    const errors: Error[] = [];
    for (let i = 0; i < 110; i++) {
      const e = new Error(`error ${i}`);
      errors.push(e);
      buf.push(e);
    }
    const result = buf.toArray();
    expect(result.length).toBe(100);
    for (let i = 0; i < 99; i++) {
      const indexA = errors.indexOf(result[i]);
      const indexB = errors.indexOf(result[i + 1]);
      expect(indexA).toBeLessThan(indexB);
    }
    expect(result[0]).toBe(errors[10]);
    expect(result[99]).toBe(errors[109]);
  });

  test("clear resets size to 0 and toArray to []", () => {
    const buf = new ErrorBuffer();
    buf.push(new Error("a"));
    buf.push(new Error("b"));
    buf.clear();
    expect(buf.size).toBe(0);
    expect(buf.toArray()).toEqual([]);
  });

  test("push after clear works normally", () => {
    const buf = new ErrorBuffer();
    buf.push(new Error("before clear"));
    buf.clear();
    const e = new Error("after clear");
    buf.push(e);
    expect(buf.size).toBe(1);
    expect(buf.toArray()[0]).toBe(e);
  });

  test("size never exceeds 100 even with many pushes", () => {
    const buf = new ErrorBuffer();
    for (let i = 0; i < 500; i++) {
      buf.push(new Error(`error ${i}`));
      expect(buf.size).toBeLessThanOrEqual(100);
    }
    expect(buf.size).toBe(100);
  });
});
