import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../services/api';
import { setPaymentResult, resetBookingFlow } from '../features/booking/bookingSlice';
import { 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Lock,
  Sparkles,
  Ticket,
  HelpCircle
} from 'lucide-react';

export default function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookingData, selectedEvent, selectedSeats, customerDetails } = useSelector((state) => state.booking);

  const [processing, setProcessing] = useState(false);
  const [simulationError, setSimulationError] = useState(null);
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  if (!bookingData?.bookingId) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Pending Booking Found</h2>
        <p className="text-xs text-brand-muted">
          Please select seats and provide your details to initiate payment.
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

  const handleSimulatePayment = async (simulationStatus) => {
    if (processing) return;

    setProcessing(true);
    setSimulationError(null);

    try {
      const res = await api.processPayment(bookingData.bookingId, {
        status: simulationStatus,
        idempotencyKey,
        paymentMethod: 'DEMO_SIMULATOR'
      });

      dispatch(setPaymentResult(res.data));

      if (simulationStatus === 'SUCCESS') {
        // Navigate directly to Confirmation page
        navigate(`/bookings/${bookingData.bookingId}`);
      } else {
        // Payment simulated as FAILED
        setSimulationError('Payment declined by user request. As per system rules, your temporary seat hold has been released.');
      }
    } catch (err) {
      setSimulationError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      {/* Checkout Stepper */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold max-w-2xl mx-auto text-center border-b border-brand-border/60 pb-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">1</span>
          <span>Seats</span>
        </div>
        <div className="w-12 h-0.5 bg-emerald-500" />
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">2</span>
          <span>Details</span>
        </div>
        <div className="w-12 h-0.5 bg-brand-primary" />
        <div className="flex items-center gap-1.5 text-brand-accent">
          <span className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-accent">3</span>
          <span>Payment</span>
        </div>
        <div className="w-12 h-0.5 bg-brand-border" />
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">4</span>
          <span>Tickets</span>
        </div>
      </div>

      {/* Prominent Demo Notice Banner */}
      <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <strong className="font-bold text-white block">
            DEMO PAYMENT SIMULATOR MODE
          </strong>
          <p className="text-slate-300 leading-relaxed">
            This is an academic evaluation project. No real cards, bank credentials, or money will ever be processed. Use the two simulation buttons below to test both the <strong>success verification</strong> and <strong>graceful failure/seat release</strong> workflows.
          </p>
        </div>
      </div>

      {/* Simulation Error Alert (on Failed Payment) */}
      {simulationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs sm:text-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Simulated Payment Result: Failed</strong>
              <p>{simulationError}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                dispatch(resetBookingFlow());
                navigate(`/events/${selectedEvent?.id || ''}`);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30"
            >
              Select New Seats
            </button>
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white"
            >
              Return Home
            </Link>
          </div>
        </div>
      )}

      {/* Main Payment Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Simulator Action Panel (7 cols) */}
        <div className="md:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-accent" />
              Simulated Payment Terminal
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              Select one of the two simulator outcomes to trigger backend state transitions.
            </p>
          </div>

          <div className="space-y-4">
            {/* SUCCESS BUTTON */}
            <button
              type="button"
              disabled={processing || simulationError}
              onClick={() => handleSimulatePayment('SUCCESS')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="block text-sm">Simulate Successful Payment</span>
                  <span className="text-[11px] text-emerald-100 font-normal">
                    Confirm booking, issue digital tickets & generate QR codes
                  </span>
                </div>
              </div>
              <span className="text-xs bg-black/20 px-2.5 py-1 rounded-full font-mono">
                PASS
              </span>
            </button>

            {/* FAILURE BUTTON */}
            <button
              type="button"
              disabled={processing || simulationError}
              onClick={() => handleSimulatePayment('FAILED')}
              className="w-full p-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 font-bold flex items-center justify-between transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <span className="block text-sm">Simulate Payment Failure</span>
                  <span className="text-[11px] text-rose-400/80 font-normal">
                    Test failed payment handling, cancel booking & release held seats
                  </span>
                </div>
              </div>
              <span className="text-xs bg-rose-500/20 px-2.5 py-1 rounded-full font-mono text-rose-300">
                FAIL
              </span>
            </button>
          </div>

          {processing && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-brand-muted">
                Communicating with backend transactional payment engine...
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Idempotency Key: <code className="font-mono text-slate-300">{idempotencyKey}</code></span>
          </div>
        </div>

        {/* Right: Booking Order Summary (5 cols) */}
        <div className="md:col-span-5 glass-card rounded-3xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white border-b border-brand-border/60 pb-3">
            Payment Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Booking ID</span>
              <span className="font-mono font-bold text-brand-accent text-sm">
                {bookingData.bookingId}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Event</span>
              <span className="font-bold text-sm text-white">{selectedEvent?.title}</span>
            </div>

            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Customer</span>
              <span className="text-white font-medium">{customerDetails?.fullName}</span>
              <span className="text-slate-400 block">{customerDetails?.email}</span>
            </div>

            <div>
              <span className="text-[10px] text-brand-muted uppercase block">Seats Selected</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-200"
                  >
                    {s.seat_number}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-base font-bold">
            <span className="text-white">Amount Due</span>
            <span className="font-mono text-xl text-brand-accent font-black">
              ₹{Number(bookingData.totalAmount).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Backend verifies payment before issuing QR passes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
