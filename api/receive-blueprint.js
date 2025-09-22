// api/receive-blueprint.js
import SubmissionStorage from './storage.js';

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
        await SubmissionStorage.init(); // Initialize storage

        const { submissionId, blueprint, status, error } = req.body;
        
        if (!submissionId) {
            return res.status(400).json({ 
                message: 'Submission ID is required' 
            });
        }
        
        // Check if submission exists
        const submission = await SubmissionStorage.get(submissionId);
        
        if (!submission) {
            return res.status(404).json({ 
                message: 'Submission not found' 
            });
        }
        
        // Update submission with blueprint data
        if (status === 'completed' && blueprint) {
            // Try to parse blueprint if it's a JSON string
            let parsedBlueprint = blueprint;
            if (typeof blueprint === 'string') {
                try {
                    parsedBlueprint = JSON.parse(blueprint);
                } catch (e) {
                    // If parsing fails, use the string as is
                    parsedBlueprint = {
                        businessType: "Custom Business",
                        solutions: [{
                            title: "AI Solution Recommendation",
                            description: blueprint,
                            features: ["Custom AI implementation", "Process automation", "Data insights"]
                        }]
                    };
                }
            }
            
            await SubmissionStorage.update(submissionId, {
                status: 'completed',
                blueprint: parsedBlueprint,
                completedAt: new Date().toISOString()
            });
            
            console.log(`Blueprint generated successfully for submission: ${submissionId}`);
            
        } else if (status === 'error') {
            await SubmissionStorage.update(submissionId, {
                status: 'error',
                error: error || 'Blueprint generation failed',
                errorAt: new Date().toISOString()
            });
            
            console.error(`Blueprint generation failed for submission: ${submissionId}`, error);
        }
        
        return res.status(200).json({
            success: true,
            message: 'Blueprint status updated successfully'
        });
        
    } catch (error) {
        console.error('Error receiving blueprint:', error);
        return res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
}
