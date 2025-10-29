/**
 * Verify Session API
 * GET /api/admin/verify-session
 * Checks if current session is valid
 */

import { requireAuth } from './auth-utils.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = requireAuth(req);

    if (!user) {
      return res.status(401).json({
        authenticated: false,
        error: 'Not authenticated',
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({
      error: 'An error occurred during session verification',
    });
  }
}
