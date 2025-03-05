export enum ErrorCodes {
  DUPLICATE_EMAIL = 'Duplicate email',
  USER_CREATION_FAILED = 'User creation failed',
  UNKNOWN_ERROR = 'Unknown error',
  MAX_WATCHLIST_LIMIT_REACHED = 'Max Watchlist limit reached',
  TICKER_NOT_FOUND = 'Ticker Not Found',
}

export enum ErrorMessages {
  INVALID_EMAIL = 'Invalid email',
  INTERNAL_FAILURE = 'Internal Failure',
  INVALID_REQUEST = 'Invalid request',
  MAX_WATCHLIST_LIMIT_REACHED = 'You can only have up to 10 tickers in your watchlist. Please remove some before adding a new one.',
  TICKER_NOT_FOUND = 'The ticker you entered could not be found. Please check the ticker symbol and try again.',
}
