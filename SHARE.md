# How to share Campus Utility with others

## Option 1: Same Wi‑Fi (easiest)

Your friend must be on the **same Wi‑Fi** as you.

### 1. Start the backend

In a terminal:

```bash
cd server
npm run dev
```

Leave this running. You should see: `Campus Utility backend running on http://localhost:5000`.

### 2. Start the frontend (reachable on your network)

In **another** terminal, from the project root:

```bash
npm run dev:share
```

(or `npm run dev -- --host`)

You should see something like:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 3. Find your “Network” URL

- **Windows**: Run `ipconfig` in a terminal and look for **IPv4 Address** under your Wi‑Fi adapter (e.g. `192.168.1.5`).
- The URL to share is: **`http://YOUR_IP:5173`** (e.g. `http://192.168.1.5:5173`).

### 4. Share with your friend

Send them that URL. They open it in their browser (phone or laptop). They can use the site; login/register and API will work because your machine is running both frontend and backend.

**Note:** As long as your PC and the backend are running, the link works. If you close the terminals or put the PC to sleep, the link will stop working.

---

## Option 2: Deploy online (anyone with the link)

So that anyone can open the site from anywhere (not only same Wi‑Fi), you need to put it on the internet.

### Frontend (e.g. Vercel – free)

1. Push your project to **GitHub** (if not already).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. **Add New Project** → Import your repo → Root: `campus-utility` → **Deploy**.
4. After deploy, you get a URL like `https://campus-utility-xxx.vercel.app`.

### Backend (e.g. Render – free)

1. Push your code to GitHub (include the `server` folder).
2. Go to [render.com](https://render.com) and sign in.
3. **New** → **Web Service** → Connect your repo.
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: leave empty or `npm install`
   - **Start Command**: `node index.js`
5. Create the service. Render will give a URL like `https://campus-utility-api.onrender.com`.

### Connect frontend to the online API

The app is already set up to use `VITE_API_URL` in production.

1. In **Vercel**: open your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** your Render backend URL, e.g. `https://campus-utility-api.onrender.com` (no trailing slash).
3. **Redeploy** the frontend (Deployments → ⋮ → Redeploy).

Then share the **Vercel URL** (e.g. `https://campus-utility-xxx.vercel.app`) with your friend — they only need that link to view and use the site (no code).

---

## Quick recap

| Goal                         | What to do                                      |
|-----------------------------|--------------------------------------------------|
| Friend on same Wi‑Fi        | Use **Option 1**: run backend + `npm run dev:share`, share `http://YOUR_IP:5173`. |
| Friend (or anyone) anywhere | Use **Option 2**: deploy frontend (e.g. Vercel) + backend (e.g. Render), then share the frontend URL. |
