// api/receive-blueprint.js - ASYNC version for Vercel KV
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
        
        // CRITICAL: Store the blueprint data first!
        if (blueprint && (status === 'completed' || status === undefined)) {
            console.log(`💾 STORING blueprint for submission: ${submissionId}`);
            
            // Store the blueprint so it can be retrieved later (ASYNC!)
            const stored = await BlueprintStorage.store(submissionId, {
                submissionId,
                contactName: contactName || 'Valued Customer',
                contactEmail: contactEmail || '',
                blueprintContent: blueprint,
                status: 'completed',
                generatedAt: new Date().toISOString()
            });
            
            if (stored) {
                console.log(`✅ Blueprint stored successfully in KV for: ${submissionId}`);
            } else {
                console.error(`❌ Failed to store blueprint for: ${submissionId}`);
            }
            
            // Now generate and return the HTML
            const blueprintHTML = generateBlueprintHTML(blueprint, contactName || 'Valued Customer', submissionId);
            return res.status(200).setHeader('Content-Type', 'text/html').send(blueprintHTML);
            
        } else if (status === 'error') {
            console.error(`❌ Blueprint generation failed for submission: ${submissionId}`, error);
            
            // Store error status (ASYNC!)
            await BlueprintStorage.store(submissionId, {
                submissionId,
                contactName: contactName || 'Valued Customer',
                contactEmail: contactEmail || '',
                status: 'error',
                error: error || 'Blueprint generation failed',
                errorAt: new Date().toISOString()
            });
            
            const errorHTML = generateErrorHTML(error || 'Blueprint generation failed', contactName || 'Valued Customer');
            return res.status(200).setHeader('Content-Type', 'text/html').send(errorHTML);
        }
        
        // Default JSON response for other cases
        return res.status(200).json({
            success: true,
            message: 'Blueprint callback received',
            submissionId
        });
        
    } catch (error) {
        console.error('💥 Error processing blueprint callback:', error);
        return res.status(500).setHeader('Content-Type', 'text/html').send(
            generateErrorHTML('Internal server error', 'Valued Customer')
        );
    }
}

function generateBlueprintHTML(blueprint, contactName, submissionId) {
    const formattedContent = formatBlueprintContent(blueprint);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your AI Blueprint is Ready - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; }
        .gradient-text { 
            background: linear-gradient(45deg, #00E5FF, #FF00CC); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
        }
        .celebration { animation: celebration 0.8s ease-out; }
        @keyframes celebration {
            0% { transform: scale(0.8) translateY(20px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .blueprint-content {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .blueprint-content h1 { font-size: 1.8rem; color: #1f2937; margin: 1.5rem 0 1rem 0; }
        .blueprint-content h2 { font-size: 1.5rem; color: #2563eb; }
        .blueprint-content h3 { font-size: 1.2rem; color: #059669; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen py-12">
        <div class="container mx-auto px-6 max-w-7xl">
            <div class="text-center mb-12 celebration">
                <div class="inline-flex items-center bg-gradient-to-r from-green-400 to-blue-500 px-8 py-3 rounded-full text-white font-bold mb-8">
                    <i class="fa-solid fa-check-circle mr-3"></i>
                    Blueprint Generated!
                </div>
                <h1 class="text-5xl font-black mb-6 gradient-text">Your AI Solution Blueprint</h1>
                <p class="text-2xl text-gray-700 mb-4">Hi <span class="font-bold text-blue-600">${contactName}</span>!</p>
            </div>
            
            <div class="blueprint-content celebration">
                ${formattedContent}
            </div>
            
            <div class="text-center mt-12">
                <p class="text-gray-500">© 2025 Revamply. Blueprint ID: ${submissionId}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function formatBlueprintContent(content) {
    if (!content) return '<p>Blueprint content not available.</p>';
    
    let formatted = content
        .replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>')
        .replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    if (!formatted.startsWith('<')) formatted = '<p>' + formatted + '</p>';
    formatted = formatted.replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>');
    
    return formatted;
}

function generateErrorHTML(error, contactName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blueprint Issue - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-lg text-center p-8">
        <h1 class="text-3xl font-bold mb-4">Almost There!</h1>
        <p class="text-gray-700 mb-6">Hi ${contactName}, we'll email your blueprint shortly.</p>
        <p class="text-sm text-gray-500">${error}</p>
        <a href="/" class="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg">Try Again</a>
    </div>
</body>
</html>`;
}
