Frontend deployment (Vite app)

This file contains minimal steps to deploy the Vite React frontend (`project/tech-event-finder`). Use Vercel or Netlify for easiest setup.

Vercel
1. Create a new project on Vercel and link your GitHub repo.
2. Set the Root Directory to `project/tech-event-finder` (so Vercel runs install/build there).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables (if frontend needs them): configure on Vercel dashboard.
6. Deploy. Vercel will automatically build and serve the site.

Netlify
1. New site -> GitHub -> select repo.
2. Set Basic build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `project/tech-event-finder`
3. Add environment variables via Site settings if needed.
4. Deploy site.

Static hosting notes
- The production build is in `project/tech-event-finder/dist`.
- If you host the frontend separately from the backend, set your API base URL in the frontend to point at the deployed backend (e.g., `https://api.example.com/api`).

Local preview of the production build
```powershell
# build
npm --prefix project/tech-event-finder run build
# preview (requires 'serve' installed globally or as a devDependency)
npx serve -s project/tech-event-finder/dist
```
