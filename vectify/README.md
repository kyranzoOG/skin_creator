# ⚡ Vectify

> Modern, sleek, client-side raster-to-vector engine that converts PNG/JPEG/WEBP images into precise square-gridded SVG files and JSON pixel data matrices.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-emerald?style=flat-square&logo=github)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Zero Build Step](https://img.shields.io/badge/Zero%20Build%20Step-Static%20HTML-indigo.svg?style=flat-square)](#)

---

## ✨ Features

- **🎯 File Upload & Drag-and-Drop:**
  - Drag-and-drop or file picker supporting PNG, JPEG, WEBP, GIF, SVG.
  - Direct clipboard paste support (`Ctrl+V`).
  - Built-in instant sample artworks (Retro Hero, Cyber Heart, Magic Potion, 3D Cube).
  - Live preview with metadata (dimensions, file size, aspect ratio).

- **📐 Grid Size & Resolution Selector:**
  - Standard presets: **32×32, 64×64, 128×128, 256×256, 512×512, and 1024×1024 (max 1M+ pixels)**.
  - **Defaults dynamically to the input image size**.
  - Custom dimension inputs for arbitrary rectangular or square grids.
  - Fitting modes: Exact Stretch, Contain (pad transparent), Cover (center crop).

- **🔬 Nearest-Neighbor Canvas Engine:**
  - Client-side HTML5 Canvas with `imageSmoothingEnabled = false` for zero blur and exact color fidelity.
  - Skips fully transparent pixels (`a === 0`) with customizable alpha cutoff threshold.
  - Chunked asynchronous processing with live progress bar and status indicator for huge resolutions (e.g., 1024×1024).

- **⚡ Layer-Optimized SVG Output:**
  - **Color Layer Grouping (`<g fill="...">`)**: Groups all same-colored pixels into their own vector layer. Each pixel is an individual `<rect x="[x]" y="[y]" width="1" height="1" />` element, inheriting fill from the parent layer and drastically reducing SVG file size.
  - **Merged Color Paths (`<path fill="..." d="M..."/>`)**: Ultra-compact vector path mode.
  - **Flat Rects Mode**: Raw individual `<rect fill="..."/>` elements.

- **📊 2D Matrix JSON Output:**
  - Clean 2D array matrix of coordinates and colors (`matrix[y][x] = { x, y, color }`).
  - Alternative flat list mode (`[{ x, y, color }, ...]`) and indexed palette grid mode.

- **🎨 Interactive Workspace & Tools:**
  - Pan & Zoom (0.2× up to 48× magnification, mouse wheel support).
  - Pixel Grid Overlay toggle (subtle 1px pixel grid mesh).
  - Real-time **Pixel Inspector HUD** on hover: coordinates `(X, Y)`, color swatch, HEX code, and RGBA values.
  - **Color Layer Explorer**: Inspect every unique color, pixel count, percentage, and solo/highlight layers on the canvas.
  - Distinct download buttons: `grid_image.svg` and `pixel_data.json`.
  - Copy SVG and JSON to clipboard with instant toast notifications.

---

## 🚀 Instant Local Usage

Because Vectify is **100% static HTML, CSS, and Vanilla JavaScript**, there are **no dependencies or build steps**:

1. Simply double-click `index.html` to open it directly in any modern browser!
2. Or use any local server of your choice:
   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js
   npx serve .
   ```

---

## 🌐 Deploying to GitHub Pages

Deploying Vectify to GitHub Pages takes less than 1 minute:

1. Create a repository on GitHub (e.g. `vectify`).
2. Push this directory to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Vectify"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vectify.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch `main` and folder `/ (root)`.
   - Click **Save**.
4. Your site will be live at `https://<your-username>.github.io/vectify/`!

---

## 📁 Project Structure

```
vectify/
├── index.html         # Main dashboard, UI components, and controls
├── css/
│   └── style.css      # Glassmorphism, animations, checkerboard canvas, scrollbars
├── js/
│   ├── samples.js     # Built-in sample pixel art generators (Hero, Heart, Potion, Cube)
│   ├── engine.js      # Nearest-neighbor raster processing, SVG & JSON generator
│   └── app.js         # Viewport controller, zoom/pan, inspector, layer explorer, exports
└── README.md          # Documentation and GitHub Pages deployment guide
```

---

## 📄 Output Formats

### 1. Optimized SVG (`grid_image.svg`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <!-- Color Layer: #f43f5e (Rose Neon) -->
  <g id="layer-f43f5e" fill="#f43f5e">
    <rect x="7" y="3" width="1" height="1" />
    <rect x="8" y="3" width="1" height="1" />
    <!-- ... -->
  </g>
  <!-- Color Layer: #ffffff (White Highlight) -->
  <g id="layer-ffffff" fill="#ffffff">
    <rect x="9" y="5" width="1" height="1" />
  </g>
</svg>
```

### 2. JSON 2D Matrix (`pixel_data.json`)
```json
[
  [
    { "x": 0, "y": 0, "color": null },
    { "x": 1, "y": 0, "color": null },
    { "x": 2, "y": 0, "color": "#f43f5e" }
  ],
  [
    { "x": 0, "y": 1, "color": null },
    { "x": 1, "y": 1, "color": "#ffffff" },
    { "x": 2, "y": 1, "color": "#f43f5e" }
  ]
]
```

---

## ⚖️ License

MIT License. Free for personal and commercial use.
