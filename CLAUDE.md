# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinanceForStudents is a static HTML/CSS/JS educational website for students to learn business and finance. There is no build system, bundler, or package manager — just plain HTML pages served directly.

## How to Run

Open `index.html` directly in a browser, or use a local server:
```bash
python -m http.server 8000
# or
npx serve .
```

## Architecture

**Static site with no framework.** Each page is a standalone HTML file that includes shared CSS and the JS modules it needs. All JS files use IIFEs (immediately-invoked function expressions) to avoid global scope pollution.

### Pages
- `index.html` — Landing page (hero, features, stats)
- `schedule.html` — Calendar widget + session list with RSVP
- `dashboard.html` — Student progress tracking
- `resources.html` — Lessons, videos, quizzes, downloadable materials
- `stock-game.html` — Stock market simulator ($10k virtual portfolio)
- `profile.html` — User account page
- `lesson-financial-statements.html` — Individual lesson page

### CSS layers
- `css/styles.css` — Base/global styles and CSS custom properties
- `css/pages.css` — Page-specific styles (dashboard, resources, stock game, schedule, profile)
- `css/home.css` — Home page hero and landing sections only

### JS modules (all IIFE-scoped, no imports/exports)
- `js/app.js` — Shared: active nav link highlighting (loaded on every page)
- `js/chatbot.js` — AI chatbot widget using Google Gemini API with rule-based fallback; renders into `#chatbot-container` div
- `js/calendar.js` — Calendar rendering, event generation, RSVP logic (uses `localStorage` key `ffs-rsvps`)
- `js/quizzes.js` — Quiz form scoring for resources page (3 quizzes with hardcoded answer keys)
- `js/stock-game.js` — Stock simulator with randomized price ticks every 5s, Chart.js for portfolio graph

### State management
All user state is client-side only:
- **localStorage** `ffs-rsvps` — RSVP data for calendar events
- **In-memory** — Stock game portfolio, chat history (resets on page reload)
- **No backend, no database, no authentication**

### External dependencies (loaded via CDN in HTML)
- **Chart.js** — Used by stock-game.html for portfolio graph
- **Google Gemini API** — Called directly from chatbot.js (often blocked by CORS in browser; falls back to rule-based responses)
