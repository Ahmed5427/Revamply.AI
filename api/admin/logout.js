/**
 * Admin Logout API
 * POST /api/admin/logout
 * Clears authentication cookie
 */

import { clearAuthCookie } from './auth-utils.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear authentication cookie
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'An error occurred during logout',
    });
  }
}
