Backend deployment (Render / Heroku)

This file contains minimal steps to deploy the Express backend (`project/backend`) that uses MongoDB.

Prerequisites
- A Git repo with this project
- A cloud host (Render or Heroku)
- A MongoDB connection string (MongoDB Atlas or similar)

Render (recommended)
1. Create a new Web Service on Render.
2. Connect your GitHub repo and choose the `project/backend` folder as the "Root Directory" (or set the build command accordingly).
3. Set the Build Command to: `npm install` (Render runs install automatically).
4. Start Command: `node server.js` (Render will use your `start` script if configured).
5. Add environment variables in Render's dashboard:
   - `MONGO_URI` (your Atlas URI)
   - `JWT_SECRET` (or other secrets)
6. Deploy and check logs on Render.

Heroku
1. From the root of your repo or the `project/backend` folder, create a Heroku app:
   - If deploying from the repo root, use the Heroku Git integration and set the "Buildpack" to Node.
2. Ensure `project/backend/Procfile` exists with:
```
web: node server.js
```
3. Set environment variables in Heroku Dashboard > Settings > Reveal Config Vars:
   - `MONGO_URI`, `JWT_SECRET`, etc.
4. Deploy (Heroku will run `npm install` and use your `start` script).

Important notes
- Do NOT commit `.env` file. Use the host's config/secret management.
- `server.js` already uses `process.env.PORT`.
- If you added `nodemon` for local development, it should be a devDependency and will not be used in production.

Troubleshooting
- If the app crashes on boot, check logs (Heroku: `heroku logs --tail`, Render: Logs tab).
- Confirm `MONGO_URI` is correctly set and accessible from the host network.
