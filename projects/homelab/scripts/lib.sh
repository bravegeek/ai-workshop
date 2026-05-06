#!/bin/bash
set -euo pipefail

# Prevent KDE ksshaskpass from intercepting SSH prompts in terminal scripts
unset SSH_ASKPASS
export SSH_ASKPASS_REQUIRE=never

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

ssh_proxmox() { ssh -n -o ConnectTimeout=10 "${PROXMOX_USER}@${PROXMOX_HOST}" "$@"; }

ssh_lxc() {
    local ip=$1; shift
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "root@${ip}" "$@"
}

lxc_exists()  { ssh_proxmox pct status "$1" >/dev/null 2>&1; }
lxc_running() { local s; s=$(ssh_proxmox pct status "$1" 2>/dev/null) && echo "$s" | grep -q running; }

wait_for_lxc_running() {
    local ctid=$1
    log "Waiting for LXC ${ctid} to reach running state..."
    for i in $(seq 1 10); do
        local status
        status=$(ssh_proxmox pct status "${ctid}" 2>/dev/null)
        log "  LXC ${ctid} status: ${status:-unknown} (attempt ${i}/10)"
        if echo "${status}" | grep -q "running"; then
            return 0
        fi
        sleep 2
    done
    die "Timed out waiting for LXC ${ctid} — check: ssh ${PROXMOX_USER}@${PROXMOX_HOST} pct status ${ctid}"
}


clear_known_host() {
    local ip=$1
    ssh-keygen -f ~/.ssh/known_hosts -R "${ip}" >/dev/null 2>&1 || true
}

# Copies the local SSH public key to a temp path on the Proxmox host and prints
# that path. Pass the printed path to `pct create --ssh-public-keys`; clean it
# up afterward with `ssh_proxmox rm -f <path>`.
stage_pubkey_on_proxmox() {
    local ctid=$1
    local pubkey_file
    for pubkey_file in ~/.ssh/id_ed25519.pub ~/.ssh/id_rsa.pub; do
        [ -f "$pubkey_file" ] && break
        pubkey_file=""
    done
    [ -n "$pubkey_file" ] || die "No SSH public key found at ~/.ssh/id_ed25519.pub or ~/.ssh/id_rsa.pub"
    local remote_path="/tmp/pubkey_${ctid}.tmp"
    scp -q "${pubkey_file}" "${PROXMOX_USER}@${PROXMOX_HOST}:${remote_path}"
    echo "${remote_path}"
}

wait_for_http() {
    local url=$1
    log "Waiting for HTTP on ${url}..."
    for i in $(seq 1 20); do
        curl -sf "${url}" >/dev/null 2>&1 && return 0
        sleep 3
    done
    die "Timed out waiting for HTTP on ${url}"
}

wait_for_ssh() {
    local ip=$1
    log "Waiting for SSH on ${ip}..."
    for i in $(seq 1 30); do
        ssh -o StrictHostKeyChecking=no -o ConnectTimeout=3 -o BatchMode=yes \
            "root@${ip}" true 2>/dev/null && return 0
        sleep 2
    done
    die "Timed out waiting for SSH on ${ip}"
}

ensure_debian12_template() {
    if ! ssh_proxmox pveam list local 2>/dev/null | grep -q 'debian-12'; then
        log "Downloading Debian 12 LXC template..."
        ssh_proxmox pveam update
        local tmpl
        tmpl=$(ssh_proxmox pveam available --section system 2>/dev/null \
            | awk '/debian-12-standard/{print $2; exit}')
        [ -n "$tmpl" ] || die "Could not find a Debian 12 template in pveam"
        ssh_proxmox pveam download local "$tmpl"
    fi
}

find_debian12_template() {
    ssh_proxmox pveam list local 2>/dev/null \
        | awk '/debian-12-standard/{print $1; exit}'
}

go_installed() { command -v go >/dev/null 2>&1; }
