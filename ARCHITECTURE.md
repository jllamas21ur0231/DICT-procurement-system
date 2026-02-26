# Project Architecture

- **Frontend**: ./frontend (Vite + React)
- **Backend**: ./backend (Laravel)
- In development:
  - Backend runs on http://localhost:8000
  - Frontend runs on http://localhost:5173
  - Frontend proxies all /api/* calls to backend (configured in vite.config.js)
- Always update both sides when adding/changing features.