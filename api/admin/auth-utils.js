/**
 * Authentication Utilities
 * Handles JWT tokens, password hashing, and session management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$XYZ...'; // Default hash

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for authenticated user
 * @param {object} payload - User data to encode in token
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: 'revamply-admin',
  });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'revamply-admin',
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Extract token from request cookies
 * @param {object} req - Request object
 * @returns {string|null} Token or null if not found
 */
export function getTokenFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies.admin_token || null;
}

/**
 * Set authentication cookie in response
 * @param {object} res - Response object
 * @param {string} token - JWT token
 */
export function setAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };

  res.setHeader('Set-Cookie', cookie.serialize('admin_token', token, cookieOptions));
}

/**
 * Clear authentication cookie
 * @param {object} res - Response object
 */
export function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
  );
}

/**
 * Verify admin credentials
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Promise<boolean>} True if credentials are valid
 */
export async function verifyAdminCredentials(username, password) {
  if (username !== ADMIN_USERNAME) {
    return false;
  }

  return await comparePassword(password, ADMIN_PASSWORD_HASH);
}

/**
 * Middleware to protect admin routes
 * @param {object} req - Request object
 * @returns {object|null} Decoded user or null if unauthorized
 */
export function requireAuth(req) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Rate limiting for login attempts
 * In-memory store (use Redis in production)
 */
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if IP is rate limited
 * @param {string} ip - Client IP address
 * @returns {object} { allowed: boolean, remainingAttempts: number, lockoutUntil: number|null }
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now, lockedUntil: null };

  // Check if currently locked out
  if (attempts.lockedUntil && attempts.lockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutUntil: attempts.lockedUntil,
    };
  }

  // Reset if lockout period has expired
  if (attempts.lockedUntil && attempts.lockedUntil <= now) {
    attempts.count = 0;
    attempts.lockedUntil = null;
  }

  // Reset count if last attempt was > 15 minutes ago
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    attempts.count = 0;
  }

  return {
    allowed: attempts.count < MAX_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts.count),
    lockoutUntil: attempts.lockedUntil,
  };
}

/**
 * Record failed login attempt
 * @param {string} ip - Client IP address
 */
export function recordFailedAttempt(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now, lockedUntil: null };

  attempts.count++;
  attempts.lastAttempt = now;

  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_DURATION;
  }

  loginAttempts.set(ip, attempts);
}

/**
 * Clear login attempts for IP (on successful login)
 * @param {string} ip - Client IP address
 */
export function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

/**
 * Generate a password hash for setup
 * Utility function to generate admin password hash
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hash to store in environment variable
 */
export async function generateAdminPasswordHash(password) {
  const hash = await hashPassword(password);
  console.log('Generated password hash for ADMIN_PASSWORD_HASH:');
  console.log(hash);
  return hash;
}
