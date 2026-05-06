## 1. lib.sh — Replace wait_for_lxc_network with Proxmox-side poll

- [x] 1.1 Add `wait_for_lxc_running` function to `lib.sh` that polls `ssh_proxmox pct status <ctid>` until output contains `running`, with 30×2s timeout and a diagnostic error message
- [x] 1.2 Remove (or rename) the existing `wait_for_lxc_network` ping-based function from `lib.sh`

## 2. phase1-dns.sh — Fix start_lxc

- [x] 2.1 Replace the `nohup ... &` line in `start_lxc` with a synchronous `ssh_proxmox pct start "${DNS_CTID}"`
- [x] 2.2 Replace the `wait_for_lxc_network "${ADGUARD_IP}"` call in `main()` with `wait_for_lxc_running "${DNS_CTID}"`

## 3. phase1-dns.sh — Fix install_adguard heredoc

- [x] 3.1 Add `set -euo pipefail` as the first line inside the `install_adguard` heredoc

## 4. phase1-dns.sh — Fix check_prereqs stderr suppression

- [x] 4.1 Remove `2>/dev/null` from the `ssh_proxmox true` call in `check_prereqs` so SSH errors are visible

## 5. Smoke test

- [x] 5.1 Run `bash -n scripts/lib.sh && bash -n scripts/phase1-dns.sh` to verify no syntax errors
- [ ] 5.2 Verify the script is idempotent by re-running against an already-configured Proxmox host (all steps should skip cleanly)
