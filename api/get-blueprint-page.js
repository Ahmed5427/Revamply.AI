// api/get-blueprint-page.js - Direct blueprint display endpoint
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        // Get submission ID from query params or body
        let submissionId, contactName;
        
        if (req.method === 'GET') {
            submissionId = req.query.submissionId;
            contactName = req.query.contactName || 'Valued Customer';
        } else {
            submissionId = req.body.submissionId;
            contactName = req.body.contactName || 'Valued Customer';
        }
        
        if (!submissionId) {
            return res.status(400).setHeader('Content-Type', 'text/html').send(`
                <html>
                <head><title>Blueprint Not Found</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>Blueprint Not Found</h1>
                    <p>The requested blueprint could not be found.</p>
                    <a href="/" style="color: #3b82f6;">Return to Homepage</a>
                </body>
                </html>
            `);
        }
        
        // For demo purposes, we'll create a generic blueprint
        // In a real implementation, you'd retrieve the actual generated blueprint
        const blueprintData = {
            businessType: "Your Business Solution",
            solutions: [{
                title: "AI-Powered Process Automation",
                description: "A comprehensive AI solution designed to streamline your business processes, reduce manual work, and increase efficiency. This solution includes intelligent workflow automation, predictive analytics, and seamless integration with your existing systems.",
                features: [
                    "Intelligent workflow automation",
                    "Real-time process monitoring",
                    "Predictive analytics dashboard", 
                    "Seamless system integration",
                    "Custom reporting tools",
                    "24/7 automated support"
                ]
            }]
        };
        
        const contactInfo = { fullName: contactName };
        
        // Generate and return the blueprint HTML page
        const blueprintHTML = generateBlueprintHTML(blueprintData, contactInfo, submissionId);
        
        return res.status(200).setHeader('Content-Type', 'text/html').send(blueprintHTML);
        
    } catch (error) {
        console.error('Error serving blueprint page:', error);
        return res.status(500).setHeader('Content-Type', 'text/html').send(`
            <html>
            <head><title>Error</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>Error Loading Blueprint</h1>
                <p>There was an error loading your blueprint. Please try again.</p>
                <a href="/" style="color: #3b82f6;">Return to Homepage</a>
            </body>
            </html>
        `);
    }
}

function generateBlueprintHTML(blueprint, contactInfo, submissionId) {
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
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen py-12">
        <div class="container mx-auto px-6">
            <div class="max-w-6xl mx-auto">
                <!-- Celebration Header -->
                <div class="text-center mb-16 celebration">
                    <div class="inline-flex items-center bg-gradient-to-r from-green-400 to-blue-500 px-8 py-3 rounded-full text-white font-bold text-lg mb-8 shadow-lg">
                        <i class="fa-solid fa-check-circle mr-3 text-2xl"></i>
                        Blueprint Generated Successfully! 🎉
                    </div>
                    <h1 class="text-6xl font-black mb-6 gradient-text">Your AI Solution Blueprint</h1>
                    <p class="text-2xl text-gray-700 mb-4">Hi <span class="font-bold text-blue-600">${contactName}</span>! 👋</p>
                    <p class="text-xl text-gray-600">Here's your personalized AI transformation plan for: <span class="font-bold gradient-text">${businessType}</span></p>
                </div>
                
                <!-- Solutions Grid -->
                <div class="grid md:grid-cols-${Math.min(solutions.length, 3)} gap-8 mb-16">
                    ${solutions.map((solution, index) => {
                        const colors = [
                            'from-blue-500 to-purple-600',
                            'from-pink-500 to-red-500', 
                            'from-green-500 to-teal-600',
                            'from-yellow-500 to-orange-600',
                            'from-purple-500 to-indigo-600'
                        ];
                        const icons = ['fa-robot', 'fa-chart-line', 'fa-cogs', 'fa-lightbulb', 'fa-rocket'];
                        
                        return `
                            <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 celebration" style="animation-delay: ${index * 0.1}s">
                                <div class="w-20 h-20 bg-gradient-to-r ${colors[index % colors.length]} rounded-3xl flex items-center justify-center mb-6 pulse-glow mx-auto">
                                    <i class="fa-solid ${icons[index % icons.length]} text-white text-3xl"></i>
                                </div>
                                <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">${solution.title}</h3>
                                <div class="text-gray-600 mb-6 leading-relaxed text-sm">
                                    ${solution.description.length > 400 ? 
                                        solution.description.substring(0, 400) + '...' : 
                                        solution.description}
                                </div>
                                ${solution.features ? `
                                    <div class="border-t pt-4">
                                        <h4 class="font-semibold text-gray-800 mb-2">Key Features:</h4>
                                        <ul class="space-y-1 text-sm text-gray-600">
                                            ${solution.features.map(feature => `<li class="flex items-start"><i class="fa-solid fa-check text-green-500 mr-2 mt-1 flex-shrink-0"></i><span>${feature}</span></li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Implementation Timeline -->
                <div class="bg-white rounded-3xl p-10 shadow-xl border-2 border-gray-100 mb-12 celebration" style="animation-delay: 0.3s">
                    <div class="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 class="text-3xl font-bold mb-8 text-gray-800">📋 Implementation Timeline</h3>
                            <div class="space-y-6">
                                <div class="flex items-center">
                                    <div class="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                        <i class="fa-solid fa-calendar text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-gray-800">Development Time</div>
                                        <div class="text-gray-600">3–6 Weeks</div>
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
                                        <div class="text-gray-600">300%+ within 12 months</div>
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
                <div class="text-center celebration" style="animation-delay: 0.5s">
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
        console.log('🎉 Blueprint page loaded successfully for submission:', '${submissionId}');
        
        // Optional: Add some interactive elements
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
