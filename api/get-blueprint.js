// api/get-blueprint.js - Status checking endpoint for polling
import BlueprintStorage from './blueprint-storage.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false,
            message: 'Method not allowed' 
        });
    }
    
    try {
        const { submissionId } = req.query;
        
        if (!submissionId) {
            return res.status(400).json({ 
                success: false,
                message: 'Submission ID is required' 
            });
        }
        
        console.log(`🔍 Checking blueprint status for: ${submissionId}`);
        
        // Check if blueprint exists in storage
        const storedBlueprint = await BlueprintStorage.retrieve(submissionId);
        
        if (!storedBlueprint) {
            console.log(`⏳ Blueprint not ready yet for: ${submissionId}`);
            return res.status(200).json({
                success: false,
                status: 'processing',
                message: 'Blueprint is still being generated',
                submissionId
            });
        }
        
        // Check if it's an error case
        if (storedBlueprint.status === 'error') {
            console.log(`❌ Blueprint generation failed for: ${submissionId}`);
            return res.status(200).json({
                success: false,
                status: 'error',
                message: storedBlueprint.error || 'Blueprint generation failed',
                submissionId
            });
        }
        
        // Blueprint is ready!
        console.log(`✅ Blueprint is ready for: ${submissionId}`);
        return res.status(200).json({
            success: true,
            status: 'completed',
            message: 'Blueprint is ready',
            submissionId,
            contactName: storedBlueprint.contactName
        });
        
    } catch (error) {
        console.error('💥 Error checking blueprint status:', error);
        return res.status(500).json({ 
            success: false,
            status: 'error',
            message: 'Internal server error' 
        });
    }
}
