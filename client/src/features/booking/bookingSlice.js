import { createSlice } from '@reduxjs/toolkit';

// Load initial state from sessionStorage if available
const loadSavedState = () => {
  try {
    const saved = sessionStorage.getItem('eventease_booking_state');
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignore storage errors
  }
  return null;
};

const savedState = loadSavedState();

const initialState = {
  selectedEvent: savedState?.selectedEvent || null,
  selectedSeats: savedState?.selectedSeats || [],
  holdInfo: savedState?.holdInfo || null,
  customerDetails: savedState?.customerDetails || {
    fullName: '',
    email: '',
    phone: ''
  },
  bookingData: savedState?.bookingData || null,
  paymentResult: savedState?.paymentResult || null,
  activeFilter: 'All',
  searchQuery: ''
};

const saveToSession = (state) => {
  try {
    sessionStorage.setItem('eventease_booking_state', JSON.stringify({
      selectedEvent: state.selectedEvent,
      selectedSeats: state.selectedSeats,
      holdInfo: state.holdInfo,
      customerDetails: state.customerDetails,
      bookingData: state.bookingData,
      paymentResult: state.paymentResult
    }));
  } catch {
    // Ignore storage errors
  }
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedEvent: (state, action) => {
      // If changing event, clear previous seats and holds
      if (state.selectedEvent?.id !== action.payload?.id) {
        state.selectedSeats = [];
        state.holdInfo = null;
        state.bookingData = null;
        state.paymentResult = null;
      }
      state.selectedEvent = action.payload;
      saveToSession(state);
    },

    toggleSeat: (state, action) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex(s => s.id === seat.id);
      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        state.selectedSeats.push(seat);
      }
      saveToSession(state);
    },

    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
      saveToSession(state);
    },

    setHoldInfo: (state, action) => {
      state.holdInfo = action.payload;
      saveToSession(state);
    },

    clearHoldInfo: (state) => {
      state.holdInfo = null;
      saveToSession(state);
    },

    setCustomerDetails: (state, action) => {
      state.customerDetails = { ...state.customerDetails, ...action.payload };
      saveToSession(state);
    },

    setBookingData: (state, action) => {
      state.bookingData = action.payload;
      saveToSession(state);
    },

    setPaymentResult: (state, action) => {
      state.paymentResult = action.payload;
      saveToSession(state);
    },

    resetBookingFlow: (state) => {
      state.selectedSeats = [];
      state.holdInfo = null;
      state.bookingData = null;
      state.paymentResult = null;
      saveToSession(state);
    },

    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

export const {
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
} = bookingSlice.actions;

export default bookingSlice.reducer;
