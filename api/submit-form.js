// api/submit-form.js
import { v4 as uuidv4 } from 'uuid';
const SubmissionStorage = require('./storage.js');

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
        const { businessDescription, name, email, timestamp, source } = req.body;
        
        // Validate required fields
        if (!businessDescription || !email) {
            return res.status(400).json({ 
                message: 'Business description and email are required' 
            });
        }
        
        // Generate unique submission ID
        const submissionId = uuidv4();
        
        // Store submission data
        const submissionData = {
            submissionId,
            businessDescription,
            name: name || 'Anonymous',
            email,
            timestamp: timestamp || new Date().toISOString(),
            source: source || 'website',
            status: 'processing',
            createdAt: new Date().toISOString()
        };
        
        SubmissionStorage.set(submissionId, submissionData);
        
        // Prepare data for n8n webhook
        const n8nPayload = {
            ...submissionData,
            webhookType: 'form_submission'
        };
        
        // Get n8n webhook URL from environment variables
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        
        if (!n8nWebhookUrl) {
            console.error('N8N_WEBHOOK_URL environment variable is not set');
            return res.status(500).json({ 
                message: 'Server configuration error' 
            });
        }
        
        // Send data to n8n webhook
        const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(n8nPayload)
        });
        
        if (!n8nResponse.ok) {
            console.error('Failed to send data to n8n:', n8nResponse.statusText);
            return res.status(500).json({ 
                message: 'Failed to process submission' 
            });
        }
        
        console.log(`Form submission processed successfully. ID: ${submissionId}`);
        
        return res.status(200).json({
            success: true,
            submissionId,
            message: 'Form submitted successfully. Generating your AI blueprint...'
        });
        
    } catch (error) {
        console.error('Error processing form submission:', error);
        return res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
}

// Export submissions for use in other endpoints
export { submissions };
