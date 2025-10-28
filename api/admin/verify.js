// api/admin/verify.js
// Session verification endpoint

const { validateSession, getSession } = require('./login');

module.exports = async (req, res) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        
        if (!validateSession(token)) {
            return res.status(401).json({ 
                valid: false, 
                error: 'Session expired or invalid' 
            });
        }
        
        const session = getSession(token);
        
        return res.status(200).json({
            valid: true,
            username: session.username,
            expiresAt: session.expiresAt
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
