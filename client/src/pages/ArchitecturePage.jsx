import React, { useState } from 'react';
import MermaidDiagram from '../components/MermaidDiagram';
import { 
  Layers, 
  Database, 
  Cpu, 
  Workflow, 
  Code2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Server,
  ShieldAlert,
  Clock,
  QrCode
} from 'lucide-react';

const classDiagramMermaid = `classDiagram
    direction TB

    class Customer {
        +String id
        +String fullName
        +String email
        +String phone
        +DateTime createdAt
    }

    class Venue {
        +String id
        +String name
        +String city
        +String address
        +Integer totalCapacity
    }

    class Event {
        +String id
        +String venueId
        +String title
        +String description
        +String category
        +String date
        +String time
        +String bannerUrl
        +Float basePrice
        +String status
    }

    class Seat {
        +String id
        +String venueId
        +String seatNumber
        +String seatRow
        +String tier
        +Float priceMultiplier
    }

    class SeatHold {
        +String id
        +String eventId
        +String seatId
        +String holdToken
        +String customerSessionId
        +DateTime expiresAt
        +String status
    }

    class Booking {
        +String id
        +String eventId
        +String customerId
        +Float totalAmount
        +String currency
        +String status
        +String holdToken
        +DateTime createdAt
    }

    class BookingSeat {
        +String id
        +String bookingId
        +String seatId
        +String eventId
        +Float priceAtBooking
    }

    class Payment {
        +String id
        +String bookingId
        +Float amount
        +String currency
        +String paymentMethod
        +String status
        +String idempotencyKey
        +String transactionReference
    }

    class Ticket {
        +String id
        +String bookingId
        +String bookingSeatId
        +String ticketCode
        +String qrData
        +String status
        +DateTime issuedAt
    }

    class BookingRepository {
        +listEvents(filters)
        +findEventById(id)
        +getSeatsForEvent(eventId, sessionId)
        +createHoldTransaction(params)
        +releaseExpiredHolds()
        +createBookingTransaction(params)
        +processPaymentTransaction(params)
        +cancelBookingTransaction(bookingId)
        +findTicketByCodeOrId(code)
    }

    class EventService {
        +getAllEvents(filters)
        +getEventById(id)
    }

    class SeatInventoryService {
        +getSeatAvailability(eventId, sessionId)
        +cleanExpiredHolds()
    }

    class SeatHoldService {
        +createHold(params)
        +releaseHold(identifier)
    }

    class BookingService {
        +createBooking(params)
        +getBookingById(id)
        +listBookings(emailOrPhone)
        +listRecentBookings()
        +cancelBooking(id)
    }

    class PaymentService {
        +processSimulatedPayment(params)
    }

    class TicketService {
        +verifyTicket(codeOrId)
    }

    Venue "1" *-- "60..*" Seat : contains
    Venue "1" <-- "0..*" Event : hosts
    Event "1" <-- "0..*" SeatHold : targets
    Seat "1" <-- "0..*" SeatHold : locked by
    Customer "1" <-- "0..*" Booking : makes
    Event "1" <-- "0..*" Booking : reserves
    Booking "1" *-- "1..*" BookingSeat : contains
    Seat "1" <-- "0..*" BookingSeat : allocated
    Booking "1" *-- "0..*" Payment : attempts
    Booking "1" *-- "0..*" Ticket : issues
    BookingSeat "1" <-- "1" Ticket : validates

    EventService ..> BookingRepository : queries
    SeatInventoryService ..> BookingRepository : queries
    SeatHoldService ..> BookingRepository : queries
    BookingService ..> BookingRepository : coordinates
    PaymentService ..> BookingRepository : coordinates
    TicketService ..> BookingRepository : verifies
`;

