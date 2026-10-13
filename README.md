# EventEase — Event Ticket Booking System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-blue.svg)](https://www.sqlite.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Vitest-30%2F30%20Passing-brightgreen.svg)](https://vitest.dev)

A responsive, full-stack event ticket booking web application designed and built for academic demonstration. **EventEase** features transactional concurrency control (ACID), 5-minute temporary seat holding, server-side dynamic pricing, idempotent simulated payment processing, and cryptographic QR code pass issuance.

---

## 1. Project Objective

EventEase addresses the critical engineering challenges found in high-scale ticket reservation systems:
- **Preventing Double-Booking**: Ensuring two users cannot book or hold the same seat under concurrent access.
- **Temporary Seat Reservations**: Automatically holding selected seats for 5 minutes during checkout, with automated release on expiration or failed payment.
- **Server-Side Trust**: Strictly validating prices and booking totals on the backend using tier multipliers (VIP, Premium, Standard).
- **Idempotent Payment Processing**: Safeguarding against duplicate charges and multiple ticket issues during network retries.
- **Verifiable Digital QR Passes**: Issuing individual tickets with unique codes and verifiable QR matrices that can be validated in real time.

---

## 2. Key Features

- **Event Discovery & Filtering**: Real-time multi-attribute search across event titles, venues, and cities (Coimbatore & Chennai), with category tabs (*Music, Technology, Sports, Arts, Comedy*).
- **Interactive Seat Matrix**: High-performance 60-seat visual grid per venue with clear reactive state indicators:
  - 🟢 **Green**: Available
  - 🟣 **Violet**: Selected by current attendee
  - 🟡 **Amber**: Temporarily held by another attendee (5-minute countdown)
  - 🔴 **Red**: Confirmed and booked
- **Hold Expiry Engine**: Hybrid dual-strategy hold expiration via a 30-second interval background scheduler and query-time lazy evaluation.
- **Simulated Demo Payment**: Clearly labelled demo checkout sandbox allowing simulation of either `SUCCESS` or `FAILED` payment. Failed payments immediately release held seats back to the public pool.
- **Digital Pass & QR Code Verification**: Renders printable tickets with scannable SVG QR codes pointing to live online verification endpoints.
- **Booking Management & Cancellation**: View active reservations, inspect ticket codes, and cancel confirmed bookings with immediate inventory replenishment.
- **Interactive Architecture Center**: In-app architecture visualizer with interactive Mermaid diagrams for **UML Class Diagram**, **Low-Level Architecture (LLD)**, and **High-Level Architecture (HLD)**.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with Vite 6
- **State Management**: Redux Toolkit (centralized booking slice) and React Hooks (`useState`, `useEffect`, `useContext`, `useReducer`)
- **Navigation**: React Router DOM 7
- **Styling**: Tailwind CSS with custom glassmorphism design system & dark navy / violet palette
- **Icons**: Lucide React
- **Diagrams**: Mermaid.js for interactive client-side rendering
- **QR Codes**: `qrcode.react` (SVG rendering)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with CORS, Morgan logging, and centralized error handling
- **Database**: SQLite 3 with `better-sqlite3` operating in Write-Ahead Logging (`WAL`) mode
- **Integrity**: Immediate ACID transactions (`db.transaction()`), foreign key cascades, and unique constraints
- **Testing**: Supertest and Vitest

---

## 4. System Architecture

```
User / Browser (React 19 SPA)
         ↕  [HTTP / REST JSON]
Express REST API Gateway (Port 5001)
         ↕
Service Layer (Event, Inventory, Hold, Booking, Payment, Ticket)
         ↕
Repository Layer (BookingRepository + db.transaction() Boundaries)
         ↕
SQLite Database (eventease.db in WAL Mode)
```

