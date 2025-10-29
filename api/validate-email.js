// api/validate-email.js - Comprehensive email validation
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export default async function handler(req, res) {
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
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                valid: false, 
                reason: 'Email is required' 
            });
        }
        
        // Run all validation checks
        const validationResult = await validateEmailComprehensive(email);
        
        return res.status(200).json(validationResult);
        
    } catch (error) {
        console.error('Email validation error:', error);
        return res.status(200).json({
            valid: true, // Default to valid if validation fails
            reason: 'Validation service unavailable',
            confidence: 50
        });
    }
}

async function validateEmailComprehensive(email) {
    const results = {
        valid: false,
        email: email.toLowerCase().trim(),
        checks: {},
        reason: '',
        confidence: 0,
        riskLevel: 'high'
    };
    
    // 1. Basic syntax validation
    results.checks.syntax = validateSyntax(email);
    if (!results.checks.syntax.valid) {
        results.reason = results.checks.syntax.reason;
        return results;
    }
    
    const [localPart, domain] = email.toLowerCase().split('@');
    
    // 2. Check for disposable/temporary email providers
    results.checks.disposable = await checkDisposableEmail(domain);
    
    // 3. Check domain MX records
    results.checks.domain = await validateDomain(domain);
    
    // 4. Check for role-based emails
    results.checks.roleBase = checkRoleBasedEmail(localPart);
    
    // 5. Check for common fake patterns
    results.checks.patterns = checkSuspiciousPatterns(email);
    
    // 6. Optional: Use external email validation API
    results.checks.external = await validateWithExternalAPI(email);
    
    // Calculate overall validity and confidence
    const assessment = calculateValidityScore(results.checks);
    results.valid = assessment.valid;
    results.confidence = assessment.confidence;
    results.riskLevel = assessment.riskLevel;
    results.reason = assessment.reason;
    
    return results;
}

function validateSyntax(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
        return { valid: false, reason: 'Invalid email format' };
    }
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length > 64) {
        return { valid: false, reason: 'Local part too long' };
    }
    
    if (domain.length > 253) {
        return { valid: false, reason: 'Domain too long' };
    }
    
    return { valid: true, reason: 'Valid syntax' };
}

async function checkDisposableEmail(domain) {
    // List of known disposable email providers
    const disposableDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
        'tempmail.org', 'yopmail.com', 'throwaway.email',
        'temp-mail.org', 'getnada.com', 'maildrop.cc',
        'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
        'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net',
        'dispostable.com', 'fake-mail.ml', 'fakeinbox.com'
    ];
    
    const isDisposable = disposableDomains.includes(domain.toLowerCase());
    
    return {
        valid: !isDisposable,
        isDisposable: isDisposable,
        reason: isDisposable ? 'Disposable email provider' : 'Not disposable'
    };
}

async function validateDomain(domain) {
    try {
        const mxRecords = await resolveMx(domain);
        
        if (!mxRecords || mxRecords.length === 0) {
            return { 
                valid: false, 
                reason: 'No mail servers found',
                hasMX: false 
            };
        }
        
        return { 
            valid: true, 
            reason: 'Domain has mail servers',
            hasMX: true,
            mxCount: mxRecords.length
        };
        
    } catch (error) {
        return { 
            valid: false, 
            reason: 'Domain does not exist or no MX records',
            hasMX: false 
        };
    }
}

function checkRoleBasedEmail(localPart) {
    const roleBased = [
        'admin', 'administrator', 'support', 'help', 'info', 'contact',
        'sales', 'marketing', 'noreply', 'no-reply', 'billing',
        'accounts', 'webmaster', 'postmaster', 'hostmaster',
        'abuse', 'security', 'privacy', 'legal', 'compliance'
    ];
    
    const isRoleBased = roleBased.includes(localPart.toLowerCase());
    
    return {
        valid: !isRoleBased, // Role-based emails might not be personal
        isRoleBased: isRoleBased,
        reason: isRoleBased ? 'Role-based email address' : 'Personal email'
    };
}

function checkSuspiciousPatterns(email) {
    const suspiciousPatterns = [
        /test\d*@/i,           // test@, test1@, test123@
        /demo\d*@/i,           // demo@, demo1@
        /fake\d*@/i,           // fake@, fake123@
        /example\d*@/i,        // example@
        /sample\d*@/i,         // sample@
        /temp\d*@/i,           // temp@, temp123@
        /spam\d*@/i,           // spam@
        /noreply\d*@/i,        // noreply@
        /^\d+@/,               // Starts with only numbers
        /^[a-z]@/i,            // Single letter before @
        /(.)\1{4,}@/           // Repeated characters (aaaaa@)
    ];
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(email));
    
    return {
        valid: !hasSuspiciousPattern,
        isSuspicious: hasSuspiciousPattern,
        reason: hasSuspiciousPattern ? 'Suspicious email pattern' : 'Normal pattern'
    };
}

async function validateWithExternalAPI(email) {
    // Optional: Use a service like Abstract API for additional validation
    // You can sign up for free tiers at these services:
    
    try {
        // Example with Abstract API (replace with your API key)
        const API_KEY = process.env.ABSTRACT_EMAIL_API_KEY;
        
        if (!API_KEY) {
            return { 
                valid: true, 
                reason: 'External validation not configured',
                skipped: true 
            };
        }
        
        const response = await fetch(
            `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(email)}`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        return {
            valid: data.deliverability === 'DELIVERABLE',
            deliverability: data.deliverability,
            isValidFormat: data.is_valid_format?.value || true,
            isFreeEmail: data.is_free_email?.value || false,
            reason: `External API: ${data.deliverability}`
        };
        
    } catch (error) {
        return { 
            valid: true, 
            reason: 'External validation unavailable',
            error: error.message 
        };
    }
}

function calculateValidityScore(checks) {
    let score = 0;
    let maxScore = 0;
    let reasons = [];
    
    // Syntax check (required)
    if (!checks.syntax.valid) {
        return {
            valid: false,
            confidence: 0,
            riskLevel: 'high',
            reason: checks.syntax.reason
        };
    }
    score += 20; maxScore += 20;
    
    // Domain validation (important)
    if (checks.domain.valid) {
        score += 25;
    } else {
        reasons.push('Domain issues');
    }
    maxScore += 25;
    
    // Disposable email check (important)
    if (checks.disposable.valid) {
        score += 20;
    } else {
        reasons.push('Disposable email');
    }
    maxScore += 20;
    
    // Role-based check (moderate importance)
    if (checks.roleBase.valid) {
        score += 10;
    } else {
        reasons.push('Role-based email');
    }
    maxScore += 10;
    
    // Pattern check (moderate importance)
    if (checks.patterns.valid) {
        score += 15;
    } else {
        reasons.push('Suspicious pattern');
    }
    maxScore += 15;
    
    // External validation (if available)
    if (checks.external && !checks.external.skipped) {
        if (checks.external.valid) {
            score += 10;
        } else {
            reasons.push('External validation failed');
        }
        maxScore += 10;
    }
    
    const confidence = Math.round((score / maxScore) * 100);
    
    let riskLevel, valid;
    if (confidence >= 80) {
        riskLevel = 'low';
        valid = true;
    } else if (confidence >= 60) {
        riskLevel = 'medium';
        valid = true; // Allow but flag
    } else {
        riskLevel = 'high';
        valid = false;
    }
    
    return {
        valid,
        confidence,
        riskLevel,
        reason: reasons.length > 0 ? reasons.join(', ') : 'Email appears valid'
    };
}
