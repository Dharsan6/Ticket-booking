import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, Heart, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-border bg-brand-surface/60 py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Event<span className="text-brand-accent">Ease</span>
            </span>
          </div>
          <p className="text-sm text-brand-muted max-w-md leading-relaxed">
            Full-stack Event Ticket Booking System featuring ACID transactional seat reservation, concurrency conflict resolution, simulated payments, and verifiable digital QR tickets.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Concurrency Protected
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              5-Min Auto Hold Expiry
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              Instant QR Verification
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-sm text-brand-muted">
            <li>
              <Link to="/" className="hover:text-white transition-colors">Browse Events</Link>
            </li>
            <li>
              <Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link>
            </li>
            <li>
              <Link to="/architecture" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-accent" /> System Architecture (HLD/LLD)
              </Link>
            </li>
          </ul>
        </div>

        {/* Project Meta */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Academic Project
          </h4>
          <ul className="space-y-2.5 text-sm text-brand-muted">
            <li>Stack: React 19, Express, SQLite</li>
            <li>Author: Dharshan S</li>
            <li>Institutions: Coimbatore & Chennai Venues</li>
            <li>Database: SQLite WAL Mode</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
        <div>
          © {new Date().getFullYear()} EventEase — Built for academic demonstration & evaluation.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          <span>using React & Node.js</span>
        </div>
      </div>
    </footer>
  );
}
