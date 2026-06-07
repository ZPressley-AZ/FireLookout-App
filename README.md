# FireLookout

A smoke triangulation tool for lookout tower smoke reports.  Users enter an azimuth and range to a smoke; reports from multiple towers are plotted on a map and their intersection identifies the likely smoke location.

## Using the App

1. **Select a forest and lookout tower** from the dropdowns in the *Add a smoke* panel.
2. **Enter the azimuth** (0–360°, true bearing) and **range** in miles.
3. **Set the time reported** — defaults to current time, but can be adjusted.
4. Click **Plot smoke**. The ray appears on the map.
5. Add a second (or third) report from a different tower. Where the rays intersect, a marker is placed showing the probable smoke location.
6. Use **Remove (✕)** next to any entry in the *Active smokes* list to delete it, or **Clear all** to start over.

## Local Development

**Prerequisites:** Node.js 22+

```bash
npm install
npm run dev        # starts the Vite dev server at http://localhost:5173
```

Other useful commands:

```bash
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # run ESLint
```

## Publishing a New Version

This app is deployed on [Netlify](https://www.netlify.com). Every push to the `main` branch triggers an automatic build and deploy — no manual step is required.

**Workflow:**

```bash
git add <files>
git commit -m "describe your change"
git push origin main
```

Netlify picks up the push, runs `npm run build`, and publishes the `dist/` directory. Build status and deploy logs are visible in the Netlify dashboard.

### Secrets and Environment Variables

**Do not commit access tokens, API keys, or other secrets to this repository.**

If the app ever requires environment variables (e.g., a map tile API key), store them as [Netlify environment variables](https://docs.netlify.com/environment-variables/overview/) in the Netlify site dashboard under **Site configuration → Environment variables**. Vite will expose variables prefixed with `VITE_` to the client bundle at build time.

For local development, create a `.env.local` file (already listed in `.gitignore`) and add variables there:

```
VITE_EXAMPLE_KEY=your-value-here
```

Never add `.env.local` or any file containing real secrets to version control.
