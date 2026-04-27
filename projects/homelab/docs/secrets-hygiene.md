# Secrets Hygiene

## What's protected

The `.gitignore` at the project root blocks the most common leak vectors:

| Pattern | What it covers |
|---|---|
| `*.env`, `.env.*` | Environment variable files |
| `secrets/` | Any dedicated secrets directory |
| `*.vault`, `*_vault_password*` | Ansible Vault passwords |
| `*.tfstate`, `*.tfvars` | Terraform state and variable files |
| `*.pem`, `*.key`, `id_rsa*`, `id_ed25519*` | SSH and TLS private keys |
| `*.conf`, `account.conf` | Config files that may contain credentials |
| `inventory.yml`, `hosts.yml`, `vars.yml`, etc. | Config files with real values |

## Pre-commit scanning

A gitleaks hook lives at `.git/hooks/pre-commit`. It runs on every `git commit` and blocks the commit if it detects credentials, tokens, or key material in staged files. It also catches accidentally staged private key files (`.pem`, `.key`, etc.).

If gitleaks is not installed, the hook falls back to a basic grep pattern scan.

## The example file pattern

For any config that needs real values, commit an `*.example` file with placeholders and gitignore the real one:

```
Caddyfile.example   ← committed, placeholder values
Caddyfile           ← gitignored, real values
```

This keeps the file structure documented without leaking anything.

## Route53 IAM credentials (Phase 2)

Caddy uses a dedicated IAM user (`homelab-caddy-dns`) to call Route53 during DNS-01 cert issuance and renewal. One IAM user per service — if the key leaks, blast radius is limited to one hosted zone.

**The `phase2-ssl.sh` script handles IAM setup automatically** using your local AWS CLI credentials. It creates the user, attaches the policy, generates the access key, and deposits credentials on the Caddy LXC. Your admin credentials never leave your local machine.

The IAM policy (applied by the script):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["route53:ChangeResourceRecordSets"],
      "Resource": "arn:aws:route53:::hostedzone/YOUR_ZONE_ID"
    },
    {
      "Effect": "Allow",
      "Action": ["route53:ListHostedZones", "route53:GetChange"],
      "Resource": "*"
    }
  ]
}
```

Credentials land on the Caddy LXC at `/etc/caddy/aws.env` (mode 640, owned root:caddy, loaded via systemd `EnvironmentFile`). This file is never in the repo.

Never hardcode AWS key values in scripts — read them from environment variables:

```bash
# Safe — reads from environment at runtime
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"

# Not safe — key hardcoded in script
export AWS_ACCESS_KEY_ID="AKIA..."
```

Note: AWS Certificate Manager (ACM) issues free certs but the private key is AWS-locked and cannot be exported. ACM certs only work with AWS services (ALB, CloudFront). Not usable for local LXC services.

## What's not covered

- Secrets already committed to history — `gitleaks detect` (not `protect`) can scan full history if needed
- Secrets in binary files or base64-encoded blobs — gitleaks handles many of these but it's not exhaustive
- Proxmox API tokens stored in scripts — treat the same as AWS keys: env vars only, never hardcoded
