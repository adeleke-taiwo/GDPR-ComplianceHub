# GDPR-ComplianceHub

> A production-style, full-stack **data privacy management platform** that translates complex GDPR legal obligations into a working, secure software system — complete with consent management, data subject rights, breach notifications, vendor risk tracking, DPIAs, and a full audit trail.

![Tech](https://img.shields.io/badge/React_19-TypeScript-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs)
![DB](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?logo=postgresql)
![Auth](https://img.shields.io/badge/Auth-JWT_+_RBAC-orange)
![GDPR](https://img.shields.io/badge/GDPR-Articles_6--35-blue)

---

## 🚀 Live Demo

**Frontend (GitHub Pages):** [https://adeleke-taiwo-dev.github.io/GDPR-ComplianceHub/](https://adeleke-taiwo-dev.github.io/GDPR-ComplianceHub/)

**Backend API (Fly.io):** [https://gdpr-compliancehub.fly.dev](https://gdpr-compliancehub.fly.dev)

### Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **User** | user@gdpr-compliance.com | `User@123` | Personal privacy dashboard, consent management, data export/erasure |
| **Admin** | admin@gdpr-compliance.com | `Admin@123` | System operations, user management, data requests, audit logs |
| **DPO** | dpo@gdpr-compliance.com | `DpoAdmin@123` | Compliance oversight, DPIAs, breach management, vendor risk |

> **Note:** First request after inactivity may take ~10 seconds (Fly.io free tier auto-suspends).

---

## Screenshots

> **Screenshots:** Preview the application's pages and user interface at a glance.

### User Portal

| Login | User Dashboard | Consent Management |
|:---:|:---:|:---:|
| ![Login](docs/screenshots/login.png) | ![User Dashboard](docs/screenshots/dashboard-user.png) | ![Consent](docs/screenshots/consent.png) |

| My Data (Export & Erasure) | Breach Alerts | Privacy Policy |
|:---:|:---:|:---:|
| ![My Data](docs/screenshots/my-data.png) | ![Breaches](docs/screenshots/breach-alerts.png) | ![Privacy](docs/screenshots/privacy-policy.png) |

### Admin & DPO Portal

| Admin Dashboard | DPO Dashboard | User Management |
|:---:|:---:|:---:|
| ![Admin Dashboard](docs/screenshots/dashboard-admin.png) | ![DPO Dashboard](docs/screenshots/dashboard-dpo.png) | ![Users](docs/screenshots/users.png) |

| Cookie Management | Vendor Management | DPIA Management |
|:---:|:---:|:---:|
| ![Cookies](docs/screenshots/cookies.png) | ![Vendors](docs/screenshots/vendors.png) | ![DPIAs](docs/screenshots/dpias.png) |

| Data Requests | Processing Records | Audit Log |
|:---:|:---:|:---:|
| ![Requests](docs/screenshots/data-requests.png) | ![Processing](docs/screenshots/processing-records.png) | ![Audit](docs/screenshots/audit-log.png) |

---

## Why This Project?

GDPR compliance is a mandatory requirement for any product handling EU personal data. This platform demonstrates the ability to:

- **Translate legal requirements** (Articles 6, 7, 13–17, 30, 33–35) into working software architecture
- **Design multi-role systems** with strict RBAC (User / Admin / DPO)
- **Build security-first APIs** — JWT refresh flow, HTTP-only cookies, Zod validation, rate limiting, Helmet headers
- **Implement audit trails** — every sensitive action is logged with actor, IP, timestamp, and resource
- **Handle real-world complexity** — consent versioning, data anonymisation on erasure, 72-hour breach reporting deadlines

---

## Features

### User Portal
| Feature | GDPR Article |
|---|---|
| Granular consent management (5 purposes, toggle per item) | Art. 7 |
| Real-time consent rate dashboard (personal %) | Art. 7 |
| Personal data export (structured JSON download) | Art. 15, 20 |
| Right to erasure request with admin review workflow | Art. 17 |
| Breach alert notifications with acknowledgement | Art. 34 |
| Privacy policy with full transparency disclosures | Art. 13–14 |

### Admin Portal
| Feature | Notes |
|---|---|
| User management (activate, deactivate, change role) | Role-based access guards |
| Data request processing (approve/reject erasure & access) | Full audit trail |
| Processing Records (ROPA) management | Art. 30 compliance |
| Cookie registry with first/third-party categorisation | ePrivacy |
| Vendor/sub-processor tracking with DPA management | Art. 28 |
| Platform-wide consent rate analytics | Recharts visualisation |
| Audit log (immutable, filterable, paginated) | All sensitive operations |

### DPO Portal
| Feature | Notes |
|---|---|
| Dedicated compliance dashboard (DPIAs, breaches, high-risk vendors) | Role-specific view |
| Data Protection Impact Assessments with risk scoring | Art. 35 |
| DPIA risk matrix (likelihood × impact scoring, 1–5 scale) | Automated risk level |
| Mitigation tracking with status workflow | Planned → Complete |
| Active breach management with 72-hour authority reporting | Art. 33 |
| High-risk vendor monitoring | Art. 28 |
| Retention policy configuration (anonymise/delete/archive) | Art. 5(1)(e) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite 6 |
| **Backend** | Node.js 20, Express 5, Zod validation |
| **Database** | PostgreSQL, Prisma 5 ORM |
| **Authentication** | JWT (15min access + 7d refresh), bcrypt, HTTP-only cookies |
| **State Management** | React Context (auth), TanStack Query v5 (server state) |
| **Charts** | Recharts (doughnut, bar, summary) |
| **Security** | Helmet, CORS, express-rate-limit, input sanitisation |
| **Testing** | Jest, Supertest |
| **Dev Tools** | Nodemon, ESLint, Prettier |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT (React 19)                      │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  │
│  │  16 Pages│  │ Components │  │ Services │  │  Context  │  │
│  │ per role │  │Layout+Common│  │13 modules│  │Auth+Query │  │
│  └────┬─────┘  └────────────┘  └────┬─────┘  └───────────┘  │
│            TanStack Query v5                                  │
└────────────────────────┬─────────────────────────────────────┘
                         │  HTTP / REST API
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVER (Express 5)                        │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 13 Route │  │13 Controllers│  │13 Services│  │Middleware │  │
│  │  groups  │──│ thin layer │──│ business │  │JWT · RBAC │  │
│  └──────────┘  └────────────┘  │  logic   │  │Audit · Zod│  │
│                                └────┬─────┘  └──────────┘  │
└─────────────────────────────────────┼───────────────────────┘
                                      │  Prisma ORM
                                      ▼
                            ┌──────────────────────┐
                            │     PostgreSQL        │
                            │  18 models · 8 enums  │
                            └──────────────────────┘
```

### API Endpoints

| Endpoint | Purpose | Access |
|---|---|---|
| `POST /api/v1/auth` | Register, login, token refresh, logout | Public |
| `GET/PATCH /api/v1/consent` | Consent preferences, history | User |
| `GET/POST /api/v1/data-requests` | Access & erasure requests | User + Admin |
| `GET /api/v1/data-export` | Download personal data as JSON | User |
| `GET /api/v1/users` | User management | Admin/DPO |
| `GET /api/v1/processing-records` | ROPA management | Admin/DPO |
| `GET /api/v1/cookies` | Cookie registry & consent tracking | Admin/DPO |
| `GET /api/v1/vendors` | Vendor & sub-processor management | Admin/DPO |
| `GET /api/v1/dpias` | DPIA lifecycle management | Admin/DPO |
| `GET /api/v1/breaches` | Breach management & notifications | DPO + User |
| `GET /api/v1/retention-policies` | Data retention rules | DPO |
| `GET /api/v1/audit-logs` | Immutable activity log | Admin/DPO |
| `GET /api/v1/dashboard` | Role-adaptive statistics | All roles |

### Auth Flow

```
POST /auth/login
  └─> Validate credentials (bcrypt)
  └─> Issue access token (JWT, 15 min, memory)
  └─> Issue refresh token (JWT, 7 days, HTTP-only cookie)

On 401 response:
  └─> Interceptor calls POST /auth/refresh (cookie sent automatically)
  └─> New access token issued → original request retried
  └─> On refresh failure → clear state → redirect to /login
```

### GDPR Compliance Mapping

| Article | Requirement | Implementation |
|:---:|---|---|
| **Art. 6** | Lawful basis for processing | Legal basis tracked per processing record (6 bases) |
| **Art. 7** | Conditions for consent | Granular per-purpose consent with timestamps, IP, and version |
| **Art. 13–14** | Transparency obligations | Privacy Policy page with full disclosures |
| **Art. 15** | Right of access | Data export as structured JSON |
| **Art. 17** | Right to erasure | Erasure request workflow; data anonymised on completion |
| **Art. 20** | Data portability | Structured JSON export of all personal data |
| **Art. 28** | Processor obligations | Vendor registry with DPA tracking and sub-processor management |
| **Art. 30** | Records of processing | ROPA management with legal basis and retention |
| **Art. 33–34** | Breach notification | Breach reporting, 72h deadline tracking, user alerts |
| **Art. 35** | Impact assessments | Full DPIA workflow with risk scoring and mitigation tracking |

---

## Roles & Permissions

| Capability | User | Admin | DPO |
|---|:---:|:---:|:---:|
| Manage own profile & consent | ✅ | ✅ | ✅ |
| Export / request erasure of own data | ✅ | ✅ | ✅ |
| View breach alerts | ✅ | ✅ | ✅ |
| Manage users | — | ✅ | ✅ |
| Process data requests | — | ✅ | ✅ |
| Manage processing records (ROPA) | — | ✅ | ✅ |
| Manage cookie registry | — | ✅ | ✅ |
| Manage vendors & sub-processors | — | ✅ | ✅ |
| Create & manage DPIAs | — | ✅ | ✅ |
| View audit logs | — | ✅ | ✅ |
| Manage breaches & notify users | — | — | ✅ |
| Configure retention policies | — | — | ✅ |
| Dedicated compliance dashboard | — | — | ✅ |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/GDPR-ComplianceHub.git
cd GDPR-ComplianceHub

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Configure environment
cd ../server
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# 4. Set up database
npx prisma db push
npx prisma generate
npm run db:seed

# 5. Start development servers
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

**Local:** Open [http://localhost:5173](http://localhost:5173)

**Live Demo:** [https://adeleke-taiwo-dev.github.io/GDPR-ComplianceHub/](https://adeleke-taiwo-dev.github.io/GDPR-ComplianceHub/)

### Demo Accounts

Use these credentials for both local and live deployments:

| Role | Email | Password |
|---|---|---|
| **User** | user@gdpr-compliance.com | `User@123` |
| **Admin** | admin@gdpr-compliance.com | `Admin@123` |
| **DPO** | dpo@gdpr-compliance.com | `DpoAdmin@123` |

---

## Project Structure

```
GDPR-ComplianceHub/
├── client/                          # React 19 frontend
│   └── src/
│       ├── components/
│       │   ├── layout/              # Sidebar, Header, Layout
│       │   └── common/              # StatCard, CookieBanner, StatusBadge, ProtectedRoute
│       ├── context/                 # AuthContext — JWT state & refresh logic
│       ├── hooks/                   # useAuth
│       ├── pages/                   # 16 page components (role-adaptive)
│       ├── services/                # 13 Axios API service modules
│       ├── types/                   # TypeScript interfaces (all models)
│       └── utils/                   # Constants, date formatters
├── server/                          # Express 5 backend
│   ├── prisma/
│   │   ├── schema.prisma            # 18 models, 8 enums
│   │   └── seed.js                  # Demo data seeder
│   └── src/
│       ├── config/                  # Environment & Prisma client
│       ├── controllers/             # 13 thin request handlers
│       ├── middleware/              # auth, roleCheck, auditLogger, validate, errorHandler
│       ├── routes/                  # 13 route groups with Zod schemas
│       ├── services/                # 13 business logic modules
│       └── utils/                   # ApiError, constants
├── docs/
│   └── screenshots/                 # UI screenshots for README
└── README.md
```

---

## Security Highlights

- **JWT rotation** — short-lived access tokens (15 min) + long-lived refresh tokens (7 days) stored in HTTP-only cookies
- **Password hashing** — bcrypt with salt rounds
- **Input validation** — Zod schemas on every POST/PATCH endpoint; invalid requests rejected before hitting controllers
- **RBAC** — role checked in middleware before every protected route; no client-side trust
- **Audit logging** — every sensitive mutation (consent, requests, breaches, users) logged with actor ID, IP address, timestamp, and resource snapshot
- **Data anonymisation** — erasure requests replace PII with anonymised placeholders, preserving relational integrity
- **Rate limiting** — express-rate-limit on all API routes
- **HTTP security headers** — Helmet with CSP, HSTS, X-Frame-Options

---

## License

MIT
