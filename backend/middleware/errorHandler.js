const { errorResponse } = require('../utils/response');

/**
 * Global Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.code === '23505' ? 409 : err.code === '23503' ? 400 : 500);
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else if (process.env.NODE_ENV !== 'test') {
    console.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${err.message}`);
  }

  // PostgreSQL unique constraint violation (code 23505)
  if (err.code === '23505') {
    return errorResponse(res, 409, 'A record with this information already exists', err.detail);
  }

  // PostgreSQL foreign key violation (code 23503)
  if (err.code === '23503') {
    return errorResponse(res, 400, 'Invalid related record identifier', err.detail);
  }

  // JSON Web Token Error
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Authentication token has expired');
  }

  const finalStatusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, finalStatusCode, message, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = errorHandler;