For complete architecture blueprints, see:
- [UML Class Diagram](file:///Users/dharsans/SD-SAT/docs/CLASS_DIAGRAM.md)
- [Low-Level Architecture (LLD)](file:///Users/dharsans/SD-SAT/docs/LLD.md)
- [High-Level Architecture (HLD)](file:///Users/dharsans/SD-SAT/docs/HLD.md)
- [REST API Documentation](file:///Users/dharsans/SD-SAT/docs/API_DOCUMENTATION.md)

---

## 5. Prerequisites

- **Node.js**: `v18.0.0` or higher (recommended: `v20+` or `v22+`)
- **npm**: `v9.0.0` or higher
- **Git**: Installed for version control and submission

Check your environment:
```bash
node -v
npm -v
git --version
```

---

## 6. Installation & Quick Start

### Step 1: Clone Repository
```bash
git clone https://github.com/Dharsan6/Ticket-booking.git
cd Ticket-booking
```

### Step 2: Install Dependencies
Install dependencies across the root, backend, and frontend with a single command:
```bash
npm run install:all
```
*(Alternatively, run `npm install` in the root, `cd server && npm install`, and `cd client && npm install`)*

### Step 3: Configure Environment
Copy the sample environment file to the server:
```bash
cp .env.example server/.env
```
Default parameters are pre-configured:
```env
PORT=5001
CLIENT_URL=http://localhost:5173
DATABASE_FILE=./src/database/eventease.db
HOLD_DURATION_SECONDS=300
HOLD_CLEANUP_INTERVAL_SECONDS=30
```

### Step 4: Seed Database
Populate the database with 6 realistic events and venues in Coimbatore & Chennai:
```bash
npm run seed
```

### Step 5: Start Development Servers
Start both backend (Port 5001) and frontend (Port 5173) concurrently:
```bash
npm run dev
```

Open your browser at:
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **Architecture Center**: [http://localhost:5173/architecture](http://localhost:5173/architecture)

---

## 7. Sample Events & Demo Workflow

The seed data provides 6 pre-configured events across categories:
1. **Tamil Rock Fusion Fest 2026** — CODISSIA Trade Fair Complex, Coimbatore (Music, ₹1,200)
2. **Global AI & Deep Tech Summit 2026** — Chennai Trade Centre, Chennai (Technology, ₹2,499)
3. **Southern Pro Kabaddi Championship Finals** — Nehru Indoor Stadium, Coimbatore (Sports, ₹750)
4. **Carnatic Symphony & Western Fusion** — The Music Academy, Chennai (Arts, ₹1,500)
5. **Laughter Riot 2026: Standup Comedy** — Hindusthan Performing Arts, Coimbatore (Comedy, ₹599)
6. **NextGen Cloud & DevOps Conclave** — Le Royal Méridien, Chennai (Technology, ₹1,899)

### Recommended Demo Steps:
1. **Browse Events**: Filter by "Coimbatore" or category "Music".
2. **Select Seats**: Click **Book Tickets** on *Tamil Rock Fusion Fest 2026*.
3. **Inspect Interactive Grid**: Notice seats `A1` and `A2` are marked red (`BOOKED`) from seed data. Select seats `B1` and `B2` (`VIP Lounge`).
4. **Reserve Hold**: Click **Proceed to Booking**. The system acquires a temporary hold with a 5-minute countdown banner.
5. **Fill Customer Form**: Enter your name, email, and mobile number.
6. **Simulate Payment**:
   - Choose **Simulate Successful Payment** to complete the reservation and receive verifiable tickets.
   - Or test **Simulate Payment Failure** to verify that seats `B1` and `B2` are immediately released back to available status.
7. **Verify QR Pass**: Click on the ticket QR code or visit `/tickets/:ticketCode/verify` to confirm real-time entry validation.
8. **Cancel Booking**: Navigate to **My Bookings**, search by email, and click **Cancel Booking** to release seats and receive a simulated refund.
9. **Inspect System Architecture**: Click **Architecture** in the navbar to explore the UML Class Diagram, LLD, and HLD.

---

## 8. Automated Testing

EventEase includes an automated test suite covering all 14 criteria:
- **Backend API Tests** (19 tests): Concurrency conflicts, transactions, hold expiry, payment idempotency, ticket issuance, cancellation, and seat map queries.
- **Frontend Unit Tests** (11 tests): Redux booking slice state transitions, seat matrix rendering, legend states, timer banner, and navigation elements.

Run all tests from the project root:
```bash
npm test
```

Or run suites independently:
```bash
npm run test:server   # Executes 19 Vitest/Supertest backend tests
npm run test:client   # Executes 11 Vitest/RTL frontend tests
```

---

## 9. API Reference Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health & SQLite connection check |
| `GET` | `/api/events` | List events with category & search filters |
| `GET` | `/api/events/:id` | Retrieve single event metadata |
| `GET` | `/api/events/:id/seats` | Real-time seat inventory & price multipliers |
| `POST` | `/api/holds` | Acquire 5-minute temporary seat hold |
| `DELETE` | `/api/holds/:id` | Manually release an active hold |
| `POST` | `/api/bookings` | Create booking in `PENDING` status |
| `GET` | `/api/bookings/:id` | Retrieve full booking confirmation |
| `GET` | `/api/bookings` | Query bookings by customer email or recent list |
| `POST` | `/api/bookings/:id/payments` | Process simulated demo payment (`SUCCESS`/`FAILED`) |
| `POST` | `/api/bookings/:id/cancel` | Cancel booking, void tickets, release seats |
| `GET` | `/api/tickets/:id/verify` | Verify digital ticket code and admission status |

---

## 10. Academic Scope & Future Enhancements

- **Customer Lookup Scope**: For academic demonstration, booking lookup utilizes customer email/phone queries. In enterprise production, this can be coupled with JWT authentication, OAuth2 (Google/GitHub), and role-based access control.
- **Payment Sandbox**: Payments are processed via an idempotent internal state simulator. A production rollout would integrate webhooks from Razorpay or Stripe.
- **Distributed Locking**: For multi-node container clusters, SQLite transactions can be augmented with Redis Redlock.

---

## 11. Author & License

- **Developer**: Dharshan S
- **Project**: EventEase — Full-Stack Event Ticket Booking System
- **License**: ISC
