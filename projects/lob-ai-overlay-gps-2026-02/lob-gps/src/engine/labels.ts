/**
 * Generate a human-readable label for a predicted suggestion
 * based on its confidence score.
 *
 * Tiers:
 *   >= 0.50  → "Most common next action (N%)"
 *   >= 0.20  → "Frequently used (N%)"
 *   <  0.20  → "Sometimes used (N%)"
 */
export function generatePredictedLabel(confidence: number): string {
  const pct = Math.round(confidence * 100);

  if (confidence >= 0.5) {
    return `Most common next action (${pct}%)`;
  }
  if (confidence >= 0.2) {
    return `Frequently used (${pct}%)`;
  }
  return `Sometimes used (${pct}%)`;
}
