import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import TicketCard from '../components/TicketCard';
import { 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  Ticket, 
  AlertCircle, 
  ShieldCheck,
  Receipt,
  Share2,
  ExternalLink
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getBooking(id)
      .then((res) => {
        if (isMounted) {
          setBooking(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to retrieve booking confirmation');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-brand-muted">Loading your verified booking confirmation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <p className="text-xs text-brand-muted">{error || 'Unable to locate this booking ID.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const latestPayment = booking.payments && booking.payments.length > 0 ? booking.payments[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-10">
      {/* Celebration Header */}
      <div className="text-center space-y-3 no-print">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block">
          BOOKING CONFIRMED & PAID
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          You're Ready for the Event!
        </h1>

        <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
          Your reservation is guaranteed in the database. Digital tickets with dynamic QR security codes have been issued below.
        </p>

        {/* Quick Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Tickets</span>
          </button>

          <Link
            to="/my-bookings"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-accent border border-brand-primary/40 flex items-center gap-1.5 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>View in My Bookings</span>
          </Link>
        </div>
      </div>

      {/* Booking Summary Receipt Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/60">
          <div>
            <span className="text-[11px] text-brand-muted uppercase block">Booking Reference</span>
            <span className="text-xl font-mono font-black text-white">{booking.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-brand-muted uppercase block">Amount Paid</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                ₹{Number(booking.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {booking.status}
            </span>
          </div>
        </div>

        {/* Customer & Event Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted uppercase block font-semibold">Attendee Info</span>
            <p className="font-bold text-white text-sm">{booking.customer_name}</p>
            <p>{booking.customer_email}</p>
            <p className="text-slate-400">{booking.customer_phone}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted uppercase block font-semibold">Event Venue</span>
            <p className="font-bold text-white text-sm">{booking.event_title}</p>
            <p>{booking.venue_name}</p>
            <p className="text-slate-400">{booking.venue_city}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-brand-muted uppercase block font-semibold">Payment Details</span>
            <p className="font-bold text-white text-sm">Demo Simulation (Verified)</p>
            <p className="font-mono text-slate-400">Txn: {latestPayment?.transaction_reference || 'TXN-OK'}</p>
            <p className="text-emerald-400 font-semibold">Status: SUCCESS</p>
          </div>
        </div>
      </div>

      {/* Issued Tickets Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-accent" />
            Issued Digital Tickets ({booking.tickets ? booking.tickets.length : 0})
          </h2>
          <span className="text-xs text-brand-muted">
            Present individual QR code at venue turnstile
          </span>
        </div>

        <div className="space-y-6">
          {booking.tickets && booking.tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              event={{
                title: booking.event_title,
                category: booking.event_category,
                date: booking.event_date,
                time: booking.event_time,
                venue_name: booking.venue_name,
                venue_city: booking.venue_city,
              }}
              customer={{
                fullName: booking.customer_name,
                email: booking.customer_email
              }}
              booking={booking}
              onPrint={handlePrint}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="text-center pt-6 no-print">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Book another event
        </Link>
      </div>
    </div>
  );
}
