import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../services/api';
import { 
  Ticket, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function MyBookingsPage() {
  const { customerDetails } = useSelector((state) => state.booking);
  
  // Default to stored customer email or demo seed customer
  const [searchQuery, setSearchQuery] = useState(customerDetails?.email || 'rajesh.k@example.com');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CONFIRMED, CANCELLED

  const fetchBookings = async (query = searchQuery) => {
    if (!query || !query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.getCustomerBookings(query.trim());
      setBookings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(searchQuery);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(searchQuery);
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;

    const id = cancelModalBooking.id;
    setCancellingId(id);

    try {
      await api.cancelBooking(id);
      setCancelModalBooking(null);
      // Refresh list immediately
      await fetchBookings(searchQuery);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (statusFilter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ticket className="w-8 h-8 text-brand-accent" />
            My Bookings & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Track your confirmed reservations, view issued QR codes, or cancel bookings to release seats.
          </p>
        </div>

        {/* Search Bar for Customer Email */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer email or phone..."
              className="w-64 sm:w-80 bg-brand-surface border border-brand-border rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primaryHover"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border/60 pb-4 text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-brand-primary text-white'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setStatusFilter('CONFIRMED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            statusFilter === 'CONFIRMED'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Confirmed ({bookings.filter(b => b.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setStatusFilter('CANCELLED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            statusFilter === 'CANCELLED'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-muted">Fetching bookings from database...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="glass-card p-6 rounded-2xl text-center space-y-3 border-rose-500/30">
          <p className="text-xs text-rose-400">{error}</p>
          <button
            onClick={() => fetchBookings(searchQuery)}
            className="px-3.5 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <Ticket className="w-12 h-12 text-brand-muted mx-auto opacity-40" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-brand-muted">
            We couldn't find any bookings associated with "{searchQuery}". Try using the demo email <strong className="text-brand-accent">rajesh.k@example.com</strong> or book an event first.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white"
          >
            Browse Available Events
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div
                key={b.id}
                className="glass-card rounded-2xl p-6 border border-brand-border/60 hover:border-brand-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Event Details & Badges */}
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-brand-accent">
                      {b.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isConfirmed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {b.event_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                      {b.event_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-accent" />
                      {b.event_time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.venue_name}, {b.venue_city}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-brand-muted uppercase">Seats:</span>
                    {b.seats && b.seats.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold"
                      >
                        {s.seat_number}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Price & Actions */}
                <div className="flex flex-col md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-brand-border/60">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-brand-muted uppercase block">Total Amount</span>
                    <span className="text-xl font-mono font-black text-white">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* View Ticket Link */}
                    {isConfirmed && (
                      <Link
                        to={`/bookings/${b.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primaryHover flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Tickets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {/* Cancel Booking Button */}
                    {isConfirmed && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        disabled={cancellingId === b.id}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}

                    {isCancelled && (
                      <span className="text-xs text-rose-400 font-semibold px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20">
                        Seats Released & Refunded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Booking?</h3>
                <span className="text-xs text-rose-300 font-mono">Ref: {cancelModalBooking.id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel this booking for <strong>{cancelModalBooking.event_title}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-200 space-y-1">
              <p>• Seats ({cancelModalBooking.seats?.map(s => s.seat_number).join(', ')}) will be returned to inventory immediately.</p>
              <p>• All digital QR passes for this booking will be invalidated.</p>
              <p>• A full simulated refund of ₹{Number(cancelModalBooking.total_amount).toLocaleString('en-IN')} will be credited.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancellingId !== null}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                {cancellingId ? 'Releasing Seats...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
