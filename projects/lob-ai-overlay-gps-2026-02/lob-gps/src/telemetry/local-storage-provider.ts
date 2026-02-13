import type {
  TransitionPacket,
  FrequencyEntry,
  TelemetryProvider,
  AggregateEntry,
  StorageEnvelope,
  NormalizedSelector,
  StateKey,
} from "./types.js";

const CURRENT_SCHEMA_VERSION = 1;
const DEFAULT_NAMESPACE = "lob-gps:telemetry";
const DEFAULT_STORAGE_CAP = 1_048_576; // 1MB

export interface LocalStorageProviderConfig {
  storageCap?: number;
  namespace?: string;
}

export class LocalStorageProvider implements TelemetryProvider {
  private readonly namespace: string;
  private readonly storageCap: number;
  private readonly mode: "localStorage" | "memory";

  // In-memory fallback storage
  private memoryStore: Map<string, Map<string, AggregateEntry>> | null = null;

  // Cache for localStorage mode to avoid re-parsing on every read
  private cache: StorageEnvelope | null = null;
  private cacheInvalidated = true;

  private storageListener: ((e: StorageEvent) => void) | null = null;

  constructor(config?: LocalStorageProviderConfig) {
    this.namespace = config?.namespace ?? DEFAULT_NAMESPACE;
    this.storageCap = config?.storageCap ?? DEFAULT_STORAGE_CAP;

    // Detect localStorage availability (R4)
    if (this.isLocalStorageAvailable()) {
      this.mode = "localStorage";
      this.setupStorageListener();
    } else {
      this.mode = "memory";
      this.memoryStore = new Map();
    }
  }

  record(packet: TransitionPacket): void {
    try {
      if (this.mode === "memory") {
        this.recordMemory(packet);
      } else {
        this.recordLocalStorage(packet);
      }
    } catch {
      // FR-009: silenced
    }
  }

  query(stateKey: StateKey): FrequencyEntry[] {
    try {
      if (this.mode === "memory") {
        return this.queryMemory(stateKey);
      }
      return this.queryLocalStorage(stateKey);
    } catch {
      return [];
    }
  }

  flush(): void {
    try {
      if (this.mode === "memory") {
        this.memoryStore?.clear();
      } else {
        localStorage.removeItem(this.namespace);
        this.cache = null;
        this.cacheInvalidated = true;
      }
    } catch {
      // FR-009: silenced
    }
  }

  // ─── localStorage mode ──────────────────────────────────────────────────

  private recordLocalStorage(packet: TransitionPacket): void {
    const envelope = this.readEnvelope();
    const stateMap = envelope.data[packet.stateKey] ??= {};
    const existing = stateMap[packet.normalizedSelector];

    if (existing) {
      existing.d = (existing.d * existing.c + packet.dwellTime) / (existing.c + 1);
      existing.c += 1;
      existing.t = Date.now();
    } else {
      stateMap[packet.normalizedSelector] = {
        c: 1,
        d: packet.dwellTime,
        t: Date.now(),
      };
    }

    this.writeEnvelope(envelope);
    this.evictIfNeeded(envelope);
  }

  private queryLocalStorage(stateKey: StateKey): FrequencyEntry[] {
    const envelope = this.readEnvelope();
    return this.extractEntries(envelope, stateKey);
  }

  private readEnvelope(): StorageEnvelope {
    if (!this.cacheInvalidated && this.cache) {
      return this.cache;
    }

    try {
      const raw = localStorage.getItem(this.namespace);
      if (raw === null) {
        return this.freshEnvelope();
      }

      const parsed = JSON.parse(raw);

      // Corruption recovery (T012)
      if (!this.isValidEnvelope(parsed)) {
        return this.freshEnvelope();
      }

      this.cache = parsed;
      this.cacheInvalidated = false;
      return parsed;
    } catch {
      // Invalid JSON — discard and reinitialize
      return this.freshEnvelope();
    }
  }

  private writeEnvelope(envelope: StorageEnvelope): void {
    const serialized = JSON.stringify(envelope);
    localStorage.setItem(this.namespace, serialized);
    this.cache = envelope;
    this.cacheInvalidated = false;
  }

  private freshEnvelope(): StorageEnvelope {
    const envelope: StorageEnvelope = { v: CURRENT_SCHEMA_VERSION, data: {} };
    this.cache = envelope;
    this.cacheInvalidated = false;
    return envelope;
  }

  // ─── Validation (T012) ────────────────────────────────────────────────────

