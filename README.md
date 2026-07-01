# focus.tools

A minimal productivity dashboard with three tools:
- **Randomizer** — add options and roll a die to pick one
- **Pomodoro** — countdown timer with focus / short / long break modes and custom time
- **Task list** — add tasks, check them off, track progress

Built with Next.js 15 + Tailwind CSS.

---

## Local dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

1. Install the CLI once:
   ```bash
   npm install -g vercel
   ```

2. From the project folder, run:
   ```bash
   vercel
   ```
   - It will ask you to log in (or sign up) — follow the prompts.
   - Accept all defaults when asked about framework / build settings.
   - First deploy goes to a preview URL.

3. To push to **production**:
   ```bash
   vercel --prod
   ```

That's it. Every time you want to redeploy after changes, just run `vercel --prod` again.

---

### Option B — GitHub + Vercel dashboard (recommended for ongoing projects)

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "init"
   gh repo create focus-tools --public --push --source=.
   ```
   (or push manually via GitHub Desktop / the GitHub website)

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.

3. Vercel auto-detects Next.js — just click **Deploy**.

4. From now on, every `git push` to `main` automatically redeploys.

---

## Project structure

```
app/
  page.tsx      ← all three tools live here
  layout.tsx    ← root layout + metadata
  globals.css   ← color tokens, scrollbar
```
