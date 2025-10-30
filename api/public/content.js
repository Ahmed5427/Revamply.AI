/**
 * Public Content API
 * GET /api/public/content
 * 
 * Returns all published content (no authentication required)
 * This is what your website uses to load content
 */

import { getAllContent } from '../admin/content-storage.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Set cache headers (cache for 1 minute)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    // Get all content
    const content = await getAllContent();

    console.log(`[Public Content API] Serving ${content.length} content items`);

    return res.status(200).json({
      success: true,
      count: content.length,
      content: content,
      cachedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Public Content API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to load content',
      message: error.message
    });
  }
}
