import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../services/api';
import { setCustomerDetails, setBookingData } from '../features/booking/bookingSlice';
import TimerBanner from '../components/TimerBanner';
import { 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  MapPin,
  Ticket
} from 'lucide-react';

export default function CustomerDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedEvent, selectedSeats, holdInfo, customerDetails } = useSelector((state) => state.booking);

  const [form, setForm] = useState({
    fullName: customerDetails?.fullName || '',
    email: customerDetails?.email || '',
    phone: customerDetails?.phone || ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // If user lands here with no seats or no hold, redirect back to events
  if (!selectedEvent || selectedSeats.length === 0 || !holdInfo?.holdToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Seat Hold</h2>
        <p className="text-xs text-brand-muted">
          Your temporary seat hold has expired or no seats were selected. Please select seats from an event to begin.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (form.phone.trim().length < 10) {
      errs.phone = 'Phone number should be at least 10 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      // Save customer details in Redux
      dispatch(setCustomerDetails(form));

      // Call API to create PENDING booking
      const res = await api.createBooking({
        eventId: selectedEvent.id,
        customer: form,
        holdToken: holdInfo.holdToken,
        seatIds: selectedSeats.map((s) => s.id)
      });

      dispatch(setBookingData(res.data));
      navigate('/checkout/payment');
    } catch (err) {
      setApiError(err.message || 'Failed to create booking. Your hold may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = selectedSeats.reduce((sum, s) => sum + (s.calculated_price || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold max-w-2xl mx-auto text-center border-b border-brand-border/60 pb-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">1</span>
          <span>Seats</span>
        </div>
        <div className="w-12 h-0.5 bg-brand-primary" />
        <div className="flex items-center gap-1.5 text-brand-accent">
          <span className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-accent">2</span>
          <span>Details</span>
        </div>
        <div className="w-12 h-0.5 bg-brand-border" />
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">3</span>
          <span>Payment</span>
        </div>
        <div className="w-12 h-0.5 bg-brand-border" />
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">4</span>
          <span>Tickets</span>
        </div>
      </div>

      {/* Hold Expiry Banner */}
      <TimerBanner
        expiresAt={holdInfo.expiresAt}
        onExpire={() => {
          setApiError('Your 5-minute seat hold has expired. Please select seats again.');
        }}
      />

      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Two Column Layout: Customer Details Form (Left) & Order Summary (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-brand-accent" />
              Customer Information
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              Your ticket confirmation and entry QR passes will be associated with these details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Rajesh Kannan"
                  className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-rose-400">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. rajesh@example.com"
                  className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-400">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-400">{errors.phone}</p>}
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <Link
                to={`/events/${selectedEvent.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Change Seats
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primaryHover hover:to-brand-primary text-white flex items-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Card (5 cols) */}
        <div className="md:col-span-5 glass-card rounded-3xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white border-b border-brand-border/60 pb-3">
            Reservation Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Event</span>
              <span className="font-bold text-sm text-white">{selectedEvent.title}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-brand-accent" />
              <span>{selectedEvent.date} • {selectedEvent.time}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedEvent.venue_name}, {selectedEvent.venue_city}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-border/60 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Reserved Seats ({selectedSeats.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedSeats.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-1 rounded-md bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold"
                >
                  {s.seat_number}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-sm">
            <span className="font-semibold text-white">Total Amount</span>
            <span className="font-extrabold font-mono text-lg text-brand-accent">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Seats are locked exclusively to your session.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
