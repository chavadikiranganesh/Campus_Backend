## Campus Utility – React-Based Student Utility Platform with AI Chatbot

Campus Utility is a React-based web application that promotes sustainability and collaboration within college environments.  
It enables senior students to sell or donate used study materials and helps juniors easily discover what they need, while also
assisting students with verified accommodation options and an integrated AI assistant.

### Project Title

**Campus Utility: A React-Based Student Utility Platform with AI Chatbot**

### Abstract

Campus Utility is a React-based web application that promotes sustainability and collaboration within college environments.
It enables senior students to sell or donate used study materials, such as books, instruments, and calculators, to juniors
who need them — fostering a culture of resource reuse.

It includes an **Accommodation Assistance Module** where students can browse nearby PGs or hostels with verified details like
rent, facilities, and contact information.

An integrated **AI Chatbot** offers 24/7 assistance, helping users navigate the platform, answer FAQs, and provide real-time
guidance.

### Key Modules

- **Study Materials Marketplace**: Lists books, instruments, calculators and notes from seniors, with filters by course,
  semester, category, and sale/donation type.
- **Accommodation Assistance**: Displays curated PG and hostel information with rent, facilities, distance and contact details.
- **AI Chatbot**: A rule-based assistant implemented in React that explains how to use the platform and answers common questions.

### Technology Stack

- **React + TypeScript** (frontend)
- **Vite** (bundler and dev server)
- **React Router** (client-side routing)
- **Tailwind CSS** (styling and layout)
- **Node.js + Express** (backend REST APIs)

The chatbot is implemented as a rule-based assistant. For demonstration, the logic exists both on the front-end and as a
`/api/chat` backend endpoint that can be extended to call real AI APIs in production.

### Project Structure (High-Level)

Frontend (inside `campus-utility`):

- `index.html` – Application entry HTML file with `root` div.
- `vite.config.ts` – Vite configuration with React plugin and `/api` proxy to the backend.
- `src/main.tsx` – Bootstraps React, wraps the app with `BrowserRouter`.
- `src/App.tsx` – Defines the main routes (`/`, `/marketplace`, `/accommodation`, `/about`) and uses a shared layout.
- `src/components/` – Shared UI components (`Navbar`, `Footer`, `Layout`, `chatbot/Chatbot`).
- `src/pages/` – Feature pages (`Home`, `Marketplace`, `Accommodation`, `About`).

Backend (inside `campus-utility/server`):

- `server/index.js` – Express server exposing:
  - `GET /api/health` – health check.
  - `GET /api/materials`, `POST /api/materials` – study materials listings.
  - `GET /api/accommodations` – accommodation listings.
  - `POST /api/chat` – rule-based chatbot reply.

### How to Run

1. **Start the backend server**

```bash
cd campus-utility/server
npm install    # first time only
npm run dev   # runs on http://localhost:5000
```

2. **Start the React frontend**

```bash
cd ../        # back to campus-utility root
npm install   # first time only
npm run dev   # Vite dev server, typically http://localhost:5173
```

During development, the frontend calls backend APIs through the Vite proxy at `/api/...`, so CORS configuration is simple.

