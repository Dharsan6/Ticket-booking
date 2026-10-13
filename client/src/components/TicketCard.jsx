import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, Clock, MapPin, User, CheckCircle2, ShieldCheck, Printer, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TicketCard({ ticket, event, customer, booking, onPrint }) {
  // Verification URL for QR code
  const verificationUrl = `${window.location.origin}/tickets/${ticket.ticket_code || ticket.ticketCode}/verify`;

  return (
    <div className="ticket-print-container glass-card rounded-2xl overflow-hidden border border-brand-primary/30 shadow-2xl relative">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-accent p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-white" />
          <span className="font-bold tracking-tight text-sm uppercase">EventEase Official Digital Pass</span>
        </div>
        <span className="text-xs bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full font-mono font-bold">
          {ticket.ticket_code || ticket.ticketCode}
        </span>
      </div>

      {/* Main Ticket Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Event & Attendee Info (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
              {event.category}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {event.title}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-accent" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-accent" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
              <span className="truncate">{event.venue_name}, {event.venue_city}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Attendee</span>
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {customer?.fullName || customer?.full_name || customer?.customer_name || 'Guest'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Seat Allocated</span>
              <span className="text-sm font-extrabold text-brand-accent px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/30">
                Seat {ticket.seat_number || ticket.seatNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Status</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {ticket.status || 'VALID'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: QR Code & Verification (1 col) */}
        <div className="flex flex-col items-center justify-center p-4 bg-brand-surface/80 rounded-xl border border-white/5 space-y-3 text-center">
          <div className="p-2.5 bg-white rounded-lg shadow-inner">
            <QRCodeSVG
              value={verificationUrl}
              size={110}
              level="H"
              includeMargin={false}
            />
          </div>
          <span className="text-[10px] text-brand-muted font-mono">
            Scan to Verify Ticket
          </span>
          <Link
            to={`/tickets/${ticket.ticket_code || ticket.ticketCode}/verify`}
            target="_blank"
            className="text-[11px] text-brand-accent hover:underline flex items-center gap-1"
          >
            <span>Verify Online</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Perforated Divider Visual */}
      <div className="relative border-t border-dashed border-white/20 py-2 px-6 flex items-center justify-between text-[11px] text-brand-muted bg-black/20">
        <span className="font-mono">Booking Ref: {booking?.id || booking?.bookingId}</span>
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Evident QR Code
        </span>
      </div>
    </div>
  );
}
