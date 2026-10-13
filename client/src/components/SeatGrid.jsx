import React from 'react';
import { Armchair, Sparkles, Check, Lock, Clock } from 'lucide-react';

export default function SeatGrid({ seats, selectedSeats, onToggleSeat, isHolding }) {
  // Group seats by Row (A, B, C, D, E, F)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsByRow = rows.reduce((acc, row) => {
    acc[row] = seats.filter(s => s.seat_row === row);
    return acc;
  }, {});

  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      // Violet: Selected by the current user
      return 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/50 scale-105';
    }

    if (seat.status === 'BOOKED') {
      // Red: Booked or unavailable
      return 'bg-rose-950/60 text-rose-500/50 border-rose-900/40 cursor-not-allowed';
    }

    if (seat.status === 'HELD') {
      // Amber: Temporarily held by another user
      return 'bg-amber-950/60 text-amber-500/60 border-amber-800/40 cursor-not-allowed animate-pulse';
    }

    if (seat.status === 'HELD_BY_YOU') {
      // Held by you in active session
      return 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/50';
    }

    // Green: Available
    return 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60 hover:bg-emerald-800/60 hover:text-white hover:border-emerald-500 hover:scale-105 transition-all';
  };

  const getTierBadge = (row) => {
    if (row === 'A' || row === 'B') {
      return { label: 'VIP Lounge (1.5x)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    if (row === 'C' || row === 'D') {
      return { label: 'Premium Circle (1.25x)', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }
    return { label: 'Standard Gallery (1.0x)', badge: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  return (
    <div className="w-full space-y-8">
      {/* Stage / Screen Visualizer */}
      <div className="relative w-full max-w-2xl mx-auto text-center pt-2 pb-6">
        <div className="h-2 w-full bg-gradient-to-r from-transparent via-brand-accent to-transparent rounded-full shadow-lg shadow-brand-primary/50" />
        <div className="w-3/4 mx-auto h-8 bg-gradient-to-b from-brand-accent/20 to-transparent blur-md -mt-1" />
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-muted block mt-2">
          STAGE / SCREEN
        </span>
      </div>

      {/* Seat Rows Map */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[620px] max-w-3xl mx-auto space-y-6">
          {rows.map((row) => {
            const tierInfo = getTierBadge(row);
            const rowSeats = seatsByRow[row] || [];

            return (
              <div key={row} className="space-y-1.5">
                {/* Row Header & Tier indicator for first row of tier */}
                {(row === 'A' || row === 'C' || row === 'E') && (
                  <div className="flex items-center justify-between text-xs py-1 border-b border-brand-border/40 mb-2">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                      {tierInfo.label}
                    </span>
                    <span className="text-[11px] text-slate-400">Rows {row} - {String.fromCharCode(row.charCodeAt(0) + 1)}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  {/* Row Label Left */}
                  <span className="w-6 text-center text-xs font-bold text-slate-400">
                    {row}
                  </span>

                  {/* Seat Grid Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rowSeats.map((seat, index) => {
                      const isSelected = selectedSeats.some(s => s.id === seat.id);
                      const isUnavailable = seat.status === 'BOOKED' || (seat.status === 'HELD' && !isSelected);

                      return (
                        <React.Fragment key={seat.id}>
                          {/* Aisle gap between seat 5 and 6 */}
                          {index === 5 && <div className="w-4 sm:w-6" />}

                          <button
                            type="button"
                            disabled={isUnavailable || isHolding}
                            onClick={() => onToggleSeat(seat)}
                            title={`Seat ${seat.seat_number} • ${seat.tier} • ₹${seat.calculated_price} (${seat.status})`}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all duration-150 relative group ${getSeatColor(seat)}`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : seat.status === 'BOOKED' ? (
                              <Lock className="w-3 h-3" />
                            ) : seat.status === 'HELD' ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <span>{seat.seat_number.replace(row, '')}</span>
                            )}

                            {/* Tooltip on hover */}
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg border border-white/10">
                              {seat.seat_number}: ₹{seat.calculated_price}
                            </span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row Label Right */}
                  <span className="w-6 text-center text-xs font-bold text-slate-400">
                    {row}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Color Legend (Green: Available, Violet: Selected, Red: Booked, Amber: Held) */}
      <div className="glass-panel p-4 rounded-xl max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-emerald-950/60 border border-emerald-500 text-emerald-400" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-violet-600 border border-violet-400 shadow-sm shadow-violet-500/50" />
          <span>Selected by You</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-950/60 border border-amber-500 text-amber-400" />
          <span>Held by Another User</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-rose-950/60 border border-rose-900/60 text-rose-500/60" />
          <span>Booked / Sold</span>
        </div>
      </div>
    </div>
  );
}
