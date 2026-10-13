# EventEase — High-Level Architecture (HLD)

## 1. System Topology Overview

**EventEase** is designed as a modular, full-stack event ticketing platform. It decouples presentation, business orchestration, and relational data persistence while keeping local deployment straightforward and lightweight.

```mermaid
flowchart LR
    subgraph ClientTier ["1. Presentation Tier (Client Browser)"]
        SPA["React 19 SPA (Vite)<br/>- Interactive Seat Matrix<br/>- Dynamic Tier Calculations<br/>- 5-Min Hold Countdown<br/>- Demo Payment Portal<br/>- SVG QR Code Renderer"]
    end

    subgraph APITier ["2. Application Tier (Node.js & Express)"]
        direction TB
        Gateway["Express HTTP Gateway (Port 5001)<br/>- CORS & Security Headers<br/>- Request Logger (Morgan)<br/>- Centralized Exception Filter"]

        subgraph CoreEngines ["Core Application Engines"]
            Cat["Event Catalog Engine"]
            Inv["Seat Inventory & Locking Engine"]
            BkMgr["Booking & Lifecycle Manager"]
            PaySim["Idempotent Payment Simulator"]
            TktGen["Ticket & QR Code Verifier"]
            Worker["Hold Expiry Scheduler (30s)"]
        end

        Gateway <--> CoreEngines
    end

    subgraph DataTier ["3. Data Tier (Relational Storage)"]
        DB[("Embedded SQLite 3 (WAL Mode)<br/>- venues, events, seats<br/>- seat_holds, bookings, booking_seats<br/>- payments, tickets<br/>- ACID Transactions & Composite Keys")]
    end

    subgraph FutureTiers ["4. Optional Future Cloud Scale (Planned)"]
        Redis["[Future] Redis Cache / Distributed Locks"]
        Queue["[Future] BullMQ / Kafka Worker"]
        PayGate["[Future] Razorpay / Stripe Gateway"]
        LB["[Future] Nginx / Cloud Load Balancer"]
    end

    SPA <-->|HTTP / REST JSON (Port 5001)| Gateway
    CoreEngines <-->|Better-SQLite3 Prepared Queries| DB

    Cat -.-x|Optional future read cache| Redis
    Worker -.-x|Optional distributed job| Queue
    PaySim -.-x|Optional live gateway| PayGate
    Gateway -.-x|Optional cluster entry| LB

    classDef future stroke-dasharray: 5 5,stroke:#64748b,fill:#1e293b,color:#94a3b8;
    class FutureTiers,Redis,Queue,PayGate,LB future;
```

---

## 2. Logical Subsystems & Responsibilities

### 2.1 Event Catalog Engine
- **Purpose**: Serves active events, venue metadata, categories (`Music`, `Technology`, `Sports`, `Arts`, `Comedy`), and schedule details.
- **Filtering**: Performs case-insensitive category matching and multi-field text search over event titles, venue names, and cities.
- **Computed Metrics**: Computes real-time remaining seat counts (`total_seats - confirmed_seats`).

### 2.2 Seat Inventory & Locking Engine
- **Purpose**: Tracks 60 physical seats per venue grouped into VIP, Premium, and Standard tiers.
- **Four-State Reactive Seat Model**:
  - `AVAILABLE` (Green): Open for selection.
  - `SELECTED` (Violet): Picked by the current attendee.
  - `HELD` (Amber): Under temporary 5-minute hold by another attendee.
  - `BOOKED` (Red): Confirmed and paid.
- **Locking**: Executes immediate transactional checks before granting a hold token.

### 2.3 Hold Expiry Scheduler
- **Purpose**: Ensures that abandoned checkouts do not lock seats indefinitely.
- **Worker**: Lightweight `setInterval` routine running every 30 seconds that transitions `ACTIVE` holds with `expires_at <= datetime('now')` to `EXPIRED`.
- **Zero Orphan Seats**: Guaranteed by both the background worker and lazy cleanup queries.

### 2.4 Booking & Lifecycle Manager
- **State Machine**:
  - `PENDING` ➔ Initial booking tied to active hold token.
  - `CONFIRMED` ➔ Successfully paid, tickets issued.
  - `CANCELLED` ➔ Booking cancelled, tickets voided, seats released.
  - `EXPIRED` ➔ Timed out before payment.
- **Server-Side Trust**: Calculates prices on the server based on `event.base_price * seat.price_multiplier`.

### 2.5 Idempotent Payment Simulator
- **Purpose**: Simulates realistic credit card / UPI checkout flows without charging real money or collecting sensitive card numbers.
- **Idempotency Guard**: Rejects or de-duplicates repeated requests with identical `idempotencyKey` values.
- **Failure Simulation**: Allows testing real-world payment decline edge cases and verifies that declined transactions immediately return held seats to inventory.

### 2.6 Ticket Generation & Verifier
- **Ticket Codes**: Generates human-readable, unique identifiers (e.g. `TKT-EE-7001-A1`).
- **Verifiable QR Codes**: Encodes an absolute verification URL (`/tickets/:code/verify`) inside an SVG QR matrix.
- **Public Verification Endpoint**: Real-time entry validation scanner that confirms ticket authenticity, seating tier, attendee name, and booking status.

---

## 3. Communication Protocols & Data Format

- **Protocol**: HTTP/1.1 REST APIs.
- **Payload Format**: `application/json; charset=utf-8`.
- **Client Session Header**: `X-Session-ID` sent with all requests to correlate holds with anonymous browser sessions.
- **Unified Response Schema**:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
  }
  ```

---

## 4. Scalability & Future Production Enhancements

The current implementation utilizes **Node.js, Express, and SQLite in WAL mode**, which provides zero-config local setup and handles thousands of reads per second without external services. For enterprise cloud scaling, the following extensions can be introduced without changing business logic:

1. **Redis for Distributed Locking (Redlock)**:
   When scaling the Node.js backend across multiple container instances, Redis can provide distributed seat locks and shared session cache.
2. **PostgreSQL / MySQL Migration**:
   The `better-sqlite3` queries can be converted to standard SQL or an ORM (Prisma/Knex) for multi-master clustering.
3. **External Payment Gateway (Stripe / Razorpay)**:
   The simulated `PaymentService` can be swapped with live webhook callbacks for automated UPI / net banking settlements.
4. **BullMQ / Kafka Job Workers**:
   The local `setInterval` hold cleanup can be offloaded to dedicated Redis-backed BullMQ delayed jobs.
