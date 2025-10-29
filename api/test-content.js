/**
 * Quick Test - Add Single Content Item
 * 
 * Use this to quickly test if your Redis connection and content storage is working
 * 
 * Access: https://revamply.ai/api/test-content
 * 
 * This will add ONE test content item to your database
 */

export default async function handler(req, res) {
  try {
    // Import the content storage module
    const { saveContent, getContent } = await import('./admin/content-storage.js');
    
    // Single test content item
    const testContent = {
      elementId: 'test-hero-title',
      text: 'Test: This is a sample editable heading',
      type: 'heading',
      className: 'heading-hero-test',
      styles: {
        color: '#ffffff',
        fontSize: '36px'
      }
    };
    
    // Save the test content
    const saved = await saveContent(testContent.elementId, {
      text: testContent.text,
      type: testContent.type,
      className: testContent.className,
      styles: testContent.styles,
      createdAt: new Date().toISOString()
    });
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save test content'
      });
    }
    
    // Verify it was saved by reading it back
    const retrieved = await getContent(testContent.elementId);
    
    return res.status(200).json({
      success: true,
      message: 'Test content added successfully!',
      test: {
        saved: saved,
        retrieved: !!retrieved,
        content: retrieved
      },
      nextSteps: [
        '1. Go to https://revamply.ai/admin-panel.html',
        '2. Login with your credentials',
        '3. Click the Refresh button',
        '4. You should see "test-hero-title" in the content list'
      ]
    });
    
  } catch (error) {
    console.error('Error in test-content:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message,
      stack: error.stack
    });
  }
}
