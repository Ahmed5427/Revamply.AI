// api/receive-blueprint.js - Updated to store actual blueprint content
import BlueprintStorage from './blueprint-storage.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        console.log('🔍 Received blueprint callback:', JSON.stringify(req.body, null, 2));
        
        const { submissionId, blueprint, status, error, contactName, contactEmail } = req.body;
        
        if (!submissionId) {
            console.error('❌ Missing submissionId in request');
            return res.status(400).json({ 
                message: 'Submission ID is required' 
            });
        }
        
        // Handle blueprint completion
        if (blueprint && (status === 'completed' || status === undefined)) {
            console.log(`✅ Processing blueprint for submission: ${submissionId}`);
            
            // Parse the blueprint content from OpenAI
            let blueprintContent = blueprint;
            if (typeof blueprint === 'string') {
                // The blueprint is the raw text from OpenAI
                blueprintContent = blueprint;
            }
            
            // Store the complete blueprint data
            const blueprintData = {
                submissionId,
                blueprintContent,
                contactName: contactName || 'Valued Customer',
                contactEmail: contactEmail || '',
                status: 'completed',
                generatedAt: new Date().toISOString(),
                type: 'ai_generated'
            };
            
            // Store using our simple storage system
            const stored = BlueprintStorage.store(submissionId, blueprintData);
            
            if (stored) {
                console.log(`💾 Successfully stored blueprint for: ${blueprintData.contactName}`);
                
                // Return success response to n8n
                return res.status(200).json({
                    success: true,
                    message: 'Blueprint stored successfully',
                    submissionId,
                    blueprintUrl: `/api/get-blueprint-page?submissionId=${submissionId}`
                });
            } else {
                throw new Error('Failed to store blueprint');
            }
            
        } else if (status === 'error') {
            console.error(`❌ Blueprint generation failed for submission: ${submissionId}`, error);
            
            // Store error info
            const errorData = {
                submissionId,
                error: error || 'Blueprint generation failed',
                contactName: contactName || 'Valued Customer',
                contactEmail: contactEmail || '',
                status: 'error',
                errorAt: new Date().toISOString(),
                type: 'error'
            };
            
            BlueprintStorage.store(submissionId, errorData);
            
            return res.status(200).json({
                success: false,
                message: 'Blueprint generation failed',
                submissionId,
                error: error || 'Unknown error occurred'
            });
        }
        
        // If we get here, something unexpected happened
        console.log(`⚠️ Received incomplete data - Status: ${status}, Has Blueprint: ${!!blueprint}`);
        
        return res.status(400).json({
            success: false,
            message: 'Incomplete blueprint data received',
            submissionId
        });
        
    } catch (error) {
        console.error('💥 Error processing blueprint callback:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}
