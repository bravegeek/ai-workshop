const LABEL_GAP = 8;
const VIEWPORT_MARGIN = 8;

export function show(
  target: Element,
  labelText: string,
  shadowRoot: ShadowRoot,
  abortSignal: AbortSignal,
): void {
  try {
    const label = document.createElement("div");
    label.className = "lob-label";
    label.textContent = labelText;
    label.style.position = "fixed";
    label.style.pointerEvents = "none";

    // Append before measuring so the label has layout dimensions
    shadowRoot.appendChild(label);

    const targetRect = target.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();

    // Default: below target, centered horizontally
    let top = targetRect.bottom + LABEL_GAP;
    let left = targetRect.left + (targetRect.width - labelRect.width) / 2;

    // Vertical flip: if label clips below viewport, place above target
    if (top + labelRect.height > window.innerHeight) {
      top = targetRect.top - labelRect.height - LABEL_GAP;
    }

    // Horizontal clamp
    if (left < VIEWPORT_MARGIN) {
      left = VIEWPORT_MARGIN;
    }
    if (left + labelRect.width > window.innerWidth - VIEWPORT_MARGIN) {
      left = window.innerWidth - VIEWPORT_MARGIN - labelRect.width;
    }

    // RTL support
    const dir = getComputedStyle(document.documentElement).direction;
    if (dir === "rtl") {
      label.style.direction = "rtl";
      label.style.textAlign = "right";
    }

    // Apply computed position
    label.style.top = `${top}px`;
    label.style.left = `${left}px`;

    // Remove on abort
    abortSignal.addEventListener(
      "abort",
      () => {
        label.remove();
      },
      { once: true },
    );
  } catch {
    // FR-023: graceful degradation — no label, no errors
  }
}
