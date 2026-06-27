# CivicTrack AI – Smart Infrastructure Issue Reporting & Tracking System

CivicTrack AI is a full-stack, enterprise-grade web application built to empower citizens to report civic infrastructure issues (e.g. potholes, broken streetlights, water leaks, garbage dumps), while providing municipality administrators with real-time mapping dashboards to assign tasks and manage resources, and field staff with operational portals to update repairs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js (Vite) + Tailwind CSS (v3) + Lucide React (Icons) + Leaflet (OpenStreetMap integration, zero-key requirements) + jsPDF (client-side PDF reports) + Native HTML5 Geolocation.
- **Backend**: Node.js + Express.js + JSON-file-based NeDB/Mongoose database system + JWT security + Multer upload storage.
- **AI Diagnostics Engine**: Local machine learning heuristic model executing instant category classification, severity estimation, auto-priority calculations, and proximity double-reporting duplicate detection (using Haversine geographical distance).
- **Notifications Channel**: Server-Sent Events (SSE) for real-time dashboard notifications + SMTP nodemailer configuration (logs virtual emails locally to a mock client inbox).
- **Containerization**: Full Docker support with orchestration.

---

## 📂 Project Structure

```
civictrack-ai/
├── backend/
│   ├── data/                   # File-based JSON database (users, complaints, notifications)
│   ├── public/uploads/         # Uploaded images (Before / After repair photos)
│   ├── src/
│   │   ├── config/db.js        # Flexible NeDB/MongoDB database connector
│   │   ├── controllers/        # Controllers (Auth, Complaint, Analytics)
│   │   ├── middleware/         # Middleware (JWT check, role authorization check)
│   │   ├── routes/api.js       # Main REST endpoints mapping & SSE push stream
│   │   └── services/           # Services (AI diagnostic engine, notifications broadcaster)
│   ├── server.js               # API Server Entrypoint & database auto-seeding
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/         # MapView, DashboardLayout
│   │   ├── context/            # AuthContext, NotificationContext (SSE stream viewer)
│   │   ├── pages/              # CitizenPortal, AdminDashboard, StaffDashboard, Analytics, DebugEmails, APIDocs
│   │   ├── App.jsx             # State routing coordinator
│   │   ├── main.jsx
│   │   └── index.css           # Styling base (Custom scrollbars, dark mode styles)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Container orchestration
└── README.md
```

---

## 🔑 Quick Login Credentials (Auto-Seeded)

The database automatically seeds default accounts on startup for immediate cross-role testing:

| Role | Email Address | Password | Action Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civictrack.ai` | `password123` | Report issues with images, retrieve GPS coordinates, run AI diagnostics, track tickets. |
| **Admin** | `admin@civictrack.ai` | `password123` | View interactive OpenStreetMap, search/filter, assign tasks, update statuses, audit logs, download PDFs. |
| **Staff** | `staff@civictrack.ai` | `password123` | View assigned repair orders, update status to "In Progress", submit completion report notes & photos. |

---

## 🚀 Running the Application

### Method 1: Using Docker (Recommended)

1. Make sure you are in the root directory:
   ```bash
   cd civictrack-ai
   ```
2. Build and start all services:
   ```bash
   docker-compose up --build
   ```
3. Open the portals:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

### Method 2: Running Locally via Node

1. Install all dependencies across workspace, backend, and frontend:
   ```bash
   npm run install:all
   ```
2. Spin up both dev servers concurrently:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.
