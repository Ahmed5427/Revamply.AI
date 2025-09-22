// api/get-blueprint.js - Updated with KV Storage
import SubmissionStorageKV from './storage-kv.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        const { submissionId } = req.query;
        
        if (!submissionId) {
            return res.status(400).json({ 
                message: 'Submission ID is required' 
            });
        }
        
        // Check if submission exists in KV storage
        const submission = await SubmissionStorageKV.get(submissionId);
        
        if (!submission) {
            console.error(`Submission not found in KV storage: ${submissionId}`);
            return res.status(404).json({ 
                message: 'Submission not found' 
            });
        }
        
        // Check if blueprint is ready
        if (submission.status === 'completed' && submission.blueprint) {
            return res.status(200).json({
                success: true,
                status: 'completed',
                blueprint: submission.blueprint,
                submissionId
            });
        } else if (submission.status === 'error') {
            return res.status(500).json({
                success: false,
                status: 'error',
                message: submission.error || 'Blueprint generation failed'
            });
        } else {
            // Still processing
            return res.status(202).json({
                success: false,
                status: 'processing',
                message: 'Blueprint is still being generated'
            });
        }
        
    } catch (error) {
        console.error('Error retrieving blueprint:', error);
        return res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
}
