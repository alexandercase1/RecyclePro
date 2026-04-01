# RecyclePro — Camera Feature: Options & Planning Guide

## Overview

The goal is to allow users to photograph a recyclable item (soda can, laptop, pizza box, etc.) and have the app recognize it and return the correct recycling information — the same data already powering the manual search bar.

**Current state of the camera:**
- `app/(tabs)/cam.tsx` exists with a working camera UI (capture, front/back toggle, permissions)
- It is **not yet wired into the tab bar** (`_layout.tsx` has only Home + Search tabs)
- A custom fine-tuned **MobileNetV3 model via ONNX Runtime** is already in development

**The bridge that's missing:** photo → recognized label → `searchItems(label)` in `services/searchService.ts`

---

## UX Decision (Already Agreed)

**Snap & Identify** (not live AR):
1. User taps a camera icon in the Search tab's search bar
2. Full-screen camera overlay opens
3. User points at item → taps capture
4. App identifies item → search results populate
5. User taps result → recycling detail screen

**Camera placement:** Icon inside Search tab's search bar — not a third tab.

---

## Recognition Engine Options

### Option A — On-Device ONNX (Current Direction)

**What it is:** Run your custom MobileNetV3 model locally on the device using `onnxruntime-react-native`.

**How it works:**
```
Photo URI → resize/normalize → ONNX inference → class index → label string → searchItems()
```

**Pros:**
- No API cost — completely free at scale
- Works offline / no internet required
- Fast inference (typically 100–300ms on modern phones)
- Custom fine-tuned for recyclables, so labels map directly to your item database
- No API key management or secrets in the app

**Cons:**
- Requires a **custom Expo dev build** (not compatible with Expo Go) — needs EAS Build
- ONNX model file adds to app bundle size (~10–20MB depending on model)
- Limited to what the model was trained on — novel items it hasn't seen will get poor results
- You own the maintenance: if recycling categories change, you retrain

**Integration complexity:** Medium — mostly around ONNX preprocessing (image resize/normalize to match training input shape)

**Key things to confirm before implementing:**
- Model file path (likely somewhere in `assets/`)
- Model input shape (e.g., 224×224×3?)
- Full class label list the model outputs
- `onnxruntime-react-native` already in `package.json`?
- Running a custom dev build or standard Expo Go?

---

### Option B — Claude Vision API (Anthropic)

**What it is:** Send the captured photo (base64 encoded) to Claude's vision model with a prompt that includes your item database context.

**How it works:**
```
Photo URI → base64 encode → POST to Anthropic API
→ Prompt: "This is a recycling app. What recyclable item is in this photo?
   Return only the item name from this list: [your items]"
→ Claude returns exact item name → searchItems()
```

**Cost:** ~$0.003–0.008 per scan (depending on image size and prompt length)

**Pros:**
- Extremely high accuracy, especially for edge cases and unusual items
- Can be prompted to return labels that match your database exactly (no fuzzy matching needed)
- Handles text on packaging (reads "PETE #1", brand names, etc.)
- No custom build or bundle size impact
- Zero training/maintenance burden — Claude handles the recognition

**Cons:**
- Requires internet connection
- Small per-scan cost (at 10K scans/month ≈ $50–80)
- Requires Anthropic API key (must be secured — never hardcode in app, use a backend proxy)
- Network latency adds 500ms–2s per scan
- Rate limits could be a concern at very high usage

**Security note:** API key should live in a backend proxy (even a simple serverless function), not bundled in the app.

**Integration complexity:** Low — one API call, straightforward response parsing

---

### Option C — Google Cloud Vision API

**What it is:** Google's cloud vision service that returns object labels for an image.

**How it works:**
```
Photo URI → base64 → POST to Google Vision API
→ Returns array of labels: ["Aluminum", "Tin can", "Beverage can", ...]
→ Best label → searchItems() via fuzzy match
```

**Cost:** First 1,000 calls/month free, then $1.50 per 1,000 calls

