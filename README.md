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
