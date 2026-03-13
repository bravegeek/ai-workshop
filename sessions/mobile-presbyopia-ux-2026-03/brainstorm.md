# Mobile UX for Aging Eyes (Presbyopia) — Brainstorm
**Date:** 2026-03-12

## Context
- US avg age is ~39; near vision begins deteriorating around 40 (presbyopia)
- Mobile screens are designed for younger eyes
- Goal: make mobile screens easier to use without reading glasses

---

## Adaptive Display

- **Dynamic font scaling** — increase size when motion sensors detect phone held at arm's length (a presbyopia tell)
- **Proximity-aware zoom** — front camera or IR sensor detects when phone moves away and scales UI accordingly
- **Auto-contrast boost** in ambient light conditions where presbyopic eyes struggle most (dim indoor lighting)

---

## Input & Interaction

- **Larger, contextual tap targets** — targets expand when phone detects shaky/imprecise touch (another aging tell)
- **Voice-first mode** triggered by phone distance from face
- **Haptic confirmation** to reduce need to visually confirm taps

---

## Content Rendering

- **"Reader distance mode"** — system-level rendering mode that reflows content into single column with larger type, toggled by gesture (e.g. hold phone at arm's length for 1 second)
- **Summarization layer** — reduce cognitive load by collapsing dense text to key points by default
- **High-contrast skin** — beyond accessibility defaults; tuned for unclear focus, not just low vision

---

## Novel Approaches

- **Perceptual sharpening filter** — software lens correction that simulates reading glasses by sharpening edges for text rendering (high-frequency boost tuned for 39+ cm focal distance)
- **Camera-based gaze/distance estimation** — infer when user is squinting and auto-adjust
- **OS-level "presbyopia profile"** — like a hearing aid profile but for near vision; consistent cross-app behavior

---

## Social/UX Friction Reduction

- Real barrier: people won't turn on accessibility settings because it feels stigmatizing
- Framing matters: **"Focus Mode"** or **"Comfort Mode"** rather than "Accessibility" or "Large Text"

---

## Open Questions / Next Directions

- Hardware sensing (sensors, camera-based distance)
- Software rendering (perceptual sharpening, reflow)
- UX/framing (stigma reduction, mode naming)
