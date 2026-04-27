# Homelab

Proxmox-based homelab on a Topton N5105 (64GB RAM, 2x 256GB NVMe, 3x 12TB SATA).

## Stack

| Service | Type | IP | Purpose |
|---|---|---|---|
| Proxmox | bare metal | `192.168.50.10` | Hypervisor |
| AdGuard Home | LXC 101 | `192.168.50.11` | DNS + ad blocking |
| TrueNAS | VM 102 | `192.168.50.12` | Storage (temporary, replaced in Phase 3) |
| Caddy | LXC 103 | `192.168.50.13` | Reverse proxy + TLS |

Internal domain: `jax.bravegeek.com`

All hostnames resolve locally via AdGuard Home. The wildcard cert (`*.jax.bravegeek.com`) is issued by Let's Encrypt via DNS-01 challenge against Route53 and managed automatically by Caddy.

## Setup

### Prerequisites

**SSH key access to Proxmox**

The scripts SSH into the Proxmox host as root. Confirm this works before running anything:

```bash
ssh root@192.168.50.10 echo ok
```

If it prompts for a password instead of succeeding silently, copy your public key to Proxmox first:

```bash
ssh-copy-id root@192.168.50.10
```

**AWS CLI**

Install and authenticate via SSO:

```bash
aws configure sso
aws sso login --profile <your-profile>
```

The scripts need permissions to create IAM users and policies, and to list Route53 hosted zones. Admin access covers all of this.

**python3** must be available locally (used for JSON parsing in `phase2-ssl.sh`).

---

### Phase 1: DNS

```bash
cd scripts
cp config.sh.example config.sh
# edit config.sh — all values should match what's established in docs/homelab-plan.md
./phase1-dns.sh
```

The script:
1. Downloads a Debian 12 LXC template if not already present
2. Creates and starts the AdGuard Home LXC at `192.168.50.11`
3. Installs AdGuard Home and starts the service
4. Prints the DNS rewrites and upstream servers to configure

Complete the first-run wizard at `http://192.168.50.11:3000`, then follow the printed instructions.

**If the script fails partway through**, fix the issue and re-run — all steps are idempotent.

**If you're on KDE/Plasma**, `ksshaskpass` may intercept SSH prompts and cause authentication failures. The scripts suppress this automatically via `SSH_ASKPASS_REQUIRE=never`. If you hit auth issues before the script has run, push your key to the LXC manually via Proxmox (no direct SSH needed):

```bash
cat ~/.ssh/id_ed25519.pub | ssh root@192.168.50.10 \
  "pct exec 101 -- bash -c 'mkdir -p /root/.ssh && chmod 700 /root/.ssh && cat >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys'"
```

Then re-run the script.

---

### Phase 2: Reverse Proxy + SSL

```bash
./phase2-ssl.sh
```

The script:
1. Creates IAM user `homelab-caddy-dns` with Route53 write access scoped to `bravegeek.com`
2. Creates the Caddy LXC at `192.168.50.13`
3. Installs Caddy (pre-built binary with Route53 DNS module)
4. Writes AWS credentials to `/etc/caddy/aws.env` on the LXC (mode 640, root:caddy)
5. Writes and validates the Caddyfile, then starts the service

After the script completes:
- Add `proxy.jax.bravegeek.com → 192.168.50.13` as a DNS rewrite in AdGuard Home
- Monitor cert issuance: `ssh root@192.168.50.13 journalctl -fu caddy`
- Cert issuance takes ~30 seconds

> **Note:** Re-running `phase2-ssl.sh` rotates the IAM access key — the old key is deleted before a new one is created and deployed.

---

### Phase 3: Storage Migration

See `docs/homelab-plan.md`. Not scripted yet.

---

## Services

| Hostname | Backend |
|---|---|
| `proxmox.jax.bravegeek.com` | Proxmox UI (`:8006`) |
| `dns.jax.bravegeek.com` | AdGuard Home (`:3000`) |
| `truenas.jax.bravegeek.com` | TrueNAS (temporary) |

All traffic goes through Caddy. Proxmox uses a self-signed cert internally — Caddy proxies it with `tls_insecure_skip_verify` on the upstream connection (LAN only).

## Secrets

See `docs/secrets-hygiene.md`. Key points:

- `scripts/config.sh` is gitignored — never committed
- `/etc/caddy/aws.env` lives on the LXC only — never in the repo
- A gitleaks pre-commit hook blocks credential commits

## Scripts

```
scripts/
├── lib.sh              shared functions
├── config.sh.example   copy to config.sh and fill in values
├── phase1-dns.sh       AdGuard Home LXC
└── phase2-ssl.sh       AWS IAM + Caddy LXC
```

All scripts are idempotent — safe to re-run. They execute on your local machine and SSH into Proxmox/LXCs as needed.

## Docs

- `docs/homelab-plan.md` — full phased plan with rationale
- `docs/secrets-hygiene.md` — what's gitignored and why
