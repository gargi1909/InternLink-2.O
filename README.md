# InternLink — Full-Stack College Internship Management System

InternLink is an enterprise-grade college internship management platform engineered with **React + TypeScript (Vite)** on the frontend and **Express + TypeScript + Prisma ORM + PostgreSQL** on the backend. It provides strict Role-Based Access Control (RBAC), mentor-wise student data isolation, exact date scheduling and joining workflows, automated attendance calculations, work log review lifecycles, and comprehensive administrative audit logging.

---

## 🌟 Key Features & Architectural Highlights

1. **Role-Based Access Control (RBAC)**:
   - Dedicated dashboards, permissions, and workflows for **Student**, **Faculty Mentor**, **Company**, and **TPO / Admin**.
   - Enforced cryptographically on the server using signed JWT tokens, Argon2/bcrypt password hashing, and express RBAC middleware.

2. **Mentor-Wise Student Data Isolation**:
   - In accordance with college guidelines where faculty mentors supervise quotas (~23 students), each mentor can **strictly view and evaluate only their assigned students**.
   - Cross-mentor access is blocked at the **database query level** via relational SQL joins (`where: { mentorAssignments: { some: { mentorId, status: 'Active' } } }`). Direct URL or API tampering results in an immediate **HTTP 403 Forbidden**.

3. **Exact Date Scheduling & Validation Engine**:
   - Replaced vague options with exact calendar date pickers for **Internship Start Date**, **End Date**, **Application Deadline**, **Expected Joining Date**, and **Actual Joining Date**.
   - Server-enforced validation guarantees `endDate > startDate` and `deadline <= startDate`.
   - Distinct tracking between planned joining date and verified actual joining date upon confirmation.

4. **Automated Attendance & Work Log Review Cycle**:
   - Daily punch-in/punch-out attendance recording with automated percentage calculation (`(Present + Half-day*0.5) / Total`).
   - Daily work log submission with faculty status progression (`Submitted` ➔ `Under Review` ➔ `Approved` / `Revision Required`).

5. **TPO / Admin Control Center & Audit Trail**:
   - Administrative dashboard featuring mentor allocation metrics, student assignment/reassignment modals, account management, and institutional audit logging.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["React 18 + TypeScript + Vite SPA<br/>(Tailwind CSS + Lucide React + Recharts)"]
    APIClient["API Service Layer (src/services/api.ts)<br/>JWT Bearer Authorization"]
    
    subgraph Express Backend ["Express.js Server (Port 5000)"]
        AuthMiddleware["Auth & RBAC Middleware<br/>verifyToken & requireRole()"]
        RateLimiter["Rate Limiting Middleware<br/>express-rate-limit"]
        
        subgraph Routes ["REST API Controllers"]
            AuthRoutes["/api/auth"]
            StudentRoutes["/api/student"]
            FacultyRoutes["/api/faculty (Mentor Isolation)"]
            CompanyRoutes["/api/company"]
            InternshipRoutes["/api/internships"]
            AdminRoutes["/api/admin (TPO Controls)"]
            NotifRoutes["/api/notifications"]
        end
        
        AuditService["Audit Logger (src/utils/audit.ts)"]
    end
    
    ORM["Prisma ORM 5.22 Client"]
    DB[("PostgreSQL 17 Database<br/>internlink_db")]

    Client -->|HTTP / JSON Requests| APIClient
    APIClient -->|Bearer JWT Header| AuthMiddleware
    AuthMiddleware --> Routes
    RateLimiter --> AuthRoutes
    Routes --> AuditService
    Routes --> ORM
    AuditService --> ORM
    ORM -->|Prepared SQL Queries| DB
