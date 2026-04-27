#!/bin/bash
# Stands up Caddy as a Debian 12 LXC with Route53 DNS-01 cert issuance.
# Creates a dedicated IAM user (homelab-caddy-dns) with least-privilege Route53 access.
# Run from your local machine. Requires SSH access to Proxmox and AWS CLI configured.
# Usage: ./phase2-ssl.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
source "${SCRIPT_DIR}/config.sh"

IAM_USER="homelab-caddy-dns"
POLICY_NAME="homelab-caddy-route53"

check_prereqs() {
    command -v scp >/dev/null || die "scp not found"
    ssh_proxmox true 2>/dev/null || die "Cannot SSH to Proxmox at ${PROXMOX_HOST}"
    command -v aws >/dev/null   || die "AWS CLI not found — install it first"
    aws sts get-caller-identity >/dev/null 2>&1 || die "AWS credentials not configured — run 'aws configure'"
    python3 --version >/dev/null 2>&1 || die "python3 not found — required for JSON parsing"
}

setup_aws_iam() {
    log "Setting up IAM user ${IAM_USER}..."

    if ! aws iam get-user --user-name "${IAM_USER}" >/dev/null 2>&1; then
        aws iam create-user --user-name "${IAM_USER}" >/dev/null
        log "Created IAM user ${IAM_USER}"
    else
        log "IAM user ${IAM_USER} already exists"
    fi

    local zone_id
    zone_id=$(aws route53 list-hosted-zones \
        --query "HostedZones[?Name=='${BASE_DOMAIN}.'].Id" \
        --output text | sed 's|/hostedzone/||')
    [ -n "$zone_id" ] || die "Could not find hosted zone for ${BASE_DOMAIN} — check AWS credentials and domain"

    local account_id policy_arn
    account_id=$(aws sts get-caller-identity --query Account --output text)
    policy_arn="arn:aws:iam::${account_id}:policy/${POLICY_NAME}"

    if ! aws iam get-policy --policy-arn "${policy_arn}" >/dev/null 2>&1; then
        aws iam create-policy \
            --policy-name "${POLICY_NAME}" \
            --policy-document "{
              \"Version\": \"2012-10-17\",
              \"Statement\": [
                {
                  \"Effect\": \"Allow\",
                  \"Action\": [\"route53:ChangeResourceRecordSets\"],
                  \"Resource\": \"arn:aws:route53:::hostedzone/${zone_id}\"
                },
                {
                  \"Effect\": \"Allow\",
                  \"Action\": [\"route53:ListHostedZones\", \"route53:GetChange\"],
                  \"Resource\": \"*\"
                }
              ]
            }" >/dev/null
        log "Created IAM policy ${POLICY_NAME}"
    else
        log "IAM policy ${POLICY_NAME} already exists"
    fi

    if ! aws iam list-attached-user-policies --user-name "${IAM_USER}" \
        --query "AttachedPolicies[?PolicyName=='${POLICY_NAME}'].PolicyName" \
        --output text | grep -q "${POLICY_NAME}"; then
        aws iam attach-user-policy --user-name "${IAM_USER}" --policy-arn "${policy_arn}"
        log "Attached policy to ${IAM_USER}"
    else
        log "Policy already attached to ${IAM_USER}"
    fi

    # Delete any existing keys before creating a new one — IAM limit is 2 keys per user,
    # and old keys should not remain active after a re-run
    local existing_keys
    existing_keys=$(aws iam list-access-keys --user-name "${IAM_USER}" \
        --query 'AccessKeyMetadata[].AccessKeyId' --output text)
    if [ -n "$existing_keys" ]; then
        warn "Rotating access keys for ${IAM_USER}..."
        for key_id in $existing_keys; do
            aws iam delete-access-key --user-name "${IAM_USER}" --access-key-id "${key_id}"
            log "Deleted old access key ${key_id}"
        done
    fi

    log "Creating access key for ${IAM_USER}..."
    local key_json
    key_json=$(aws iam create-access-key --user-name "${IAM_USER}")
    AWS_KEY_ID=$(echo "${key_json}" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['AccessKeyId'])")
    AWS_KEY_SECRET=$(echo "${key_json}" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['SecretAccessKey'])")
}

create_lxc() {
    if lxc_exists "$CADDY_CTID"; then
        log "LXC ${CADDY_CTID} already exists, skipping creation"
        return
    fi

    local template
    template=$(find_debian12_template)
    [ -n "$template" ] || die "Debian 12 template not found — run phase1-dns.sh first"

    log "Creating Caddy LXC (CTID: ${CADDY_CTID}, IP: ${CADDY_IP})..."
    ssh_proxmox pct create "${CADDY_CTID}" "${template}" \
        --hostname caddy \
        --memory 256 \
        --cores 1 \
        --net0 "name=eth0,bridge=${LXC_BRIDGE},ip=${CADDY_IP}/24,gw=${GATEWAY}" \
        --storage "${LXC_STORAGE}" \
        --rootfs "${LXC_STORAGE}:4" \
        --unprivileged 1 \
        --features nesting=1
}