const lldMermaid = `flowchart TD
    subgraph ClientLayer ["Frontend Client (React + Vite + Redux)"]
        UI["React Pages & Components<br/>(HomePage, SeatGrid, CustomerForm, PaymentSim)"]
        Store["Redux Toolkit Store<br/>(bookingSlice: event, seats, holdInfo, customer)"]
        ApiClient["HTTP API Client (/api)<br/>(Session Tracking via X-Session-ID header)"]
        UI -->|Dispatches Actions| Store
        UI -->|Triggers Async Calls| ApiClient
    end

    subgraph ControllerLayer ["Express API & Controller Layer"]
        Router["Express Routers<br/>(/api/events, /api/holds, /api/bookings, /api/tickets)"]
        Val["Validation & Error Handler<br/>(Input sanitization, HTTP Status Mapping)"]
        Router --> Val
    end

    subgraph ServiceLayer ["Domain Service Layer"]
        ES["EventService"]
        SIS["SeatInventoryService"]
        SHS["SeatHoldService"]
        BS["BookingService"]
        PS["PaymentService"]
        TS["TicketService"]
    end

    subgraph RepoLayer ["Data Access & Concurrency Layer"]
        Repo["BookingRepository<br/>(Better-SQLite3 Prepared Statements)"]
        TX["Immediate ACID Transactions<br/>(db.transaction wrapper)"]
        Worker["Hold Expiry Background Worker<br/>(Runs every 30s + Lazy Cleanup)"]
    end

    subgraph DBLayer ["SQLite WAL Database Engine"]
        DB[("eventease.db (WAL Mode)<br/>tables: venues, events, seats,<br/>seat_holds, bookings, booking_seats,<br/>payments, tickets")]
    end

    ApiClient -->|REST HTTP Requests| Router
    Val --> ES & SIS & SHS & BS & PS & TS
    ES & SIS & SHS & BS & PS & TS --> Repo
    Repo --> TX
    Worker -->|Background interval| Repo
    TX -->|Atomic Write Operations| DB
`;

