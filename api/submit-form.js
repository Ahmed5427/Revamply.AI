// api/submit-form.js - Simplified approach without storage
import { v4 as uuidv4 } from 'uuid';

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
        const { 
            businessDescription, 
            department,
            currentProcess,
            painPoints,
            businessImpact,
            processFrequency,
            fullName, 
            email, 
            countryCode,
            phoneNumber,
            timestamp, 
            source 
        } = req.body;
        
        // Validate required fields
        if (!businessDescription || !department || !currentProcess || !businessImpact || 
            !processFrequency || !fullName || !email) {
            return res.status(400).json({ 
                message: 'Required fields are missing. Please fill out all required information.' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address.' 
            });
        }
        
        // Validate full name (should have at least first and last name)
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length < 2 || nameParts.some(part => part.length === 0)) {
            return res.status(400).json({ 
                message: 'Please provide your full name (first and last name).' 
            });
        }
        
        // Generate unique submission ID
        const submissionId = uuidv4();
        
        // Prepare enhanced submission data
        const submissionData = {
            submissionId,
            
            // Business Information
            businessDescription,
            department,
            currentProcess,
            painPoints: painPoints || null,
            businessImpact,
            processFrequency,
            
            // Contact Information
            fullName,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            email,
            phone: phoneNumber ? `${countryCode} ${phoneNumber}` : null,
            countryCode: countryCode || null,
            phoneNumber: phoneNumber || null,
            
            // Metadata
            timestamp: timestamp || new Date().toISOString(),
            source: source || 'revamply-simplified-landing-page',
            status: 'processing',
            createdAt: new Date().toISOString(),
            
            // Additional derived information
            hasPhoneNumber: !!(phoneNumber && phoneNumber.trim()),
            hasPainPoints: !!(painPoints && painPoints.trim()),
            departmentCategory: getDepartmentCategory(department),
            businessImpactCategory: getBusinessImpactCategory(businessImpact),
            processFrequencyCategory: getProcessFrequencyCategory(processFrequency)
        };
        
        // Prepare enhanced data for n8n webhook
        const n8nPayload = {
            ...submissionData,
            webhookType: 'simplified_form_submission',
            
            // Add callback URL for n8n to send blueprint back
            callbackUrl: `${getBaseUrl(req)}/api/receive-blueprint`,
            
            // Add formatted data for easier processing in n8n
            formatted: {
                contactName: fullName,
                contactEmail: email,
                contactPhone: submissionData.phone,
                businessOverview: businessDescription,
                targetDepartment: department,
                currentWorkflow: currentProcess,
                challenges: painPoints || 'Not specified',
                primaryGoal: businessImpact,
                processOccurrence: processFrequency,
                submissionSummary: generateSubmissionSummary(submissionData)
            }
        };
        
        // Get n8n webhook URL from environment variables
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        
        if (!n8nWebhookUrl) {
            console.error('N8N_WEBHOOK_URL environment variable is not set');
            return res.status(500).json({
                success: false,
                message: 'Webhook configuration missing. Please contact support.'
            });
        }
        
        // Send enhanced data to n8n webhook
        try {
            const n8nResponse = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(n8nPayload)
            });

            if (!n8nResponse.ok) {
                console.error('Failed to send data to n8n:', n8nResponse.statusText);
                throw new Error('Failed to initiate blueprint generation');
            }

            console.log('Successfully sent form data to n8n for processing');

            // Check the content type of N8N's response
            const contentType = n8nResponse.headers.get('content-type');

            // If N8N returns HTML (duplicate case), forward it to the browser
            if (contentType && contentType.includes('text/html')) {
                console.log('N8N returned HTML (likely duplicate case), forwarding to browser');
                const htmlResponse = await n8nResponse.text();
                return res.status(200).setHeader('Content-Type', 'text/html').send(htmlResponse);
            }

            // If N8N returns JSON, check if it indicates success
            if (contentType && contentType.includes('application/json')) {
                const jsonResponse = await n8nResponse.json();
                console.log('N8N returned JSON:', jsonResponse);

                // If N8N provides its own response structure, use it
                if (jsonResponse.success !== undefined) {
                    return res.status(200).json(jsonResponse);
                }
            }

        } catch (error) {
            console.error('Error sending to n8n:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to initiate blueprint generation. Please try again.'
            });
        }

        // Default response for normal (non-duplicate) submissions
        console.log(`Form submission processed successfully. ID: ${submissionId}, Department: ${department}, Impact: ${businessImpact}`);

        return res.status(200).json({
            success: true,
            submissionId,
            message: 'Thank you! We\'re generating your comprehensive AI blueprint based on your detailed requirements...',
            estimatedTime: getEstimatedProcessingTime(businessImpact, processFrequency)
        });
        
    } catch (error) {
        console.error('Error processing form submission:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error. Please try again or contact support if the issue persists.' 
        });
    }
}

// Helper function to get base URL
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}`;
}

// Helper functions
function getDepartmentCategory(department) {
    const categories = {
        'sales': 'Revenue Generation',
        'customer-service': 'Customer Experience',
        'operations': 'Operational Efficiency',
        'hr': 'Human Resources',
        'finance': 'Financial Management',
        'it': 'Technology & Infrastructure',
        'manufacturing': 'Production & Manufacturing',
        'project-management': 'Project & Process Management',
        'quality-assurance': 'Quality & Compliance',
        'legal': 'Legal & Compliance',
        'research-development': 'Innovation & Development',
        'multiple': 'Cross-Departmental',
        'other': 'Specialized'
    };
    return categories[department] || 'Other';
}

function getBusinessImpactCategory(impact) {
    const categories = {
        'cost-reduction': 'Cost Optimization',
        'time-saving': 'Efficiency Enhancement',
        'revenue-growth': 'Revenue Generation',
        'quality-improvement': 'Quality Enhancement',
        'customer-experience': 'Customer Experience',
        'scalability': 'Business Scaling',
        'competitive-advantage': 'Market Advantage',
        'compliance': 'Risk Management',
        'multiple': 'Multi-Objective'
    };
    return categories[impact] || 'Other';
}

function getProcessFrequencyCategory(frequency) {
    const categories = {
        'multiple-daily': 'High Frequency',
        'daily': 'Daily Operations',
        'weekly': 'Regular Operations',
        'monthly': 'Periodic Operations',
        'quarterly': 'Strategic Operations',
        'annually': 'Annual Operations',
        'on-demand': 'On-Demand',
        'project-based': 'Project-Based'
    };
    return categories[frequency] || 'Other';
}

function generateSubmissionSummary(data) {
    return `${data.fullName} from ${data.departmentCategory} department is looking to implement AI solutions for ${data.businessImpactCategory.toLowerCase()}. The target process occurs ${data.processFrequencyCategory.toLowerCase()} and currently involves: ${data.currentProcess.substring(0, 100)}${data.currentProcess.length > 100 ? '...' : ''}.`;
}

function getEstimatedProcessingTime(businessImpact, processFrequency) {
    const complexImpacts = ['multiple', 'competitive-advantage', 'scalability'];
    const highFrequency = ['multiple-daily', 'daily'];
    
    if (complexImpacts.includes(businessImpact) || highFrequency.includes(processFrequency)) {
        return '3-5 minutes';
    }
    return '2-3 minutes';
}
