// api/receive-blueprint.js - Returns HTML directly to n8n
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
        
        // Handle blueprint completion - Return HTML directly
        if (blueprint && (status === 'completed' || status === undefined)) {
            console.log(`✅ Processing blueprint for submission: ${submissionId}`);
            console.log(`📄 Generating HTML page for: ${contactName || 'Valued Customer'}`);
            
            // Generate and return the blueprint HTML page directly
            const blueprintHTML = generateBlueprintHTML(blueprint, contactName || 'Valued Customer', submissionId);
            
            return res.status(200).setHeader('Content-Type', 'text/html').send(blueprintHTML);
            
        } else if (status === 'error') {
            console.error(`❌ Blueprint generation failed for submission: ${submissionId}`, error);
            
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
    // Format the blueprint content for better display
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
        body { 
            font-family: 'Inter', sans-serif; 
            line-height: 1.6;
        }
        .gradient-text { 
            background: linear-gradient(45deg, #00E5FF, #FF00CC); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            background-clip: text;
        }
        .pulse-glow { 
            animation: pulseGlow 2s ease-in-out infinite; 
        }
        @keyframes pulseGlow { 
            0%, 100% { opacity: 1; transform: scale(1); } 
            50% { opacity: 0.8; transform: scale(1.05); } 
        }
        .celebration {
            animation: celebration 0.8s ease-out;
        }
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
            border: 1px solid #e5e7eb;
            max-width: none;
        }
        .blueprint-content h1, .blueprint-content h2, .blueprint-content h3 {
            color: #1f2937;
            margin: 1.5rem 0 1rem 0;
            font-weight: bold;
        }
        .blueprint-content h1 { font-size: 1.8rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        .blueprint-content h2 { font-size: 1.5rem; color: #2563eb; }
        .blueprint-content h3 { font-size: 1.2rem; color: #059669; }
        .blueprint-content ul, .blueprint-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
        }
        .blueprint-content li {
            margin: 0.5rem 0;
            line-height: 1.6;
        }
        .blueprint-content p {
            margin: 1rem 0;
            color: #374151;
            line-height: 1.7;
        }
        .section-divider {
            border-top: 2px solid #e5e7eb;
            margin: 2rem 0;
            position: relative;
        }
        .section-divider::after {
            content: "✦";
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 1rem;
            color: #6b7280;
        }
        .highlight-box {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0 0.5rem 0.5rem 0;
        }
        .phase-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 0.5rem 0;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen py-12">
        <div class="container mx-auto px-6">
            <div class="max-w-7xl mx-auto">
                <!-- Celebration Header -->
                <div class="text-center mb-12 celebration">
                    <div class="inline-flex items-center bg-gradient-to-r from-green-400 to-blue-500 px-8 py-3 rounded-full text-white font-bold text-lg mb-8 shadow-lg">
                        <i class="fa-solid fa-check-circle mr-3 text-2xl"></i>
                        Blueprint Generated Successfully!
                    </div>
                    <h1 class="text-5xl font-black mb-6 gradient-text">Your AI Solution Blueprint</h1>
                    <p class="text-2xl text-gray-700 mb-4">Hi <span class="font-bold text-blue-600">${contactName}</span>!</p>
                    <p class="text-lg text-gray-600">Here's your personalized AI transformation plan</p>
                </div>
                
                <!-- Blueprint Content -->
                <div class="blueprint-content celebration" style="animation-delay: 0.2s">
                    ${formattedContent}
                </div>
                
                <!-- Implementation Timeline -->
                <div class="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 mb-12 celebration" style="animation-delay: 0.4s">
                    <div class="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 class="text-3xl font-bold mb-8 text-gray-800">📋 Implementation Details</h3>
                            <div class="space-y-6">
                                <div class="flex items-center">
                                    <div class="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                        <i class="fa-solid fa-calendar text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-gray-800">Development Time</div>
                                        <div class="text-gray-600">6–9 Months</div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center">
                                    <div class="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                        <i class="fa-solid fa-headset text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-gray-800">Support & Training</div>
                                        <div class="text-gray-600">Fully Included</div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center">
                                    <div class="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                        <i class="fa-solid fa-chart-line text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-gray-800">Expected ROI</div>
                                        <div class="text-gray-600">20-25% cost reduction within 12 months</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Call to Action -->
                        <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                            <h4 class="text-3xl font-bold mb-6 text-gray-800">🚀 Ready to Transform Your Business?</h4>
                            <p class="text-gray-700 mb-8 text-lg">Let's discuss your blueprint in detail and create an implementation plan tailored to your timeline and budget.</p>
                            
                            <div class="space-y-4">
                                <a href="https://calendly.com/revamply/consultation" target="_blank" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-xl text-white font-bold text-center block transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                    <i class="fa-solid fa-calendar-check mr-3"></i>
                                    Schedule Free Consultation
                                </a>
                                <a href="tel:+1234567890" class="w-full border-2 border-blue-500 hover:bg-blue-50 px-8 py-4 rounded-xl text-blue-600 font-bold text-center block transition-colors">
                                    <i class="fa-solid fa-phone mr-3"></i>
                                    Call: +1 (234) 567-890
                                </a>
                                <a href="mailto:solutions@revamply.com" class="w-full border-2 border-purple-500 hover:bg-purple-50 px-8 py-4 rounded-xl text-purple-600 font-bold text-center block transition-colors">
                                    <i class="fa-solid fa-envelope mr-3"></i>
                                    Email: solutions@revamply.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="text-center celebration" style="animation-delay: 0.6s">
                    <div class="flex items-center justify-center space-x-3 mb-6">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span class="text-white font-bold text-xl">R</span>
                        </div>
                        <span class="text-3xl font-bold gradient-text">Revamply</span>
                    </div>
                    <p class="text-gray-500 text-lg">© 2025 Revamply. Transforming businesses with AI.</p>
                    <p class="text-sm text-gray-400 mt-2">Blueprint ID: ${submissionId} | Generated: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        console.log('🎉 Blueprint page loaded successfully for: ${contactName}');
        console.log('📋 Blueprint ID: ${submissionId}');
        
        document.addEventListener('DOMContentLoaded', function() {
            // Add subtle scroll animations
            const animatedElements = document.querySelectorAll('.celebration');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'celebration 0.8s ease-out';
                    }
                });
            });
            
            animatedElements.forEach(el => observer.observe(el));
        });
    </script>
