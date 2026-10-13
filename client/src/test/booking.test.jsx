import { describe, it, expect } from 'vitest';
import bookingReducer, {
  setSelectedEvent,
  toggleSeat,
  clearSelectedSeats,
  setHoldInfo,
  clearHoldInfo,
  setCustomerDetails,
  setBookingData,
  setPaymentResult,
  resetBookingFlow,
  setActiveFilter,
  setSearchQuery
} from '../features/booking/bookingSlice';

describe('Redux Booking Slice Unit Tests', () => {
  const initialState = {
    selectedEvent: null,
    selectedSeats: [],
    holdInfo: null,
    customerDetails: { fullName: '', email: '', phone: '' },
    bookingData: null,
    paymentResult: null,
    activeFilter: 'All',
    searchQuery: ''
  };

  it('should set selected event and reset prior seat selection', () => {
    const stateWithSeats = {
      ...initialState,
      selectedSeats: [{ id: 'seat_1', seat_number: 'A1' }],
      holdInfo: { holdToken: 'token_old' }
    };

    const newEvent = { id: 'evt_new_1', title: 'Tech Summit', base_price: 1500 };
    const nextState = bookingReducer(stateWithSeats, setSelectedEvent(newEvent));

    expect(nextState.selectedEvent).toEqual(newEvent);
    expect(nextState.selectedSeats).toEqual([]);
    expect(nextState.holdInfo).toBeNull();
  });

  it('should toggle seats correctly (select then unselect)', () => {
    const seatA1 = { id: 'seat_A1', seat_number: 'A1', calculated_price: 1200 };
    const seatA2 = { id: 'seat_A2', seat_number: 'A2', calculated_price: 1200 };

    // Add A1
    let state = bookingReducer(initialState, toggleSeat(seatA1));
    expect(state.selectedSeats).toHaveLength(1);
    expect(state.selectedSeats[0].id).toBe('seat_A1');

    // Add A2
    state = bookingReducer(state, toggleSeat(seatA2));
    expect(state.selectedSeats).toHaveLength(2);

    // Toggle A1 again -> should remove A1
    state = bookingReducer(state, toggleSeat(seatA1));
    expect(state.selectedSeats).toHaveLength(1);
    expect(state.selectedSeats[0].id).toBe('seat_A2');
  });

  it('should clear all selected seats', () => {
    const stateWithSeats = {
      ...initialState,
      selectedSeats: [{ id: 's1' }, { id: 's2' }]
    };
    const nextState = bookingReducer(stateWithSeats, clearSelectedSeats());
    expect(nextState.selectedSeats).toEqual([]);
  });

  it('should set and clear hold info', () => {
    const holdData = {
      holdToken: 'hold_abc123',
      expiresAt: '2026-10-13T20:00:00.000Z',
      totalAmount: 2400
    };

    let state = bookingReducer(initialState, setHoldInfo(holdData));
    expect(state.holdInfo).toEqual(holdData);

    state = bookingReducer(state, clearHoldInfo());
    expect(state.holdInfo).toBeNull();
  });

  it('should update customer details', () => {
    const details = {
      fullName: 'Vikram Seth',
      email: 'vikram.s@example.com',
      phone: '+91 9876543210'
    };

    const state = bookingReducer(initialState, setCustomerDetails(details));
    expect(state.customerDetails).toEqual(details);
  });

  it('should store booking data and payment results', () => {
    const booking = { bookingId: 'BK-999', totalAmount: 3000, status: 'PENDING' };
    const payment = { status: 'SUCCESS', transactionReference: 'TXN-001' };

    let state = bookingReducer(initialState, setBookingData(booking));
    expect(state.bookingData).toEqual(booking);

    state = bookingReducer(state, setPaymentResult(payment));
    expect(state.paymentResult).toEqual(payment);

    // Reset flow
    state = bookingReducer(state, resetBookingFlow());
    expect(state.selectedSeats).toEqual([]);
    expect(state.holdInfo).toBeNull();
    expect(state.bookingData).toBeNull();
    expect(state.paymentResult).toBeNull();
  });

  it('should set active category filter and search query', () => {
    let state = bookingReducer(initialState, setActiveFilter('Music'));
    expect(state.activeFilter).toBe('Music');

    state = bookingReducer(state, setSearchQuery('Coimbatore'));
    expect(state.searchQuery).toBe('Coimbatore');
  });
});
