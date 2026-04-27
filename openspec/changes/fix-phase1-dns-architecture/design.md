## Context

`phase1-dns.sh` creates and configures an AdGuard Home LXC on Proxmox. It is designed to run from a local machine over SSH. The current implementation uses two distinct execution contexts:

1. **Proxmox control plane** — `ssh_proxmox pct ...` commands that talk to Proxmox's container management API
2. **Network/local-machine vantage** — `ping` and `ssh root@<lxc-ip>` that require the local machine to have direct L3 access to `192.168.50.x`

The split works on the developer's home workstation (which is on `192.168.50.x`) but is silently broken from any other machine (e.g., a laptop over VPN, a CI runner, a different subnet). It also swallows `pct start` failures entirely.

## Goals / Non-Goals

**Goals:**
- `pct start` failures surface immediately with Proxmox's error message
- Container readiness is verified via Proxmox (not local ping), so the script works from any machine with SSH to Proxmox
- Errors inside the AdGuard install heredoc abort the script rather than being silently ignored
- `check_prereqs` shows the actual SSH error on failure

**Non-Goals:**
- Routing LXC SSH through Proxmox (local `ssh_lxc` calls remain direct — that's an optional future improvement)
- Changes to network topology, AdGuard config, or the phase2 script
- Supporting machines that have no direct route to `192.168.50.x` for the final `install_adguard` phase (the heredoc SSH still goes direct; this fix only affects the *container lifecycle* phase)

## Decisions

### 1. Replace `nohup &` with synchronous `pct start` + Proxmox poll

**Current:** `ssh_proxmox "nohup pct start ${DNS_CTID} </dev/null >/dev/null 2>&1 &"` — fires and forgets, swallows exit code.

**Decision:** Run `pct start` synchronously, then poll `pct status` until `running`:

```bash
start_lxc() {
    if lxc_running "$DNS_CTID"; then
        log "LXC ${DNS_CTID} already running"; return
    fi
    log "Starting LXC ${DNS_CTID}..."
    ssh_proxmox pct start "${DNS_CTID}"
}
```

`pct start` returns quickly (~2s) once Proxmox has accepted the command. The container state is then polled via `wait_for_lxc_running` (see below).

**Alternatives considered:**
- Keep `nohup &` but capture PID and poll — overly complex, no benefit
- Use `pct wait` — available in newer Proxmox versions but not universally; polling `pct status` is more portable

### 2. Replace `wait_for_lxc_network` (local ping) with `wait_for_lxc_running` (Proxmox poll)

**Current:** `ping -c 1 -W 2 "${ip}"` from local machine — breaks if local machine can't reach the LXC subnet.

**Decision:** Poll `pct status <ctid>` via `ssh_proxmox` until output contains `running`:

```bash
wait_for_lxc_running() {
    local ctid=$1
    log "Waiting for LXC ${ctid} to reach running state..."
    for i in $(seq 1 30); do
        ssh_proxmox pct status "${ctid}" 2>/dev/null | grep -q "running" && return 0
        sleep 2
    done
    die "Timed out waiting for LXC ${ctid} to start — check: ssh ${PROXMOX_USER}@${PROXMOX_HOST} pct status ${ctid}"
}
```

This uses only the Proxmox SSH vantage point. Once the container is `running` from Proxmox's perspective, `pct push`/`pct exec` (used in `lxc_push_pubkey`) are guaranteed to work.

The local `wait_for_ssh` call that follows still requires direct access to the LXC IP — that's acceptable since it's a pre-condition for `install_adguard` anyway (which also SSHes directly). The key fix is that the *container lifecycle* phase (create → start → push key) no longer depends on local network access.

### 3. Add `set -euo pipefail` to the `install_adguard` heredoc

The heredoc passed to `bash -s` on the LXC runs without any error trapping. A failed `apt-get install` or `curl` silently continues.

**Decision:** Prepend `set -euo pipefail` as the first line of the heredoc.

### 4. Surface SSH errors in `check_prereqs`

**Current:** `ssh_proxmox true 2>/dev/null` — stderr suppressed, user sees only the `die` message.

**Decision:** Remove the `2>/dev/null` so SSH error output (wrong key, unknown host, etc.) appears before the die message.

## Risks / Trade-offs

- **`pct status` output format** — The grep for `running` matches `status: running` from Proxmox 7/8 output. If a future Proxmox version changes this string, the poll would time out. Mitigation: the timeout error message includes the exact command to run manually for diagnosis.
- **`set -euo pipefail` in heredoc** — Pipefail may cause surprising exits if AdGuard's install script uses pipes internally. Mitigation: the AdGuard install script is a well-maintained official script; if it fails, failing loudly is the correct behavior.
- **`check_prereqs` stderr now visible** — SSH might print host-key warnings on first connection. This is more informative, not less. Not a risk.

## Migration Plan

1. Apply changes to `lib.sh` and `phase1-dns.sh`
2. Re-run the script against an existing Proxmox host — idempotency checks (`lxc_exists`, `lxc_running`, `test -f /opt/AdGuardHome/AdGuardHome`) ensure a re-run is safe
3. No rollback needed — these are pure correctness fixes with no behavior change on the happy path

## Open Questions

- Should `wait_for_ssh` also be moved to use a Proxmox-side check (e.g., `pct exec` to test sshd)? Left out of scope for now — the direct SSH check is acceptable once the container lifecycle phase is clean.
