# FitTrack

A clean, professional nutrition and workout tracker in the spirit of MyFitnessPal / MyNetDiary — built with React (Vite), Express, and SQLite.

## Features

- **Dashboard** — calorie ring (goal vs. consumed vs. burned), macro breakdown (protein/carbs/fat), quick stats, and a 14-day calories-in vs. calories-burned trend chart.
- **Food Diary** — log foods by meal (breakfast/lunch/dinner/snacks), search the food database, adjust servings, navigate between days.
- **Food Database** — 117 built-in common foods with full nutrition info (calories, protein, carbs, fat, fiber, sugar, sodium), searchable/filterable by category, plus the ability to add your own custom foods.
- **Workouts** — 52 built-in exercises with MET values for accurate calorie-burn estimates based on your body weight, log workouts by duration, day-by-day history.
- **Settings** — set your weight/height/age/activity level and daily calorie & macro goals, or use "Suggest goals for me" (Mifflin-St Jeor BMR + activity multiplier).

All data is stored locally in a SQLite file (`server/data/fittrack.db`) — no account, no cloud, no external services required.

## Project structure

```
fittrack/
├── server/            Express API + SQLite database
│   ├── src/
│   │   ├── index.js       API routes
│   │   ├── db.js          schema + seeding
│   │   ├── seedFoods.js   ~117 starter foods
│   │   └── seedExercises.js  ~52 starter exercises
│   └── data/           fittrack.db lives here (auto-created)
└── client/            React + Vite frontend
    └── src/
        ├── pages/          Dashboard, Diary, Foods, Workouts, Settings
        ├── components/     Sidebar, modals, calorie ring, macro bars, etc.
        └── api.js          API client
```

## Requirements

- Node.js 18+ (tested on Node 22)

## Setup

From the `fittrack/` folder:

```bash
npm run install:all
```

This installs dependencies for both the server and the client.

## Run it

```bash
npm run dev
```

This starts both the API server (http://localhost:4000) and the frontend (http://localhost:5173) together. Open **http://localhost:5173** in your browser.

The Vite dev server proxies `/api` requests to the Express server, so there's no CORS configuration to worry about.

The first time the server starts, it automatically creates the SQLite database and seeds it with the starter foods and exercises.

### Running them separately

```bash
npm run dev:server   # API on port 4000
npm run dev:client   # frontend on port 5173
```

## Single-URL mode (recommended if you just want "one thing to run")

```bash
npm run start
```

This builds the frontend and starts the Express server serving *both* the API and the built app from **one port**: **http://localhost:4000**. No proxy, no second process — just open that one URL. This is also the setup you'd point a real host (a VPS, Render, Railway, Fly.io, etc.) at, since it's a single Node process listening on `PORT` (defaults to 4000).

## Building for production

```bash
npm run build
```

Builds the static frontend into `client/dist`. `npm run start` (above) does this automatically and then serves it — use `npm run build` on its own if you want to build without also starting the server.

## Getting a public URL later

This project runs as a single Node process (`npm run start`), which makes it a good fit for any free-tier host that runs a Node app: Render, Railway, Fly.io, a cheap VPS, etc. The general recipe on any of them is: build command `npm run install:all && npm run build`, start command `npm start --prefix server` (or `npm run start` from the repo root), and note that the bundled SQLite file resets on redeploy unless the host gives you a persistent disk/volume — check that if you want logged data to survive restarts. Happy to walk through a specific host if you want to set one up.

## Customizing

- **Add more starter foods/exercises**: edit `server/src/seedFoods.js` / `seedExercises.js`. They only seed on first run when the tables are empty — delete `server/data/fittrack.db` to re-seed from scratch (this wipes all logged data).
- **Change the color palette**: all colors are CSS custom properties in `client/src/styles/theme.css`.
- **Calorie-burn formula**: `calories = MET × weight(kg) × (minutes / 60)`, computed server-side in `server/src/index.js`.
