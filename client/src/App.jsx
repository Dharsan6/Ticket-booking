import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import TicketVerifyPage from './pages/TicketVerifyPage';
import ArchitecturePage from './pages/ArchitecturePage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-100 selection:bg-brand-primary selection:text-white">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/checkout/details" element={<CustomerDetailsPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/bookings/:id" element={<BookingConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/tickets/:id/verify" element={<TicketVerifyPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
