## Why

`phase1-dns.sh` has a split-vantage-point architecture: Proxmox container management (via `pct` over SSH) and network-level readiness checks (local ping/SSH) are interleaved without ensuring they agree. This makes the script silently fail when run from any machine not on the `192.168.50.x` subnet, and hides `pct start` failures behind misleading timeout errors.

## What Changes

- Replace the `nohup &` fire-and-forget `pct start` with a synchronous call + Proxmox-side status poll (eliminates silent failure)
- Replace local-machine `ping` in `wait_for_lxc_network` with a Proxmox-side `pct status` poll (consistent vantage point, works from any machine)
- Add `set -euo pipefail` to the `install_adguard` heredoc (stops silent apt/curl failures)
- Update `check_prereqs` to surface SSH errors rather than suppressing them via `2>/dev/null`

## Capabilities

### New Capabilities

- `lxc-start-wait`: Reliable, synchronous LXC start that polls Proxmox for container running state and surfaces errors before proceeding

### Modified Capabilities

*(none — no spec-level behavior changes; all changes are correctness and reliability fixes to existing script behavior)*

## Impact

- `scripts/phase1-dns.sh`: `start_lxc`, `wait_for_lxc_network`, `check_prereqs` functions modified
- `scripts/lib.sh`: `wait_for_lxc_network` replaced with a Proxmox-side poller; `install_adguard` heredoc updated
- No changes to config, network topology, or installed software
- Script becomes runnable from any machine with SSH access to Proxmox, not just machines on `192.168.50.x`
