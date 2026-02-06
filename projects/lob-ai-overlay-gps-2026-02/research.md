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
- **Performance:** Avoid `MutationObserver` on the entire `body` if possible; target specific containers to reduce CPU overhead.
