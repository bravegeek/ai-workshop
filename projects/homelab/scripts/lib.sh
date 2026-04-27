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

wait_for_lxc_network() {
    local ip=$1
    log "Waiting for LXC at ${ip} to come up..."
    for i in $(seq 1 30); do
        ping -c 1 -W 2 "${ip}" >/dev/null 2>&1 && return 0
        sleep 2
    done
    die "Timed out waiting for LXC ${ip}"
}


lxc_push_pubkey() {
    local ctid=$1
    local pubkey_file
    pubkey_file=$(ls ~/.ssh/id_ed25519.pub ~/.ssh/id_rsa.pub 2>/dev/null | head -1)
    [ -n "$pubkey_file" ] || die "No SSH public key found at ~/.ssh/id_ed25519.pub or ~/.ssh/id_rsa.pub"

    log "Pushing SSH key into LXC ${ctid}..."
    local proxmox_tmp="/tmp/pubkey_${ctid}.tmp"
    scp -q "${pubkey_file}" "${PROXMOX_USER}@${PROXMOX_HOST}:${proxmox_tmp}"
    ssh_proxmox "pct push ${ctid} ${proxmox_tmp} /tmp/id.pub && pct exec ${ctid} -- sh -c 'mkdir -p /root/.ssh && chmod 700 /root/.ssh && cat /tmp/id.pub >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && rm /tmp/id.pub' && rm -f ${proxmox_tmp}"
    log "SSH key installed in LXC ${ctid}"
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
