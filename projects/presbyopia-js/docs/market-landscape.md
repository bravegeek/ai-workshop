# Presbyopia & Mobile Phones: Market Landscape Review
**Date:** 2026-03-12

---

## 1. OS-Level Features

### iOS
- **Display Zoom** — scales entire UI (icons, buttons, layout), not just text
- **Dynamic Type** — per-app font scaling up to ~310%; only works in apps respecting `UIFontMetrics`
- **Bold Text** — system-wide weight increase
- **Increase Contrast / Reduce Transparency** — removes frosted-glass blur effects
- **Button Shapes** — visible outlines on tappable controls (directly helps ambiguous tap targets)
- **Magnifier** — rear camera as real-time loupe via triple-click shortcut
- **iOS 26** — stronger borders and edge recognition noted as meaningful by low-vision trainers

**Ceiling:** Third-party apps that hardcode font sizes are unaffected by Dynamic Type. Display Zoom helps but reduces information density.

### Android
- **Font Size** — up to ~200% on most devices
- **Display Size / Screen Zoom** — full UI scaling analog to iOS Display Zoom
- **High Contrast Text** — adds black outline to text for complex backgrounds
- **Outline Text** (Android 16+) — sharper text boundary rendering
- **Magnification Gesture** — triple-tap to zoom any screen area
- **Reading Mode** (Google Accessibility) — adjustable contrast, font, TTS; document context only
- **Extra Dim** (Android 12+) — sub-hardware-minimum brightness

**Ceiling:** Font scaling only affects apps respecting system text size. All features buried under "Accessibility" label (known adoption barrier). No adaptive or context-aware behavior in stock Android.

### What Neither OS Does
- No distance-aware scaling (UI does not respond to how far the phone is held)
- No perceptual sharpening or deconvolution-based text rendering
- No adaptive tap target expansion
- No presbyopia-specific onboarding or calibration flow

---

## 2. Third-Party Apps

### MaxVue (iOS only)
**What it is:** Real-time display rendering modification — closest current product to "software reading glasses." Calibrates for user's near-vision deficiency (+0.00D to +3.50D), then adjusts text rendering: edge contrast, character weight, letter spacing. Targets text specifically; images/video minimally affected.

**What it is NOT:** Does not apply full-screen PSF/deconvolution correction.

**Positioning:** Deliberately avoids "accessibility" and "aging" language. Frames as a tech convenience tool. Best example of non-stigmatizing branding in the current market.

**Limitations:** Self-described as insufficient for high prescriptions or low light. iOS only. No independent clinical trial published.

### GlassesOff / Innovision Labs (iOS; Android removed Dec 2022)
**What it is:** Neuroscience-based vision training (perceptual learning). Not a display correction tool. 2012 *Scientific Reports* study (n=30): participants read text 1.6× smaller after training.

**What it is NOT:** Does not change the display. Results require weeks of sessions and fade without maintenance.

**Current status:** iOS only (~$60/year); small company (~15 employees).

### RevitalVision "Read Without Glasses"
Similar to GlassesOff — brain training, not display tool. PC/Mac + mobile. Clinically validated for amblyopia; presbyopia program claims improvement over 2 months.

### Magnifier / Loupe Apps
Large commodity category using rear camera. Practical workaround for physical reading (menus, packaging), not phone UI correction.

### Google Reading Mode (Android)
High contrast, large text, TTS within a dedicated reading surface. Does not affect the rest of the phone UI.

---

## 3. Hardware Solutions

### Clip-on Phone Lenses
Generic clip-ons (+1.0 to +3.0D) — cheap commodity on Amazon. Passive, bulky, optically imprecise.

### Autofocus Eyewear (Wearable, Adjacent)

**IXI (Finland)** — raised $36.5M Series A in 2025; claims "world's first autofocus eyewear." Uses IR sensors to detect eye convergence and dynamically adjusts optical power in real time. Moving toward launch (late 2025/2026). Not phone-specific — addresses presbyopia for all near tasks.

**Deep Optics / 32°N** — Israeli company, backed by EssilorLuxottica and Samsung Ventures. Electro-optic lenses. Kickstarted 2021, less active since 2024.

### Screen Overlays
No dedicated presbyopia screen overlay product category exists. Anti-glare and privacy overlays exist but address different problems.

---

## 4. Emerging Research & Patents

### Computational Vision-Correcting Displays
Core concept: compute a modified image that, when blurred by the user's specific optical PSF, appears sharp.

**MIT/UC Berkeley (2014–present):** Original demonstrations by Wetzstein, Barsky, et al. showing real-time pre-distortion of display content to compensate for refractive error.

