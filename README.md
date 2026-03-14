# Consultancy Management System (CMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com)
[![Material-UI](https://img.shields.io/badge/MUI-5-007fff?logo=mui)](https://mui.com/)

A full-stack **Consultancy Management System** for managing leads, visa applications, documents, follow-ups, and invoices. Built with **React**, **TypeScript**, **Node.js**, **Express**, and **Supabase**.

---

## ✨ Features

- **Leads** – Capture, track, and assign leads with status, source, and visa details  
- **Visa applications** – Manage applications with status, fees, and dates  
- **Documents** – Upload, verify, and organize lead documents (Supabase Storage)  
- **Follow-ups** – Plan and log activities, meetings, and reminders  
- **Invoices** – Generate and manage invoices per lead  
- **Lead transfer** – Reassign leads between users  
- **Dashboard** – Overview of leads, activities, documents, and applications  
- **Auth** – Email/password sign-in via Supabase Auth with RLS  

---

## 🛠 Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, TypeScript, Material-UI (MUI), React Router, Framer Motion |
| Backend  | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL, Auth, Storage, RLS) |

---

## 🚀 Quick start

### Prerequisites

- **Node.js** 18+ and **npm**
- A **Supabase** project ([create one free](https://supabase.com))

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/CMS.git
cd CMS
npm run install:all
```

### 2. Environment variables

**Frontend** – copy and edit:

```bash
cp frontend/.env.example frontend/.env
```

Set in `frontend/.env`:

- `REACT_APP_API_URL` – e.g. `http://localhost:5000`
- `REACT_APP_SUPABASE_URL` – your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` – your Supabase anon (public) key

**Backend** – copy and edit:

```bash
cp backend/.env.example backend/.env
```

Set in `backend/.env`:

- `PORT` – e.g. `5000`
- `SUPABASE_URL` – same Supabase project URL
- `SUPABASE_ANON_KEY` – anon key
- `SUPABASE_SERVICE_ROLE_KEY` – service role key (server-only, keep secret)

### 3. Database setup

In the [Supabase SQL Editor](https://supabase.com/dashboard), run the schema:

- Open `supabase/schema.sql` in this repo
- Copy its contents and run them in your project’s SQL Editor

See [supabase/README.md](supabase/README.md) for details.

### 4. Run the app

```bash
npm start
```

- **Frontend:** http://localhost:3000  
- **Backend:** http://localhost:5000  

Create a user in **Supabase → Authentication → Users** to sign in.

---

## 📁 Project structure

```
CMS/
├── frontend/          # React app (port 3000)
│   ├── src/
│   │   ├── pages/     # Leads, Applications, Documents, Followups, Invoice, etc.
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/       # Supabase client, API
│   │   └── types/
│   └── .env.example
├── backend/           # Express API (port 5000)
│   ├── src/
│   └── .env.example
├── supabase/
│   ├── schema.sql    # Full DB schema (tables, RLS, storage, seed)
│   └── README.md     # Supabase setup guide
├── package.json      # Root scripts: install:all, start, build
└── README.md
```

---

## 📜 Scripts

| Command | Description |
|--------|-------------|
| `npm run install:all` | Install root, frontend, and backend dependencies |
| `npm start` | Run backend + frontend (concurrently) |
| `npm run start:frontend` | Run only frontend |
| `npm run start:backend` | Run only backend |
| `npm run build` | Build frontend for production |

---

## 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for how to submit issues and pull requests.

---

## 📄 License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) for details.

---

## ⭐ Show your support

If this project is useful to you, consider giving it a **star** on GitHub — it helps others discover the repo and motivates further development.
