import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  skipSuccessfulRequests: true,
});

export const paymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment requests per hour
  message: {
    success: false,
    message: 'Too many payment requests, please try again later',
  },
});
