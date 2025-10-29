/**
 * Initialize Content - Matches Actual HTML Element IDs
 * 
 * This populates Redis with content matching the exact element IDs in your index.html
 * 
 * Usage: https://revamply.ai/api/init-real-content
 */

export default async function handler(req, res) {
  try {
    // Import the content storage module
    const { saveContent } = await import('./admin/content-storage.js');
    
    // Content matching YOUR actual HTML element IDs
    const actualContent = [
      // Hero Section - Main Heading Lines
      {
        elementId: 'hero-heading-line1',
        text: 'AI Solutions That',
        type: 'span',
        className: 'heading-hero-line1',
        styles: { color: '#ffffff' }
      },
      {
        elementId: 'hero-heading-line2',
        text: 'Save Time, Cut Costs',
        type: 'span',
        className: 'heading-hero-line2',
        styles: { color: '#3b82f6' } // gradient
      },
      {
        elementId: 'hero-heading-line3',
        text: '& Grow Revenue',
        type: 'span',
        className: 'heading-hero-line3',
        styles: { color: '#ffffff' }
      },
      {
        elementId: 'hero-main-heading',
        text: 'AI Solutions That Save Time, Cut Costs & Grow Revenue',
        type: 'h1',
        className: 'heading-hero-main',
        styles: { color: '#ffffff' }
      },
      
      // Hero Description
      {
        elementId: 'hero-desc',
        text: 'Revamply develops tailored AI solutions using advanced machine learning, natural language processing, and automation. From predictive analytics to enterprise-grade AI platforms — we engineer systems that drive efficiency and unlock new revenue streams.',
        type: 'p',
        className: 'paragraph-hero-description',
        styles: { color: '#d1d5db' }
      },
      
      // Hero Stats
      {
        elementId: 'hero-stat1-number',
        text: '80%',
        type: 'div',
        className: 'stat-hero-number',
        styles: {}
      },
      {
        elementId: 'hero-stat1-text',
        text: 'of executives say AI boosts productivity',
        type: 'div',
        className: 'stat-hero-description',
        styles: { color: '#9ca3af' }
      },
      {
        elementId: 'hero-stat2-number',
        text: '$15.7K',
        type: 'div',
        className: 'stat-hero-number',
        styles: {}
      },
      {
        elementId: 'hero-stat2-text',
        text: 'projected global AI contribution by 2030',
        type: 'div',
        className: 'stat-hero-description',
        styles: { color: '#9ca3af' }
      },
      
      // Why Trust Section (if it exists)
      {
        elementId: 'why-trust-heading',
        text: 'Why Businesses Trust Revamply for AI Transformation',
        type: 'h2',
        className: 'heading-why-main',
        styles: { color: '#ffffff' }
      },
      {
        elementId: 'efficiency-title',
        text: 'Intelligent Efficiency',
        type: 'h3',
        className: 'heading-why-card',
        styles: { color: '#ffffff' }
      },
      {
        elementId: 'efficiency-description',
        text: 'Automate repetitive tasks with AI so your team can focus on high-value growth activities.',
        type: 'p',
        className: 'paragraph-why-card',
        styles: { color: '#9ca3af' }
      },
      {
        elementId: 'overhead-title',
        text: 'Reduce Overhead',
        type: 'h3',
        className: 'heading-why-card',
        styles: { color: '#ffffff' }
      },
      {
        elementId: 'overhead-description',
        text: 'Cut operational costs by up to 45% through intelligent automation and process optimization.',
        type: 'p',
        className: 'paragraph-why-card',
        styles: { color: '#9ca3af' }
      },
      {
        elementId: 'growth-title',
        text: 'Accelerated Growth',
        type: 'h3',
        className: 'heading-why-card',
        styles: { color: '#ffffff' }
      },
      {
        elementId: 'growth-description',
        text: 'Unlock new revenue streams with AI-powered insights and predictive analytics.',
        type: 'p',
        className: 'paragraph-why-card',
        styles: { color: '#9ca3af' }
      }
    ];
    
    let successCount = 0;
    let failedCount = 0;
    const results = [];
    
    // Save each content item
    for (const item of actualContent) {
      const success = await saveContent(item.elementId, {
        text: item.text,
        type: item.type,
        className: item.className,
        styles: item.styles,
        createdAt: new Date().toISOString()
      });
      
      if (success) {
        successCount++;
        results.push({ elementId: item.elementId, status: 'success' });
        console.log(`✅ Initialized: ${item.elementId}`);
      } else {
        failedCount++;
        results.push({ elementId: item.elementId, status: 'failed' });
        console.log(`❌ Failed: ${item.elementId}`);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Real content initialized matching your HTML',
      initialized: successCount,
      failed: failedCount,
      total: actualContent.length,
      results: results,
      nextSteps: [
        '1. Go to https://revamply.ai/admin-panel.html',
        '2. Login with your credentials',
        '3. Click the Refresh button',
        `4. You should see ${successCount} content items matching your HTML!`
      ]
    });
    
  } catch (error) {
    console.error('Error initializing content:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize content',
      details: error.message,
      stack: error.stack
    });
  }
}
