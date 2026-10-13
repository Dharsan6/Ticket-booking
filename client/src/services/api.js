const API_BASE = '/api';

/**
 * Helper to get or create a persistent anonymous session ID in sessionStorage
 */
export function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('eventease_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    sessionStorage.setItem('eventease_session_id', sessionId);
  }
  return sessionId;
}

async function request(url, options = {}) {
  const sessionId = getOrCreateSessionId();
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return request(`/events${queryString ? `?${queryString}` : ''}`);
  },

  getEventById: (id) => request(`/events/${id}`),

  getEventSeats: (eventId, holdToken) => {
    const sessionId = getOrCreateSessionId();
    const query = new URLSearchParams({ sessionId });
    if (holdToken) query.append('holdToken', holdToken);
    return request(`/events/${eventId}/seats?${query.toString()}`);
  },

  // Holds
  createHold: ({ eventId, seatIds, durationSeconds = 300 }) => {
    const customerSessionId = getOrCreateSessionId();
    return request('/holds', {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        seatIds,
        customerSessionId,
        durationSeconds
      })
    });
  },

  releaseHold: (identifier) => {
    return request(`/holds/${identifier}`, {
      method: 'DELETE'
    });
  },

  // Bookings
  createBooking: ({ eventId, customer, holdToken, seatIds }) => {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        customer,
        holdToken,
        seatIds
      })
    });
  },

  getBooking: (id) => request(`/bookings/${id}`),

  getCustomerBookings: (emailOrPhone) => {
    const query = new URLSearchParams({ email: emailOrPhone });
    return request(`/bookings?${query.toString()}`);
  },

  processPayment: (bookingId, { status = 'SUCCESS', idempotencyKey, paymentMethod = 'DEMO_SIMULATION' }) => {
    return request(`/bookings/${bookingId}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        idempotencyKey,
        paymentMethod
      })
    });
  },

  cancelBooking: (bookingId) => {
    return request(`/bookings/${bookingId}/cancel`, {
      method: 'POST'
    });
  },

  // Tickets
  verifyTicket: (codeOrId) => request(`/tickets/${codeOrId}/verify`)
};
