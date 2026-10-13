import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Ticket, Calendar, Layers, Clock, AlertCircle } from 'lucide-react';
import { clearHoldInfo } from '../features/booking/bookingSlice';

export default function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { holdInfo, selectedEvent } = useSelector((state) => state.booking);
  const [timeLeft, setTimeLeft] = useState(null);

  // Hold Countdown effect
  useEffect(() => {
    if (!holdInfo?.expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(holdInfo.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        dispatch(clearHoldInfo());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [holdInfo, dispatch]);

  const formatTime = (secs) => {
    if (secs === null || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:scale-105 transition-transform duration-200">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Event<span className="text-brand-accent">Ease</span>
            </span>
            <span className="text-[10px] text-brand-muted block uppercase tracking-wider font-semibold">
              Ticket Booking System
            </span>
          </div>
        </Link>

        {/* Center / Right Nav Items */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-brand-card text-brand-accent border border-brand-border' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Events
            </Link>

            <Link
              to="/my-bookings"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/my-bookings') 
                  ? 'bg-brand-card text-brand-accent border border-brand-border' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              My Bookings
            </Link>

            <Link
              to="/architecture"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/architecture') 
                  ? 'bg-brand-card text-brand-accent border border-brand-border' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture</span>
            </Link>
          </div>

          {/* Active Hold Countdown Badge */}
          {timeLeft !== null && timeLeft > 0 && (
            <Link
              to="/checkout/details"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse hover:bg-amber-500/20 transition-colors"
              title="You have reserved seats pending completion"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Hold: {formatTime(timeLeft)}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
