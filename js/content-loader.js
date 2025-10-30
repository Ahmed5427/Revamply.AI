/**
 * Revamply Content Loader
 * Loads editable content from database and updates the page
 * 
 * Place this script in: /public/js/content-loader.js
 * Then add to your index.html: <script src="/js/content-loader.js"></script>
 */

(function() {
  'use strict';

  console.log('[Content Loader] Initializing...');

  // Configuration
  const API_ENDPOINT = '/api/public/content';
  const CACHE_KEY = 'revamply_content_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load content from API or cache
   */
  async function loadContent() {
    try {
      // Check cache first
      const cached = getFromCache();
      if (cached) {
        console.log('[Content Loader] Using cached content');
        applyContent(cached);
        return;
      }

      // Fetch from API
      console.log('[Content Loader] Fetching content from API...');
      const response = await fetch(API_ENDPOINT);
      
      if (!response.ok) {
        console.error('[Content Loader] API returned:', response.status);
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.content) {
        console.error('[Content Loader] Invalid API response');
        return;
      }

      console.log(`[Content Loader] Loaded ${data.content.length} content items`);
      
      // Cache the content
      saveToCache(data.content);
      
      // Apply to page
      applyContent(data.content);
      
    } catch (error) {
      console.error('[Content Loader] Error loading content:', error);
    }
  }

  /**
   * Apply content to page elements
   */
  function applyContent(contentArray) {
    let applied = 0;
    let notFound = 0;

    contentArray.forEach(item => {
      const element = document.getElementById(item.elementId);
      
      if (!element) {
        notFound++;
        return;
      }

      // Update text content
      if (item.text) {
        element.textContent = item.text;
      }

      // Apply styles
      if (item.styles) {
        if (item.styles.color) {
          element.style.color = item.styles.color;
        }
        if (item.styles.fontSize) {
          element.style.fontSize = item.styles.fontSize;
        }
        if (item.styles.fontWeight) {
          element.style.fontWeight = item.styles.fontWeight;
        }
        if (item.styles.backgroundColor) {
          element.style.backgroundColor = item.styles.backgroundColor;
        }
      }

      applied++;
    });

    console.log(`[Content Loader] Applied ${applied} content items, ${notFound} elements not found`);
  }

  /**
   * Cache management
   */
  function getFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { content, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return content;
    } catch (error) {
      console.error('[Content Loader] Cache read error:', error);
      return null;
    }
  }

  function saveToCache(content) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        content,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('[Content Loader] Cache write error:', error);
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  window.revamplyReloadContent = function() {
    console.log('[Content Loader] Clearing cache and reloading...');
    localStorage.removeItem(CACHE_KEY);
    loadContent();
  };

  // Load content when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }

  console.log('[Content Loader] Initialized successfully');
})();
