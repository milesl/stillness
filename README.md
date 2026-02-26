# Stillness

A personal wellbeing PWA. Three pillars: Grounding, Breathwork, Meditation.

## Structure

```
stillness/
├── stillness.html       ← app shell
├── manifest.json        ← PWA manifest
├── sw.js                ← service worker (offline support)
├── css/
│   └── app.css          ← all styles
├── js/
│   └── app.js           ← all Vue components and app logic
└── icons/
    ├── icon.svg
    ├── icon-192.png
    └── icon-512.png
```

## Usage

Open `stillness.html` in a browser, or serve the directory with any static file server:

```sh
npx serve .
# or
python3 -m http.server
```

No build step required. Vue 3 is loaded via CDN.

## Features

**Grounding**
- 5-4-3-2-1 Senses
- Body Scan (4 min)
- Mindful Object Focus (2 min)
- Grounding Through Feet (2.5 min)
- Leaves on a Stream (open-ended)

**Breathwork**
- Wim Hof Breathing (1–5 rounds)
- Box Breathing (4/5/6 count, 4–12 min)
- 4-7-8 Breathing (1–8 cycles)

**Meditation**
- Configurable duration (1–30 min)
- Optional guided prompts
- Optional interval bell

## Tech

- Vue 3 (CDN, no build)
- CSS custom properties
- `localStorage` for name and preferences
- PWA: installable, works offline
