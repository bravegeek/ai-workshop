#!/bin/bash
# Installs AdGuard Home as a Debian 12 LXC on Proxmox.
# Run from your local machine. Requires SSH access to Proxmox host.
# Usage: ./phase1-dns.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
source "${SCRIPT_DIR}/config.sh"

check_prereqs() {
    command -v ssh >/dev/null || die "ssh not found"
    command -v scp >/dev/null || die "scp not found"
    ssh_proxmox true 2>/dev/null || die "Cannot SSH to Proxmox at ${PROXMOX_HOST} — check SSH key and host"
}

create_lxc() {
    if lxc_exists "$DNS_CTID"; then
        log "LXC ${DNS_CTID} already exists, skipping creation"
        return
    fi

    ensure_debian12_template
    local template
    template=$(find_debian12_template)
    [ -n "$template" ] || die "Debian 12 template not found after download attempt"

    log "Creating AdGuard Home LXC (CTID: ${DNS_CTID}, IP: ${ADGUARD_IP})..."
    ssh_proxmox pct create "${DNS_CTID}" "${template}" \
        --hostname adguard \
        --memory 512 \
        --cores 1 \
        --net0 "name=eth0,bridge=${LXC_BRIDGE},ip=${ADGUARD_IP}/24,gw=${GATEWAY}" \
        --storage "${LXC_STORAGE}" \
        --rootfs "${LXC_STORAGE}:4" \
        --unprivileged 1 \
        --features nesting=1
}

start_lxc() {
    if lxc_running "$DNS_CTID"; then
        log "LXC ${DNS_CTID} already running"
        return
    fi
    log "Starting LXC ${DNS_CTID}..."
    ssh_proxmox "nohup pct start ${DNS_CTID} </dev/null >/dev/null 2>&1 &"
}

install_adguard() {
    if ssh_lxc "${ADGUARD_IP}" "test -f /opt/AdGuardHome/AdGuardHome" 2>/dev/null; then
        log "AdGuard Home already installed"
    else
        log "Installing AdGuard Home (this takes a few minutes)..."
        ssh_lxc "${ADGUARD_IP}" bash -s << 'EOF'
            export DEBIAN_FRONTEND=noninteractive
            apt-get update -qq && apt-get install -y -qq curl ca-certificates python3

            # Resolve latest release tag, then fetch that exact version of the install script —
            # avoids running whatever happens to be on master at install time
            VERSION=$(curl -s https://api.github.com/repos/AdguardTeam/AdGuardHome/releases/latest \
                | python3 -c "import sys,json; print(json.load(sys.stdin)['tag_name'])")
            [ -n "$VERSION" ] || { echo "Failed to resolve AdGuard Home release version"; exit 1; }

            curl -sSL "https://raw.githubusercontent.com/AdguardTeam/AdGuardHome/${VERSION}/scripts/install.sh" \
                | sh -s -- -v
EOF
    fi

    if ! ssh_lxc "${ADGUARD_IP}" "systemctl is-active AdGuardHome" >/dev/null 2>&1; then
        ssh_lxc "${ADGUARD_IP}" "systemctl start AdGuardHome"
    fi
}

print_next_steps() {
    log "Done."
    echo ""
    echo "  Complete initial setup: http://${ADGUARD_IP}:3000"
    echo ""
    echo "  After setup, add DNS rewrites (Settings → DNS rewrites):"
    echo "    proxmox.${DOMAIN}  →  ${PROXMOX_HOST}"
    echo "    dns.${DOMAIN}      →  ${ADGUARD_IP}"
    echo "    truenas.${DOMAIN}  →  ${TRUENAS_IP}"
    echo "    proxy.${DOMAIN}    →  ${CADDY_IP}"
    echo ""
    echo "  Set upstream DNS (Settings → DNS settings → Upstream DNS):"
    echo "    https://dns.cloudflare.com/dns-query"
    echo "    https://dns.google/dns-query"
    echo ""
    echo "  Then point your router DHCP DNS to ${ADGUARD_IP}."
}

main() {
    check_prereqs
    create_lxc
    start_lxc
    wait_for_lxc_network "${ADGUARD_IP}"
    lxc_push_pubkey "$DNS_CTID"
    wait_for_ssh "${ADGUARD_IP}"
    install_adguard
    print_next_steps
}

main "$@"
