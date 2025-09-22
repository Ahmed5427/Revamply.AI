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
        
        // For the simplified approach, we'll create a display page
        if (status === 'completed' && blueprint) {
            console.log(`Blueprint generated successfully for submission: ${submissionId}`);
            
            // Parse blueprint if it's a string
            let parsedBlueprint = blueprint;
            if (typeof blueprint === 'string') {
                try {
                    parsedBlueprint = JSON.parse(blueprint);
                } catch (e) {
                    // If parsing fails, create a structured response
                    parsedBlueprint = {
                        businessType: contactInfo?.departmentCategory || "Your Business",
                        solutions: [{
                            title: "AI Solution Recommendation",
                            description: blueprint,
                            features: ["Custom AI implementation", "Process automation", "Data insights", "ROI tracking"]
                        }]
                    };
                }
            }
            
            // Create an HTML response page that the user can view directly
            const blueprintHTML = generateBlueprintHTML(parsedBlueprint, contactInfo);
            
            return res.status(200).setHeader('Content-Type', 'text/html').send(blueprintHTML);
            
        } else if (status === 'error') {
            console.error(`Blueprint generation failed for submission: ${submissionId}`, error);
            
            const errorHTML = generateErrorHTML(error, contactInfo);
            return res.status(200).setHeader('Content-Type', 'text/html').send(errorHTML);
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

function generateBlueprintHTML(blueprint, contactInfo) {
    const solutions = blueprint.solutions || [];
    const businessType = blueprint.businessType || "Your Business";
    const contactName = contactInfo?.fullName || "Valued Customer";
    
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
        body { font-family: 'Inter', sans-serif; }
        .gradient-text { background: linear-gradient(45deg, #00E5FF, #FF00CC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
        @keyframes pulseGlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen py-20">
        <div class="container mx-auto px-6">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-16">
                    <div class="inline-flex items-center bg-gradient-to-r from-blue-400 to-pink-500 px-6 py-2 rounded-full text-white font-semibold mb-6">
                        <i class="fa-solid fa-check mr-2"></i>
                        Blueprint Generated Successfully
                    </div>
                    <h1 class="text-5xl font-black mb-6">🎉 Your AI Solution Blueprint Is Ready!</h1>
                    <p class="text-xl text-gray-700">Hi ${contactName}, here's your customized AI solution for: <span class="font-bold gradient-text">${businessType}</span></p>
                </div>
                
                <!-- Solutions Grid -->
                <div class="grid md:grid-cols-${Math.min(solutions.length, 3)} gap-8 mb-16">
                    ${solutions.map((solution, index) => {
                        const colors = [
                            'from-blue-400 to-blue-600',
                            'from-pink-400 to-pink-600', 
                            'from-purple-400 to-purple-600',
                            'from-green-400 to-green-600',
                            'from-yellow-400 to-yellow-600'
                        ];
                        const icons = ['fa-robot', 'fa-chart-line', 'fa-cogs', 'fa-lightbulb', 'fa-rocket'];
                        
                        return `
                            <div class="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
                                <div class="w-16 h-16 bg-gradient-to-r ${colors[index % colors.length]} rounded-2xl flex items-center justify-center mb-6 pulse-glow">
                                    <i class="fa-solid ${icons[index % icons.length]} text-white text-2xl"></i>
                                </div>
                                <h3 class="text-2xl font-bold mb-4">${solution.title}</h3>
                                <p class="text-gray-600 mb-4">${solution.description}</p>
                                ${solution.features ? `
                                    <ul class="space-y-2 text-sm text-gray-500">
                                        ${solution.features.map(feature => `<li>• ${feature}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Implementation Details -->
                <div class="bg-white rounded-3xl p-10 shadow-2xl border-2 border-gray-100">
                    <div class="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 class="text-3xl font-bold mb-6">Implementation Details</h3>
                            <div class="space-y-6">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                                        <i class="fa-solid fa-calendar text-white"></i>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-lg">Build Time</div>
                                        <div class="text-gray-600">3–5 Weeks</div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                                        <i class="fa-solid fa-headset text-white"></i>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-lg">Maintenance & Support</div>
                                        <div class="text-gray-600">Included</div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                                        <i class="fa-solid fa-rocket text-white"></i>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-lg">Expected ROI</div>
                                        <div class="text-gray-600">300%+ within 12 months</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 rounded-2xl p-8">
                            <h4 class="text-2xl font-bold mb-6">Ready to Move Forward?</h4>
                            <p class="text-gray-600 mb-8">Speak with our solutions expert to get full pricing, timeline, and implementation details.</p>
                            
                            <div class="space-y-4">
                                <a href="tel:+1234567890" class="w-full bg-gradient-to-r from-blue-400 to-pink-500 px-8 py-4 rounded-xl text-white font-bold text-center block">
                                    <i class="fa-solid fa-phone mr-3"></i>
                                    Call: +1 (234) 567-890
                                </a>
                                <a href="mailto:solutions@revamply.com" class="w-full border-2 border-blue-400 px-8 py-4 rounded-xl text-blue-600 font-bold text-center block">
                                    <i class="fa-solid fa-envelope mr-3"></i>
                                    Email: solutions@revamply.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="text-center mt-16">
                    <div class="flex items-center justify-center space-x-3 mb-4">
                        <img src="/images/r-logo.png" alt="Revamply Logo" class="w-12 h-12 rounded-lg" onerror="this.style.display='none'">
                        <span class="text-2xl font-bold gradient-text">Revamply</span>
                    </div>
                    <p class="text-gray-500">© 2025 Revamply. All rights reserved.</p>
                    <p class="text-sm text-gray-400 mt-2">This blueprint was generated specifically for your business requirements.</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-close after displaying (optional)
        setTimeout(() => {
            if (window.opener) {
                // If opened in popup, try to communicate back to parent
                try {
                    window.opener.postMessage({
                        type: 'blueprint_ready',
                        blueprint: ${JSON.stringify(blueprint)}
                    }, '*');
                } catch (e) {
                    console.log('Could not communicate with parent window');
                }
            }
        }, 1000);
    </script>
</body>
</html>
    `;
}

function generateErrorHTML(error, contactInfo) {
    const contactName = contactInfo?.fullName || "Valued Customer";
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blueprint Generation Error - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto text-center p-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Blueprint Generation Error</h1>
        <p class="text-gray-600 mb-6">Hi ${contactName}, we encountered an issue generating your AI blueprint.</p>
        <p class="text-sm text-gray-500 mb-8">${error || 'Unknown error occurred'}</p>
        <div class="space-y-3">
            <a href="mailto:support@revamply.com" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg block">
                Contact Support
            </a>
            <button onclick="window.close()" class="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg">
                Close
            </button>
        </div>
    </div>
</body>
</html>
    `;
}
