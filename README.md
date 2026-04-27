# RecyclePro

A cross-platform mobile app that helps residents find their local trash and recycling pickup schedules, look up how to dispose of specific items, and identify recyclables using on-device AI.

Built with React Native and Expo. Currently covering **New Jersey** — the majority of Bergen County and a growing portion of Essex County, with ongoing expansion.

---

## Features

### Home — Pickup Calendar
- Enter your address to automatically detect your collection zone
- View your next scheduled pickup for garbage, commingled recycling, paper recycling, and yard waste
- Full monthly calendar with color-coded indicators per collection type
- Zone-aware scheduling that handles alternating-week recycling programs and seasonal yard waste

### Search — Item Lookup
- Fuzzy search across a database of common household recyclable items
- Location-aware results — disposal instructions update based on your saved town
- Camera shortcut to jump directly to photo recognition from the search bar

### Camera — AI Recognition
- Take a photo of any item and get an instant recycling classification
- On-device inference using a fine-tuned MobileNetV3-Large model (no data leaves your phone)
- Classifies into 8 material categories: Cardboard, Electronics, Glass, Hazardous, Metal, Non-Recyclable, Paper, Plastic
- Confidence thresholding — low-confidence results prompt for a better photo rather than showing a wrong answer
- Results link directly to disposal instructions for your location

### Learn — Recycling Education
- Rotating daily tips drawn from a curated recycling knowledge base
- Per-material guides covering what is and isn't accepted (paper, plastic resin codes, glass, metal, electronics, hazardous waste, organics, textiles)
- Common recycling myths with fact-checked explanations
- Seasonal tips that update based on the current time of year

---

## Coverage

Currently supports most municipalities in **Bergen County, NJ** and a growing selection of towns in **Essex County, NJ**. New towns are being added on an ongoing basis.

See [ADDING_LOCATIONS.md](ADDING_LOCATIONS.md) for the guide on contributing new municipality data.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform iOS and Android framework |
| Expo (v54) | Build tooling, dev server, native API access |
| Expo Router | File-based navigation |
| TypeScript | Type-safe JavaScript throughout |
| ONNX Runtime React Native | On-device ML inference for camera recognition |
| MobileNetV3-Large | Fine-tuned image classification model (8 recycling classes) |
| Fuse.js | Fuzzy search for the item database |
| Mapbox SDK | Geocoding for town and address lookup |
| AsyncStorage | Persistent local storage for saved location |

---

## Getting Started

### Prerequisites

- Node.js v18 or newer
- Xcode (for iOS builds) or Android Studio (for Android builds)
- A Mapbox account for a free API token — [account.mapbox.com](https://account.mapbox.com)

### Installation

```bash
git clone https://github.com/alexandercase1/RecyclePro.git
cd RecyclePro
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Running the App

Because the app uses native modules (ONNX Runtime), it requires a development build — it cannot run in Expo Go.

**Build and run on a connected iPhone:**
```bash
npx expo run:ios --device
```

**Build and run on an iOS Simulator:**
```bash
npx expo run:ios
```

**Build and run on Android:**
```bash
npx expo run:android
```

After the first native build, you can start the Metro bundler alone for subsequent JS-only changes:
```bash
npm start
```

---

## Project Structure

```
RecyclePro/
├── app/                        # Screens (file-based routing via Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx           # Home — pickup calendar
│   │   ├── search.tsx          # Search — item lookup
│   │   ├── cam.tsx             # Camera — AI recognition
│   │   └── learn.tsx           # Learn — education content
│   ├── location-search.tsx     # Town search modal
│   ├── address-input.tsx       # Street address entry
│   ├── zone-selector.tsx       # Manual zone picker
│   └── item-detail.tsx         # Item disposal detail view
├── assets/
│   └── models/                 # ONNX model files (on-device inference)
├── components/
│   ├── search/                 # SearchBar, SearchResults
│   └── recyclability/          # ItemCard, DisposalMethodBadge
├── data/
│   ├── types.ts                # All TypeScript interfaces
│   ├── locations/              # Town schedules by state > county > town
│   └── recyclables/            # Item database and disposal rules
├── services/
│   ├── model.ts                # ONNX inference, image preprocessing
│   ├── searchService.ts        # Fuse.js fuzzy search
│   ├── recyclabilityService.ts # Disposal rule lookup
│   ├── locationService.ts      # Mapbox geocoding
│   ├── storageService.ts       # AsyncStorage
│   └── zoneMatchingService.ts  # Address-to-zone matching
├── plugins/
│   └── withOnnxRuntime.js      # Expo config plugin for native ONNX setup
├── waste_recog_train.py        # Model training script (PyTorch → ONNX)
└── ADDING_LOCATIONS.md         # Guide for adding new towns
```

---

## Team

| Name | Role |
|---|---|
| Alex Case | Co-developer |
| Ahmet Taskiran | Co-developer |
| Vicente Contreras | Co-developer |
| Jesse Santoni | Co-developer |