</body>
</html>
    `;
}

function formatBlueprintContent(content) {
    if (!content) return '<p>Blueprint content not available.</p>';
    
    // Enhanced formatting for better display
    let formatted = content
        // Convert main headers (Blueprint titles)
        .replace(/^(AI Solution Blueprint[^\n]*)/gm, '<h1>$1</h1>')
        // Convert section headers
        .replace(/^([A-Z][^:\n]*:)\s*$/gm, '<h2>$1</h2>')
        .replace(/^(Phase \d+[^:\n]*):?/gm, '<h3 class="phase-header">$1</h3>')
        .replace(/^(\d+\.\s+[^:\n]+)/gm, '<h3>$1</h3>')
        // Convert objectives and key sections
        .replace(/^(Objective|Benefits|Tech Stack|AI Features):\s*(.+)$/gm, '<div class="highlight-box"><strong>$1:</strong> $2</div>')
        // Convert bullet points
        .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
        .replace(/^☑\s(.+)$/gm, '<li class="text-green-600"><i class="fa-solid fa-check mr-2"></i>$1</li>')
        // Convert checkmarks  
        .replace(/✓/g, '<i class="fa-solid fa-check text-green-500 mr-1"></i>')
        // Convert bold text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Convert phases into boxes
        .replace(/(Phase \d+[^:]*:[\s\S]*?)(?=Phase \d+|$)/g, '<div class="phase-box">$1</div>')
        // Convert line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not starting with HTML
    if (!formatted.startsWith('<')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    // Wrap consecutive <li> tags in <ul>
    formatted = formatted.replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>');
    
    return formatted;
}

function generateErrorHTML(error, contactName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blueprint Generation Issue - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-lg mx-auto text-center p-8">
        <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-exclamation-triangle text-yellow-500 text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Almost There!</h1>
        <p class="text-gray-700 mb-6">Hi ${contactName}, we encountered an issue generating your AI blueprint. Our team will email you the results shortly.</p>
        <p class="text-sm text-gray-500 mb-8">Technical details: ${error}</p>
        <div class="space-y-3">
            <a href="mailto:support@revamply.com" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg block font-semibold">
                Contact Support
            </a>
            <a href="/" class="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold">
                Try Again
            </a>
        </div>
    </div>
</body>
</html>
    `;
}
