import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function TimerBanner({ expiresAt, onExpire }) {
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        if (onExpire) onExpire();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (secondsRemaining === null || secondsRemaining <= 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 60;

  return (
    <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium transition-all ${
      isUrgent
        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 animate-pulse'
        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
    }`}>
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <span>
          {isUrgent ? 'Hurry! ' : 'Temporary Reservation Active: '}
          Seats held for <strong className="font-bold underline">{minutes}:{seconds.toString().padStart(2, '0')}</strong>. Complete booking before timer expires.
        </span>
      </div>

      <div className="hidden sm:block text-xs font-mono font-bold bg-black/40 px-2.5 py-1 rounded border border-white/10">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
