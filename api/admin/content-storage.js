/**
 * Content Storage Module
 * Manages editable content storage in Vercel KV (Redis)
 */

import { kv } from '@vercel/kv';

const CONTENT_PREFIX = 'content:';
const HISTORY_PREFIX = 'history:';
const MAX_HISTORY_ENTRIES = 50;

/**
 * Get all editable content
 * @returns {Promise<Array>} Array of content items
 */
export async function getAllContent() {
  try {
    const keys = await kv.keys(`${CONTENT_PREFIX}*`);
    const contentItems = [];

    for (const key of keys) {
      const content = await kv.get(key);
      if (content) {
        contentItems.push(content);
      }
    }

    return contentItems.sort((a, b) => a.elementId.localeCompare(b.elementId));
  } catch (error) {
    console.error('Error fetching content:', error);
    return [];
  }
}

/**
 * Get content by element ID
 * @param {string} elementId - Unique element identifier
 * @returns {Promise<object|null>} Content item or null
 */
export async function getContent(elementId) {
  try {
    return await kv.get(`${CONTENT_PREFIX}${elementId}`);
  } catch (error) {
    console.error(`Error fetching content for ${elementId}:`, error);
    return null;
  }
}

/**
 * Save or update content
 * @param {string} elementId - Unique element identifier
 * @param {object} contentData - Content data to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveContent(elementId, contentData) {
  try {
    // Get existing content for history
    const existingContent = await getContent(elementId);

    // Prepare content object
    const content = {
      elementId,
      ...contentData,
      updatedAt: new Date().toISOString(),
    };

    // Save content with no expiry (10 years = effectively permanent)
    // This overrides the database's default 7-day TTL
    await kv.set(`${CONTENT_PREFIX}${elementId}`, content, {
      ex: 315360000 // 10 years in seconds (365 * 10 * 24 * 60 * 60)
    });

    // Save to history if content existed before
    if (existingContent) {
      await saveToHistory(elementId, existingContent);
    }

    return true;
  } catch (error) {
    console.error(`Error saving content for ${elementId}:`, error);
    return false;
  }
}

/**
 * Delete content
 * @param {string} elementId - Unique element identifier
 * @returns {Promise<boolean>} Success status
 */
export async function deleteContent(elementId) {
  try {
    await kv.del(`${CONTENT_PREFIX}${elementId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting content for ${elementId}:`, error);
    return false;
  }
}

/**
 * Save content to revision history
 * @param {string} elementId - Unique element identifier
 * @param {object} content - Content to save in history
 * @returns {Promise<boolean>} Success status
 */
async function saveToHistory(elementId, content) {
  try {
    const historyKey = `${HISTORY_PREFIX}${elementId}`;

    // Get existing history
    let history = (await kv.get(historyKey)) || [];

    // Add new entry with timestamp
    history.unshift({
      ...content,
      archivedAt: new Date().toISOString(),
    });

    // Keep only last N entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history = history.slice(0, MAX_HISTORY_ENTRIES);
    }

    // Save updated history with no expiry (10 years = effectively permanent)
    await kv.set(historyKey, history, {
      ex: 315360000 // 10 years in seconds
    });

    return true;
  } catch (error) {
    console.error(`Error saving history for ${elementId}:`, error);
    return false;
  }
}

/**
 * Get revision history for content
 * @param {string} elementId - Unique element identifier
 * @returns {Promise<Array>} Array of historical versions
 */
export async function getContentHistory(elementId) {
  try {
    return (await kv.get(`${HISTORY_PREFIX}${elementId}`)) || [];
  } catch (error) {
    console.error(`Error fetching history for ${elementId}:`, error);
    return [];
  }
}

/**
 * Initialize content from HTML
 * Scans HTML and creates content entries for all editable elements
 * @param {Array} elements - Array of element data from HTML
 * @returns {Promise<number>} Number of elements initialized
 */
export async function initializeContent(elements) {
  let initialized = 0;

  for (const element of elements) {
    const existing = await getContent(element.elementId);

    // Only initialize if doesn't exist
    if (!existing) {
      const success = await saveContent(element.elementId, {
        text: element.text,
        type: element.type,
        className: element.className,
        styles: element.styles || {},
        createdAt: new Date().toISOString(),
      });

      if (success) initialized++;
    }
  }

  return initialized;
}

/**
 * Bulk update multiple content items
 * @param {Array} updates - Array of {elementId, contentData} objects
 * @returns {Promise<object>} {success: number, failed: number}
 */
export async function bulkUpdateContent(updates) {
  let success = 0;
  let failed = 0;

  for (const update of updates) {
    const result = await saveContent(update.elementId, update.contentData);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Export all content as JSON
 * @returns {Promise<object>} All content data
 */
export async function exportContent() {
  try {
    const content = await getAllContent();
    return {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      contentCount: content.length,
      content,
    };
  } catch (error) {
    console.error('Error exporting content:', error);
    throw error;
  }
}

/**
 * Import content from JSON
 * @param {object} data - Exported content data
 * @returns {Promise<object>} {imported: number, errors: Array}
 */
export async function importContent(data) {
  const results = {
    imported: 0,
    errors: [],
  };

  if (!data.content || !Array.isArray(data.content)) {
    results.errors.push('Invalid data format');
    return results;
  }

  for (const item of data.content) {
    try {
      await saveContent(item.elementId, item);
      results.imported++;
    } catch (error) {
      results.errors.push({
        elementId: item.elementId,
        error: error.message,
      });
    }
  }

  return results;
}
