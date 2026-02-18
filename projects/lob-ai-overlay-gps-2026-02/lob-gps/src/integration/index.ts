import { Mapper } from "../mapper/index.js";
import { Telemetry } from "../telemetry/index.js";
import { LocalStorageProvider } from "../telemetry/local-storage-provider.js";
import { Engine } from "../engine/index.js";
import { OverlayUI } from "../ui/index.js";
import { Pipeline } from "./pipeline.js";
import { ErrorBuffer } from "./error-buffer.js";
import { parseCombo, attach } from "./kill-switch.js";
import {
  resolveConfig,
  extractMapperConfig,
  extractUIConfig,
} from "./config-resolver.js";
import { LobGPSState } from "./types.js";
import type { LobGPSConfig, ResolvedConfig } from "./types.js";
import type { TelemetryProvider } from "../telemetry/types.js";

const VERSION = "0.1.0";

export class LobGPS {
  readonly version: string = VERSION;

  private state = LobGPSState.ACTIVE;
  private config: ResolvedConfig;
  private readonly errorBuffer = new ErrorBuffer();

  private readonly telemetry: Telemetry;
  private readonly provider: TelemetryProvider;
  private mapper: Mapper | null = null;
  private engine: Engine | null = null;
  private ui: OverlayUI | null = null;
  private pipeline: Pipeline | null = null;
  private killSwitchController: AbortController | null = null;

  constructor(inputConfig?: LobGPSConfig) {
    this.config = resolveConfig(inputConfig ?? {});

    // Create shared TelemetryProvider
    this.provider =
      this.config.telemetryProvider ??
      new LocalStorageProvider({
        storageCap: this.config.storageCap,
        namespace: this.config.namespace,
      });

    // Telemetry persists across disable/enable cycles (FR-014)
    this.telemetry = new Telemetry({ provider: this.provider });

    this.initModules();
    this.attachKillSwitch();
  }

  get isActive(): boolean {
    return this.state === LobGPSState.ACTIVE;
  }

  get errors(): readonly Error[] {
    return this.errorBuffer.toArray();
  }

  disable(): void {
    if (this.state !== LobGPSState.ACTIVE) return;
    this.state = LobGPSState.DISABLED;
    this.teardownModules();
    this.detachKillSwitch();
  }

  enable(): void {
    if (this.state !== LobGPSState.DISABLED) return;
    this.state = LobGPSState.ACTIVE;
    this.initModules();
    this.attachKillSwitch();
  }

  configure(options: Partial<LobGPSConfig>): void {
    if (this.state !== LobGPSState.ACTIVE) return;
    this.config = resolveConfig({ ...this.config, ...options } as LobGPSConfig);
    this.pipeline?.updateConfig(this.config);
  }

  teardown(): void {
    if (this.state === LobGPSState.TORN_DOWN) return;
    this.teardownModules();
    this.detachKillSwitch();
    this.telemetry.teardown();
    this.state = LobGPSState.TORN_DOWN;
  }

  reportError(err: Error): void {
    this.errorBuffer.push(err);

    if (this.config.onError) {
      try {
        this.config.onError(err);
      } catch {
        // onError callback failure is silenced (double try-catch)
      }
    }

    if (this.config.debug) {
      console.warn("[LobGPS]", err);
    }
  }

  private attachKillSwitch(): void {
    this.killSwitchController = new AbortController();
    const descriptor = parseCombo(this.config.killSwitch);
    attach(descriptor, () => this.disable(), this.killSwitchController.signal);
  }

  private detachKillSwitch(): void {
    if (this.killSwitchController) {
      this.killSwitchController.abort();
      this.killSwitchController = null;
    }
  }

  private initModules(): void {
    this.mapper = new Mapper(extractMapperConfig(this.config));

    this.engine = new Engine({
      telemetryProvider: this.provider,
      maxSuggestions: this.config.maxSuggestions,
      curatedPaths: this.config.curatedPaths,
    });

    this.ui = new OverlayUI(extractUIConfig(this.config));

    this.pipeline = new Pipeline({
      mapper: this.mapper,
      telemetry: this.telemetry,
      engine: this.engine,
      ui: this.ui,
      config: this.config,
      errorReporter: (error) => this.reportError(error),
      onAutoDisable: () => {
        this.reportError(new Error("Auto-disabled after consecutive errors"));
        this.disable();
      },
    });

    this.pipeline.start();
    this.mapper.observe();
  }

  private teardownModules(): void {
    this.pipeline?.stop();
    this.pipeline = null;
    this.ui?.teardown();
    this.ui = null;
    this.engine = null;
    this.mapper?.teardown();
    this.mapper = null;
  }
}
