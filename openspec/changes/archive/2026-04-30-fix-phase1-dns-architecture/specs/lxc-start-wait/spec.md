## ADDED Requirements

### Requirement: LXC start is synchronous and surfaces errors
The `start_lxc` function SHALL start the LXC container synchronously via `pct start` and surface any Proxmox errors immediately, rather than backgrounding the process and discarding its exit code.

#### Scenario: Successful start
- **WHEN** `start_lxc` is called and `pct start` succeeds
- **THEN** the function returns 0 and execution continues to the next step

#### Scenario: Failed start surfaces error
- **WHEN** `start_lxc` is called and `pct start` exits with a non-zero code (e.g., storage error, container config invalid)
- **THEN** the script exits immediately with Proxmox's error message visible to the user

#### Scenario: Already running is idempotent
- **WHEN** `start_lxc` is called and the LXC is already in `running` state
- **THEN** the function logs a skip message and returns 0 without calling `pct start`

### Requirement: Container running state is verified via Proxmox before proceeding
After starting an LXC, the script SHALL poll Proxmox (`pct status <ctid>`) to confirm the container has reached `running` state before calling any Proxmox-side container operations (`pct push`, `pct exec`).

#### Scenario: Container reaches running state
- **WHEN** `wait_for_lxc_running` is called after `pct start`
- **THEN** the function polls `pct status` via `ssh_proxmox` until the output contains `running`, then returns 0

#### Scenario: Container fails to reach running state within timeout
- **WHEN** `wait_for_lxc_running` polls for 60 seconds (30 × 2s) and the container never shows `running`
- **THEN** the script exits with an error message that includes the exact `pct status` command for manual diagnosis

#### Scenario: Vantage point is Proxmox-only
- **WHEN** the script is run from a machine with no direct route to the LXC subnet
- **THEN** `wait_for_lxc_running` succeeds (or fails) based solely on `pct status` output, not on local `ping`

### Requirement: AdGuard install heredoc propagates errors
The remote `bash -s` session used to install AdGuard Home SHALL run with `set -euo pipefail` so that any failed command (apt, curl, etc.) aborts the installation immediately.

#### Scenario: apt-get fails inside heredoc
- **WHEN** `apt-get install` exits non-zero inside the install heredoc
- **THEN** the remote bash session exits non-zero, `ssh_lxc` returns non-zero, and the script exits with an error

#### Scenario: curl fails to resolve AdGuard version
- **WHEN** the GitHub API call returns an empty VERSION string
- **THEN** the explicit `[ -n "$VERSION" ]` check fires and the heredoc exits non-zero

### Requirement: check_prereqs surfaces SSH connection errors
When the connectivity check for Proxmox SSH fails, the script SHALL display the actual SSH error output so the user can diagnose the cause (wrong key, unknown host, port closed, etc.).

#### Scenario: SSH to Proxmox fails with a known error
- **WHEN** `ssh_proxmox true` exits non-zero due to an SSH error (e.g., host key mismatch)
- **THEN** the SSH error message is visible in the terminal before the script's `die` message
