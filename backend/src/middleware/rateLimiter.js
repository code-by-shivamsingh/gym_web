const RateLimit = require('../models/RateLimit');

/**
 * MongoDB-backed request rate limiting middleware.
 * Enforces security limits that persist across server restarts and scale horizontally.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests allowed in the time window
 * @param {string} options.message - Error message to return when limit is exceeded
 */
const rateLimiter = (options) => {
  const { windowMs, max, message } = options;

  return async (req, res, next) => {
    // Standardize client IP detection (consider reverse proxies)
    const ip = req.ip || 
               req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.socket.remoteAddress;
               
    const endpoint = req.baseUrl + req.path;
    const now = new Date();

    try {
      // Find or create rate limit document for this IP & endpoint
      let record = await RateLimit.findOne({ ip, endpoint });

      if (!record) {
        record = await RateLimit.create({
          ip,
          endpoint,
          hits: 1,
          resetTime: new Date(now.getTime() + windowMs)
        });
      } else {
        // If the record exists but its reset time is in the past (before the TTL clean up)
        if (record.resetTime.getTime() < now.getTime()) {
          record.hits = 1;
          record.resetTime = new Date(now.getTime() + windowMs);
          await record.save();
        } else {
          // Increment hit counter
          record.hits += 1;
          await record.save();
        }
      }

      // Check if limit exceeded
      if (record.hits > max) {
        const secondsLeft = Math.max(0, Math.ceil((record.resetTime.getTime() - now.getTime()) / 1000));
        
        console.warn(`[SECURITY WARNING] Rate limit exceeded by IP: ${ip} on endpoint: ${endpoint}. Blocked for ${secondsLeft}s.`);

        // Set standard rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime.getTime() / 1000));
        res.setHeader('Retry-After', secondsLeft);

        return res.status(429).json({
          success: false,
          message: message || `Too many requests from this IP. Please try again after ${secondsLeft} seconds.`,
          retryAfter: secondsLeft
        });
      }

      // Set headers for successful requests
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.hits));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime.getTime() / 1000));

      next();
    } catch (err) {
      console.error('[RATE LIMIT ERROR] Failed to enforce rate limiting:', err);
      // Fallback: Fail open so users can still request OTP/login if database encounters issues
      next();
    }
  };
};

module.exports = rateLimiter;
