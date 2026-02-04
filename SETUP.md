# RecyclePro - Development Setup

## What is this project?

RecyclePro is a React Native mobile app built with Expo and TypeScript. It helps users find their local trash and recycling pickup schedules and look up how to dispose of specific items.

## Prerequisites

You need the following installed on your system before you can run this project.

### 1. Node.js (v18 or newer)

Node.js is the JavaScript runtime that runs all the tooling.

**Mac (using Homebrew):**
```bash
brew install node
```

**Or download directly:** https://nodejs.org (use the LTS version)

Verify it's installed:
```bash
node --version
npm --version
```

### 2. Expo CLI

Expo is the framework that wraps React Native and handles building/running the app.

```bash
npm install -g expo-cli
```

### 3. Expo Go app (for testing on your phone)

Install **Expo Go** from the App Store (iOS) or Google Play Store (Android). This lets you run the app on your phone without building a full native binary.

### 4. Git

```bash
brew install git
```

Or download from https://git-scm.com

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd RecyclePro
```

### 2. Install dependencies

```bash
npm install
```

This reads `package.json` and installs everything the project needs into the `node_modules/` folder.

### 3. Set up environment variables

Create a `.env` file in the project root (or ask a team member for theirs):

```
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_api_token_here
```

The Mapbox token is used for location search (geocoding town names). You can get a free token at https://account.mapbox.com.

### 4. Start the development server

```bash
npm start
```

This runs `expo start` and opens the Expo developer tools. You'll see a QR code in the terminal.

- **iPhone:** Open the Camera app and scan the QR code. It will open in Expo Go.
- **Android:** Open the Expo Go app and scan the QR code.
- **iOS Simulator:** Press `i` in the terminal (requires Xcode installed).
- **Android Emulator:** Press `a` in the terminal (requires Android Studio installed).

### 5. Other commands

| Command | What it does |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Start and open in iOS Simulator |
| `npm run android` | Start and open in Android Emulator |
| `npm run web` | Start in web browser |
| `npm run lint` | Run the linter to check code style |

---

## Project Structure

```
RecyclePro/
├── app/                    # Screens (file-based routing via Expo Router)
│   ├── (tabs)/             # Bottom tab screens
│   │   ├── _layout.tsx     # Tab navigation config
│   │   ├── index.tsx       # Home screen (calendar)
│   │   └── search.tsx      # Item search screen
│   ├── _layout.tsx         # Root navigation config
│   ├── location-search.tsx # Town search modal
│   ├── address-input.tsx   # Street address entry
│   ├── zone-selector.tsx   # Manual zone picker
│   └── item-detail.tsx     # Item disposal details
├── components/             # Reusable UI components
│   ├── search/             # Search bar, results, category grid
│   └── recyclability/      # Item cards, disposal badges
├── data/                   # All static data
│   ├── types.ts            # TypeScript interfaces for all data
│   ├── locations/          # Location hierarchy (state > county > town)
│   └── recyclables/        # Item database and disposal rules
├── services/               # Business logic
│   ├── locationService.ts  # Mapbox geocoding
│   ├── searchService.ts    # Fuzzy item search (Fuse.js)
│   ├── storageService.ts   # AsyncStorage (saved location)
│   ├── recyclabilityService.ts  # Disposal rule lookup
│   └── zoneMatchingService.ts   # Address-to-zone matching
├── hooks/                  # Custom React hooks
├── constants/              # Theme colors, config
├── assets/                 # Images, icons, splash screen
├── .env                    # Environment variables (not committed)
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native | Cross-platform mobile framework |
| Expo (v54) | Build tooling, dev server, native APIs |
| Expo Router | File-based navigation (like Next.js for mobile) |
| TypeScript | Type-safe JavaScript |
| Fuse.js | Fuzzy search for the item database |
| Mapbox SDK | Geocoding (town/address search) |
| AsyncStorage | Persistent local storage (saving user location) |

---

## TypeScript Note

This project is written entirely in TypeScript (`.ts` and `.tsx` files). TypeScript adds type annotations to JavaScript, which helps catch bugs before the app runs. If you're new to TypeScript, the key thing to know is that it's just JavaScript with extra syntax for describing data shapes. The app compiles TypeScript down to JavaScript when it runs.

All data types are defined in `data/types.ts`. When adding new data, follow the interfaces defined there.
