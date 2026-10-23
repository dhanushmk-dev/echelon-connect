# Echelon Connect

Echelon Connect is a modern, paperless campus leave, on-duty (OD), and outpass approval management system. It features automated multi-tier approval workflows, cloud database persistence, and a single-use QR-based gate scanner for real-time exit verification and checkout tracking.

---

## 1. Overview

Traditional gate passes and physical leave letters in college campuses cause delayed approvals, lost paperwork, and untracked student exits. **Echelon Connect** digitizes this lifecycle into a unified, transparent portal connecting:
- **Students** (Day Scholars & Hostellers)
- **Class Advisors**
- **Heads of Departments (HOD)**
- **Hostel Wardens**

Once an application is approved through its required hierarchy, the system generates a secure, one-time QR pass. At the campus gate, security can scan the QR code via camera or token to verify student details in real time. Confirming departure marks the pass as exited and immediately invalidates it against reuse.

---

## 2. Features

- **Global Navigation Bar:**
  - Modern dark slate navigation header with responsive branding.
  - Prominent, glowing **"Scan Pass / QR"** action button accessible across all pages.
  - Active page indicator and smooth role-based routing.

- **Interactive Staff & Advisor Dashboard:**
  - **Filter & Stat Chips:** Quick visual metrics for total, pending, approved, and rejected requests.
  - **Comprehensive Request Table:**
    - **Student Profile:** Name, register number, department, and academic year.
    - **Hostel Information:** Dynamic block & room number display for Wardens.
    - **Request Details:** Type (`leave_request`, `od_request`, `leave_letter`, `leave_outpass_letter`), reason, and dual date/time stamps.
    - **Pill Status Badges:** Amber (Pending), Green (Approved), and Red (Rejected).
    - **Gate Exit Audit:** Displays verified checkout timestamp (`DD/MM/YYYY • hh:mm AM/PM`) or `Not Exited`.
    - **Action Buttons:** Polished Accept (Green) and Reject (Red) workflow triggers with action confirmation.

- **Student Workspace & Pass View:**
  - Dynamic request form adapting fields for Day Scholars vs. Hostellers.
  - Overview metric cards with colored accent icons.
  - Modal viewer for the generated QR Gate Pass barcode.

- **QR Scanner & Gate Verification Modal:**
  - **Live Camera Viewfinder:** Real-time scanning powered by `html5-qrcode`.
  - **File Upload & Token Input:** Fallback image QR reader and manual token entry tab.
  - **Valid Pass Card Preview:** Displays student photo placeholder, department, room, and allowed exit window before checkout.
  - **"Accept & Record Exit":** Single-click gate exit recording that updates `scanned_at` in the database and voids the pass.

- **Public Gate Check Page (`/verify/:token`):**
  - Standalone, high-contrast, mobile-first screen for gate guards scanning with external smartphones.
  - Instant visual feedback: Large green **"Valid Pass"** vs. red **"This QR has expired"**.

- **Modernized UI Design System:**
  - Clean SaaS visual theme with Inter typography.
  - Polished cards with subtle borders, elevation shadows, and hover lifts.
  - Modernized two-column authentication portals.

---

## 3. Tech Stack & Project Structure

### Tech Stack
- **Frontend:** React 18, Vite 5, Lucide React (icons), `html5-qrcode` (camera QR scanning).
- **Backend:** Node.js, Express (ES Modules), `mysql2` (MySQL client with SSL support), `dotenv`, `cors`.
- **Database:** Aiven Cloud MySQL with TLS/SSL encryption.
- **QR Generation Engine:** Python 3 (`qrcode[pil]`) invoked securely via `child_process.execFile`.

### Project Structure & File Map

```text
ai-project/
├── .gitignore                   # Excludes node_modules, .env, SSL certs, and generated QR PNGs
├── README.md                    # Project documentation, architecture, and setup instructions
├── backend/
│   ├── certs/
│   │   └── README.txt           # Instructions for placing Aiven ca.pem SSL certificate
│   ├── qr/
│   │   └── generate_qr.py       # Python script generating QR code images from token URLs
│   ├── qr_codes/                # Directory for static storage of generated QR pass images
│   ├── .env.example             # Template for required environment variables (safe for GitHub)
│   ├── .env                     # Local credentials (ignored by Git for security)
│   ├── db.js                    # MySQL2 connection pool configured for Aiven Cloud with SSL
│   ├── package.json             # Backend dependencies and launch scripts
│   ├── requirements.txt         # Python QR dependencies (qrcode[pil])
│   ├── schema.sql               # Base database schema definition and sample structure
│   └── server.js                # Express API routes, schema auto-migration, auth & exit logic
└── frontend/
    ├── public/                  # Public assets
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Dark slate header with glowing "Scan Pass" trigger
    │   │   ├── QRScannerModal.jsx   # Camera scanner, token lookup, and exit confirmation modal
    │   │   └── RequestTable.jsx     # Reusable request table with sticky headers & pill badges
    │   ├── pages/
    │   │   ├── Home.jsx             # Redesigned landing page with workflow strip and feature cards
    │   │   ├── RequestForm.jsx      # Adaptive leave and outpass application form
    │   │   ├── StaffDashboard.jsx   # Staff management dashboard with stat chips and action table
    │   │   ├── StaffLogin.jsx       # Two-column staff portal authentication card
    │   │   ├── StaffSignUp.jsx      # Staff registration portal with role selector
    │   │   ├── StudentDashboard.jsx # Student portal with colored metric cards and request history
    │   │   ├── StudentLogin.jsx     # Two-column student login card
    │   │   ├── StudentSignUp.jsx    # Student registration card with accommodation toggle
    │   │   └── Verify.jsx           # Public gate verification page with high-contrast validity status
    │   ├── App.jsx                  # Root component handling client-side state routing
    │   ├── index.css                # CSS variables, animations, and global utility classes
    │   └── main.jsx                 # React DOM application entry point
    ├── index.html               # Vite HTML entry point
    ├── package.json             # Frontend dependencies
    └── vite.config.js           # Vite dev configuration and backend API reverse proxy
```

