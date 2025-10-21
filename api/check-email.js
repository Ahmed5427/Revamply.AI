// api/check-email.js - Check if email has existing blueprint
import BlueprintStorage from './blueprint-storage.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed. Use GET or POST.'
        });
    }

    try {
        // Support both GET and POST
        let email;

        if (req.method === 'GET') {
            email = req.query.email;
        } else {
            email = req.body.email;
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required',
                exists: false
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                exists: false
            });
        }

        console.log(`🔍 Checking if email has existing blueprint: ${email}`);

        // Check if email has an existing blueprint
        const existingBlueprint = await BlueprintStorage.retrieveByEmail(email);

        if (existingBlueprint) {
            console.log(`✅ Found existing blueprint for email: ${email}`);
            return res.status(200).json({
                success: true,
                exists: true,
                message: 'Email has existing blueprint',
                submissionId: existingBlueprint.submissionId,
                contactName: existingBlueprint.contactName,
                generatedAt: existingBlueprint.generatedAt,
                status: existingBlueprint.status,
                blueprintUrl: `${getBaseUrl(req)}/api/get-blueprint-page?submissionId=${existingBlueprint.submissionId}`
            });
        } else {
            console.log(`❌ No existing blueprint found for email: ${email}`);
            return res.status(200).json({
                success: true,
                exists: false,
                message: 'No existing blueprint found for this email',
                email
            });
        }

    } catch (error) {
        console.error('💥 Error checking email:', error);
        return res.status(500).json({
            success: false,
            exists: false,
            message: 'Internal server error'
        });
    }
}

// Helper function to get base URL
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}`;
}