**Pros:**
- Very accurate for common items
- Generous free tier (1K scans/month free)
- Mature, well-documented API
- Google ML Kit version available for on-device (see Option D)

**Cons:**
- Returns generic Google labels (e.g., `"Tin can"`) — these won't always cleanly match your item database, so fuzzy matching is less reliable than prompting Claude directly
- Requires internet
- Requires Google Cloud account + API key (same security concerns as Claude)
- No control over what label vocabulary is returned

**Integration complexity:** Low — REST call, but output needs label-to-item mapping

---

### Option D — Google ML Kit (On-Device, Free)

**What it is:** Google's on-device ML library, available via `@react-native-ml-kit/image-labeling`.

**How it works:**
```
Photo URI → ML Kit on-device inference → label list → best label → searchItems()
```

**Cost:** Free

**Pros:**
- No API cost, works offline
- No API key
- Reasonably fast on-device

**Cons:**
- Uses standard Google label vocabulary (~1,000 categories) — NOT fine-tuned for recyclables
- Labels like `"Bottle"`, `"Plastic"`, `"Container"` are vague — fuzzy matching to your item database is hit-or-miss
- Requires custom Expo dev build (same as ONNX)
- Less accurate than cloud options for edge cases
- Less control than your own custom ONNX model

**Integration complexity:** Medium (custom build requirement)

---

## Comparison Table

| | ONNX (Custom) | Claude Vision | Google Cloud Vision | Google ML Kit |
|---|---|---|---|---|
| **Cost** | Free | ~$0.003–0.008/scan | Free up to 1K/mo | Free |
| **Internet required** | No | Yes | Yes | No |
| **Accuracy for your items** | High (custom trained) | Very High | Medium | Low–Medium |
| **Label match to DB** | Direct (custom labels) | Direct (prompted) | Needs fuzzy match | Needs fuzzy match |
| **Custom build needed** | Yes | No | No | Yes |
| **Bundle size impact** | +10–20MB | None | None | Small |
| **API key / secret** | None | Yes | Yes | None |
| **Latency** | 100–300ms | 500ms–2s | 300ms–1s | 100–300ms |
| **Maintenance** | You own model | None | None | None |

---

## Recommended Architecture

**Primary:** ONNX on-device (custom model)
**Fallback (optional):** Claude Vision API for low-confidence results

```
Photo captured
    ↓
ONNX inference → { label, confidence }
    ↓
confidence ≥ 0.60?
  YES → searchItems(label) → show results
  NO  → "Not sure what this is"
          → [Try AI Scan] button → Claude Vision API → searchItems()
          → [Search Manually] → pre-fills search bar with best guess
```

This gives you free + offline for the majority of cases, with a smart AI fallback for the hard ones.

---

## Files That Will Change

| File | Change |
|---|---|
| `services/visionService.ts` | **New** — ONNX model loading, image preprocessing, inference, label mapping |
| `components/search/SearchBar.tsx` | Add `onCameraPress` prop + camera icon button |
| `app/(tabs)/search.tsx` | Camera overlay state, scan result → `handleSearch()` pipeline |
| `app/(tabs)/cam.tsx` | Repurpose camera logic into reusable overlay (or extract to component) |
| `app/(tabs)/_layout.tsx` | No change needed (cam tab already not in tab bar) |

---

## Open Questions for Team

1. **ONNX model details** — what's the input shape, where's the model file, and what are the full class labels?
2. **API fallback?** — Do we want Claude Vision API integration for low-confidence cases, or keep it ONNX-only for now?
3. **Backend proxy?** — If using any API, do we have or want a simple backend (Cloudflare Worker, Vercel function) to proxy API calls and keep keys out of the app bundle?
4. **EAS Build** — Are we already set up with a custom dev build, or are we still on Expo Go?
5. **Confidence threshold** — what score should we require before auto-showing a result vs. asking the user to confirm?

---

*Last updated: March 2026 | RecyclePro — Camera Planning Doc*
