import { LobGPS } from "./integration/index.js";
import type { LobGPSConfig } from "./integration/types.js";

const GUARD = Symbol.for("lob-gps:init");

function boot(): void {
  // Duplicate detection (FR-004)
  if ((window as unknown as Record<symbol, unknown>)[GUARD]) return;

  // Read pre-existing config from window.LobGPS (FR-016)
  const preExisting = (window as unknown as Record<string, unknown>).LobGPS;
  const config: LobGPSConfig =
    preExisting && typeof preExisting === "object" && !("version" in preExisting)
      ? { ...(preExisting as LobGPSConfig) }
      : {};

  const instance = new LobGPS(config);

  // Replace window.LobGPS with API proxy
  (window as unknown as Record<string, unknown>).LobGPS = {
    get version() {
      return instance.version;
    },
    get isActive() {
      return instance.isActive;
    },
    get errors() {
      return instance.errors;
    },
    enable: () => instance.enable(),
    disable: () => instance.disable(),
    configure: (options: Partial<LobGPSConfig>) => instance.configure(options),
    teardown: () => instance.teardown(),
  };

  // Set guard symbol
  (window as unknown as Record<symbol, unknown>)[GUARD] = true;
}

// Wait for DOMContentLoaded if document is still loading
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