start_lxc() {
    if lxc_running "$CADDY_CTID"; then
        log "LXC ${CADDY_CTID} already running"
        return
    fi
    log "Starting LXC ${CADDY_CTID}..."
    ssh_proxmox pct start "${CADDY_CTID}"
}

install_caddy() {
    if ssh_lxc "${CADDY_IP}" "test -f /usr/bin/caddy" 2>/dev/null; then
        log "Caddy already installed"
        return
    fi

    log "Downloading Caddy with Route53 module..."
    ssh_lxc "${CADDY_IP}" bash -s << 'EOF'
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -qq && apt-get install -y -qq curl ca-certificates
        curl -fsSL 'https://caddyserver.com/api/download?os=linux&arch=amd64&p=github.com/caddy-dns/route53' \
            -o /usr/bin/caddy
        chmod +x /usr/bin/caddy
        id caddy >/dev/null 2>&1 || useradd --system --home /var/lib/caddy --shell /usr/sbin/nologin caddy
        mkdir -p /etc/caddy /var/lib/caddy
        chown caddy:caddy /var/lib/caddy
EOF
}

write_aws_env() {
    log "Writing AWS credentials to /etc/caddy/aws.env on LXC..."
    ssh_lxc "${CADDY_IP}" "cat > /etc/caddy/aws.env && chmod 640 /etc/caddy/aws.env && chown root:caddy /etc/caddy/aws.env" << EOF
AWS_ACCESS_KEY_ID=${AWS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_KEY_SECRET}
AWS_REGION=${AWS_REGION}
EOF
    unset AWS_KEY_ID AWS_KEY_SECRET
}

write_caddyfile() {
    if ssh_lxc "${CADDY_IP}" "test -f /etc/caddy/Caddyfile" 2>/dev/null; then
        log "Caddyfile already exists, skipping"
        return
    fi

    log "Writing Caddyfile..."
    ssh_lxc "${CADDY_IP}" "cat > /etc/caddy/Caddyfile" << EOF
{
    email admin@${BASE_DOMAIN}
}

*.${DOMAIN} {
    tls {
        dns route53
    }

    @proxmox host proxmox.${DOMAIN}
    handle @proxmox {
        reverse_proxy https://${PROXMOX_HOST}:8006 {
            transport http {
                tls_insecure_skip_verify
            }
            # Proxmox validates the Host header — must match upstream
            header_up Host {upstream_hostport}
        }
    }

    @dns host dns.${DOMAIN}
    handle @dns {
        reverse_proxy http://${ADGUARD_IP}:3000
    }

    @truenas host truenas.${DOMAIN}
    handle @truenas {
        reverse_proxy https://${TRUENAS_IP} {
            transport http {
                tls_insecure_skip_verify
            }
        }
    }

    handle {
        respond "no route" 404
    }
}
EOF
}

write_systemd_unit() {
    log "Writing caddy.service..."
    ssh_lxc "${CADDY_IP}" "cat > /etc/systemd/system/caddy.service" << 'EOF'
[Unit]
Description=Caddy
Documentation=https://caddyserver.com/docs/
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE
EnvironmentFile=/etc/caddy/aws.env

[Install]
WantedBy=multi-user.target
EOF
}

enable_caddy() {
    log "Validating Caddyfile..."
    ssh_lxc "${CADDY_IP}" "/usr/bin/caddy validate --config /etc/caddy/Caddyfile" \
        || die "Caddyfile validation failed — fix errors before starting service"

    log "Enabling and starting Caddy..."
    ssh_lxc "${CADDY_IP}" bash -s << 'EOF'
        systemctl daemon-reload
        systemctl enable caddy
        systemctl start caddy
EOF
}

print_next_steps() {
    log "Done."
    echo ""
    echo "  Add DNS rewrite in AdGuard Home:"
    echo "    proxy.${DOMAIN} → ${CADDY_IP}"
    echo ""
    echo "  Monitor cert issuance (takes ~30s):"
    echo "    ssh root@${CADDY_IP} journalctl -fu caddy"
    echo ""
    echo "  Once cert is issued, verify:"
    echo "    https://proxmox.${DOMAIN}"
    echo "    https://dns.${DOMAIN}"
}

main() {
    check_prereqs
    setup_aws_iam
    create_lxc
    start_lxc
    wait_for_lxc_boot "$CADDY_CTID"
    lxc_push_pubkey "$CADDY_CTID"
    wait_for_ssh "${CADDY_IP}"
    install_caddy
    write_aws_env
    write_caddyfile
    write_systemd_unit
    enable_caddy
    print_next_steps
}

main "$@"
