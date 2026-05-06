#!/bin/bash
# Installs AdGuard Home as a Debian 12 LXC on Proxmox.
# Run from your local machine. Requires SSH access to Proxmox host.
# Usage: ./phase1-dns.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
source "${SCRIPT_DIR}/config.sh"

check_prereqs() {
    command -v ssh  >/dev/null || die "ssh not found"
    command -v scp  >/dev/null || die "scp not found"
    command -v curl >/dev/null || die "curl not found"
    ssh_proxmox true || die "Cannot SSH to Proxmox at ${PROXMOX_HOST} — check SSH key and host"
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

    local pubkey_remote
    pubkey_remote=$(stage_pubkey_on_proxmox "${DNS_CTID}")

    log "Creating AdGuard Home LXC (CTID: ${DNS_CTID}, IP: ${ADGUARD_IP})..."
    ssh_proxmox pct create "${DNS_CTID}" "${template}" \
        --hostname adguard \
        --ostype debian \
        --memory 512 \
        --swap 512 \
        --cores 1 \
        --net0 "name=eth0,bridge=${LXC_BRIDGE},ip=${ADGUARD_IP}/24,gw=${GATEWAY}" \
        --storage "${LXC_STORAGE}" \
        --rootfs "${LXC_STORAGE}:4" \
        --unprivileged 1 \
        --features keyctl=1,nesting=1 \
        --ssh-public-keys "${pubkey_remote}" \
        --onboot 1
    ssh_proxmox rm -f "${pubkey_remote}"
}

start_lxc() {
    if lxc_running "$DNS_CTID"; then
        log "LXC ${DNS_CTID} already running"
        return
    fi
    log "Starting LXC ${DNS_CTID}..."
    ssh_proxmox pct start "${DNS_CTID}"
}

install_adguard() {
    if ssh_lxc "${ADGUARD_IP}" "test -f /opt/AdGuardHome/AdGuardHome" 2>/dev/null; then
        log "AdGuard Home already installed"
    else
        log "Installing AdGuard Home (this takes a few minutes)..."
        ssh_lxc "${ADGUARD_IP}" bash -s << 'EOF'
            set -euo pipefail
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

configure_adguard() {
    local wizard_base="http://${ADGUARD_IP}:3000"   # wizard only listens on 3000
    local base="http://${ADGUARD_IP}:80"            # post-setup web UI port
    local auth="${ADGUARD_USER}:${ADGUARD_PASSWORD}"

    # /control/install/get_addresses is only present during wizard mode
    if curl -sf "${wizard_base}/control/install/get_addresses" >/dev/null 2>&1; then
        log "Running AdGuard Home initial setup..."

        # Autofix any port conflicts before configuring
        curl -sf -X POST "${wizard_base}/control/install/check_config" \
            -H "Content-Type: application/json" \
            -d '{"web":{"port":80,"ip":"0.0.0.0"},"dns":{"port":53,"ip":"0.0.0.0","autofix":true}}' \
            >/dev/null 2>&1 || true

        local resp
        resp=$(curl -s -o /tmp/adguard_configure_resp.txt -w "%{http_code}" \
            -X POST "${wizard_base}/control/install/configure" \
            -H "Content-Type: application/json" \
            -d "{\"web\":{\"ip\":\"0.0.0.0\",\"port\":80},\"dns\":{\"ip\":\"0.0.0.0\",\"port\":53},\"username\":\"${ADGUARD_USER}\",\"password\":\"${ADGUARD_PASSWORD}\"}")
        [ "${resp}" = "200" ] || die "AdGuard Home initial setup failed (HTTP ${resp}): $(cat /tmp/adguard_configure_resp.txt)"
        rm -f /tmp/adguard_configure_resp.txt

        # AdGuard restarts on port 80 after configure — wait for it
        wait_for_http "${base}"
    else
        log "AdGuard Home wizard already completed"
    fi

    log "Configuring upstream DNS..."
    curl -sf -X POST "${base}/control/dns_config" \
        -u "${auth}" \
        -H "Content-Type: application/json" \
        -d '{"upstream_dns":["https://dns.cloudflare.com/dns-query","https://dns.google/dns-query"],"bootstrap_dns":["9.9.9.10","149.112.112.10"],"upstream_mode":"parallel"}' \
        || die "Failed to configure upstream DNS"

    log "Adding DNS rewrites..."
    local rewrites
    rewrites=$(curl -sf "${base}/control/rewrite/list" -u "${auth}" 2>/dev/null || echo "[]")

    _rewrite_add() {
        local d=$1 a=$2
        if echo "${rewrites}" | grep -q "\"${d}\""; then
            log "  Already exists: ${d}"; return
        fi
        curl -sf -X POST "${base}/control/rewrite/add" \
            -u "${auth}" \
            -H "Content-Type: application/json" \
            -d "{\"domain\":\"${d}\",\"answer\":\"${a}\"}" \
            || die "Failed to add DNS rewrite ${d} → ${a}"
        log "  Added: ${d} → ${a}"
    }

    _rewrite_add "proxmox.${DOMAIN}" "${PROXMOX_HOST}"
    _rewrite_add "dns.${DOMAIN}"     "${ADGUARD_IP}"
    _rewrite_add "truenas.${DOMAIN}" "${TRUENAS_IP}"
    _rewrite_add "proxy.${DOMAIN}"   "${CADDY_IP}"
}

print_next_steps() {
    log "Done."
    echo ""
    echo "  AdGuard Home is configured and running."
    echo "  Web UI: http://${ADGUARD_IP}  (user: ${ADGUARD_USER})"
    echo ""
    echo "  One manual step — point your router's DHCP DNS to ${ADGUARD_IP}:"
    echo "    RT-AX86U Pro: LAN → DHCP Server → DNS Server 1"
    echo ""
    echo "  Then verify from a LAN client:"
    echo "    dig proxmox.${DOMAIN} @${ADGUARD_IP} +short"
}

main() {
    check_prereqs
    create_lxc
    start_lxc
    wait_for_lxc_running "${DNS_CTID}"
    clear_known_host "${ADGUARD_IP}"
    wait_for_ssh "${ADGUARD_IP}"
    install_adguard
    wait_for_http "http://${ADGUARD_IP}:3000"   # wizard port — configure_adguard handles the port 80 wait
    configure_adguard
    print_next_steps
}

main "$@"
