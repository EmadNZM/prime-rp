# PRIME RP — Official Community Web Platform

> A luxury, bilingual (Arabic & English) web platform and administration suite designed for the **PRIME RP** FiveM roleplay community.

---

## 🌟 Overview

PRIME RP features a modern, responsive interface crafted with a dark luxury aesthetic (copper `#C8874B` accents, obsidian neutrals) and powered by a full-stack Node.js Express backend and React 18 frontend with Tailwind CSS.

### Key Capabilities

- **Bilingual Interface**: Full Arabic (RTL) & English (LTR) language switching with localized typography (Cairo & Montserrat).
- **Discord OAuth2 & RBAC**: Player authentication and role hierarchy (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `SUPPORT`, `CITIZEN`).
- **Interactive Constitution & Rules**: Filterable rulebook with severity tags, violation definitions, and penal codes.
- **Government & Private Careers**: Interactive career portal with duties, requirements, and job application submission.
- **Community Chronicles (News CMS)**: Real-time bilingual publishing system for server updates and changelogs.
- **Luxury Exchange (Store)**: VIP packages, custom vehicles, and real-estate listings with order tracking.
- **Citizen Portal**: Personal dashboard for managing tickets, past orders, and system notifications.
- **Staff Administration Desk**: Comprehensive admin dashboard for citizen management, ticket resolution, audit logs, and server settings.
- **FiveM Integration Layer**: Abstracted services ready to bind to live FXServer endpoints (online players, status, telemetry).

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/prime-rp-platform.git

# Navigate to project directory
cd prime-rp-platform

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your configuration variables in `.env`:
```env
PORT=3000
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
SESSION_SECRET=your_secure_session_secret
FIVEM_SERVER_IP=127.0.0.1
FIVEM_SERVER_PORT=30120
```

### 4. Running the Application

#### Development Mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build:
```bash
npm run build
npm start
```

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Full control over settings, CMS, staff, tickets, and audit trails |
| `ADMIN` | Manage users, edit rules/jobs, publish news, handle tickets |
| `MODERATOR` | Review tickets, enforce rules, moderate citizens |
| `SUPPORT` | Respond to player support tickets |
| `CITIZEN` | Access citizen portal, browse store, submit applications |

> **Development Testing**: The login screen includes a built-in Role Switcher to instantly preview the portal with any permission level.

---

## 📁 Project Structure

```
├── server.ts              # Express API server & Vite middleware
├── server/
│   ├── routes/            # REST API route handlers
│   ├── services/          # Business logic, FiveM connectors & db store
│   └── types.ts           # Backend TypeScript interfaces
├── src/
│   ├── components/        # UI components (Navbar, Footer, Logo, etc.)
│   ├── context/           # AuthContext & LanguageContext
│   ├── pages/
│   │   ├── public/        # Home, Rules, Jobs, News, Store, Support, FAQ
│   │   ├── user/          # Citizen Dashboard
│   │   └── admin/         # Staff Management Portal
│   ├── services/          # Frontend API client
│   ├── types.ts           # Frontend shared types
│   └── translations.ts    # Arabic & English localization dictionaries
├── data/
│   └── prime_rp_db.json   # Local relational JSON database (auto-seeded)
└── package.json
```

---

## 📜 License
All rights reserved © PRIME RP Community.
