# NexMart

nexmart/
  backend/    Node + Express + MongoDB API (models, routes, middleware, utils)
  frontend/   React + Vite storefront (components, context, pages, services)

## First time setup
1. cd backend
   - copy `.env.example` to `.env` and fill MONGODB_URI, JWT_SECRET, ADMIN_EMAIL (Razorpay keys optional)
   - put your old `app.js` here and rename it `old-app.js`
   - npm install
   - npm run seed        (imports the 100 products, run once)
2. cd ../frontend
   - npm install
   - npm run build       (creates frontend/dist)

## Run
- cd backend, then npm start, then open http://localhost:5000

## Develop the frontend with hot reload (optional)
- Terminal 1: cd backend, npm start
- Terminal 2: cd frontend, npm run dev, then open http://localhost:5173

Register with the ADMIN_EMAIL address to see the Admin dashboard under Your account.
Never upload `.env` or `old-app.js` to GitHub.

## End-to-end tests
- From the repository root, install dependencies with `npm ci`.
- Install the Chromium browser once with `npx playwright install chromium` (Linux CI uses `npx playwright install --with-deps chromium`).
- Run the desktop and mobile Chromium storefront flows with `npm run test:e2e`.
- Use `npm run test:e2e:headed` to watch the browser, `npm run test:e2e:ui` for Playwright UI mode, and `npm run test:e2e:report` to open the last HTML report.
- Tests start the Vite storefront automatically. They mock the product catalog API with isolated fixtures, so the core guest shopping tests do not need MongoDB and never create real orders or accounts. To point the browser tests at an already running site, set `PLAYWRIGHT_BASE_URL` before running the test command; the test catalog remains mocked.
- For a read-only real backend + MongoDB browser test, start the backend in one terminal (`cd backend; npm start`), then in another set `PLAYWRIGHT_API_URL=http://localhost:5000` and run `npm run test:e2e`. This verifies the database health check, catalog response, Vite proxy, product details, and a guest cart held only in browser storage. It creates no database records.
- Traces, screenshots, videos, and HTML reports are local artifacts under `test-results/` and `playwright-report/`; they are ignored by Git.
