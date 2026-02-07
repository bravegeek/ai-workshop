# Research Findings: GPS for LOB

## 1. Telemetry & User Behavior (The "Brain")
- **Open Source Candidates:**
    - **TA3/web-user-behaviour:** Excellent for granular mouse and scroll tracking.
    - **OpenTelemetry JS:** The industry standard for observability, though perhaps heavier than needed for a simple overlay.
- **Methodology:** Use a content script to capture `(event_type, selector, page_state, timestamp)`. Aggregating these allows for sequence analysis to identify "The Golden Path."

## 2. Robust DOM Identification (The "Eyes")
- **Hierarchical Fallback:**
    1. **Stable Attributes:** `name`, `type`, `aria-label`, or `data-test-id`.
    2. **XPath with Text:** `//button[contains(normalize-space(text()), 'Next')]` is surprisingly resilient in LOB apps where labels are fixed.
    3. **Structural Anchors:** Finding a unique header and using `following-sibling::input`.
- **Tooling:** Need a custom "Selector Generator" that produces the most stable path rather than the most specific one.

## 3. Interaction Patterns (The "Face")
- **Next Best Action (NBA):** Common in enterprise CRM. Key is to provide the "Why" (e.g., "90% of users do this next").
- **Ghost UI:** Using semi-transparent elements helps avoid "Clippy" syndrome.
- **Focus Management:** `element.focus()` and `element.scrollIntoView()` are the primary tools for "Auto-Scroll & Pulse."

## 4. Technical Constraints (Browser Extensions)
- **Permissions:** Manifest V3 requires explicit `host_permissions` for the LOB domains.
- **Isolation:** Content scripts run in an "isolated world," which is good for security but requires `chrome.runtime.sendMessage` to talk to a background worker for data persistence or API calls.

## 5. Quick Scan Findings: Proxy & Security (2026-02-06)

### Proxy Overhead (Latency)
- **Nginx `sub_filter` Performance:** Efficient for simple replacements but sensitive to the "Gzip Trap."
- **Gzip Conflict:** To inject content, the proxy must disable `Accept-Encoding` in the request to the backend. This forces the backend to send uncompressed content, which the proxy then modifies and re-compresses. This adds significant CPU overhead and potential latency at scale.
- **Recommendation:** Monitor CPU load during POC; consider streaming Go-based proxies for production.

### StateKey Robustness (Collision Rates)
- **Problem:** `URL + Selector` is highly susceptible to collisions in dynamic LOB apps (AJAX, dynamic IDs).
- **Hierarchical Semantic Selectors:** Move from flat CSS selectors to text-anchored XPaths or relative positioning (e.g., `[label: 'SSN'] -> input`).
- **Isolation:** Shadow DOM prevents host CSS from leaking into the overlay, but also complicates global selector logic for state detection.

### PII Masking Feasibility
- **Reliability:** Schema-based masking is the "Gold Standard" for accuracy (low false positives).
- **Regex Risks:** Pure Regex masking is context-agnostic and prone to over-masking (e.g., zip codes vs. part numbers).
- **Hybrid Strategy:** Use a simple "Selector-to-PII" map in the proxy (e.g., "Always mask the value of `#patient-id`") to combine the speed of Regex with the precision of a light schema.
