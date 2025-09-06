/**
 * Theme Toggle for Premium E-Commerce Product Card
 * Author: Yassir Rzigui - Full-Stack Developer & E-Commerce Specialist
 * Handles dark/light theme switching with smooth transitions
 */

class ECommerceThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('ecommerce-theme') || 'light';
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.setupThemeTransitions();
        this.detectSystemPreference();
    }

    setupEventListeners() {
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    setupThemeTransitions() {
        // Add smooth transitions to theme-sensitive elements
        const transitionElements = [
            'body', '.product-card', '.header', '.footer',
            '.cart-button', '.buy-now-button', '.size-btn',
            '.quantity-btn', '.wishlist-btn', '.quick-view-btn'
        ];

        transitionElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element) {
                    element.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
                }
            });
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.animateThemeToggle();
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        
        // Update toggle button icon
        this.themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        this.themeToggle.setAttribute('aria-label', 
            theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
        );

        // Update theme colors
        this.updateThemeColors(theme);

        // Save preference
        localStorage.setItem('ecommerce-theme', theme);

        console.log(`Theme switched to ${theme} mode`);
    }

    updateThemeColors(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            // Dark theme colors
            root.style.setProperty('--bg-primary', '#0d1117');
            root.style.setProperty('--bg-secondary', '#161b22');
            root.style.setProperty('--bg-tertiary', '#21262d');
            root.style.setProperty('--text-primary', '#f0f6fc');
            root.style.setProperty('--text-secondary', '#8b949e');
            root.style.setProperty('--accent-primary', '#58a6ff');
            root.style.setProperty('--accent-secondary', '#21262d');
            root.style.setProperty('--border-color', '#30363d');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.4)');
            root.style.setProperty('--success-color', '#3fb950');
            root.style.setProperty('--warning-color', '#d29922');
            root.style.setProperty('--danger-color', '#f85149');
        } else {
            // Light theme colors
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f6f8fa');
            root.style.setProperty('--bg-tertiary', '#ffffff');
            root.style.setProperty('--text-primary', '#24292f');
            root.style.setProperty('--text-secondary', '#656d76');
            root.style.setProperty('--accent-primary', '#0969da');
            root.style.setProperty('--accent-secondary', '#f6f8fa');
            root.style.setProperty('--border-color', '#d0d7de');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--success-color', '#1a7f37');
            root.style.setProperty('--warning-color', '#9a6700');
            root.style.setProperty('--danger-color', '#cf222e');
        }
    }

    animateThemeToggle() {
        // Add rotation animation to toggle button
        this.themeToggle.style.transform = 'rotate(360deg) scale(1.1)';
        
        setTimeout(() => {
            this.themeToggle.style.transform = 'rotate(0deg) scale(1)';
        }, 300);

        // Add subtle flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.currentTheme === 'dark' ? '#000' : '#fff'};
            opacity: 0.1;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.2s ease;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 200);
        }, 100);
    }

    detectSystemPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Apply system preference if no saved preference
            if (!localStorage.getItem('ecommerce-theme')) {
                this.applyTheme(mediaQuery.matches ? 'dark' : 'light');
            }
            
            // Listen for system theme changes
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('ecommerce-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Auto theme based on time of day
    setAutoTheme() {
        const hour = new Date().getHours();
        const theme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        this.applyTheme(theme);
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Force theme (for external control)
    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.applyTheme(theme);
        }
    }

    // High contrast mode for accessibility
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('ecommerce-high-contrast', isHighContrast);
        
        if (isHighContrast) {
            this.applyHighContrastColors();
        } else {
            this.updateThemeColors(this.currentTheme);
        }
    }

    applyHighContrastColors() {
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', '#000000');
        root.style.setProperty('--bg-secondary', '#000000');
        root.style.setProperty('--bg-tertiary', '#1a1a1a');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#cccccc');
        root.style.setProperty('--accent-primary', '#ffff00');
        root.style.setProperty('--border-color', '#ffffff');
        root.style.setProperty('--shadow-color', 'rgba(255, 255, 255, 0.2)');
    }

    initHighContrast() {
        const isHighContrast = localStorage.getItem('ecommerce-high-contrast') === 'true';
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
            this.applyHighContrastColors();
        }
    }

    // Reduced motion for accessibility
    initReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            
            // Disable transitions for reduced motion
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ECommerceThemeManager();
    window.themeManager.initHighContrast();
    window.themeManager.initReducedMotion();
    
    console.log('E-Commerce Theme Manager initialized by Yassir Rzigui');
});
