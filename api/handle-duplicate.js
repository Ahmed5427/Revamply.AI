// api/handle-duplicate.js - Handle duplicate email submissions
import BlueprintStorage from './blueprint-storage.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed. Use POST.'
        });
    }

    try {
        const { email, status, message, submissionId, contactName } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        console.log(`📧 Handling duplicate submission for email: ${email}`);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Try to retrieve existing blueprint info
        let existingBlueprint = null;

        if (submissionId) {
            // If submissionId provided, retrieve by that
            existingBlueprint = await BlueprintStorage.retrieve(submissionId);
        } else {
            // Otherwise, look up by email
            existingBlueprint = await BlueprintStorage.retrieveByEmail(email);
        }

        const customerName = contactName || existingBlueprint?.contactName || 'Valued Customer';
        const blueprintUrl = existingBlueprint
            ? `${getBaseUrl(req)}/api/get-blueprint-page?submissionId=${existingBlueprint.submissionId}`
            : null;

        console.log(`✅ Duplicate handled for: ${email}, Blueprint URL: ${blueprintUrl || 'Not found'}`);

        // Return user-facing HTML response
        const htmlResponse = generateDuplicateHTML(customerName, email, blueprintUrl);

        return res.status(200).setHeader('Content-Type', 'text/html').send(htmlResponse);

    } catch (error) {
        console.error('💥 Error handling duplicate:', error);
        return res.status(500).setHeader('Content-Type', 'text/html').send(
            generateErrorHTML('Internal server error')
        );
    }
}

// Helper function to get base URL
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}`;
}

// Generate HTML for duplicate submission
function generateDuplicateHTML(contactName, email, blueprintUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blueprint Already Generated - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-text {
            background: linear-gradient(45deg, #00E5FF, #FF00CC);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center">
    <div class="max-w-2xl mx-auto p-8 text-center">
        <!-- Icon -->
        <div class="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center pulse-animation">
            <i class="fa-solid fa-envelope-circle-check text-white text-5xl"></i>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-black mb-4 gradient-text">
            Great News, ${contactName}!
        </h1>

        <!-- Main Message -->
        <div class="bg-white rounded-3xl shadow-2xl p-10 mb-8">
            <div class="text-2xl font-bold text-gray-800 mb-4">
                You Already Have a Blueprint! 🎉
            </div>

            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
                We found that you previously generated an AI solution blueprint with this email address:
            </p>

            <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div class="text-sm text-blue-600 font-semibold mb-1">Your Email</div>
                <div class="text-lg font-mono text-blue-900">${email}</div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <i class="fa-solid fa-paper-plane text-green-600 text-3xl mb-3"></i>
                <p class="text-lg font-bold text-gray-800 mb-2">
                    We're Sending Your Blueprint Now! 📬
                </p>
                <p class="text-gray-600">
                    Check your email inbox in the next few minutes. We're sending your existing AI solution blueprint right away.
                </p>
            </div>

            ${blueprintUrl ? `
            <div class="mt-6">
                <p class="text-sm text-gray-500 mb-3">Or view it instantly:</p>
                <a href="${blueprintUrl}" class="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    <i class="fa-solid fa-eye mr-2"></i>View Blueprint Now
                </a>
            </div>
            ` : ''}
        </div>

        <!-- Additional Actions -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Need Something Different?</h3>
            <div class="grid md:grid-cols-2 gap-4 text-left">
                <div class="flex items-start space-x-3">
                    <i class="fa-solid fa-rotate text-blue-500 text-xl mt-1"></i>
                    <div>
                        <div class="font-semibold text-gray-800">Updated Analysis</div>
                        <div class="text-sm text-gray-600">Business changed? Contact us for a fresh blueprint.</div>
                    </div>
                </div>
                <div class="flex items-start space-x-3">
                    <i class="fa-solid fa-calendar-check text-green-500 text-xl mt-1"></i>
                    <div>
                        <div class="font-semibold text-gray-800">Consultation</div>
                        <div class="text-sm text-gray-600">Ready to discuss implementation? Book a call.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Options -->
        <div class="space-y-3">
            <a href="https://calendly.com/revamply/consultation" target="_blank" class="inline-block bg-white border-2 border-cyan-400 hover:bg-cyan-50 text-cyan-600 font-bold py-3 px-8 rounded-xl transition-all">
                <i class="fa-solid fa-calendar mr-2"></i>Schedule Consultation
            </a>
            <br>
            <a href="mailto:solutions@revamply.ai" class="inline-block text-gray-600 hover:text-cyan-600 transition-colors">
                <i class="fa-solid fa-envelope mr-2"></i>Contact Support: solutions@revamply.ai
            </a>
        </div>

        <!-- Footer -->
        <div class="mt-12 text-center">
            <div class="flex items-center justify-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-lg">R</span>
                </div>
                <span class="text-2xl font-bold gradient-text">Revamply</span>
            </div>
            <p class="text-gray-500">© 2025 Revamply. Transforming businesses with AI.</p>
        </div>
    </div>

    <script>
        // Auto-scroll to top on load
        window.scrollTo(0, 0);

        // Log for debugging
        console.log('✅ Duplicate submission handled for: ${email}');
    </script>
</body>
</html>`;
}

// Generate error HTML
function generateErrorHTML(error) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Revamply</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-lg text-center p-8">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-solid fa-exclamation-triangle text-red-500 text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
        <p class="text-gray-600 mb-6">${error}</p>
        <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Return to Home
        </a>
    </div>
</body>
</html>`;
}
