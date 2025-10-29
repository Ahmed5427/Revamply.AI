// api/admin/initialize-content.js
// API endpoint to initialize editable content (data sent from browser)
// UPDATED: Uses ioredis with KV_REDIS_URL to match project setup

import Redis from 'ioredis';
import { getTokenFromRequest, verifyToken } from './auth-utils.js';

// Create Redis client using KV_REDIS_URL (same as blueprint-storage.js)
const redis = new Redis(process.env.KV_REDIS_URL);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        // ✅ Authentication using correct cookie name
        const token = getTokenFromRequest(req);
        
        if (!token) {
            console.error('❌ No token found in request');
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
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
            
            // Check if this element already exists in the database
            const existingData = await redis.get(`content:${elementId}`);
            const existing = existingData ? JSON.parse(existingData) : null;
            
            if (existing) {
                // Update the element if text is different
                if (existing.text !== text) {
                    const updatedData = {
                        ...existing,
                        text,
                        updatedAt: new Date().toISOString(),
                    };
                    await redis.set(`content:${elementId}`, JSON.stringify(updatedData));
                    console.log(`🔄 Updated ${elementId}`);
                    updated++;
                    results.push({ elementId, action: 'updated', type });
                } else {
                    console.log(`⏭️  Skipped ${elementId} (unchanged)`);
                    skipped++;
                    results.push({ elementId, action: 'skipped', type });
                }
                continue;
            }
            
            // Create content object
            const contentData = {
                elementId,
                text,
                type: type || 'text',
                styles: styles || { color: '#000000', fontSize: '16px' },
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
            
            // Save to database using ioredis
            await redis.set(`content:${elementId}`, JSON.stringify(contentData));
            
            // Add to content index
            const indexData = await redis.get('content:index');
            let contentIndex = indexData ? JSON.parse(indexData) : [];
            if (!contentIndex.includes(elementId)) {
                contentIndex.push(elementId);
                await redis.set('content:index', JSON.stringify(contentIndex));
            }
            
            console.log(`✅ Initialized ${elementId} (${type})`);
            initialized++;
            results.push({ elementId, action: 'initialized', type });
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
