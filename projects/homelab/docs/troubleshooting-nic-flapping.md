# Troubleshooting: Proxmox Unreachable After Router Reboot

**Date:** 2026-04-29  
**Hardware:** Topton N5105, Intel i225/i226 NIC (`enp4s0`, driver: `igc`)  
**Router:** ASUS RT-AX86U Pro (Merlin firmware)

---

## Symptom

Proxmox (`192.168.50.10`) and all LXC containers become simultaneously unreachable after:
- Router reboots (any reason — settings save, power cycle, firmware update)
- Any extended link loss on `enp4s0` (>~4 seconds)

The only recovery is a physical reboot of the Proxmox server.

---

## Root Cause

The Intel `igc` driver (used by i225/i226 NICs) has a known bug where it does not recover from extended link loss. After the physical link goes down for more than a few seconds, the driver gets stuck. The interface appears `UP` in software but passes no traffic. `ip link` and `ethtool` show the interface as active; the NIC is not.

This affects all traffic through `vmbr0`, which bridges `enp4s0`. When `enp4s0` is stuck, both Proxmox itself and all LXC containers (which share the same bridge) become unreachable at the same IP layer.

---

## Why It Started When Switching from Pi-hole to AdGuard

The problem predates AdGuard — it's the `igc` driver bug, not the DNS software. The switch to AdGuard is coincidental in that it required changing the router's DHCP DNS from `192.168.50.14` to `192.168.50.11`, which required saving router network settings. The RT-AX86U Pro triggers a full link renegotiation (link down for 4–10 seconds) when network settings are saved. That's the trigger, not AdGuard itself.

Pi-hole ran at `.14` so no router change was needed — the bug was always present, just never triggered.

---

## What Was Ruled Out

| Hypothesis | Verdict |
|---|---|
| EEE (Energy Efficient Ethernet) causing brief link drops | Ruled out — already disabled on `enp4s0` before this issue was investigated |
| Forcing autoneg off | Not possible — 2.5GBASE-T standard mandates autoneg; `ethtool -s enp4s0 autoneg off` exits 0 but is silently ignored by `igc` |
| NIC flap duration too short — 4s downdelay with bonding would help | Tangential — bonding adds debounce for short drops, but igc doesn't recover from longer drops regardless. Any router reboot causes >60s link loss. |
| AdGuard causing the problem | No — Proxmox became unreachable before AdGuard itself was pinged; both hosts went dark simultaneously, consistent with shared NIC, not DNS failure |

---

## Diagnostic Evidence

### Simultaneous unreachability pattern

When the router rebooted after saving DNS settings:

```
192.168.50.1   (router)    → reachable immediately after reboot
192.168.50.10  (proxmox)   → unreachable (NIC stuck)
192.168.50.11  (adguard)   → unreachable (same NIC, same bridge)
```

Both `.10` and `.11` going dark together confirms a bridge/NIC failure, not a per-host issue.

### Journal evidence

Proxmox system journal showed:
```
systemd-journald[...]: System journal corrupted or uncleanly shut down — journal file rotated
```

This pattern appears each time Proxmox was forcibly rebooted. There are no graceful shutdown entries before these rotations.

### igc link events in journal

Router-triggered link events appeared in the Proxmox journal as `igc 0000:04:00.0 enp4s0: NIC Link is Down` followed by `NIC Link is Up 2500 Mbps` — but after an extended down period, the `Link is Up` event either doesn't fire or the driver fails to fully reinitialize packet processing.

---

## Workaround: NIC Recovery Watchdog

A systemd timer that detects when `enp4s0` is stuck and cycles it. "Stuck" is defined as: interface is operationally down, OR carrier is present but the interface hasn't been receiving packets for N seconds.

Simple version (detect operstate down, cycle the interface):

```bash
#!/bin/bash
# /usr/local/bin/igc-watchdog.sh

IFACE="enp4s0"
OPERSTATE=$(cat /sys/class/net/${IFACE}/operstate 2>/dev/null)

if [ "${OPERSTATE}" != "up" ]; then
    logger -t igc-watchdog "${IFACE} operstate=${OPERSTATE}, cycling interface"
    ip link set "${IFACE}" down
    sleep 2
    ip link set "${IFACE}" up
fi
```

Run every 30 seconds via systemd timer. This won't help while the server is unreachable (can't SSH in to run anything), but it will recover automatically without requiring a physical reboot.

**Status:** Not yet implemented. Physical reboot is required to recover each occurrence until this is deployed.

---

## Permanent Fix Options

1. **Deploy the watchdog** — covers the igc bug without hardware changes. Implemented as a systemd timer, runs every 30s, costs nothing.

2. **Kernel / firmware update** — the igc driver bug is known upstream. Check if a newer Proxmox kernel or NIC firmware version has the fix before deploying the watchdog.

3. **Replace the NIC** — swap the i225/i226 for a Realtek or Intel X550 that doesn't have this recovery bug. The N5105 has a PCIe slot; a 2.5G card is ~$20. Most reliable long-term fix if the kernel fix doesn't materialize.

4. **Reduce router link renegotiations** — the RT-AX86U Pro renegotiates the link when network settings are saved. If settings changes can be batched rather than saved one at a time, the number of triggers is reduced. Not a fix, just risk reduction.

---

## Next Steps

1. Physical reboot to restore access (done)
2. Implement and deploy the watchdog script + systemd timer
3. Check for updated igc firmware or Proxmox kernel with the fix