---

## 4. Key Changed & Modernized Files

During the latest development cycle, the application underwent a full database migration to the cloud and a comprehensive UI redesign:

### 1. Database & Backend Modernization
- **`backend/db.js`**: Migrated from local MySQL to an environment-configured **Aiven Cloud MySQL** connection pool with SSL certificate validation (`rejectUnauthorized: true` with fallback support).
- **`backend/server.js`**: Updated startup routine to use the shared pool from `db.js`. Removed hardcoded local database creation routines while preserving automated schema verification and column migrations.
- **`backend/.env.example`**: Added a safe environment configuration template containing placeholder keys for repository sharing.
- **`backend/certs/` & `.gitignore`**: Created certificate handling folder and secured all private keys, `.env` files, and generated QR assets against GitHub commits.

### 2. Frontend UI Overhaul (Presentation & Styling)
- **`frontend/src/index.css`**: Built a complete CSS custom properties design token system (colors, gradients, shadows, radius scales, animations like `fadeIn`, `scaleIn`, and `pulse-glow`).
- **`frontend/src/pages/Home.jsx`**: Rebuilt with a mesh gradient hero, feature highlight cards with circular icon badges, and an interactive 4-step workflow indicator strip (*Student → Advisor → HOD → Warden*).
- **`frontend/src/pages/StudentLogin.jsx` & `StaffLogin.jsx`**: Transformed into polished two-column split cards with branded indigo/teal panels and gradient CTA buttons.
- **`frontend/src/pages/StudentSignUp.jsx` & `StaffSignUp.jsx`**: Redesigned with organized section dividers, rounded inputs, clear hints, and improved accessibility.
- **`frontend/src/pages/StudentDashboard.jsx`**: Enhanced with colored icon stat cards for metrics and an indigo gradient "New Request" button.
- **`frontend/src/pages/StaffDashboard.jsx`**: Added a left-accented banner, status filter chips, and an animated glowing "Scan Pass" button.
- **`frontend/src/pages/RequestForm.jsx`**: Form card styled with grouped fields, soft shadows, rounded inputs, and focused validation boundaries.
- **`frontend/src/components/RequestTable.jsx`**: Enhanced with sticky column headers, pill-style status badges, and streamlined Accept/Reject actions.

---

## 5. How to Run Locally

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (3.8+) with `pip`
- **Aiven Cloud MySQL Account** (or compatible MySQL database)

---

### Step 1: Environment & Database Configuration

1. In the `backend/` folder, copy `.env.example` to create `.env`:
   ```powershell
   cd backend
   copy .env.example .env
   ```
2. Open `backend/.env` and enter your Aiven MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=your-aiven-hostname.aivencloud.com
   DB_PORT=your-aiven-port
   DB_USER=avnadmin
   DB_PASSWORD=your-aiven-password
   DB_NAME=defaultdb
   DB_SSL_CA=./certs/ca.pem
   FRONTEND_BASE_URL=http://localhost:5173
   PYTHON_CMD=python
   ```
3. *(Optional)* Download your Aiven CA certificate (`ca.pem`) and place it in:
   ```text
   backend/certs/ca.pem
   ```
   *(Note: The backend automatically connects using secure SSL fallback if `ca.pem` is not present).*

---

### Step 2: Install Dependencies

1. **Backend & Python dependencies:**
   ```powershell
   cd backend
   npm install
   pip install -r requirements.txt
   ```

2. **Frontend dependencies:**
   ```powershell
   cd ../frontend
   npm install
   ```

---

### Step 3: Run the Application

Open two separate terminals:

**Terminal 1 — Backend:**
```powershell
cd backend
node server.js
```
*Expected log:*
```text
Echelon Connect Backend running on port 5000
[Database] Successfully connected to database 'defaultdb' on your-aiven-host.
[Database] Tables and schema migrations verified successfully.
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 6. GitHub & Security Best Practices

> [!IMPORTANT]
> **Never commit your `.env` file to GitHub.**
> Your actual database passwords, usernames, and hostnames are stored in `backend/.env`. This project has `.env` pre-configured in [.gitignore](file:///.gitignore).
> 
> Before committing code, verify with:
> ```powershell
> git status
> ```
> Ensure that `backend/.env` is never listed under changes to be committed. Only commit `backend/.env.example`.

---

## 7. Limitations

- **Authentication Storage:** Session state uses client-side `localStorage` (`echelon_ai_user`).
- **Password Storage:** Plaintext storage without bcrypt hashing (intended for development prototyping).
- **Network Scanning for Phones:** The QR code encodes `FRONTEND_BASE_URL`. Scanning via physical mobile devices requires setting this URL to your LAN IP (e.g., `http://192.168.1.50:5173`) in `backend/.env`.

---

## 8. Roadmap

- [ ] **Bcrypt Password Encryption:** Hash and salt student/staff credentials before saving to the database.
- [ ] **JWT Authorization:** Stateless token authentication headers for API security.
- [ ] **Curfew Expiry Cron:** Background scheduled service to invalidate un-exited passes automatically past designated hours.
- [ ] **Automated Notifications:** SMS/Email notifications to parents/wardens when exit is recorded.