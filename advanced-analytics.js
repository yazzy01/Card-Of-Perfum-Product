/**
 * Advanced E-Commerce Analytics & User Behavior Tracking
 * Professional implementation for enterprise-level insights
 * 
 * @author Yassir Rzigui
 * @version 3.0.0
 * @github https://github.com/yazzy01
 */

class ECommerceAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.events = [];
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventListeners();
        this.trackUserBehavior();
        this.setupHeatmapTracking();
        this.trackPerformanceMetrics();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            event: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            ...properties
        };

        this.events.push(event);
        this.sendEvent(event);
        
        // Store in localStorage for offline capability
        this.storeEventLocally(event);
    }

    trackPageView() {
        this.trackEvent('page_view', {
            title: document.title,
            referrer: document.referrer,
            loadTime: performance.now()
        });
    }

    setupEventListeners() {
        // Product interactions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track]');
            if (target) {
                const trackingData = target.dataset.track;
                this.trackEvent('click', {
                    element: trackingData,
                    text: target.textContent?.trim() || '',
                    position: {
                        x: e.clientX,
                        y: e.clientY
                    }
                });
            }
        });

        // Form interactions
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('focus', () => {
                this.trackEvent('form_field_focus', {
                    fieldName: input.name || input.id,
                    fieldType: input.type
                });
            });

            input.addEventListener('blur', () => {
                this.trackEvent('form_field_blur', {
                    fieldName: input.name || input.id,
                    fieldValue: input.value ? 'filled' : 'empty'
                });
            });
        });

        // Scroll tracking
        let scrollDepth = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (currentScroll > scrollDepth && currentScroll % 25 === 0) {
                scrollDepth = currentScroll;
                this.trackEvent('scroll_depth', { depth: scrollDepth });
            }
        }, 1000));

        // Time on page
        setInterval(() => {
            this.trackEvent('time_on_page', {
                timeSpent: Date.now() - this.startTime
            });
        }, 30000); // Every 30 seconds
    }

    trackUserBehavior() {
        // Mouse movement heatmap
        let mousePositions = [];
        document.addEventListener('mousemove', this.throttle((e) => {
            mousePositions.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            });

            if (mousePositions.length > 100) {
                this.trackEvent('mouse_heatmap', {
                    positions: mousePositions
                });
                mousePositions = [];
            }
        }, 500));

        // Click heatmap
        document.addEventListener('click', (e) => {
            this.trackEvent('click_heatmap', {
                x: e.clientX,
                y: e.clientY,
                element: e.target.tagName,
                className: e.target.className
            });
        });

        // Exit intent detection
        document.addEventListener('mouseout', (e) => {
            if (e.clientY <= 0) {
                this.trackEvent('exit_intent', {
                    timeOnPage: Date.now() - this.startTime
                });
            }
        });
    }

    setupHeatmapTracking() {
        // Track element visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.trackEvent('element_visible', {
                        element: entry.target.id || entry.target.className,
                        visibilityRatio: entry.intersectionRatio
                    });
                }
            });
        }, { threshold: [0.25, 0.5, 0.75, 1.0] });

        // Observe key elements
        document.querySelectorAll('.product-card, .price-container, .button-container').forEach(el => {
            observer.observe(el);
        });
    }

    trackPerformanceMetrics() {
        // Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.trackEvent('lcp', { value: entry.startTime });
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.trackEvent('fid', { value: entry.processingStart - entry.startTime });
                }
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            new PerformanceObserver((entryList) => {
                let clsValue = 0;
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.trackEvent('cls', { value: clsValue });
            }).observe({ entryTypes: ['layout-shift'] });
        }

        // Resource timing
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.trackEvent('page_performance', {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
            });
        });
    }

    // E-commerce specific tracking
    trackProductView(productId, productName, price) {
        this.trackEvent('product_view', {
            productId,
            productName,
            price,
            currency: 'USD'
        });
    }

    trackAddToCart(productId, productName, price, quantity = 1) {
        this.trackEvent('add_to_cart', {
            productId,
            productName,
            price,
            quantity,
            currency: 'USD',
            value: price * quantity
        });
    }

    trackPurchaseIntent(productId, productName, price) {
        this.trackEvent('purchase_intent', {
            productId,
            productName,
            price,
            currency: 'USD'
        });
    }

    trackWishlistAdd(productId, productName) {
        this.trackEvent('wishlist_add', {
            productId,
            productName
        });
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    sendEvent(event) {
        // In a real implementation, send to analytics service
        // This is a demo implementation
        if (window.gtag) {
            window.gtag('event', event.event, event);
        }
        
        // Send to custom analytics endpoint
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics', JSON.stringify(event));
        } else {
            fetch('/api/analytics', {
                method: 'POST',
                body: JSON.stringify(event),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(() => {
                // Silently fail - don't break user experience
            });
        }
    }

    storeEventLocally(event) {
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        storedEvents.push(event);
        
        // Keep only last 100 events
        if (storedEvents.length > 100) {
            storedEvents.splice(0, storedEvents.length - 100);
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    }

    // Generate insights dashboard
    generateInsights() {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        
        const insights = {
            totalEvents: events.length,
            uniqueSessions: [...new Set(events.map(e => e.sessionId))].length,
            topEvents: this.getTopEvents(events),
            averageSessionDuration: this.getAverageSessionDuration(events),
            conversionFunnel: this.getConversionFunnel(events),
            heatmapData: this.getHeatmapData(events)
        };

        return insights;
    }

    getTopEvents(events) {
        const eventCounts = {};
        events.forEach(event => {
            eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        });
        
        return Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }

    getAverageSessionDuration(events) {
        const sessions = {};
        events.forEach(event => {
            if (!sessions[event.sessionId]) {
                sessions[event.sessionId] = { start: event.timestamp, end: event.timestamp };
            }
            sessions[event.sessionId].end = Math.max(sessions[event.sessionId].end, event.timestamp);
        });

        const durations = Object.values(sessions).map(session => session.end - session.start);
        return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    }

    getConversionFunnel(events) {
        const funnel = {
            pageViews: events.filter(e => e.event === 'page_view').length,
            productViews: events.filter(e => e.event === 'product_view').length,
            addToCarts: events.filter(e => e.event === 'add_to_cart').length,
            purchaseIntents: events.filter(e => e.event === 'purchase_intent').length
        };

        return funnel;
    }

    getHeatmapData(events) {
        return events.filter(e => e.event === 'click_heatmap')
                     .map(e => ({ x: e.x, y: e.y }));
    }
}

// Initialize analytics
const analytics = new ECommerceAnalytics();

// Export for global use
window.ECommerceAnalytics = analytics;

// Auto-track common e-commerce events
document.addEventListener('DOMContentLoaded', () => {
    // Track product view
    analytics.trackProductView('gabrielle-essence', 'Gabrielle Essence Eau De Parfum', 149.99);

    // Track add to cart button clicks
    const addToCartBtn = document.querySelector('.cart-button');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            analytics.trackAddToCart('gabrielle-essence', 'Gabrielle Essence Eau De Parfum', 149.99);
        });
    }

    // Track buy now button clicks
    const buyNowBtn = document.querySelector('.buy-now-button');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            analytics.trackPurchaseIntent('gabrielle-essence', 'Gabrielle Essence Eau De Parfum', 149.99);
        });
    }

    // Track wishlist interactions
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            analytics.trackWishlistAdd('gabrielle-essence', 'Gabrielle Essence Eau De Parfum');
        });
    }
});

console.log('🚀 Advanced E-Commerce Analytics initialized by Yassir Rzigui');
console.log('📊 Real-time user behavior tracking active');
console.log('💡 Access insights via: window.ECommerceAnalytics.generateInsights()');