**2024–2025 papers:**
- *"Real-Time Computational Visual Aberration Correcting Display Through High-Contrast Inverse Blurring"* (arXiv 2501.01450, Jan 2025) — YUV space, real-time feasibility demonstrated
- *"Towards Fast and Accurate Computational Algorithms for Vision Correcting Displays"* (UC Berkeley, 2024) — compressed-sensing + Vision Transformer approaches
- *"Development of Image Preprocessing Methods for Software Compensation of Refraction Anomalies"* (Springer, 2024)

**Rabbit Eyes** — startup building hardware VCD (microlens array + real-time eye tracking in display panels). Targeting consumer OEM partnerships; claimed launch by end of 2025. No confirmed ship.

### Apple Patents
- Patent for smartphone display that adjusts rendering based on refractive error (front camera / embedded sensors) — not shipped
- Apple Vision Pro tunable lens patents (2022–2024) — liquid-fill adjustable lenses for myopia/presbyopia in HMD context

### Distance/Gaze Detection Research
- **LIME** (arXiv 1612.04131): front camera + accelerometer to estimate face-to-screen distance. Purpose was eye protection; methodology directly applicable to adaptive scaling.
- **Google Patent US20130321617A1** (2013): mobile device measures user-to-device distance via camera/rangefinder and adjusts font size. Filed 2013. Never shipped.

### Touch Target Research
- ACM TACCESS: confirms larger targets significantly close accuracy gap between older/younger adults
- W3C WCAG 2.5.5: 44×44px minimum — static guideline, not adaptive

---

## 5. Gap Analysis

| Concept | Status | Notes |
|---|---|---|
| OS font/display scaling | Exists | iOS + Android; static, manual, buried in Accessibility |
| Vision training apps | Exists | GlassesOff, RevitalVision; weeks of training; not a display fix |
| Display text rendering tuning | Partial | MaxVue (iOS only); not full PSF deconvolution |
| Full computational vision correction display | Research only | 2025 arXiv; Rabbit Eyes in HW development |
| Clip-on phone lenses | Exists | Commodity, low quality |
| Autofocus wearable glasses | Emerging | IXI funded/near-launch; not phone-specific |
| Distance-adaptive UI scaling | **Gap** | Patented 2013 (Google), never shipped |
| Proximity-aware zoom via front camera | **Gap** | Research done (LIME 2016); no product |
| Real-time tap target expansion | **Gap** | Research supports it; no product |
| Perceptual sharpening / software reading glasses | **Partial gap** | MaxVue is closest; full PSF deconvolution not shipped |
| Non-stigmatizing OS framing | **Gap** | All features in "Accessibility"; MaxVue is exception at app level |

---

## Key Takeaways

1. **The OS is the bottleneck.** Both iOS and Android have the right primitives but they're manual, static, and stigmatized. No platform has built adaptive, context-aware vision accommodation.

2. **MaxVue is the most interesting incumbent.** It's the only product that both addresses display rendering *and* consciously avoids stigmatizing framing. iOS-only and limited to text rendering is a real constraint.

3. **The research is ahead of the market.** Full computational vision-correcting displays are demonstrated in 2025 papers and patents date back to 2013 — yet nothing has shipped. The gap is commercialization, not feasibility.

4. **Autofocus glasses are the hardware bet.** IXI's $36.5M raise suggests hardware-level correction is getting serious investment. This could sidestep the phone problem entirely — but it's wearable hardware, not a phone solution.

5. **The adaptive tap target problem is completely unaddressed.** No product, no patent, no prototype in this exact space.

---

## Sources
- Apple Support: Accessibility features on iPhone
- MaxVue: maxvue.app
- GlassesOff: glassesoff.com / Tracxn profile
- Rabbit Eyes: rabbit-eyes.com
- arXiv 2501.01450 (real-time vision-correcting display, 2025)
- arXiv 2404.08238 (simulation methodology, 2024)
- UC Berkeley EECS Tech Report 2024-110
- MIT News, 2014 (original vision-correcting display demo)
- arXiv 1612.04131 (LIME face-distance detection)
- Google Patent US20130321617A1 (adaptive font size, 2013)
- PhoneArena: Apple display correction patent
- IXI: ixieyewear.com / TFN funding coverage
- Deep Optics / 32°N Kickstarter
- Scientific Reports 2020 (optoelectronic lens portable device)
- ACM TACCESS: aging + touch target study
- W3C WCAG 2.5.5
- Android Accessibility Help: text scaling
- CBS News: app-based reading glasses review
- Apple iOS 26 low vision coverage (New England Low Vision)
- PMC: mobile app design for older adults
