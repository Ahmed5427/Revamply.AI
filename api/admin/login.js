/**
 * Admin Login API
 * POST /api/admin/login
 * Authenticates admin user and returns JWT token
 */

import {
  verifyAdminCredentials,
  generateToken,
  setAuthCookie,
  checkRateLimit,
  recordFailedAttempt,
  clearLoginAttempts,
} from './auth-utils.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
      });
    }

    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    // Check rate limiting
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const lockoutMinutes = Math.ceil((rateLimit.lockoutUntil - Date.now()) / (60 * 1000));
      return res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${lockoutMinutes} minutes.`,
        lockoutUntil: rateLimit.lockoutUntil,
      });
    }

    // Verify credentials
    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      // Record failed attempt
      recordFailedAttempt(clientIP);

      const updatedRateLimit = checkRateLimit(clientIP);

      return res.status(401).json({
        error: 'Invalid credentials',
        remainingAttempts: updatedRateLimit.remainingAttempts,
      });
    }

    // Clear any previous failed attempts
    clearLoginAttempts(clientIP);

    // Generate JWT token
    const token = generateToken({
      username,
      role: 'admin',
      loginTime: new Date().toISOString(),
    });

    // Set HTTP-only cookie
    setAuthCookie(res, token);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        username,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'An error occurred during login',
    });
  }
}
