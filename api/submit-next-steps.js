// api/submit-next-steps.js
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
        const { businessName, phone, submissionId, timestamp } = req.body;
        
        // Validate required fields
        if (!businessName || !phone) {
            return res.status(400).json({ 
                message: 'Business name and phone number are required' 
            });
        }
        
        // Get original submission data if submissionId is provided
        let originalSubmission = null;
        if (submissionId) {
            originalSubmission = SubmissionStorage.get(submissionId);
        }
        
        // Prepare data for n8n webhook
        const nextStepsData = {
            businessName,
            phone,
            submissionId: submissionId || null,
            timestamp: timestamp || new Date().toISOString(),
            webhookType: 'next_steps_submission',
            originalSubmission: originalSubmission ? {
                businessDescription: originalSubmission.businessDescription,
                name: originalSubmission.name,
                email: originalSubmission.email,
                blueprint: originalSubmission.blueprint
            } : null
        };
        
        // Get n8n webhook URL from environment variables
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        
        if (n8nWebhookUrl) {
            try {
                // Send data to n8n webhook
                const n8nResponse = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(nextStepsData)
                });
                
                if (!n8nResponse.ok) {
                    console.error('Failed to send next steps data to n8n:', n8nResponse.statusText);
                }
            } catch (error) {
                console.error('Error sending to n8n:', error.message);
            }
        }
        
        // Update original submission if it exists
        if (originalSubmission) {
            SubmissionStorage.update(submissionId, {
                nextSteps: {
                    businessName,
                    phone,
                    submittedAt: new Date().toISOString()
                }
            });
        }
        
        console.log(`Next steps submission processed successfully for: ${businessName}`);
        
        return res.status(200).json({
            success: true,
            message: 'Next steps submission successful. We will contact you soon!'
        });
        
    } catch (error) {
        console.error('Error processing next steps submission:', error);
        return res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
}
