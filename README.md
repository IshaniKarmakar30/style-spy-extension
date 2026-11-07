# style-spy-extension

Style Spy is a developer and designer utility Chrome Extension built using Manifest V3. It allows users to inspect any webpage, extract dominant colors ranked by frequency, analyze typography rules, save customized style kits, and export the styling as reusable CSS variables.

---

## Features

- **Ranked Color Extraction:** Scans all visible DOM elements and identifies background and text colors, sorting them by real usage across the page.
- **Typography Detection:** Extracts font families, weights, and font sizes used on the target website.
- **One-Click Clipboard Copy:** Click on any color swatch or font rule to instantly copy its CSS property to your clipboard.
- **CSS Variable Export:** Generates clean, ready-to-use `:root` CSS variables for immediate integration into web development projects.
- **Persistent Style Kits:** Save extracted design schemes as named style kits stored locally via `chrome.storage.local`, ensuring they survive browser restarts.

---

## Project Structure

```text
style-spy-extension/
│
├── manifest.json       # Manifest V3 configuration & permissions
├── popup.html          # Extension popup UI
├── popup.css           # Styling for the popup interface
├── popup.js            # Popup logic, clipboard handling & storage management
├── content.js          # DOM style analyzer & style extraction engine
├── icon16.png          # 16x16 extension icon
├── icon48.png          # 48x48 extension icon
└── icon128.png         # 128x128 extension icon
