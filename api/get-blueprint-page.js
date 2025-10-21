// api/get-blueprint-page.js - ASYNC version for Vercel KV
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
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        // Get submission ID from query params or body
        let submissionId, contactName;
        
        if (req.method === 'GET') {
            submissionId = req.query.submissionId;
            contactName = req.query.contactName;
        } else {
            submissionId = req.body.submissionId;
            contactName = req.body.contactName;
        }
        
        console.log(`🔍 Looking for blueprint with ID: ${submissionId}`);
        
        if (!submissionId) {
            console.error('❌ No submissionId provided');
            return res.status(400).setHeader('Content-Type', 'text/html').send(generateNotFoundHTML());
        }
        
        // Try to retrieve the stored blueprint (ASYNC!)
        const storedBlueprint = await BlueprintStorage.retrieve(submissionId);
        
        if (!storedBlueprint) {
            console.log(`❌ Blueprint not found in KV for submission: ${submissionId}`);
            return res.status(404).setHeader('Content-Type', 'text/html').send(generateNotFoundHTML());
        }
        
        console.log(`✅ Blueprint found in KV for: ${submissionId}`);
        
        // Check if it's an error case
        if (storedBlueprint.status === 'error') {
            return res.status(200).setHeader('Content-Type', 'text/html').send(
                generateErrorHTML(storedBlueprint.error, storedBlueprint.contactName)
            );
        }
        
        // Generate the blueprint HTML with real content
        const blueprintHTML = generateBlueprintHTML(storedBlueprint);
        
        console.log(`📄 Displaying blueprint for: ${storedBlueprint.contactName}`);
        return res.status(200).setHeader('Content-Type', 'text/html').send(blueprintHTML);
        
    } catch (error) {
        console.error('💥 Error serving blueprint page:', error);
        return res.status(500).setHeader('Content-Type', 'text/html').send(
            generateErrorHTML('Internal server error', 'Valued Customer')
        );
    }
}

// In your get-blueprint-page.js file, update the generateBlueprintHTML function:

