/**
 * Theme Management API
 * POST /api/admin/theme - Switch theme (dark/light)
 */

import { requireAuth } from './auth-utils.js';
import { kv } from '@vercel/kv';

const THEME_KEY = 'site:theme';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const user = requireAuth(req);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized. Please login first.',
      });
    }

    const { method, body, query } = req;

    // GET - Get current theme
    if (method === 'GET') {
      const theme = (await kv.get(THEME_KEY)) || 'dark';

      return res.status(200).json({
        success: true,
        theme,
      });
    }

    // POST - Set theme
    if (method === 'POST') {
      const { theme } = body;

      if (!theme || !['dark', 'light'].includes(theme)) {
        return res.status(400).json({
          error: 'Invalid theme. Must be "dark" or "light"',
        });
      }

      await kv.set(THEME_KEY, theme);

      return res.status(200).json({
        success: true,
        message: `Theme set to ${theme}`,
        theme,
      });
    }

    return res.status(405).json({
      error: 'Method not allowed',
    });
  } catch (error) {
    console.error('Theme API error:', error);
    return res.status(500).json({
      error: 'An error occurred',
      message: error.message,
    });
  }
}
