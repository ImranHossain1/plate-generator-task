# Plate Generator

A React app to design a plate generator system for configuring and visualizing custom wall plates: enter plate dimensions in **cm/inch**, preview a **continuous motif** spanning all plates, and export a **PNG**. Supports **English/German** (react-intl).

![Preview](./docs/images/preview.png)

> Tip: The preview supports **horizontal scroll** for wide layouts and **mirrors** the image for layouts wider than 300 cm to keep a seamless look.

---

## ✨ Features

- **Live visual preview** with smooth add/remove/resize transitions (shadcn + Tailwind / Headless UI `Transition`)
- **Continuous motif** across plates (`cover`)
- **Unit toggle**: centimeters ⇄ inches (with validation & locale formatting)
- **i18n**: English & German via **react-intl**
- **PNG export** of the preview canvas
- **Persistent config** (localStorage) with reset to defaults
- **Mobile-first**: horizontal scroll on overflow; no layout squish
- **Accessible**: keyboard focus/select on plate rows; ARIA labels on controls

---

## 🧱 Tech Stack

- **React 19**, **TypeScript**, **React Router**
- **shadcn/ui** (Tailwind + Radix UI)
- **react-intl** (FormatJS) for messages & number formatting
- **React-Konva (Konva)** for rendering
- Local state + **localStorage** persistence hook

> Note: This project **does not use framer-motion** and **does not implement theme/dark mode colors**.

---

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or **pnpm**/**yarn**)

### Installation

```bash
# clone your repo (choose one)
# SSH (requires SSH key setup):
git clone git@github.com:ImranHossain1/plate-generator-task.git
# HTTPS (works everywhere):
git clone https://github.com/ImranHossain1/plate-generator-task.git

# install deps
npm install
# or: pnpm i / yarn
```

### Development

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

---

## 🔗 Live Demo

[Live Server on Vercel](https://plate-generator-task.vercel.app/)

---

## 🌍 Internationalization (EN/DE)

- Provided by **react-intl**.
- Messages live in `src/i18n/en.json` and `src/i18n/de.json`.
- Wraps the app in `<LocaleProvider>` (see `main.tsx`).
- **Language toggle** via `useLocale()` hook and a shadcn toggle/button.

**Number formatting**:

- Use `<FormattedNumber>` or `intl.formatNumber` to respect locale rules.
- Inputs parse localized numbers via `parseLocaleNumber`.

---

## 🖼️ Preview & Rendering

- Scale: **1 cm = 1 px** (auto horizontal scroll if overflow).
- Renders plates using **React-Konva** (`Stage`, `Layer`, `Group`, `Image`).
- Robust cropping via a global **cover-crop** and per-plate **crop** calcs.
- **Mirroring**: When total width > **300 cm**, builds an offscreen `[img | mirrored img]` stripe for seamless continuity.
- `Export PNG` button grabs the canvas and triggers a download.

> **CORS Note:** For remote images, the server must allow cross-origin access. Otherwise the canvas becomes tainted and PNG export will fail. Use the sample image or a CORS-enabled URL.

---

## ⚙️ Configuration & Limits

Defined in `src/constants/plates.ts`:

```ts
export const PLATE_LIMITS = {
  MIN_W: 20,
  MAX_W: 300,
  MIN_H: 30,
  MAX_H: 128,
  MAX_PLATES: 10,
};

export const DEFAULT_PLATE_CONFIG = {
  motifUrl:
    "https://rueckwand24.com/cdn/shop/files/Kuechenrueckwand-Kuechenrueckwand-Gruene-frische-Kraeuter-KR-000018-HB.jpg?v=1695288356&width=1200",
  plates: [
    { id: crypto.randomUUID(), w: 60, h: 100 },
    { id: crypto.randomUUID(), w: 60, h: 100 },
    { id: crypto.randomUUID(), w: 60, h: 100 },
  ],
};
```

---

## 🧪 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --strictPort",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

---

## 🧰 Development Notes

## 🔧 Troubleshooting

- **PNG export fails**: likely a CORS issue. Try the **sample image** or host your image with proper `Access-Control-Allow-Origin`.
- **Layout shrinks on mobile**: ensure the preview wrapper has `overflow-x-auto` and the canvas uses `shrink-0`. The right config card column should be `md:flex-none` with a fixed width.
- **Numbers parse wrong**: check `parseLocaleNumber` and ensure you’re passing strings from inputs; use `<FormattedNumber>` for output.

---

## 🙌 Credits

Built by **Imran Hossain**.  
Localization via **react-intl**, components via **shadcn/ui**, styling via **Tailwind CSS**.
