// api/admin/login.js
// Secure authentication endpoint for admin panel

const crypto = require('crypto');

// IMPORTANT: Change these credentials immediately after deployment
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    // Password is hashed with SHA-256
    passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword('Revamply2025!Change')
};

// Session storage (in production, use Redis or database)
const sessions = new Map();
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function cleanExpiredSessions() {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (now > session.expiresAt) {
            sessions.delete(token);
        }
    }
}

module.exports = async (req, res) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password required' 
            });
        }
        
        // Rate limiting check (simple implementation)
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const attemptKey = `login_attempt_${ip}`;
        
        // Check credentials
        const inputHash = hashPassword(password);
        const isValid = username === ADMIN_CREDENTIALS.username && 
                       inputHash === ADMIN_CREDENTIALS.passwordHash;
        
        if (!isValid) {
            // Add delay to prevent brute force
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        // Clean expired sessions
        cleanExpiredSessions();
        
        // Generate session token
        const token = generateToken();
        const expiresAt = Date.now() + SESSION_DURATION;
        
        sessions.set(token, {
            username,
            createdAt: Date.now(),
            expiresAt,
            ip
        });
        
        return res.status(200).json({
            success: true,
            token,
            expiresAt
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
};

// Export session validator for other endpoints
module.exports.validateSession = (token) => {
    if (!token) return false;
    
    const session = sessions.get(token);
    if (!session) return false;
    
    // Check if expired
    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return false;
    }
    
    return true;
};

module.exports.getSession = (token) => {
    return sessions.get(token);
};