function generateBlueprintHTML(blueprint) {
    const contactName = blueprint.contactName || 'Valued Customer';
    const blueprintContent = blueprint.blueprintContent || 'Blueprint content not available';
    const submissionId = blueprint.submissionId || 'unknown';
    const generatedDate = blueprint.generatedAt ? new Date(blueprint.generatedAt).toLocaleDateString() : new Date().toLocaleDateString();
    
    const formattedContent = formatBlueprintContent(blueprintContent);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your AI Blueprint is Ready - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <!-- Add pdfMake library for better PDF generation -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
    <style>
        /* CSS Variables matching Index.html */
        :root {
            --primary-blue: #00E5FF;
            --primary-pink: #FF00CC;
            --gradient-1: linear-gradient(45deg, #00E5FF, #FF00CC);
            --shadow-glow: 0 0 30px #00E5FF, 0 0 60px #FF00CC;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            background: #000000;
            color: #ffffff;
            overflow-x: hidden;
        }

        /* Particle Container */
        .particle-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        }

        .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary-blue);
            border-radius: 50%;
            animation: floatingParticles 15s infinite ease-in-out;
            opacity: 0;
        }

        @keyframes floatingParticles {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }

        /* Neon Glow Effects */
        .neon-glow {
            animation: neonGlow 3s ease-in-out infinite;
        }

        @keyframes neonGlow {
            0%, 100% {
                box-shadow: 0 0 20px var(--primary-blue), 0 0 40px var(--primary-blue);
            }
            50% {
                box-shadow: 0 0 30px var(--primary-pink), 0 0 50px var(--primary-pink);
            }
        }

        /* Gradient Text */
        .gradient-text {
            background: linear-gradient(45deg, #00E5FF, #FF00CC);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradientShift 4s ease infinite;
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Celebration Animation */
        .celebration {
            animation: celebration 0.8s ease-out;
        }

        @keyframes celebration {
            0% { transform: scale(0.8) translateY(20px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* Blueprint Content Card */
        .blueprint-content {
            background: linear-gradient(135deg, rgba(0, 229, 255, 0.05), rgba(255, 0, 204, 0.05));
            backdrop-filter: blur(10px);
            border-radius: 1.5rem;
            padding: 2.5rem;
            margin: 2rem 0;
            border: 2px solid rgba(0, 229, 255, 0.3);
            box-shadow: 0 0 40px rgba(0, 229, 255, 0.2), 0 0 80px rgba(255, 0, 204, 0.1);
            line-height: 1.8;
            position: relative;
            overflow: hidden;
        }

        .blueprint-content::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(0, 229, 255, 0.1), transparent);
            animation: shimmer 6s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .blueprint-content h1,
        .blueprint-content h2,
        .blueprint-content h3 {
            color: var(--primary-blue);
            margin: 2rem 0 1rem 0;
            font-weight: bold;
            line-height: 1.4;
            text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
            position: relative;
            z-index: 1;
        }

        .blueprint-content h1 {
            font-size: 2rem;
            border-bottom: 3px solid var(--primary-blue);
            padding-bottom: 0.75rem;
            margin-bottom: 1.5rem;
        }

        .blueprint-content h2 {
            font-size: 1.5rem;
            color: var(--primary-blue);
            margin-top: 2.5rem;
        }

        .blueprint-content h3 {
            font-size: 1.25rem;
            color: var(--primary-pink);
            margin-top: 1.5rem;
        }

        .blueprint-content ul {
            margin: 1.25rem 0;
            padding-left: 2rem;
            list-style-type: none;
            position: relative;
            z-index: 1;
        }

        .blueprint-content li {
            margin: 0.75rem 0;
            line-height: 1.8;
            color: #e0e0e0;
            position: relative;
            padding-left: 1.5rem;
        }

        .blueprint-content li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: var(--primary-blue);
            font-weight: bold;
        }

        .blueprint-content p {
            margin: 1.25rem 0;
            color: #d0d0d0;
            line-height: 1.8;
            font-size: 1rem;
            position: relative;
            z-index: 1;
        }

        .blueprint-content strong {
            color: #ffffff;
            font-weight: 600;
        }

        /* Download Button */
        .download-btn {
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
        }

        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(0, 229, 255, 0.8), 0 0 60px rgba(255, 0, 204, 0.5);
        }

        /* Glass Card Effect */
        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        /* Neon Border */
        .neon-border {
            border: 2px solid transparent;
            background: linear-gradient(#000, #000) padding-box,
                        linear-gradient(45deg, #00E5FF, #FF00CC) border-box;
        }

        /* PDF-specific styles */
        @media print {
            .no-print { display: none !important; }
            .particle-container { display: none !important; }

            body {
                background: white !important;
                color: black !important;
            }

            .blueprint-content {
                background: white !important;
                box-shadow: none !important;
                border: 2px solid #e5e7eb !important;
                page-break-inside: avoid;
                padding: 2rem !important;
            }

            .blueprint-content::before {
                display: none !important;
            }

            .blueprint-content h1,
            .blueprint-content h2,
            .blueprint-content h3 {
                page-break-after: avoid;
                color: #000000 !important;
                text-shadow: none !important;
            }

            .blueprint-content p,
            .blueprint-content li {
                color: #000000 !important;
                font-size: 11pt !important;
            }

            .gradient-text {
                background: none !important;
                -webkit-text-fill-color: #2563eb !important;
                color: #2563eb !important;
            }
        }
    </style>
</head>
<body class="bg-black">
    <!-- Particle Background -->
    <div class="particle-container" id="particleContainer"></div>

    <div class="min-h-screen py-12 relative z-10">
        <div class="container mx-auto px-6">
            <div class="max-w-7xl mx-auto" id="blueprint-container">
                <!-- Download Button - Floating at top right -->
                <div class="fixed top-6 right-6 z-50 no-print">
                    <button onclick="downloadPDF()" class="download-btn bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl flex items-center space-x-2 neon-glow">
                        <i class="fa-solid fa-download"></i>
                        <span>Download PDF</span>
                    </button>
                </div>

                <!-- Celebration Header -->
                <div class="text-center mb-12 celebration">
                    <div class="inline-flex items-center bg-gradient-to-r from-cyan-400 to-pink-500 px-8 py-3 rounded-full text-white font-bold text-lg mb-8 neon-glow">
                        <i class="fa-solid fa-check-circle mr-3 text-2xl animate-pulse"></i>
                        Blueprint Generated Successfully!
                    </div>
                    <h1 class="text-6xl font-black mb-6 gradient-text">Your AI Solution Blueprint</h1>
                    <p class="text-2xl text-white mb-4">Hi <span class="font-bold gradient-text">${contactName}</span>! 🎉</p>
                    <p class="text-lg text-gray-400">Here's your personalized AI transformation plan</p>
                </div>
                
                <!-- Blueprint Content -->
                <div class="blueprint-content celebration" style="animation-delay: 0.2s">
                    ${formattedContent}
                </div>
                
                <!-- Implementation Timeline -->
                <div class="glass-card neon-border rounded-3xl p-10 mb-12 celebration" style="animation-delay: 0.4s">
                    <div class="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 class="text-3xl font-bold mb-8 gradient-text">📋 Implementation Details</h3>
                            <div class="space-y-6">
                                <div class="flex items-center group">
                                    <div class="w-14 h-14 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mr-4 neon-glow">
                                        <i class="fa-solid fa-calendar text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-white">Development Time</div>
                                        <div class="text-gray-400">6–9 Months</div>
                                    </div>
                                </div>
                                <div class="flex items-center group">
                                    <div class="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4 neon-glow">
                                        <i class="fa-solid fa-headset text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-white">Support & Training</div>
                                        <div class="text-gray-400">Fully Included</div>
                                    </div>
                                </div>
                                <div class="flex items-center group">
                                    <div class="w-14 h-14 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mr-4 neon-glow">
                                        <i class="fa-solid fa-chart-line text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-lg text-white">Expected ROI</div>
                                        <div class="text-gray-400">20-25% cost reduction in 12 months</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Call to Action -->
                        <div class="glass-card rounded-2xl p-8 border border-cyan-500/30">
                            <h4 class="text-3xl font-bold mb-6 gradient-text">🚀 Ready to Transform?</h4>
                            <p class="text-gray-300 mb-8 text-lg">Let's discuss your blueprint and create a plan tailored to your timeline.</p>
                            <div class="space-y-4 no-print">
                                <a href="https://calendly.com/revamply/consultation" target="_blank" class="w-full bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 px-8 py-4 rounded-xl text-white font-bold text-center block transition-all shadow-lg hover:shadow-xl transform hover:scale-105 neon-glow">
                                    <i class="fa-solid fa-calendar-check mr-3"></i>Schedule Consultation
                                </a>
                                <a href="mailto:solutions@revamply.ai" onclick="handleEmailClick(event)" class="w-full border-2 border-cyan-400 hover:bg-cyan-400/10 px-8 py-4 rounded-xl text-cyan-400 font-bold text-center block transition-all cursor-pointer">
                                    <i class="fa-solid fa-envelope mr-3"></i>Email Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="text-center celebration" style="animation-delay: 0.6s">
                    <div class="flex items-center justify-center space-x-3 mb-6">
                        <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-xl flex items-center justify-center neon-glow">
                            <span class="text-white font-bold text-xl">R</span>
                        </div>
                        <span class="text-3xl font-bold gradient-text">Revamply</span>
                    </div>
                    <p class="text-gray-400 text-lg">© 2025 Revamply. Transforming businesses with AI.</p>
                    <p class="text-sm text-gray-600 mt-2">Blueprint ID: ${submissionId} | Generated: ${generatedDate}</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        console.log('🎉 Blueprint loaded successfully!');
        console.log('👤 ${contactName}');
        console.log('📋 ${submissionId}');
        
        // PDF Download Function using pdfMake
        function downloadPDF() {
            const button = event.target.closest('button');
            const originalHTML = button.innerHTML;

            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Generating PDF...';
            button.disabled = true;

            try {
                // Get the blueprint content
                const blueprintContainer = document.getElementById('blueprint-container');
                const content = parseBlueprintToPDF(blueprintContainer);

                // Define PDF document
                const docDefinition = {
                    pageSize: 'LETTER',
                    pageMargins: [60, 60, 60, 60],
                    defaultStyle: {
                        font: 'Roboto',
                        fontSize: 11,
                        lineHeight: 1.5
                    },
                    styles: {
                        header: {
                            fontSize: 24,
                            bold: true,
                            color: '#1f2937',
                            margin: [0, 0, 0, 20]
                        },
                        h1: {
                            fontSize: 20,
                            bold: true,
                            color: '#2563eb',
                            margin: [0, 20, 0, 12]
                        },
                        h2: {
                            fontSize: 16,
                            bold: true,
                            color: '#2563eb',
                            margin: [0, 16, 0, 10]
                        },
                        h3: {
                            fontSize: 14,
                            bold: true,
                            color: '#059669',
                            margin: [0, 12, 0, 8]
                        },
                        paragraph: {
                            fontSize: 11,
                            color: '#374151',
                            margin: [0, 0, 0, 10],
                            alignment: 'justify'
                        },
                        listItem: {
                            fontSize: 11,
                            color: '#374151',
                            margin: [0, 4, 0, 4]
                        },
                        emphasis: {
                            bold: true,
                            color: '#1f2937'
                        },
                        footer: {
                            fontSize: 9,
                            color: '#6b7280',
                            alignment: 'center'
                        }
                    },
                    content: [
                        {
                            text: 'AI Solution Blueprint',
                            style: 'header',
                            decoration: 'underline',
                            decorationColor: '#2563eb'
                        },
                        {
                            text: 'Prepared for: ${contactName}',
                            style: 'paragraph',
                            margin: [0, 0, 0, 5]
                        },
                        {
                            text: 'Generated: ${new Date().toLocaleDateString()}',
                            style: 'paragraph',
                            margin: [0, 0, 0, 20]
                        },
                        ...content
                    ],
                    footer: function(currentPage, pageCount) {
                        return {
                            text: \`Page \${currentPage} of \${pageCount} | Powered by Revamply.AI\`,
                            style: 'footer',
                            margin: [40, 20]
                        };
                    }
                };

                const filename = 'AI-Blueprint-${contactName.replace(/[^a-z0-9]/gi, '_')}-${submissionId.substring(0, 8)}.pdf';
                pdfMake.createPdf(docDefinition).download(filename);

                button.innerHTML = originalHTML;
                button.disabled = false;
                showNotification('✅ PDF downloaded successfully!');
            } catch (error) {
                console.error('PDF generation error:', error);
                button.innerHTML = originalHTML;
                button.disabled = false;
                showNotification('❌ Error generating PDF. Please try again.', 'error');
            }
        }

        // Parse blueprint HTML content to pdfMake format
        function parseBlueprintToPDF(container) {
            const content = [];
            const blueprintContent = container.querySelector('.blueprint-content');

            if (!blueprintContent) return content;

            const elements = blueprintContent.children;

            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                const tagName = el.tagName.toLowerCase();
                const text = el.textContent.trim();

                if (!text) continue;

                if (tagName === 'h1') {
                    content.push({
                        text: text,
                        style: 'h1',
                        pageBreak: i > 0 ? 'before' : undefined
                    });
                } else if (tagName === 'h2') {
                    content.push({
                        text: text,
                        style: 'h2'
                    });
                } else if (tagName === 'h3') {
                    content.push({
                        text: text,
                        style: 'h3'
                    });
                } else if (tagName === 'p') {
                    // Parse bold text within paragraphs
                    const textContent = parseInlineStyles(el);
                    content.push({
                        text: textContent,
                        style: 'paragraph'
                    });
                } else if (tagName === 'ul') {
                    const listItems = [];
                    const lis = el.querySelectorAll('li');
                    lis.forEach(li => {
                        const liText = parseInlineStyles(li);
                        listItems.push(liText);
                    });
                    content.push({
                        ul: listItems,
                        style: 'listItem',
                        margin: [0, 5, 0, 10]
                    });
                }
            }

            return content;
        }

        // Parse inline styles (bold, etc.)
        function parseInlineStyles(element) {
            const result = [];
            const childNodes = element.childNodes;

            for (let i = 0; i < childNodes.length; i++) {
                const node = childNodes[i];

                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    if (text.trim()) {
                        result.push(text);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    const text = node.textContent.trim();

                    if (tagName === 'strong' || tagName === 'b') {
                        result.push({ text: text, bold: true });
                    } else if (tagName === 'em' || tagName === 'i') {
                        result.push({ text: text, italics: true });
                    } else {
                        result.push(text);
                    }
                }
            }

            return result.length === 1 && typeof result[0] === 'string' ? result[0] : result;
        }
        
        // Handle email click with fallback
        function handleEmailClick(event) {
            event.preventDefault();
            const email = 'solutions@revamply.ai';

            // Try to open mailto link
            try {
                window.location.href = 'mailto:' + email;

                // Show notification with email address as fallback
                setTimeout(() => {
                    showNotification(\`📧 Opening email to \${email}. If your email client doesn't open, please copy this address.\`, 'success');
                }, 500);
            } catch (error) {
                // Fallback: copy to clipboard
                copyToClipboard(email);
            }
        }

        // Copy email to clipboard
        function copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showNotification(\`📋 Email address copied: \${text}\`, 'success');
                }).catch(() => {
                    showNotification(\`📧 Email: \${text} (click to copy)\`, 'success');
                });
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showNotification(\`📋 Email address copied: \${text}\`, 'success');
                } catch (err) {
                    showNotification(\`📧 Email: \${text}\`, 'success');
                }
                document.body.removeChild(textarea);
            }
        }

        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = \`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl z-50 transition-all transform translate-y-0 \${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-semibold\`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.transform = 'translateY(100px)';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Create floating particles
        function createParticles() {
            const container = document.getElementById('particleContainer');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (15 + Math.random() * 10) + 's';

                // Randomize colors between blue and pink
                if (Math.random() > 0.5) {
                    particle.style.background = 'var(--primary-blue)';
                    particle.style.boxShadow = '0 0 10px var(--primary-blue)';
                } else {
                    particle.style.background = 'var(--primary-pink)';
                    particle.style.boxShadow = '0 0 10px var(--primary-pink)';
                }

                container.appendChild(particle);
            }
        }

        // Animation observer
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize particles
            createParticles();

            // Celebration animations
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
</html>`;
}
function formatBlueprintContent(content) {
    if (!content) return '<p>Blueprint content not available.</p>';

    // Split content into lines for better processing
    let lines = content.split('\n');
    let formatted = '';
    let inList = false;
    let currentParagraph = '';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            // Close current paragraph if any
            if (currentParagraph) {
                formatted += '<p>' + currentParagraph + '</p>\n';
                currentParagraph = '';
            }
            // Close list if open
            if (inList) {
                formatted += '</ul>\n';
                inList = false;
            }
            continue;
        }

        // Process bold text
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Main title
        if (line.match(/^AI Solution Blueprint/i)) {
            if (currentParagraph) {
                formatted += '<p>' + currentParagraph + '</p>\n';
                currentParagraph = '';
            }
            if (inList) {
                formatted += '</ul>\n';
                inList = false;
            }
            formatted += '<h1>' + line + '</h1>\n';
        }
        // Section headers (all caps or ending with colon)
        else if (line.match(/^[A-Z][^:]*:$/)) {
            if (currentParagraph) {
                formatted += '<p>' + currentParagraph + '</p>\n';
                currentParagraph = '';
            }
            if (inList) {
                formatted += '</ul>\n';
                inList = false;
            }
            formatted += '<h2>' + line + '</h2>\n';
        }
        // Phase headers
        else if (line.match(/^(Phase \d+|Step \d+|Timeline)/i)) {
            if (currentParagraph) {
                formatted += '<p>' + currentParagraph + '</p>\n';
                currentParagraph = '';
            }
            if (inList) {
                formatted += '</ul>\n';
                inList = false;
            }
            formatted += '<h3>' + line + '</h3>\n';
        }
        // Numbered items
        else if (line.match(/^\d+\./)) {
            if (currentParagraph) {
                formatted += '<p>' + currentParagraph + '</p>\n';
                currentParagraph = '';
            }
            if (inList) {
                formatted += '</ul>\n';
                inList = false;
            }
            formatted += '<h3>' + line + '</h3>\n';
        }
        // List items
        else if (line.match(/^[-•*]\s/)) {
            if (currentParagraph) {
                formatted += '<p>' + currentParagraph + '</p>\n';
                currentParagraph = '';
            }
            if (!inList) {
                formatted += '<ul>\n';
                inList = true;
            }
            formatted += '<li>' + line.replace(/^[-•*]\s/, '') + '</li>\n';
        }
        // Regular text - accumulate into paragraph
        else {
            if (inList) {
                formatted += '</ul>\n';
                inList = false;
            }
            if (currentParagraph) {
                currentParagraph += ' ' + line;
            } else {
                currentParagraph = line;
            }
        }
    }

    // Close any remaining paragraph or list
    if (currentParagraph) {
        formatted += '<p>' + currentParagraph + '</p>\n';
    }
    if (inList) {
        formatted += '</ul>\n';
    }

    return formatted || '<p>Blueprint content not available.</p>';
}

function generateNotFoundHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blueprint Not Found - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto text-center p-8">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-search text-yellow-500 text-2xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Blueprint Not Found</h1>
        <p class="text-gray-600 mb-6">The blueprint may still be generating or the link may be incorrect.</p>
        <a href="/" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg block font-semibold">
            Create New Blueprint
        </a>
    </div>
</body>
</html>`;
}

function generateErrorHTML(error, contactName = 'Valued Customer') {
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
        <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-exclamation-triangle text-yellow-500 text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold mb-4">Almost There!</h1>
        <p class="text-gray-700 mb-6">Hi ${contactName}, we'll email your blueprint shortly.</p>
        <p class="text-sm text-gray-500 mb-8">${error}</p>
        <a href="mailto:support@revamply.com" class="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block font-semibold">
            Contact Support
        </a>
    </div>
</body>
</html>`;
}
