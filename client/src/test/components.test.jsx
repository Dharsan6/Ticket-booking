import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '../features/booking/bookingSlice';
import SeatGrid from '../components/SeatGrid';
import EventCard from '../components/EventCard';
import TimerBanner from '../components/TimerBanner';
import Navbar from '../components/Navbar';

function renderWithProviders(ui, { initialState } = {}) {
  const store = configureStore({
    reducer: { booking: bookingReducer },
    preloadedState: initialState ? { booking: initialState } : undefined
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
}

describe('Frontend Component Tests', () => {
  it('SeatGrid renders seats, legend, and handles seat clicks', () => {
    const mockSeats = [
      { id: 's_A1', seat_number: 'A1', seat_row: 'A', tier: 'VIP', price_multiplier: 1.5, calculated_price: 1500, status: 'AVAILABLE' },
      { id: 's_A2', seat_number: 'A2', seat_row: 'A', tier: 'VIP', price_multiplier: 1.5, calculated_price: 1500, status: 'BOOKED' },
      { id: 's_A3', seat_number: 'A3', seat_row: 'A', tier: 'VIP', price_multiplier: 1.5, calculated_price: 1500, status: 'HELD' },
    ];
    const selectedSeats = [{ id: 's_A1' }];
    const onToggle = vi.fn();

    render(
      <SeatGrid
        seats={mockSeats}
        selectedSeats={selectedSeats}
        onToggleSeat={onToggle}
        isHolding={false}
      />
    );

    // Legend check
    expect(screen.getByText(/Available/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected by You/i)).toBeInTheDocument();
    expect(screen.getByText(/Booked/i)).toBeInTheDocument();
    expect(screen.getByText(/Held/i)).toBeInTheDocument();

    // Check button A1 is rendered
    const seatA1 = screen.getByRole('button', { name: /A1/i });
    expect(seatA1).toBeInTheDocument();

    // Clicking available/selected seat triggers callback
    fireEvent.click(seatA1);
    expect(onToggle).toHaveBeenCalledWith(mockSeats[0]);

    // Booked seat A2 is disabled
    const seatA2 = screen.getByRole('button', { name: /A2/i });
    expect(seatA2).toBeDisabled();

    // Held seat A3 is disabled
    const seatA3 = screen.getByRole('button', { name: /A3/i });
    expect(seatA3).toBeDisabled();
  });

  it('EventCard renders event title, date, venue, and price correctly', () => {
    const mockEvent = {
      id: 'evt_rock_fest',
      title: 'Tamil Rock Fusion Fest',
      category: 'Music',
      date: '2026-11-14',
      time: '06:30 PM',
      venue_city: 'Coimbatore',
      venue_name: 'CODISSIA Complex',
      base_price: 1200,
      available_seats_count: 58,
      total_seats: 60,
      description: 'An electrifying open-air rock experience.',
      banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'
    };

    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText('Tamil Rock Fusion Fest')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Coimbatore')).toBeInTheDocument();
    expect(screen.getByText(/2026-11-14/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1,200/i)).toBeInTheDocument();
    expect(screen.getByText(/58 seats left/i)).toBeInTheDocument();
  });

  it('TimerBanner displays countdown when expiresAt is future timestamp', () => {
    const futureExpiry = new Date(Date.now() + 180 * 1000).toISOString(); // 3 minutes in future

    render(<TimerBanner expiresAt={futureExpiry} onExpire={vi.fn()} />);

    expect(screen.getByText(/Temporary Reservation Active/i)).toBeInTheDocument();
  });

  it('Navbar renders brand logo and navigation links', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText('Ease')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Events/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /My Bookings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Architecture/i })).toBeInTheDocument();
  });
});
