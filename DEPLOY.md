# Deploy Campus Utility – Step by Step

Follow these steps in order. You will get one link (e.g. `https://your-app.vercel.app`) to share so anyone can view your website.

---

## Part 1: Put your code on GitHub

1. Go to **https://github.com** and sign in (or create an account).
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** `campus-utility` (or any name).
4. Leave **Public** selected. Do **not** add a README or .gitignore (you already have a project).
5. Click **Create repository**.
6. On your PC, open a terminal in your project folder (`c:\Users\dodda\campus-utility`).
7. Run these commands one by one (replace `YOUR_USERNAME` with your GitHub username):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/campus-utility.git
   git push -u origin main
   ```

8. If it asks for login, use your GitHub username and a **Personal Access Token** (not your password).  
   To create a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Give it “repo” permission.

After this, your code is on GitHub. Keep that tab open; you will use this repo for both Render and Vercel.

---

## Part 2: Deploy the backend (Render)

The backend is the `server` folder. Render will run it and give you a URL.

1. Go to **https://render.com** and sign in (choose **Sign in with GitHub**).
2. Allow Render to access your GitHub if asked.
3. Click **New +** (top right) → **Web Service**.
4. Under **Connect a repository**, find **campus-utility** and click **Connect** (or connect the repo if it’s not listed).
5. Fill in:
   - **Name:** `campus-utility-api` (or any name).
   - **Region:** Choose one close to you.
   - **Root Directory:** Click **Set** and type: `server`
   - **Runtime:** Node
   - **Build Command:** Leave empty, or type: `npm install`
   - **Start Command:** `node index.js`
6. Under **Instance type**, leave **Free** selected.
7. Click **Create Web Service**.
8. Wait a few minutes until the status is **Live** (green).
9. At the top you will see a URL like: **https://campus-utility-api.onrender.com**  
   **Copy this URL** (no slash at the end). You need it for Part 3.

---

## Part 3: Deploy the frontend (Vercel)

The frontend is the main React app. Vercel will build it and give you the link to share.

1. Go to **https://vercel.com** and sign in (choose **Continue with GitHub**).
2. Allow Vercel to access your GitHub if asked.
3. Click **Add New…** → **Project**.
4. Import your **campus-utility** repo (select it and click **Import**).
5. **Configure Project**:
   - **Root Directory:** Leave as `.` (root).
   - **Framework Preset:** Vite (Vercel usually detects it).
   - **Build Command:** `npm run build` (default).
   - **Output Directory:** `dist` (default).
6. **Environment Variables** (important):
   - Click **Environment Variables**.
   - **Name:** `VITE_API_URL`
   - **Value:** Paste the **Render URL** from Part 2 (e.g. `https://campus-utility-api.onrender.com`) — **no slash at the end**.
   - Click **Add**.
7. Click **Deploy**.
8. Wait 1–2 minutes until you see **Congratulations!**.
9. Click **Visit** (or the link shown). Your site URL will look like: **https://campus-utility-xxxx.vercel.app**

That link is the one you share. Anyone who opens it can view and use your website (no code needed).

---

## Part 4: If you change the backend URL later

If you created a new Render service or the URL changed:

1. In **Vercel** → your project → **Settings** → **Environment Variables**.
2. Edit **VITE_API_URL** and set it to the new Render URL (no trailing slash).
3. Go to **Deployments** → click **⋯** on the latest → **Redeploy**.

---

## Quick checklist

| Step | Where | What you get |
|------|--------|----------------|
| 1 | GitHub | Repo with your code |
| 2 | Render | Backend URL (e.g. `https://xxx.onrender.com`) |
| 3 | Vercel | **Site URL to share** (e.g. `https://xxx.vercel.app`) |

Share the **Vercel URL** with your friend so they can view the website.
