// api/admin/initialize-content.js
// API endpoint to scan index.html and initialize all editable content in the database

import { kv } from '@vercel/kv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    
    try {
        // Verify authentication
        const token = req.cookies.adminToken;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        console.log('📖 Reading index.html...');
        
        // Read the HTML file
        const htmlPath = join(process.cwd(), 'index.html');
        const html = readFileSync(htmlPath, 'utf-8');
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Find all elements with data-editable="true"
        const editableElements = document.querySelectorAll('[data-editable="true"]');
        
        console.log(`Found ${editableElements.length} editable elements`);
        
        let initialized = 0;
        let skipped = 0;
        let updated = 0;
        const results = [];
        
        for (const element of editableElements) {
            const elementId = element.getAttribute('data-element-id');
            
            if (!elementId) {
                console.log(`⚠️  Skipping element without data-element-id`);
                skipped++;
                continue;
            }
            
            // Get element properties
            const text = element.textContent.trim();
            const tagName = element.tagName.toLowerCase();
            
            // Determine element type
            let type = 'text';
            if (tagName.match(/^h[1-6]$/)) {
                type = 'heading';
            } else if (tagName === 'p') {
                type = 'paragraph';
            } else if (tagName === 'span') {
                type = 'span';
            } else if (tagName === 'div' && elementId.includes('stat')) {
                type = 'stat';
            }
            
            // Check if this element already exists in the database
            const existing = await kv.get(`content:${elementId}`);
            
            if (existing) {
                // Update the element if text is different
                if (existing.text !== text) {
                    const updatedData = {
                        ...existing,
                        text,
                        updatedAt: new Date().toISOString(),
                    };
                    await kv.set(`content:${elementId}`, updatedData);
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
            
            // Get basic styles
            const styles = {
                color: '#000000',
                fontSize: '16px',
            };
            
            // Create content object
            const contentData = {
                elementId,
                text,
                type,
                styles,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
            
            // Save to database
            await kv.set(`content:${elementId}`, contentData);
            
            // Add to content index
            let contentIndex = await kv.get('content:index') || [];
            if (!contentIndex.includes(elementId)) {
                contentIndex.push(elementId);
                await kv.set('content:index', contentIndex);
            }
            
            console.log(`✅ Initialized ${elementId} (${type})`);
            initialized++;
            results.push({ elementId, action: 'initialized', type });
        }
        
        console.log(`✨ Initialization complete!`);
        console.log(`   ✅ Initialized: ${initialized} elements`);
        console.log(`   🔄 Updated: ${updated} elements`);
        console.log(`   ⏭️  Skipped: ${skipped} elements`);
        console.log(`   📊 Total: ${editableElements.length} elements`);
        
        return res.status(200).json({
            success: true,
            message: 'Content initialized successfully',
            stats: {
                total: editableElements.length,
                initialized,
                updated,
                skipped,
            },
            results,
        });
        
    } catch (error) {
        console.error('Error initializing content:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to initialize content',
            error: error.message,
        });
    }
}
