import type { IErrorBuffer } from "./types.js";

const MAX_SIZE = 100;

export class ErrorBuffer implements IErrorBuffer {
  private readonly buffer: (Error | undefined)[] = new Array(MAX_SIZE);
  private writeIndex = 0;
  private count = 0;

  push(error: Error): void {
    this.buffer[this.writeIndex] = error;
    this.writeIndex = (this.writeIndex + 1) % MAX_SIZE;
    if (this.count < MAX_SIZE) this.count++;
  }

  toArray(): Error[] {
    if (this.count === 0) return [];

    const result: Error[] = [];
    if (this.count < MAX_SIZE) {
      // Buffer hasn't wrapped yet — entries are 0..count-1
      for (let i = 0; i < this.count; i++) {
        result.push(this.buffer[i]!);
      }
    } else {
      // Buffer has wrapped — oldest is at writeIndex, newest at writeIndex-1
      for (let i = 0; i < MAX_SIZE; i++) {
        result.push(this.buffer[(this.writeIndex + i) % MAX_SIZE]!);
      }
    }
    return result;
  }

  clear(): void {
    this.buffer.fill(undefined);
    this.writeIndex = 0;
    this.count = 0;
  }

  get size(): number {
    return this.count;
  }
}
