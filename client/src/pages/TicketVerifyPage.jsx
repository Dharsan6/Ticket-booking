import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  XCircle, 
  AlertCircle, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export default function TicketVerifyPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.verifyTicket(id)
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Ticket verification check failed');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-brand-muted">Verifying digital ticket cryptographic token...</p>
      </div>
    );
  }

  const isValid = data?.isValid;
  const ticket = data?.ticket;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      {/* Top Status Header */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-2xl ${
          isValid
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
            : 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/20'
        }`}>
          {isValid ? <ShieldCheck className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <span className={`text-xs uppercase font-extrabold tracking-widest block ${
          isValid ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {isValid ? 'VERIFIED OFFICIAL TICKET' : 'INVALID / VOID TICKET'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isValid ? 'Entry Authorized' : 'Entry Declined'}
        </h1>

        <p className="text-xs text-brand-muted">
          {data?.message || (isValid ? 'Ticket is authentic and confirmed in the EventEase registry.' : 'This ticket has been cancelled or could not be found.')}
        </p>
      </div>

      {/* Verified Details Card */}
      {ticket && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-border/60">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Ticket Identifier</span>
              <span className="font-mono text-base font-bold text-brand-accent">
                {ticket.ticketCode}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isValid
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {ticket.status}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Event</span>
              <h3 className="text-base font-bold text-white mt-0.5">{ticket.eventTitle}</h3>
              <p className="text-slate-400 text-[11px]">{ticket.eventCategory}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300 pt-2 border-t border-brand-border/40">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                <span>{ticket.eventDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-accent" />
                <span>{ticket.eventTime}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span className="truncate">{ticket.venueName}, {ticket.venueCity}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-muted uppercase block">Attendee</span>
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {ticket.attendeeName}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-brand-muted uppercase block">Assigned Seat</span>
                <span className="font-mono text-sm font-black text-brand-accent px-2 py-0.5 rounded bg-violet-600/20 border border-violet-500/30">
                  {ticket.seatNumber} ({ticket.seatTier})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border/60 text-[10px] text-brand-muted font-mono flex items-center justify-between">
            <span>Booking Ref: {ticket.bookingId}</span>
            <span>Issued: {new Date(ticket.issuedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Go to EventEase Home
        </Link>
      </div>
    </div>
  );
}
