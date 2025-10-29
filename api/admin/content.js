/**
 * Content Management API
 * Handles CRUD operations for editable content
 *
 * GET /api/admin/content - Get all content
 * GET /api/admin/content?id=element-id - Get specific content
 * POST /api/admin/content - Create/Update content
 * DELETE /api/admin/content?id=element-id - Delete content
 */

import { requireAuth } from './auth-utils.js';
import {
  getAllContent,
  getContent,
  saveContent,
  deleteContent,
  getContentHistory,
  initializeContent,
  bulkUpdateContent,
  exportContent,
  importContent,
} from './content-storage.js';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const user = requireAuth(req);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized. Please login first.',
      });
    }

    const { method, query, body } = req;

    // GET - Fetch content
    if (method === 'GET') {
      // Get specific content by ID
      if (query.id) {
        const content = await getContent(query.id);

        if (!content) {
          return res.status(404).json({
            error: 'Content not found',
          });
        }

        return res.status(200).json({
          success: true,
          content,
        });
      }

      // Get history for specific content
      if (query.history && query.id) {
        const history = await getContentHistory(query.id);

        return res.status(200).json({
          success: true,
          elementId: query.id,
          history,
        });
      }

      // Export all content
      if (query.export) {
        const exportData = await exportContent();

        return res.status(200).json({
          success: true,
          ...exportData,
        });
      }

      // Get all content
      const allContent = await getAllContent();

      return res.status(200).json({
        success: true,
        count: allContent.length,
        content: allContent,
      });
    }

    // POST - Create or Update content
    if (method === 'POST') {
      // Bulk update
      if (body.bulkUpdate && Array.isArray(body.updates)) {
        const result = await bulkUpdateContent(body.updates);

        return res.status(200).json({
          success: true,
          message: `Updated ${result.success} items, ${result.failed} failed`,
          ...result,
        });
      }

      // Initialize content from HTML elements
      if (body.initialize && Array.isArray(body.elements)) {
        const initialized = await initializeContent(body.elements);

        return res.status(200).json({
          success: true,
          message: `Initialized ${initialized} elements`,
          initialized,
        });
      }

      // Import content
      if (body.import && body.data) {
        const result = await importContent(body.data);

        return res.status(200).json({
          success: true,
          message: `Imported ${result.imported} items`,
          ...result,
        });
      }

      // Single content update
      const { elementId, contentData } = body;

      if (!elementId || !contentData) {
        return res.status(400).json({
          error: 'elementId and contentData are required',
        });
      }

      const success = await saveContent(elementId, contentData);

      if (!success) {
        return res.status(500).json({
          error: 'Failed to save content',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Content updated successfully',
        elementId,
      });
    }

    // DELETE - Remove content
    if (method === 'DELETE') {
      const elementId = query.id;

      if (!elementId) {
        return res.status(400).json({
          error: 'elementId is required',
        });
      }

      const success = await deleteContent(elementId);

      if (!success) {
        return res.status(500).json({
          error: 'Failed to delete content',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Content deleted successfully',
        elementId,
      });
    }

    // Method not allowed
    return res.status(405).json({
      error: 'Method not allowed',
    });
  } catch (error) {
    console.error('Content API error:', error);
    return res.status(500).json({
      error: 'An error occurred',
      message: error.message,
    });
  }
}
