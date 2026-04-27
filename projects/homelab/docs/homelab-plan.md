# Home Lab Plan

## Stack Overview

- **Hypervisor:** Proxmox (bare metal)
- **DNS / Ad blocking:** AdGuard Home (LXC)
- **Reverse proxy + SSL:** Caddy (LXC) — config-file driven, handles cert lifecycle automatically
- **File sharing:** NFS (Proxmox host or lightweight LXC)
- **Object storage:** MinIO LXC (S3-compatible API)
- **Cloud backup:** restic / rclone (future)
- **Hardware:** Topton N5105 · 64GB DDR4 · 2x 256GB NVMe · 3x HGST 12TB SATA · Jonsbo N1

## Domain

Internal domain: `jax.bravegeek.com`

All hostnames resolve locally via AdGuard Home. A records never appear in public DNS — only the wildcard cert (`*.jax.bravegeek.com`) shows up in CT logs, which is normal and harmless.

```
proxmox.jax.bravegeek.com  → 192.168.50.10
dns.jax.bravegeek.com      → 192.168.50.11
truenas.jax.bravegeek.com  → 192.168.50.12  (temporary, until Phase 3)
proxy.jax.bravegeek.com    → 192.168.50.x   (assign when Phase 2 LXC is created)
```

---

## Phase 1: DNS

**Goal:** Stable, authoritative local DNS. Everything else depends on this.

- [ ] Stand up AdGuard Home as an LXC at `192.168.50.11`
  - Pi-hole considered and rejected — local DNS record handling is brittle (dnsmasq bolt-on)
  - AdGuard Home has first-class local DNS, DoH/DoT upstream support, single binary
- [ ] Configure AdGuard Home upstream DNS (DoH recommended — set in `AdGuardHome.yaml`)
- [ ] Add local A records (see Domain section above)
- [ ] Configure Merlin on RT-AX86U Pro to set `192.168.50.11` as DNS for all DHCP clients
- [ ] Verify all LAN clients resolve `proxmox.jax.bravegeek.com` correctly

**Script:** `scripts/phase1-dns.sh`

---

## Phase 2: Reverse Proxy + SSL

**Goal:** Single SSL termination point, no browser warnings, fully automated cert lifecycle.

Phases 2 and 3 (from original plan) are merged — standing up the proxy and getting the cert are one operation.

### Cert strategy

Caddy handles cert issuance and renewal automatically via DNS-01 challenge against Route53. No acme.sh needed.

- Caddy downloaded via the official download API with the `caddy-dns/route53` module included — no build step, no Go required
- Wildcard cert: `*.jax.bravegeek.com` — Caddy requests from Let's Encrypt, renews automatically
- ACM (AWS Certificate Manager) issues free certs but keys are AWS-locked, not exportable — not usable here
- All services including Proxmox web UI route through Caddy — no per-service cert handling
  - Proxmox WebSocket (console/shell) works through Caddy with correct headers

### AWS credentials for Caddy

Caddy needs Route53 write access to place DNS-01 TXT records during cert issuance and renewal.

- Dedicated IAM user: `homelab-caddy-dns` (one user per service, least privilege)
- IAM policy: Route53 write scoped to `bravegeek.com` hosted zone only — see `secrets-hygiene.md`
- Credentials stored in `/etc/caddy/aws.env` (mode 640, root:caddy) — loaded via systemd `EnvironmentFile`
- **The phase2 script handles all AWS work** — runs from your local machine using your existing AWS CLI credentials:
  - Looks up the `bravegeek.com` hosted zone ID automatically
  - Creates `homelab-caddy-dns` IAM user (idempotent — skips if exists)
  - Creates and attaches the scoped policy
  - Generates access key
  - SSHes credentials onto the LXC as `/etc/caddy/aws.env`
  - Your admin credentials never leave your local machine

### Tasks

- [ ] Assign IP for proxy LXC (update Domain section above)
- [ ] Stand up Caddy LXC
- [ ] Run `phase2-ssl.sh` — handles AWS IAM setup, Caddy download, Caddyfile, systemd unit
- [ ] Add proxy A record to AdGuard Home
- [ ] Verify `*.jax.bravegeek.com` cert is valid and auto-renewing
- [ ] Route all web UIs through Caddy

Caddy is installed by downloading a pre-built binary from the official Caddy download API with the Route53 module included. No Go installation or build step required.

**Script:** `scripts/phase2-ssl.sh`

---

## Phase 3: Storage Migration

**Goal:** Remove TrueNAS VM, manage ZFS natively on Proxmox, reclaim RAM.

### Controller Fix (do first)

- [ ] Audit which drives are on which SATA controller
- [ ] Reorganize so each leg of the mirror is on a *different* controller
  - Currently both mirror drives share one controller — single point of failure
- [ ] Scratch drive can stay on either controller

### ZFS on Proxmox

- [ ] Decommission TrueNAS VM
- [ ] Create ZFS mirror pool on the 2x 12TB drives natively in Proxmox
- [ ] Create ZFS dataset for scratch on the 3rd 12TB drive
- [ ] Configure scrub schedule and ZFS ARC limits
  - 64GB RAM is plenty — target ~12GB ARC for a ~12TB usable pool

### NFS Shares

- [ ] Expose ZFS datasets via NFS — native Linux-to-Linux protocol
- [ ] Configure exports on the Proxmox host or a lightweight Debian LXC
- [ ] Mount shares on LXC clients via `/etc/fstab` or `autofs`
- [ ] Keep UIDs consistent across LXCs to avoid permissions headaches

### MinIO (S3-Compatible Object Storage)

- [ ] Stand up MinIO as a dedicated LXC
- [ ] Point MinIO at ZFS dataset(s) for backing storage
- [ ] Provides S3-compatible API for any app that supports it
- [ ] NFS and MinIO coexist — different use cases, same underlying storage

---

## Phase 4: Cloud Backup

**Goal:** Off-site backup for critical data. Not urgent, worth planning for.

- [ ] Evaluate storage targets:
  - **Backblaze B2** — cheapest egress, S3-compatible API
  - **Cloudflare R2** — no egress fees, S3-compatible
  - **AWS S3** — more features, higher cost
- [ ] Set up `restic` or `rclone` against ZFS datasets on Proxmox
- [ ] Optionally configure MinIO bucket replication to cloud target
- [ ] Define backup schedule and retention policy

---

## Notes

- Phase 1 gates everything — get DNS solid first
- Phases 1 and 2 are tightly coupled; don't add services until both are done
- Phase 3 is largely independent once Phase 2 is done
- Phase 4 is whenever — prioritize local infrastructure stability first
- TrueNAS VM can stay running and untouched until Phase 3 begins
- If Caddy LXC goes down, Proxmox UI is still reachable by IP (browser warning, but functional)

## Scripts

Repeatable shell scripts live in `scripts/`. Each script is idempotent — safe to re-run. Scripts run from your local machine over SSH; your machine needs AWS CLI configured with admin credentials for Phase 2 IAM setup.

```
scripts/
├── lib.sh            ← shared functions: logging, SSH helpers, idempotency checks
├── phase1-dns.sh     ← AdGuard Home LXC setup and config
├── phase2-ssl.sh     ← Caddy LXC, xcaddy build, AWS IAM setup, Caddyfile, systemd
└── phase3-storage.sh ← ZFS pool, NFS exports, MinIO LXC
```

See `secrets-hygiene.md` for how sensitive values are kept out of scripts and the repo.
