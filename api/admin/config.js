// api/admin/config.js
// Configuration management endpoint

const fs = require('fs').promises;
const path = require('path');
const { validateSession } = require('./login');

const CONFIG_FILE = path.join(process.cwd(), 'data', 'site-config.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load configuration
async function loadConfig() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default config if file doesn't exist
        return getDefaultConfig();
    }
}

// Save configuration
async function saveConfig(config) {
    await ensureDataDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    
    // Also generate the CSS override file
    await generateCSSOverride(config);
}

// Generate CSS override file from config
async function generateCSSOverride(config) {
    const cssContent = `/* Auto-generated CSS overrides from Admin Panel */
/* Generated at: ${new Date().toISOString()} */

:root {
    /* Hero Section Colors */
    ${config.colors?.heroBg ? `--hero-bg: ${config.colors.heroBg};` : ''}
    ${config.colors?.heroTitle ? `--hero-title: ${config.colors.heroTitle};` : ''}
    ${config.colors?.heroDesc ? `--hero-desc: ${config.colors.heroDesc};` : ''}
    
    /* Why Trust Section Colors */
    ${config.colors?.trustBg ? `--trust-bg: ${config.colors.trustBg};` : ''}
    ${config.colors?.trustCardBg ? `--trust-card-bg: ${config.colors.trustCardBg};` : ''}
    ${config.colors?.trustCardTitle ? `--trust-card-title: ${config.colors.trustCardTitle};` : ''}
}

/* Apply CSS variable overrides */
.hero-wrapper {
    background-color: var(--hero-bg, #0a0a0a) !important;
}

.hero-title-line1,
.hero-title-line3 {
    color: var(--hero-title, #ffffff) !important;
}

.hero-description {
    color: var(--hero-desc, #d1d5db) !important;
}

.why-trust-wrapper {
    background-color: var(--trust-bg, #0a0a0a) !important;
}

.efficiency-card,
.overhead-card,
.growth-card {
    background-color: var(--trust-card-bg, #1a1a1a) !important;
}

.efficiency-title,
.overhead-title,
.growth-title {
    color: var(--trust-card-title, #ffffff) !important;
}
`;

    const cssPath = path.join(process.cwd(), 'public', 'css', 'admin-overrides.css');
    await fs.writeFile(cssPath, cssContent, 'utf8');
}

// Default configuration
function getDefaultConfig() {
    return {
        hero: {
            title1: 'AI Solutions That',
            title2: 'Save Time, Cut Costs',
            title3: '& Grow Revenue',
            description: 'Revamply develops tailored AI solutions using advanced machine learning, natural language processing, and automation. From predictive analytics to enterprise-grade AI platforms — we engineer systems that drive efficiency and unlock new revenue streams.',
            ctaText: 'Get Your Free Blueprint'
        },
        whyTrust: {
            title: 'Why Businesses Trust Revamply for AI Transformation',
            efficiency: {
                title: 'Intelligent Efficiency',
                text: 'Automate repetitive tasks with AI so your team can focus on high-value growth activities.'
            },
            overhead: {
                title: 'Reduce Overhead',
                text: 'Eliminate inefficiencies and lower operational expenses with intelligent automation and optimized workflows.'
            },
            growth: {
                title: 'Accelerate Growth',
                text: 'Scale faster with data-driven insights and AI-powered decision making.'
            }
        },
        colors: {
            heroBg: '#0a0a0a',
            heroTitle: '#ffffff',
            heroDesc: '#d1d5db',
            trustBg: '#0a0a0a',
            trustCardBg: '#1a1a1a',
            trustCardTitle: '#ffffff'
        }
    };
}

module.exports = async (req, res) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Verify authentication
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!validateSession(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        // GET - Load configuration
        if (req.method === 'GET') {
            const config = await loadConfig();
            return res.status(200).json(config);
        }
        
        // POST - Save configuration
        if (req.method === 'POST') {
            const config = req.body;
            
            // Validate config structure
            if (!config || typeof config !== 'object') {
                return res.status(400).json({ error: 'Invalid configuration' });
            }
            
            await saveConfig(config);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Configuration saved successfully' 
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Config error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