const hldMermaid = `flowchart LR
    subgraph ClientSide ["Client Web Browser"]
        SPA["React SPA (EventEase)<br/>- Interactive Seat Matrix<br/>- 5-Min Hold Countdown<br/>- Simulated Payment Portal<br/>- SVG QR Code Renderer"]
    end

    subgraph APIGateway ["HTTP REST API Engine"]
        API["Node.js / Express Server (Port 5001)<br/>- CORS & Request Logging<br/>- Endpoint Handlers<br/>- Centralized Exception Filter"]
    end

    subgraph CoreServices ["Application Modules"]
        direction TB
        Catalog["Event Catalog Engine"]
        Inventory["Seat Inventory & Locking Engine"]
        BookingMgr["Booking & Lifecycle Manager"]
        PaySim["Idempotent Payment Simulator"]
        TicketGen["Ticket & QR Code Verifier"]
        Cron["Hold Expiry Scheduler (30s)"]
    end

    subgraph StorageLayer ["Persistence Layer"]
        SQLite[("Embedded SQLite 3<br/>- Write-Ahead Logging (WAL)<br/>- Foreign Key Enforcement<br/>- Immediate Concurrency Lock")]
    end

    subgraph FutureScale ["Future Cloud Extensions (Optional)"]
        Redis["[Future] Redis Cache / Distributed Locks"]
        Queue["[Future] BullMQ / Kafka Async Worker"]
        Gateway["[Future] Razorpay / Stripe Gateway"]
    end

    SPA <-->|JSON / HTTP REST| API
    API <--> Catalog & Inventory & BookingMgr & PaySim & TicketGen
    Cron -.->|Cleans expired holds| Inventory
    Catalog & Inventory & BookingMgr & PaySim & TicketGen <--> SQLite

    Catalog -.-x|Optional future scale| Redis
    PaySim -.-x|Optional future integration| Gateway
    Cron -.-x|Optional worker scale| Queue

    classDef future stroke-dasharray: 5 5,stroke:#64748b,fill:#1e293b,color:#94a3b8;
    class FutureScale,Redis,Queue,Gateway future;
`;

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState('UML'); // UML, LLD, HLD

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-xs font-semibold text-brand-accent">
          <Layers className="w-3.5 h-3.5" />
          <span>System Design & Architecture Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          EventEase System Architecture
        </h1>
        <p className="text-sm text-brand-muted max-w-3xl leading-relaxed">
          Comprehensive blueprint detailing the domain model, layered component architecture, ACID database transactions, concurrency protection, and simulated checkout lifecycle.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-brand-border/60 pb-4">
        <button
          onClick={() => setActiveTab('UML')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'UML'
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 border border-brand-accent'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>1. UML Class Diagram</span>
        </button>

        <button
          onClick={() => setActiveTab('LLD')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'LLD'
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 border border-brand-accent'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>2. Low-Level Architecture (LLD)</span>
        </button>

        <button
          onClick={() => setActiveTab('HLD')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'HLD'
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 border border-brand-accent'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>3. High-Level Architecture (HLD)</span>
        </button>
      </div>

      {/* TAB 1: UML CLASS DIAGRAM */}
      {activeTab === 'UML' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-brand-border/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-accent" />
              Domain Model & UML Class Relationships
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              This class diagram illustrates the domain entities, primary data models, and service abstractions implemented in the EventEase system.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3 rounded-xl bg-brand-surface border border-white/5 space-y-1">
                <span className="font-bold text-white block">Venue & Seats</span>
                <p className="text-brand-muted">Each venue contains 60 physical seats partitioned into VIP, Premium, and Standard tiers with price multipliers.</p>
              </div>
              <div className="p-3 rounded-xl bg-brand-surface border border-white/5 space-y-1">
                <span className="font-bold text-white block">Events & Bookings</span>
                <p className="text-brand-muted">An event is scheduled at a venue. Customers reserve seats for events creating a <code className="text-brand-accent">Booking</code> in PENDING state.</p>
              </div>
              <div className="p-3 rounded-xl bg-brand-surface border border-white/5 space-y-1">
                <span className="font-bold text-white block">Holds, Payments & Tickets</span>
                <p className="text-brand-muted">Seat holds expire in 5 minutes. Successful payments convert holds to CONFIRMED bookings and issue unique verifiable tickets.</p>
              </div>
            </div>
          </div>

          {/* Diagram Container */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-brand-muted">
              Interactive UML Class Diagram (Mermaid)
            </span>
            <MermaidDiagram chart={classDiagramMermaid} id="uml-diagram" />
          </div>
        </div>
      )}

      {/* TAB 2: LOW-LEVEL ARCHITECTURE (LLD) */}
      {activeTab === 'LLD' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-brand-border/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-brand-accent" />
              Low-Level Architecture (LLD) & Data Flow
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Traceability across application layers: from React UI events through Redux Toolkit state, Express REST routers, service coordinators, to transactional SQLite storage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-brand-accent font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Transactional Concurrency Guard</span>
                </div>
                <p className="text-brand-muted leading-relaxed">
                  Both seat holding (<code className="text-white">createHoldTransaction</code>) and payment confirmation (<code className="text-white">processPaymentTransaction</code>) execute inside synchronous SQLite transactions (<code className="text-white">db.transaction()</code>). Conflicting hold attempts result in an immediate <code className="text-amber-400">409 Conflict</code> error.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Dual Hold Expiry Mechanism</span>
                </div>
                <p className="text-brand-muted leading-relaxed">
                  Seat holds expire after 300 seconds (5 minutes). Expiry is enforced via two complementary strategies: a <strong>background interval worker</strong> running every 30 seconds, plus <strong>lazy evaluation</strong> on every seat lookup query (<code className="text-white">releaseExpiredHolds()</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Diagram Container */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-brand-muted">
              Interactive Low-Level Architecture Diagram (Mermaid)
            </span>
            <MermaidDiagram chart={lldMermaid} id="lld-diagram" />
          </div>
        </div>
      )}

      {/* TAB 3: HIGH-LEVEL ARCHITECTURE (HLD) */}
      {activeTab === 'HLD' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-brand-border/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-accent" />
              High-Level Architecture (HLD) & System Topology
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Macro system view demonstrating client-server interaction, internal micro-modules, and clearly demarcated future production scale enhancements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-brand-surface border border-white/5 space-y-1">
                <span className="font-bold text-white block">Client Tier (Browser)</span>
                <p className="text-brand-muted">Single Page Application built with React 19, Tailwind CSS, Lucide Icons, and QR SVG generation for offline pass display.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-surface border border-white/5 space-y-1">
                <span className="font-bold text-white block">API Tier (Node/Express)</span>
                <p className="text-brand-muted">Stateless REST API handling hold tokens, server-side price validation, idempotency caching, and simulated payment state machines.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-surface border border-white/5 space-y-1">
                <span className="font-bold text-white block">Data Tier (SQLite WAL)</span>
                <p className="text-brand-muted">Self-contained relational database utilizing Write-Ahead Logging for concurrent readers without write lock contention.</p>
              </div>
            </div>
          </div>

          {/* Diagram Container */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-brand-muted">
              Interactive High-Level Architecture Diagram (Mermaid)
            </span>
            <MermaidDiagram chart={hldMermaid} id="hld-diagram" />
          </div>
        </div>
      )}

      {/* System Integrity & Concurrency Highlights */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 border border-brand-border/60 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Core Architectural Guarantees
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-white/5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Double-Booking Prevention
            </span>
            <p className="text-brand-muted">
              Enforced by SQLite unique composite constraints on <code className="text-slate-200">booking_seats(event_id, seat_id)</code> and transactional verification before hold conversion.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-white/5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Server-Side Pricing Trust
            </span>
            <p className="text-brand-muted">
              The frontend never submits prices. Seat prices are calculated strictly on the backend using base price multiplied by seat tier multiplier.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-white/5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Payment Idempotency
            </span>
            <p className="text-brand-muted">
              Payment submissions require a unique <code className="text-slate-200">idempotencyKey</code>. Network retries return existing payment receipts without duplicate charges or tickets.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-white/5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              Cryptographic QR Verification
            </span>
            <p className="text-brand-muted">
              Issued tickets contain unique alphanumeric identifiers. Scanning the QR code navigates to an online verification endpoint returning real-time validity status.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
