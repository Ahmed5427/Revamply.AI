// api/admin/initialize-content.js
// API endpoint to initialize editable content (data sent from browser)

import { getTokenFromRequest, verifyToken } from './auth-utils.js';
import { saveContent, getContent } from './content-storage.js';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        // ✅ Use auth utility to get token from correct cookie name
        const token = getTokenFromRequest(req);
        
        if (!token) {
            console.error('❌ No token found in request');
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        // ✅ Use auth utility to verify token
        const decoded = verifyToken(token);
        
        if (!decoded) {
            console.error('❌ Token verification failed');
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        console.log('✅ Authentication successful for user:', decoded.username);
        
        // Get the scanned elements from the request body
        const { elements } = req.body;
        
        if (!elements || !Array.isArray(elements)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid request: elements array required' 
            });
        }
        
        console.log(`📦 Received ${elements.length} elements to initialize`);
        
        let initialized = 0;
        let skipped = 0;
        let updated = 0;
        const results = [];
        
        for (const element of elements) {
            const { elementId, text, type, styles } = element;
            
            if (!elementId) {
                console.log(`⚠️  Skipping element without elementId`);
                skipped++;
                continue;
            }
            
            // ✅ Use content-storage.js to check if element exists
            const existing = await getContent(elementId);
            
            if (existing) {
                // Update the element if text is different
                if (existing.text !== text) {
                    // ✅ Use content-storage.js to save
                    const success = await saveContent(elementId, {
                        text,
                        type: type || existing.type,
                        styles: styles || existing.styles,
                    });
                    
                    if (success) {
                        console.log(`🔄 Updated ${elementId}`);
                        updated++;
                        results.push({ elementId, action: 'updated', type });
                    } else {
                        console.log(`❌ Failed to update ${elementId}`);
                        skipped++;
                        results.push({ elementId, action: 'failed', type });
                    }
                } else {
                    console.log(`⏭️  Skipped ${elementId} (unchanged)`);
                    skipped++;
                    results.push({ elementId, action: 'skipped', type });
                }
                continue;
            }
            
            // Create content object and save using content-storage.js
            // ✅ Use content-storage.js to save new content
            const success = await saveContent(elementId, {
                text,
                type: type || 'text',
                styles: styles || { color: '#000000', fontSize: '16px' },
                createdAt: new Date().toISOString(),
            });
            
            if (success) {
                console.log(`✅ Initialized ${elementId} (${type})`);
                initialized++;
                results.push({ elementId, action: 'initialized', type });
            } else {
                console.log(`❌ Failed to initialize ${elementId}`);
                skipped++;
                results.push({ elementId, action: 'failed', type });
            }
        }
        
        console.log(`✨ Initialization complete!`);
        console.log(`   ✅ Initialized: ${initialized} elements`);
        console.log(`   🔄 Updated: ${updated} elements`);
        console.log(`   ⏭️  Skipped: ${skipped} elements`);
        console.log(`   📊 Total: ${elements.length} elements`);
        
        return res.status(200).json({
            success: true,
            message: 'Content initialized successfully',
            stats: {
                total: elements.length,
                initialized,
                updated,
                skipped,
            },
            results,
        });
        
    } catch (error) {
        console.error('❌ Error initializing content:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to initialize content',
            error: error.message,
        });
    }
}