  private isValidEnvelope(parsed: unknown): parsed is StorageEnvelope {
    if (typeof parsed !== "object" || parsed === null) return false;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.v !== "number") return false;
    if (obj.v !== CURRENT_SCHEMA_VERSION) return false; // Future version = corrupt
    if (typeof obj.data !== "object" || obj.data === null) return false;
    return true;
  }

  // ─── Eviction (T011) ─────────────────────────────────────────────────────

  private evictIfNeeded(envelope: StorageEnvelope): void {
    let serialized = JSON.stringify(envelope);

    while (serialized.length > this.storageCap) {
      const stateKeys = Object.keys(envelope.data);
      if (stateKeys.length === 0) break;

      if (stateKeys.length === 1) {
        // Single stateKey exceeds cap — evict its least-recently-updated selectors
        this.evictSelectorsFromState(envelope, stateKeys[0]);
      } else {
        // Find stateKey with oldest max lastSeenTimestamp
        let oldestKey = stateKeys[0];
        let oldestTimestamp = this.maxTimestamp(envelope.data[oldestKey]);

        for (let i = 1; i < stateKeys.length; i++) {
          const ts = this.maxTimestamp(envelope.data[stateKeys[i]]);
          if (ts < oldestTimestamp) {
            oldestTimestamp = ts;
            oldestKey = stateKeys[i];
          }
        }

        delete envelope.data[oldestKey];
      }

      serialized = JSON.stringify(envelope);
    }

    // Write back after eviction
    this.writeEnvelope(envelope);
  }

  private evictSelectorsFromState(
    envelope: StorageEnvelope,
    stateKey: string,
  ): void {
    const selectorMap = envelope.data[stateKey];
    if (!selectorMap) return;

    const selectors = Object.entries(selectorMap).sort(
      ([, a], [, b]) => a.t - b.t,
    );

    // Remove the oldest selector
    if (selectors.length > 0) {
      delete selectorMap[selectors[0][0]];
    }

    // If empty, remove the stateKey entirely
    if (Object.keys(selectorMap).length === 0) {
      delete envelope.data[stateKey];
    }
  }

  private maxTimestamp(
    selectorMap: Record<string, AggregateEntry>,
  ): number {
    let max = 0;
    for (const entry of Object.values(selectorMap)) {
      if (entry.t > max) max = entry.t;
    }
    return max;
  }

  // ─── In-memory fallback (T013) ────────────────────────────────────────────

  private recordMemory(packet: TransitionPacket): void {
    let selectorMap = this.memoryStore!.get(packet.stateKey);
    if (!selectorMap) {
      selectorMap = new Map();
      this.memoryStore!.set(packet.stateKey, selectorMap);
    }

    const existing = selectorMap.get(packet.normalizedSelector);
    if (existing) {
      existing.d = (existing.d * existing.c + packet.dwellTime) / (existing.c + 1);
      existing.c += 1;
      existing.t = Date.now();
    } else {
      selectorMap.set(packet.normalizedSelector, {
        c: 1,
        d: packet.dwellTime,
        t: Date.now(),
      });
    }
  }

  private queryMemory(stateKey: StateKey): FrequencyEntry[] {
    const selectorMap = this.memoryStore?.get(stateKey);
    if (!selectorMap) return [];

    const entries: FrequencyEntry[] = [];
    for (const [sel, agg] of selectorMap) {
      entries.push({
        selector: sel as NormalizedSelector,
        count: agg.c,
        avgDwellTime: agg.d,
        lastSeenTimestamp: agg.t,
      });
    }

    return entries.sort((a, b) => b.count - a.count);
  }

  // ─── Shared ───────────────────────────────────────────────────────────────

  private extractEntries(
    envelope: StorageEnvelope,
    stateKey: StateKey,
  ): FrequencyEntry[] {
    const selectorMap = envelope.data[stateKey as string];
    if (!selectorMap) return [];

    const entries: FrequencyEntry[] = [];
    for (const [sel, agg] of Object.entries(selectorMap)) {
      entries.push({
        selector: sel as NormalizedSelector,
        count: agg.c,
        avgDwellTime: agg.d,
        lastSeenTimestamp: agg.t,
      });
    }

    return entries.sort((a, b) => b.count - a.count);
  }

  // ─── Availability detection (T013) ────────────────────────────────────────

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = `${this.namespace}:__probe__`;
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // ─── Cross-tab handling (T014) ────────────────────────────────────────────

  private setupStorageListener(): void {
    if (typeof window === "undefined") return;

    this.storageListener = (e: StorageEvent) => {
      if (e.key === this.namespace) {
        this.cacheInvalidated = true;
        this.cache = null;
      }
    };

    window.addEventListener("storage", this.storageListener);
  }

  dispose(): void {
    if (this.storageListener && typeof window !== "undefined") {
      window.removeEventListener("storage", this.storageListener);
      this.storageListener = null;
    }
  }
}
