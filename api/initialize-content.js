/**
 * Initialize Sample Content
 * This script adds sample editable content to your Redis database
 * Run this once to populate the admin panel with test content
 */

// Sample content structure matching your website sections
const sampleContent = [
  // Hero Section
  {
    elementId: 'hero-title-main',
    text: 'AI Solutions That Save Time',
    type: 'heading',
    className: 'heading-hero-main',
    styles: {
      color: '#ffffff',
      fontSize: '48px'
    }
  },
  {
    elementId: 'hero-description',
    text: 'Revamply develops tailored AI solutions using advanced machine learning, natural language processing, and automation.',
    type: 'paragraph',
    className: 'paragraph-hero-description',
    styles: {
      color: '#d1d5db',
      fontSize: '18px'
    }
  },
  {
    elementId: 'hero-cta-button',
    text: 'Get Your Free Blueprint',
    type: 'button',
    className: 'button-hero-cta',
    styles: {
      backgroundColor: '#667eea',
      color: '#ffffff'
    }
  },
  
  // Why Trust Section
  {
    elementId: 'why-trust-title',
    text: 'Why Businesses Trust Revamply for AI Transformation',
    type: 'heading',
    className: 'heading-why-trust-title',
    styles: {
      color: '#ffffff',
      fontSize: '36px'
    }
  },
  {
    elementId: 'efficiency-title',
    text: 'Intelligent Efficiency',
    type: 'heading',
    className: 'heading-efficiency-title',
    styles: {
      color: '#ffffff',
      fontSize: '24px'
    }
  },
  {
    elementId: 'efficiency-description',
    text: 'Automate repetitive tasks with AI so your team can focus on high-value growth activities.',
    type: 'paragraph',
    className: 'paragraph-efficiency-description',
    styles: {
      color: '#9ca3af'
    }
  },
  
  // Features Section
  {
    elementId: 'features-title',
    text: 'Transform Your Business with AI',
    type: 'heading',
    className: 'heading-features-title',
    styles: {
      color: '#ffffff',
      fontSize: '36px'
    }
  },
  {
    elementId: 'features-description',
    text: 'Our AI understands context and intent, delivering intelligent solutions that adapt to your business needs.',
    type: 'paragraph',
    className: 'paragraph-features-description',
    styles: {
      color: '#d1d5db'
    }
  },
  
  // CTA Section
  {
    elementId: 'cta-title',
    text: 'Ready to Transform Your Business?',
    type: 'heading',
    className: 'heading-cta-title',
    styles: {
      color: '#ffffff',
      fontSize: '32px'
    }
  },
  {
    elementId: 'cta-description',
    text: 'Get your personalized AI blueprint in minutes',
    type: 'paragraph',
    className: 'paragraph-cta-description',
    styles: {
      color: '#d1d5db'
    }
  }
];

export default async function initializeSampleContent(req, res) {
  try {
    // Import the content storage module
    const { saveContent } = await import('./admin/content-storage.js');
    
    let successCount = 0;
    let failedCount = 0;
    
    // Save each content item
    for (const item of sampleContent) {
      const success = await saveContent(item.elementId, {
        text: item.text,
        type: item.type,
        className: item.className,
        styles: item.styles,
        createdAt: new Date().toISOString()
      });
      
      if (success) {
        successCount++;
        console.log(`✅ Initialized: ${item.elementId}`);
      } else {
        failedCount++;
        console.log(`❌ Failed: ${item.elementId}`);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Sample content initialized',
      initialized: successCount,
      failed: failedCount,
      total: sampleContent.length
    });
    
  } catch (error) {
    console.error('Error initializing content:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize content',
      details: error.message
    });
  }
}
