import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../services/api';
import { 
  setSelectedEvent, 
  toggleSeat, 
  clearSelectedSeats, 
  setHoldInfo 
} from '../features/booking/bookingSlice';
import SeatGrid from '../components/SeatGrid';
import TimerBanner from '../components/TimerBanner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Ticket, 
  AlertCircle, 
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedSeats, holdInfo } = useSelector((state) => state.booking);
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [error, setError] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);

  // Fetch event details and seat map
  const loadEventAndSeats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    setConflictWarning(null);

    try {
      const [eventRes, seatsRes] = await Promise.all([
        api.getEventById(id),
        api.getEventSeats(id, holdInfo?.holdToken)
      ]);

      setEvent(eventRes.data);
      dispatch(setSelectedEvent(eventRes.data));
      setSeats(seatsRes.data.seats || []);
      setStats(seatsRes.data.stats || null);
    } catch (err) {
      setError(err.message || 'Failed to load event or seat layout');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadEventAndSeats(true);
  }, [id]);

  const handleToggleSeat = (seat) => {
    setConflictWarning(null);
    dispatch(toggleSeat(seat));
  };

  // Calculate pricing breakdown
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.calculated_price || 0), 0);
  const convenienceFee = selectedSeats.length > 0 ? 0 : 0; // ₹0 for demo
  const grandTotal = subtotal + convenienceFee;

  // Handle temporary seat hold and continue to checkout
  const handleProceedToBooking = async () => {
    if (selectedSeats.length === 0) return;

    setIsHolding(true);
    setConflictWarning(null);

    try {
      const seatIds = selectedSeats.map((s) => s.id);
      const res = await api.createHold({
        eventId: id,
        seatIds,
        durationSeconds: 300
      });

      // Save hold details to Redux
      dispatch(setHoldInfo(res.data));

      // Navigate to Customer Details page
      navigate('/checkout/details');
    } catch (err) {
      if (err.status === 409) {
        setConflictWarning(err.message || 'One or more of your chosen seats were just held by another attendee. Please select alternative seats.');
      } else {
        setConflictWarning(err.message || 'Failed to reserve selected seats. Please try again.');
      }
      // Re-fetch seats to show updated availability
      loadEventAndSeats(false);
    } finally {
      setIsHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-brand-muted">Loading event details and real-time seat inventory...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-brand-muted">{error || 'Unable to load event.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all events
        </Link>
      </div>

      {/* Event Header Banner */}
      <div className="glass-card rounded-3xl overflow-hidden border border-brand-border/60">
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/70 to-transparent" />

          {/* Floating Details */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/80 backdrop-blur-md text-white border border-brand-accent/40">
                {event.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-accent" />
                  {event.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-accent" />
                  {event.time}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-accent" />
                  {event.venue_name}, {event.venue_city}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] text-brand-muted uppercase block">Base Ticket Price</span>
              <span className="text-2xl font-black text-white">
                ₹{Number(event.base_price).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-brand-border/60 bg-black/20 text-xs sm:text-sm text-brand-muted leading-relaxed">
          {event.description}
        </div>
      </div>

      {/* Hold Expiry Banner if hold is active */}
      {holdInfo?.expiresAt && (
        <TimerBanner
          expiresAt={holdInfo.expiresAt}
          onExpire={() => {
            loadEventAndSeats(false);
          }}
        />
      )}

      {/* Concurrency Conflict Alert */}
      {conflictWarning && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">Seat Availability Conflict:</strong>
            <p>{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Seat Map (Left 8 cols) & Summary Sidebar (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Seat Map */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-brand-accent" />
                Select Your Seats
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Click on any available green seat to add it to your booking
              </p>
            </div>

            <button
              onClick={() => loadEventAndSeats(false)}
              title="Refresh seat availability"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <SeatGrid
            seats={seats}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            isHolding={isHolding}
          />
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <h3 className="text-base font-bold text-white">Booking Summary</h3>
            {selectedSeats.length > 0 && (
              <button
                onClick={() => dispatch(clearSelectedSeats())}
                className="text-xs text-brand-muted hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selected Seats List */}
          {selectedSeats.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Ticket className="w-8 h-8 text-brand-muted mx-auto opacity-50" />
              <p className="text-xs text-brand-muted">
                No seats selected yet. Please select at least one seat from the map.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span>Selected Seats ({selectedSeats.length})</span>
                <span className="text-[11px] text-brand-accent font-normal">Max 6 per booking</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">Seat {seat.seat_number}</span>
                      <span className="text-[10px] text-brand-muted ml-2">({seat.tier})</span>
                    </div>
                    <span className="font-mono font-bold text-brand-accent">
                      ₹{Number(seat.calculated_price).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="space-y-2 pt-4 border-t border-brand-border/60 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Seats Subtotal</span>
              <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Convenience Fee</span>
              <span className="font-mono text-emerald-400">₹0 (Academic Demo)</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-brand-border text-sm font-bold text-white">
              <span>Total Payable</span>
              <span className="font-mono text-base text-brand-accent">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={selectedSeats.length === 0 || isHolding}
            onClick={handleProceedToBooking}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primaryHover hover:to-brand-primary text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isHolding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Holding Seats...</span>
              </>
            ) : (
              <>
                <span>Continue to Booking</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-brand-muted leading-tight">
            Seats will be held for 5 minutes once you continue.
          </p>
        </div>
      </div>
    </div>
  );
}
