import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import { setActiveFilter, setSearchQuery } from '../features/booking/bookingSlice';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  QrCode, 
  Ticket, 
  MapPin, 
  Music, 
  Cpu, 
  Trophy, 
  Palette, 
  Smile 
} from 'lucide-react';

const categories = [
  { id: 'All', label: 'All Events', icon: Sparkles },
  { id: 'Music', label: 'Music', icon: Music },
  { id: 'Technology', label: 'Technology', icon: Cpu },
  { id: 'Sports', label: 'Sports', icon: Trophy },
  { id: 'Arts', label: 'Arts & Culture', icon: Palette },
  { id: 'Comedy', label: 'Comedy', icon: Smile },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { activeFilter, searchQuery } = useSelector((state) => state.booking);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.getEvents({ category: activeFilter, search: searchQuery })
      .then((res) => {
        if (isMounted) {
          setEvents(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch events');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [activeFilter, searchQuery]);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 lg:px-8 border-b border-brand-border/60">
        {/* Subtle Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-10 w-80 h-80 bg-brand-accent/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-xs font-semibold text-brand-accent backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Event Ticketing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Next Experience <br />
            <span className="bg-gradient-to-r from-brand-primary via-brand-accent to-pink-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-brand-muted leading-relaxed">
            Discover premier concerts, tech summits, tournaments, and theatre in Coimbatore and Chennai. Reserve seats in real-time with zero double-booking risk.
          </p>

          {/* Quick Value Metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ACID Seat Locking</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>5-Min Auto Hold</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-brand-accent" />
              <span>Instant QR Pass</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-10 relative z-10">
          <div className="glass-card rounded-2xl p-2 flex items-center gap-3 shadow-2xl border-brand-primary/20">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by event name, venue, or city (e.g. Coimbatore, Rock)..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="text-xs text-brand-muted hover:text-white px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-4xl mx-auto mt-8 flex flex-wrap items-center justify-center gap-2 relative z-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeFilter === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => dispatch(setActiveFilter(cat.id))}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 border border-brand-accent scale-105'
                    : 'glass-panel text-slate-400 hover:text-white hover:bg-white/5 border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Events Grid */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Ticket className="w-6 h-6 text-brand-accent" />
              Featured Events
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              {loading ? 'Fetching available events...' : `Showing ${events.length} event(s) matching your selection`}
            </p>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-accent" />
            <span>Coimbatore & Chennai Venues</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card rounded-2xl h-80 animate-pulse bg-white/5 border border-white/5" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-3 border-rose-500/30">
            <p className="text-rose-400 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primaryHover"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="glass-card p-12 rounded-2xl text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-accent flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Events Found</h3>
            <p className="text-xs text-brand-muted">
              We couldn't find any events matching "{searchQuery}" in category "{activeFilter}".
            </p>
            <button
              onClick={() => {
                dispatch(setActiveFilter('All'));
                dispatch(setSearchQuery(''));
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Event Cards Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-10">
        <div className="glass-card rounded-3xl p-8 lg:p-12 border border-brand-border/60 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-brand-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Atomic Concurrency</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              SQLite WAL mode with immediate transactional locks prevents race conditions. Two concurrent users cannot book or hold the same seat.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">5-Min Temporary Hold</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              Selected seats are held for 5 minutes during checkout. If payment is abandoned or fails, seats are automatically returned to inventory.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Tamper-Proof QR Tickets</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              Confirmed bookings generate individual cryptographic ticket codes with live online QR verification endpoints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
