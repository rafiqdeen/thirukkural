# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static website displaying Thirukkural (ancient Tamil literature with 1330 couplets) grouped by Adhigaram (chapters). The data is loaded from a CSV file and rendered dynamically using JavaScript.

## Architecture

- **index.html**: Single-page application with Bootstrap 5.3 for styling
- **script.js**: Fetches and parses `assets/kural.csv` using PapaParse, groups kurals by `adigaaram_ta` (chapter name in Tamil), and renders them to the DOM
- **style.css**: Minimal custom styles
- **assets/kural.csv**: CSV dataset containing all 1330 Thirukkural verses with columns including: `paal_ta/en` (section), `iyal_ta/en` (subsection), `adigaaram_ta/en` (chapter), `kural_ta` (verse in Tamil), `kural_en` (English translation), meanings, and transliterations

## Development

This is a static site with no build process. Open `index.html` directly in a browser or use any static file server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## External Dependencies (CDN)

- Bootstrap 5.3.0 (CSS + JS)
- PapaParse 5.3.2 (CSV parsing)
