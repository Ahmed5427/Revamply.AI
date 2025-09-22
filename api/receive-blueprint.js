// api/receive-blueprint.js - Simplified approach without storage dependency
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
        const { submissionId, blueprint, status, error, contactInfo } = req.body;
        
        console.log('Received blueprint callback:', { submissionId, status, hasBlueprint: !!blueprint });
        
        if (!submissionId) {
            return res.status(400).json({ 
                message: 'Submission ID is required' 
            });
        }
        
        // For the simplified approach, we'll just acknowledge receipt
        // The frontend will need to handle the blueprint display differently
        if (status === 'completed' && blueprint) {
            console.log(`Blueprint generated successfully for submission: ${submissionId}`);
            
            // You could implement alternative storage here like:
            // - Direct database insert
            // - Email/webhook to notify completion
            // - File storage
            // - Or use the blueprint data directly in the response
            
            return res.status(200).json({
                success: true,
                message: 'Blueprint received and processed successfully',
                blueprint: blueprint,
                submissionId: submissionId
            });
            
        } else if (status === 'error') {
            console.error(`Blueprint generation failed for submission: ${submissionId}`, error);
            
            return res.status(200).json({
                success: false,
                message: 'Blueprint generation failed',
                error: error || 'Unknown error occurred',
                submissionId: submissionId
            });
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
