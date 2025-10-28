// Revamply Admin Panel JavaScript
// Handles authentication, content editing, and API communication

// Configuration
const API_BASE_URL = '/api/admin';
const SESSION_KEY = 'revamply_admin_session';

// State Management
let currentConfig = {};
let isAuthenticated = false;

// Authentication
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        hideLoading();
        
        if (response.ok && data.success) {
            // Store session token
            sessionStorage.setItem(SESSION_KEY, data.token);
            isAuthenticated = true;
            
            // Show admin panel
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            
            // Load current configuration
            await loadConfiguration();
        } else {
            showError('Invalid credentials. Access denied.');
        }
    } catch (error) {
        hideLoading();
        showError('Connection error. Please try again.');
        console.error('Login error:', error);
    }
});

// Load Configuration
async function loadConfiguration() {
    try {
        showLoading();
        const token = sessionStorage.getItem(SESSION_KEY);
        
        const response = await fetch(`${API_BASE_URL}/config`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentConfig = await response.json();
            populateEditor(currentConfig);
        }
        
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error('Config load error:', error);
    }
}

// Populate Editor with Current Config
function populateEditor(config) {
    // Hero Section
    document.getElementById('hero-title-1').value = config.hero?.title1 || 'AI Solutions That';
    document.getElementById('hero-title-2').value = config.hero?.title2 || 'Save Time, Cut Costs';
    document.getElementById('hero-title-3').value = config.hero?.title3 || '& Grow Revenue';
    document.getElementById('hero-description').value = config.hero?.description || '';
    document.getElementById('hero-cta').value = config.hero?.ctaText || 'Get Your Free Blueprint';
    
    // Why Trust Section
    document.getElementById('trust-title').value = config.whyTrust?.title || '';
    document.getElementById('efficiency-title').value = config.whyTrust?.efficiency?.title || '';
    document.getElementById('efficiency-text').value = config.whyTrust?.efficiency?.text || '';
    document.getElementById('overhead-title').value = config.whyTrust?.overhead?.title || '';
    document.getElementById('overhead-text').value = config.whyTrust?.overhead?.text || '';
    document.getElementById('growth-title').value = config.whyTrust?.growth?.title || '';
    document.getElementById('growth-text').value = config.whyTrust?.growth?.text || '';
    
    // Colors
    if (config.colors) {
        Object.keys(config.colors).forEach(key => {
            const element = document.querySelector(`[data-css-var="--${key}"]`);
            if (element) {
                element.value = config.colors[key];
                element.nextElementSibling.value = config.colors[key];
            }
        });
    }
}

// Save Changes
async function saveChanges() {
    try {
        showLoading();
        const token = sessionStorage.getItem(SESSION_KEY);
        
        // Collect all changes from the editor
        const updatedConfig = {
            hero: {
                title1: document.getElementById('hero-title-1').value,
                title2: document.getElementById('hero-title-2').value,
                title3: document.getElementById('hero-title-3').value,
                description: document.getElementById('hero-description').value,
                ctaText: document.getElementById('hero-cta').value
            },
            whyTrust: {
                title: document.getElementById('trust-title').value,
                efficiency: {
                    title: document.getElementById('efficiency-title').value,
                    text: document.getElementById('efficiency-text').value
                },
                overhead: {
                    title: document.getElementById('overhead-title').value,
                    text: document.getElementById('overhead-text').value
                },
                growth: {
                    title: document.getElementById('growth-title').value,
                    text: document.getElementById('growth-text').value
                }
            },
            colors: collectColors()
        };
        
        const response = await fetch(`${API_BASE_URL}/config`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedConfig)
        });
        
        hideLoading();
        
        if (response.ok) {
            showSuccess('Changes saved successfully!');
            currentConfig = updatedConfig;
        } else {
            showError('Failed to save changes. Please try again.');
        }
    } catch (error) {
        hideLoading();
        showError('Error saving changes.');
        console.error('Save error:', error);
    }
}

// Collect Color Values
function collectColors() {
    const colors = {};
    const colorInputs = document.querySelectorAll('[data-css-var]');
    
    colorInputs.forEach(input => {
        const varName = input.dataset.cssVar.replace('--', '');
        colors[varName] = input.value;
    });
    
    return colors;
}

// Preview Changes
function previewChanges() {
    const previewWindow = window.open('/', '_blank');
    
    // Wait for the page to load, then apply changes
    previewWindow.addEventListener('load', () => {
        // Apply content changes
        const changes = {
            '.hero-title-line1': document.getElementById('hero-title-1').value,
            '.hero-title-line2': document.getElementById('hero-title-2').value,
            '.hero-title-line3': document.getElementById('hero-title-3').value,
            '.hero-description': document.getElementById('hero-description').value
        };
        
        Object.keys(changes).forEach(selector => {
            const element = previewWindow.document.querySelector(selector);
            if (element) {
                element.textContent = changes[selector];
            }
        });
        
        // Apply color changes
        const colors = collectColors();
        Object.keys(colors).forEach(key => {
            previewWindow.document.documentElement.style.setProperty(`--${key}`, colors[key]);
        });
    });
}

// Section Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.editor-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem(SESSION_KEY);
        isAuthenticated = false;
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginForm').reset();
    }
}

// UI Helper Functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showError(message) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = message;
    successEl.style.display = 'block';
    
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
}

// Color Picker Sync
document.addEventListener('DOMContentLoaded', () => {
    // Sync color picker with text input
    document.querySelectorAll('input[type="color"]').forEach(colorInput => {
        colorInput.addEventListener('input', (e) => {
            const textInput = e.target.nextElementSibling;
            if (textInput && textInput.type === 'text') {
                textInput.value = e.target.value;
            }
        });
    });
    
    // Auto-save on input change (debounced)
    let saveTimeout;
    document.querySelectorAll('.text-input, .textarea-input').forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                // Optional: Auto-save indicator
                console.log('Changes detected');
            }, 1000);
        });
    });
});

// Check session on page load
window.addEventListener('load', () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    
    if (token) {
        // Verify token is still valid
        fetch(`${API_BASE_URL}/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if (response.ok) {
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                isAuthenticated = true;
                loadConfiguration();
            }
        });
    }
});

// Prevent accidental navigation
window.addEventListener('beforeunload', (e) => {
    if (isAuthenticated) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});