```

---

## 🗄️ Relational Database Schema (Mermaid ERD)

```mermaid
erDiagram
    User ||--o| StudentProfile : "has"
    User ||--o| FacultyProfile : "has"
    User ||--o| CompanyProfile : "has"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "initiates"

    StudentProfile ||--o{ StudentMentorAssignment : "assigned to"
    FacultyProfile ||--o{ StudentMentorAssignment : "supervises"

    CompanyProfile ||--o{ Internship : "posts"
    Internship ||--o{ InternshipApplication : "receives"
    StudentProfile ||--o{ InternshipApplication : "submits"

    StudentProfile ||--o{ AttendanceRecord : "records"
    Internship ||--o{ AttendanceRecord : "tracks"

    StudentProfile ||--o{ WorkLog : "logs"
    FacultyProfile ||--o{ WorkLog : "reviews"

    User ||--o{ Feedback : "submits"

    User {
        string id PK
        string email UK
        string passwordHash
        enum role "student | company | faculty | admin"
        string fullName
        string phone
        string avatarUrl
        boolean isActive
        datetime createdAt
    }

    StudentMentorAssignment {
        string id PK
        string studentId FK
        string mentorId FK
        string academicYear
        enum status "Active | Completed | Transferred"
        string assignedBy
        datetime assignedAt
    }

    Internship {
        string id PK
        string companyId FK
        string title
        string location
        string workMode
        date startDate
        date endDate
        date deadline
        int stipend
        int openings
        enum status "Draft | Scheduled | Open | In Progress | Completed | Cancelled"
    }

    InternshipApplication {
        string id PK
        string studentId FK
        string internshipId FK
        enum status "Applied | Shortlisted | Interview Scheduled | Accepted | Rejected | Completed"
        date interviewDate
        date expectedJoiningDate
        date actualJoiningDate
    }

    AttendanceRecord {
        string id PK
        string studentId FK
        string internshipId FK
        date date
        enum status "Present | Absent | Half Day"
        string punchInTime
        string punchOutTime
    }

    WorkLog {
        string id PK
        string studentId FK
        date logDate
        string tasksCompleted
        int hoursWorked
        enum status "Submitted | Under Review | Approved | Revision Required"
        string mentorNotes
        string reviewerId FK
    }

    AuditLog {
        string id PK
        string userId FK
        string action
        string entityType
        string entityId
        json details
        string ipAddress
        datetime createdAt
    }
```

---

## 👥 Demo Accounts & Credentials

The database has been pre-seeded with realistic academic data:

| Role | Name | Email | Password | Details & Context |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `student@internlink.demo` | `student123` | B.Tech CSE, 7th Sem. Assigned to **Dr. Priya Nair**. |
| **Faculty Mentor 1** | Dr. Priya Nair | `faculty@internlink.demo` | `faculty123` | Head of Mentorship. Supervises **Group A** (10 students). |
| **Faculty Mentor 2** | Prof. Rajesh Kumar | `rajesh@internlink.demo` | `faculty123` | Associate Professor. Supervises **Group B** (10 students). |
| **Company** | TechCorp Solutions (Sarah Jenkins) | `company@internlink.demo` | `company123` | Top Recruiter with active internship postings. |
| **TPO / Admin** | Dr. Suresh Kumar | `admin@internlink.demo` | `admin123` | Training & Placement Officer. Institution-wide rights. |

> *Quick Login*: Click any role chip on the Login page (`/login`) to instantly fill demo credentials.

---

## 🛠️ Windows Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **PostgreSQL**: PostgreSQL 16 or 17 running on Windows as a service (default port: `5432`)

### 1. Database Configuration
Ensure PostgreSQL is running. By default, InternLink uses database `internlink_db`.
If you need to create the database manually via `psql`:
```sql
CREATE DATABASE internlink_db;
```

Check `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:admin@localhost:5432/internlink_db?schema=public"
JWT_SECRET="internlink_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### 2. Install Dependencies
```cmd
cmd /c npm install
cmd /c npm --prefix server install
```

### 3. Run Prisma Migrations & Seed Data
```cmd
cmd /c npm run server:seed
```
*(This triggers `prisma generate`, `prisma migrate deploy`, and executes `server/prisma/seed.ts` creating 26 user accounts, profiles, mentor allocations, applications, and logs).*

### 4. Start Development Servers
Open two terminal windows:

**Terminal 1 — Backend API (Port 5000):**
```cmd
cmd /c npm run server
```

**Terminal 2 — Frontend Vite Application (Port 5173):**
```cmd
cmd /c npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Verification Test Suite

InternLink includes an automated end-to-end backend integration test suite verifying authentication, RBAC, mentor isolation, date validations, attendance algorithms, and audit logging.

Run the test suite anytime:
```cmd
cmd /c npm run server:test
```

### Verification Test Results:
```text
======================================================
🚀 RUNNING INTERNLINK BACKEND VERIFICATION TEST SUITE
======================================================

[1] Health Check & Database Connectivity
  ✅ PASS: Database connection verified via /api/health

[2] Authentication & Password Verification
  ✅ PASS: Rejects invalid password with 401
  ✅ PASS: Student login succeeds with valid password & returns JWT
  ✅ PASS: Faculty 1 login succeeds
  ✅ PASS: Faculty 2 login succeeds
  ✅ PASS: Company login succeeds
  ✅ PASS: Admin login succeeds

[3] Role-Based Access Control Enforcement
  ✅ PASS: Student blocked from faculty route with 403
  ✅ PASS: Company blocked from admin route with 403
  ✅ PASS: Unauthenticated request rejected with 401

[4] Critical Feature: Mentor-Wise Student Data Isolation
  ✅ PASS: Dr. Priya Nair sees exactly her 10 assigned students (not all 20)
  ✅ PASS: Aarav Sharma is present in Dr. Priya Nair group
  ✅ PASS: Ishita Kumar is NOT visible in Dr. Priya Nair group
  ✅ PASS: Prof. Rajesh Kumar sees exactly his 10 assigned students
  ✅ PASS: Ishita Kumar is present in Prof. Rajesh Kumar group
  ✅ PASS: Aarav Sharma is NOT visible in Prof. Rajesh Kumar group
  ✅ PASS: Unauthorized cross-mentor access denied with 403 Forbidden
  ✅ PASS: Faculty blocked from reviewing unassigned student work log with 403

[5] Critical Feature: Exact Internship Dates & Schedule Validation
  ✅ PASS: Rejects internship creation where end date <= start date with 400
  ✅ PASS: Rejects internship creation where deadline > start date with 400

[6] Attendance Recording & Exact Percentage Formula
  ✅ PASS: Student retrieves own attendance records
  ✅ PASS: Attendance percentage formula calculated: 80%

[7] Work-Log Submission & Faculty Review Lifecycle
  ✅ PASS: Student successfully submits daily work log
  ✅ PASS: Assigned mentor successfully reviews student work log

[8] Admin Mentor Assignment Management & Audit Logging
  ✅ PASS: Admin views all institution-wide student mentor assignments
  ✅ PASS: Audit trail records administrative and review actions

======================================================
TEST RESULTS: 26 PASSED, 0 FAILED
======================================================
```

---

## 🛡️ Mentor-Wise Student Data Isolation: In-Depth

### The Rule
A faculty mentor must **never** be capable of seeing or modifying records of students assigned to another mentor.

### Implementation at Database Level
In [`server/src/routes/faculty.routes.ts`](file:///c:/Users/PRASHANT%20SAWANT/Desktop/project-bolt-sb1-kjmpu3y3/project/server/src/routes/faculty.routes.ts), student listings and statistics are filtered using Prisma relations:
```typescript
const assignedStudents = await prisma.studentProfile.findMany({
  where: {
    mentorAssignments: {
      some: {
        mentorId: mentorUserId,
        status: 'Active',
      },
    },
  },
  include: { ... }
});
```

When accessing a specific student (`/api/faculty/students/:studentId`), the backend executes `verifyMentorAccess(mentorUserId, studentId)`:
```typescript
async function verifyMentorAccess(mentorUserId: string, studentId: string): Promise<boolean> {
  const assignment = await prisma.studentMentorAssignment.findFirst({
    where: {
      mentorId: mentorUserId,
      studentId: studentId,
      status: 'Active',
    },
  });
  return !!assignment;
}
```
If the assignment does not exist, the API rejects the request immediately with:
```json
{ "error": "Access denied: This student is not assigned to your supervision." } // HTTP 403 Forbidden
```

---

## 📅 Exact Date Scheduling Specifications

All internship models store ISO-8601 timestamps and calendar dates.
- `startDate`: Minimum date from which the internship begins.
- `endDate`: Must strictly occur **after** `startDate` (`endDate > startDate`).
- `deadline`: Application cutoff date. Must occur **on or before** `startDate` (`deadline <= startDate`).
- `expectedJoiningDate`: Planned date when student expects to start.
- `actualJoiningDate`: Confirmed date recorded when the student commences onboarding.

All dates are formatted consistently in the UI using standard locale formatting (e.g., `01 June 2026`).

---

## 📡 REST API Catalog

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account (Student/Company/Faculty). |
| `POST` | `/api/auth/login` | Public | Authenticate user, verify password, return JWT token. |
| `GET` | `/api/auth/me` | Authenticated | Fetch current authenticated user's session and profile. |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session client-side. |

### Student Endpoints (`/api/student`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/student/dashboard` | Student | Overall student metrics, assigned mentor info, active internship. |
| `PUT` | `/api/student/profile` | Student | Update student profile, skills, academic branch. |
| `GET` | `/api/student/applications` | Student | List applications submitted by student. |
| `POST` | `/api/student/applications` | Student | Apply for an internship with resume URL and cover letter. |
| `GET` | `/api/student/attendance` | Student | List student attendance records and calculate percentage. |
| `POST` | `/api/student/attendance` | Student | Submit punch-in / punch-out attendance record. |
| `GET` | `/api/student/work-logs` | Student | Retrieve student work logs. |
| `POST` | `/api/student/work-logs` | Student | Submit a daily work log with hours and tasks completed. |

### Faculty Mentor Endpoints (`/api/faculty`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/faculty/dashboard` | Faculty | Assigned student count, pending logs, department stats. |
| `GET` | `/api/faculty/students` | Faculty | **Isolated list** of only explicitly assigned students. |
| `GET` | `/api/faculty/students/:studentId` | Faculty | Detailed profile and logs of an assigned student (403 if unassigned). |
| `GET` | `/api/faculty/work-logs` | Faculty | Work logs belonging only to assigned students. |
| `PUT` | `/api/faculty/work-logs/:id/review` | Faculty | Approve or request revision on work log (403 if unassigned). |
| `GET` | `/api/faculty/reports` | Faculty | Progress and attendance summary report for assigned cohort. |

### Company Endpoints (`/api/company`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/company/dashboard` | Company | Company internship metrics and applicant statistics. |
| `PUT` | `/api/company/profile` | Company | Update company bio, website, location, and industry. |
| `GET` | `/api/company/internships` | Company | List internships posted by the logged-in company. |
| `POST` | `/api/company/internships` | Company | Post a new internship with exact date validation. |
| `GET` | `/api/company/applications` | Company | View applicants for company internships. |
| `PUT` | `/api/company/applications/:id/status`| Company | Update application status, schedule interviews, record joining dates. |

### Admin / TPO Endpoints (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Total institution metrics, mentor capacity utilization. |
| `GET` | `/api/admin/users` | Admin | Search and view all user accounts across roles. |
| `GET` | `/api/admin/assignments` | Admin | Complete list of all student-to-mentor allocations. |
| `POST` | `/api/admin/assignments` | Admin | Assign or reassign a student to a faculty mentor. |
| `GET` | `/api/admin/audit-logs` | Admin | Institution-wide audit trail with timestamps and IP addresses. |
| `GET` | `/api/admin/reports` | Admin | Comprehensive placement and internship analytics. |

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with salt rounds of 10 for all stored passwords. Plaintext passwords are never persisted or returned.
- **JWT Authorization**: Signed using HMAC-SHA256, verified on every state-mutating request.
- **SQL Injection Prevention**: Prisma ORM parameterized queries prevent SQL injection vulnerabilities.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attacks on `/api/auth/*`.
- **CORS Protection**: Restricted to trusted frontend origin (`http://localhost:5173`).
- **Audit Logging**: Sensitive administrative assignments, reviews, and status changes are recorded in the `AuditLog` table with user references and timestamps.
