/**
 * Mobile Navigation Menu Script - FIXED VERSION
 * Handles hamburger menu toggle and smooth scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu elements if they don't exist
    initializeMobileMenu();
    
    // Get menu elements
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const navBackdrop = document.querySelector('.nav-backdrop');
    const hamburger = document.querySelector('.hamburger');
    
    if (!menuToggle || !mobileNavOverlay || !navBackdrop) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Toggle menu
    menuToggle.addEventListener('click', function() {
        toggleMenu();
    });
    
    // Close menu when backdrop is clicked
    navBackdrop.addEventListener('click', function() {
        closeMenu();
    });
    
    // Close menu when nav link is clicked
    const navLinks = mobileNavOverlay.querySelectorAll('a, span');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        }, 250);
    });
    
    // Prevent body scroll when menu is open
    function preventBodyScroll() {
        document.body.style.overflow = 'hidden';
    }
    
    function allowBodyScroll() {
        document.body.style.overflow = '';
    }
    
    function toggleMenu() {
        const isActive = mobileNavOverlay.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        mobileNavOverlay.classList.add('active');
        navBackdrop.classList.add('active');
        hamburger.classList.add('active');
        preventBodyScroll();
    }
    
    function closeMenu() {
        mobileNavOverlay.classList.remove('active');
        navBackdrop.classList.remove('active');
        hamburger.classList.remove('active');
        allowBodyScroll();
    }
});

/**
 * Initialize mobile menu structure
 */
function initializeMobileMenu() {
    // Check if mobile menu already exists
    if (document.querySelector('.mobile-nav-overlay')) {
        return;
    }
    
    // Get the header element
    const header = document.querySelector('header');
    if (!header) {
        console.warn('Header element not found');
        return;
    }
    
    // Get existing navigation links
    const desktopNav = header.querySelector('nav');
    if (!desktopNav) {
        console.warn('Desktop navigation not found');
        return;
    }
    
    // Create hamburger menu button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    menuToggle.innerHTML = `
        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    
    // Create mobile navigation overlay
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav-overlay';
    
    // Clone desktop navigation
    const mobileNavContent = document.createElement('nav');
    const navItems = desktopNav.querySelectorAll('span, a');
    
    navItems.forEach(item => {
        const clonedItem = item.cloneNode(true);
        mobileNavContent.appendChild(clonedItem);
    });
    
    mobileNav.appendChild(mobileNavContent);
    
    // Add "Get Started" button to mobile menu
    const getStartedBtn = header.querySelector('button[onclick*="scrollToForm"]');
    if (getStartedBtn) {
        const mobileGetStarted = document.createElement('a');
        mobileGetStarted.href = '#';
        mobileGetStarted.textContent = '🚀 Get Started';
        mobileGetStarted.style.cssText = `
            display: block;
            margin: 20px 30px;
            padding: 14px 24px;
            background: linear-gradient(135deg, #60a5fa 0%, #ec4899 100%);
            color: white;
            text-align: center;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
        `;
        mobileGetStarted.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToForm();
        });
        mobileNav.appendChild(mobileGetStarted);
    }
    
    // Insert hamburger button into header
    const headerContainer = header.querySelector('.flex.items-center.justify-between');
    if (headerContainer) {
        const rightSection = headerContainer.querySelector('.flex.items-center.space-x-4');
        if (rightSection) {
            rightSection.insertBefore(menuToggle, rightSection.firstChild);
        }
    }
    
    // Add mobile nav and backdrop to body
    document.body.appendChild(backdrop);
    document.body.appendChild(mobileNav);
}

/**
 * Smooth scroll to form section
 */
function scrollToForm() {
    const formSection = document.getElementById('form-section') || 
                       document.getElementById('get-blueprint') ||
                       document.querySelector('form');
    
    if (formSection) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 80;
        const targetPosition = formSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Handle smooth scrolling for navigation links
 * FIXED: Now works with regular spans without onclick attribute
 */
document.addEventListener('click', function(e) {
    const target = e.target;
    
    // FIXED: Check if it's any navigation link (span or a tag inside nav)
    // Changed from: target.matches('nav span[onclick], nav a[href^="#"]')
    // To: target.matches('.mobile-nav-overlay nav span, .mobile-nav-overlay nav a, header nav span, header nav a')
    if (target.closest('nav') && (target.tagName === 'SPAN' || target.tagName === 'A')) {
        e.preventDefault();
        
        const text = target.textContent.toLowerCase().trim();
        let targetSection = null;
        
        console.log('Clicked navigation item:', text); // Debug logging
        
        // Map navigation items to sections
        if (text.includes('solution')) {
            targetSection = document.getElementById('features-showcase') || 
                          document.getElementById('why-revamply');
        } else if (text.includes('process')) {
            targetSection = document.getElementById('process');
        } else if (text.includes('about')) {
            targetSection = document.getElementById('social-proof') || 
                          document.querySelector('section[class*="about"]');
        } else if (text.includes('contact')) {
            targetSection = document.getElementById('final-cta') || 
                          document.getElementById('footer');
        }
        
        if (targetSection) {
            console.log('Scrolling to section:', targetSection.id); // Debug logging
            const headerHeight = document.querySelector('header')?.offsetHeight || 80;
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn('Target section not found for:', text); // Debug logging
        }
    }
});

/**
 * Add scroll-to-top functionality
 */
function addScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #60a5fa 0%, #ec4899 100%);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 900;
        box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top on mobile
if (window.innerWidth <= 768) {
    addScrollToTop();
}
