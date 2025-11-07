export const CONSTANTS = {
  // Nag sensitivity intervals in hours
  NAG_INTERVALS: {
    low: 48,      // Remind once after 48 hours
    medium: 24,   // Remind every 24 hours
    high: 12,     // Remind every 12 hours
  },

  // Currency codes
  CURRENCIES: {
    USD: 'USD',
    NGN: 'NGN',
    EUR: 'EUR',
    GBP: 'GBP',
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Debt status flow
  DEBT_STATUS_FLOW: {
    pending: ['ready_to_send', 'cancelled'],
    ready_to_send: ['payment_requested', 'cancelled'],
    payment_requested: ['settled', 'cancelled'],
    settled: [],
    cancelled: [],
  },

  // Error messages
  ERRORS: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_SERVER: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    DEBT_NOT_FOUND: 'Debt not found',
    FRIEND_NOT_FOUND: 'Friend not found',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    PAYMENT_FAILED: 'Payment processing failed',
  },

  // Success messages
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    DEBT_CREATED: 'Debt created successfully',
    DEBT_UPDATED: 'Debt updated successfully',
    DEBT_DELETED: 'Debt deleted successfully',
    PAYMENT_INITIATED: 'Payment initiated successfully',
    PAYMENT_COMPLETED: 'Payment completed successfully',
    FRIEND_ADDED: 'Friend added successfully',
    FRIEND_REMOVED: 'Friend removed successfully',
  },
};
