/**
 * AI-Powered Product Recommendation Engine
 * Machine Learning-based personalization and cross-selling
 * 
 * @author Yassir Rzigui
 * @version 3.0.0
 * @github https://github.com/yazzy01
 */

class AIRecommendationEngine {
    constructor() {
        this.userProfile = this.initializeUserProfile();
        this.productCatalog = this.loadProductCatalog();
        this.behaviorTracker = new UserBehaviorTracker();
        this.mlModel = new RecommendationModel();
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.setupBehaviorTracking();
        this.generateRecommendations();
        this.setupRealtimePersonalization();
    }

    initializeUserProfile() {
        const stored = localStorage.getItem('user_profile');
        return stored ? JSON.parse(stored) : {
            id: this.generateUserId(),
            preferences: {
                fragrance_families: [],
                price_range: { min: 0, max: 1000 },
                brand_affinity: {},
                size_preference: '50ml',
                occasion_preference: []
            },
            behavior: {
                viewed_products: [],
                search_history: [],
                purchase_history: [],
                wishlist: [],
                session_time: 0,
                bounce_rate: 0
            },
            demographics: {
                age_group: null,
                gender: null,
                location: null
            },
            engagement_score: 0,
            last_active: new Date()
        };
    }

    loadProductCatalog() {
        return {
            'gabrielle-essence': {
                id: 'gabrielle-essence',
                name: 'Gabrielle Essence Eau De Parfum',
                brand: 'Chanel',
                price_range: { min: 99.99, max: 199.99 },
                fragrance_family: ['floral', 'oriental'],
                notes: {
                    top: ['jasmine', 'ylang-ylang', 'orange_blossom'],
                    middle: ['tuberose', 'jasmine_sambac'],
                    base: ['sandalwood', 'white_musk']
                },
                occasions: ['evening', 'special_occasion', 'romantic'],
                season: ['spring', 'summer'],
                longevity: 8, // hours
                sillage: 'moderate',
                popularity: 0.85,
                rating: 4.9,
                tags: ['luxury', 'feminine', 'sophisticated', 'floral']
            },
            'chanel-no5': {
                id: 'chanel-no5',
                name: 'Chanel No. 5',
                brand: 'Chanel',
                price_range: { min: 120, max: 250 },
                fragrance_family: ['aldehydic', 'floral'],
                notes: {
                    top: ['aldehydes', 'neroli', 'bergamot'],
                    middle: ['jasmine', 'rose', 'lily'],
                    base: ['vetiver', 'sandalwood', 'vanilla']
                },
                occasions: ['formal', 'evening', 'classic'],
                season: ['fall', 'winter'],
                longevity: 10,
                sillage: 'strong',
                popularity: 0.95,
                rating: 4.8,
                tags: ['iconic', 'timeless', 'elegant', 'aldehydic']
            },
            'coco-mademoiselle': {
                id: 'coco-mademoiselle',
                name: 'Coco Mademoiselle',
                brand: 'Chanel',
                price_range: { min: 110, max: 220 },
                fragrance_family: ['oriental', 'fresh'],
                notes: {
                    top: ['orange', 'bergamot', 'orange_blossom'],
                    middle: ['jasmine', 'rose', 'litchi'],
                    base: ['patchouli', 'vetiver', 'vanilla']
                },
                occasions: ['daily', 'office', 'casual'],
                season: ['spring', 'fall'],
                longevity: 7,
                sillage: 'moderate',
                popularity: 0.88,
                rating: 4.7,
                tags: ['modern', 'fresh', 'versatile', 'citrusy']
            }
        };
    }

    generateRecommendations(context = 'general') {
        const recommendations = {
            similar_products: this.getSimilarProducts(),
            complementary_products: this.getComplementaryProducts(),
            trending_products: this.getTrendingProducts(),
            personalized_picks: this.getPersonalizedRecommendations(),
            price_alternatives: this.getPriceAlternatives(),
            seasonal_recommendations: this.getSeasonalRecommendations()
        };

        this.displayRecommendations(recommendations, context);
        return recommendations;
    }

    getSimilarProducts() {
        const currentProduct = this.productCatalog['gabrielle-essence'];
        const similarities = [];

        Object.values(this.productCatalog).forEach(product => {
            if (product.id === currentProduct.id) return;

            let similarity = 0;
            
            // Brand similarity (high weight)
            if (product.brand === currentProduct.brand) similarity += 0.3;
            
            // Fragrance family similarity
            const commonFamilies = product.fragrance_family.filter(family => 
                currentProduct.fragrance_family.includes(family)
            ).length;
            similarity += (commonFamilies / Math.max(product.fragrance_family.length, currentProduct.fragrance_family.length)) * 0.25;
            
            // Price range similarity
            const priceDiff = Math.abs(product.price_range.min - currentProduct.price_range.min);
            similarity += Math.max(0, (100 - priceDiff) / 100) * 0.2;
            
            // Occasion similarity
            const commonOccasions = product.occasions.filter(occasion => 
                currentProduct.occasions.includes(occasion)
            ).length;
            similarity += (commonOccasions / Math.max(product.occasions.length, currentProduct.occasions.length)) * 0.15;
            
            // Rating similarity
            similarity += Math.max(0, (5 - Math.abs(product.rating - currentProduct.rating)) / 5) * 0.1;

            if (similarity > 0.3) {
                similarities.push({
                    product,
                    similarity_score: similarity,
                    reason: this.generateSimilarityReason(product, currentProduct)
                });
            }
        });

        return similarities.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 3);
    }

    getComplementaryProducts() {
        const user = this.userProfile;
        const currentProduct = this.productCatalog['gabrielle-essence'];
        
        // Products that complement the current selection
        const complementary = [];
        
        Object.values(this.productCatalog).forEach(product => {
            if (product.id === currentProduct.id) return;
            
            let complementScore = 0;
            
            // Different fragrance families for variety
            if (!product.fragrance_family.some(family => currentProduct.fragrance_family.includes(family))) {
                complementScore += 0.3;
            }
            
            // Different occasions
            if (!product.occasions.some(occasion => currentProduct.occasions.includes(occasion))) {
                complementScore += 0.25;
            }
            
            // Different seasons
            if (!product.season.some(season => currentProduct.season.includes(season))) {
                complementScore += 0.2;
            }
            
            // Price consideration
            if (product.price_range.min < currentProduct.price_range.max) {
                complementScore += 0.15;
            }
            
            // High rating
            if (product.rating >= 4.5) {
                complementScore += 0.1;
            }
            
            if (complementScore > 0.4) {
                complementary.push({
                    product,
                    complement_score: complementScore,
                    reason: this.generateComplementReason(product, currentProduct)
                });
            }
        });
        
        return complementary.sort((a, b) => b.complement_score - a.complement_score).slice(0, 2);
    }

    getTrendingProducts() {
        // Based on popularity and recent engagement
        return Object.values(this.productCatalog)
            .filter(p => p.id !== 'gabrielle-essence')
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 3)
            .map(product => ({
                product,
                trend_score: product.popularity,
                reason: `Trending with ${Math.round(product.popularity * 100)}% popularity`
            }));
    }

    getPersonalizedRecommendations() {
        const user = this.userProfile;
        const personalized = [];
        
        Object.values(this.productCatalog).forEach(product => {
            if (product.id === 'gabrielle-essence') return;
            
            let personalScore = 0;
            
            // Brand affinity
            if (user.preferences.brand_affinity[product.brand]) {
                personalScore += user.preferences.brand_affinity[product.brand] * 0.3;
            }
            
            // Price range preference
            if (product.price_range.min >= user.preferences.price_range.min && 
                product.price_range.max <= user.preferences.price_range.max) {
                personalScore += 0.25;
            }
            
            // Fragrance family preference
            const preferredFamilies = user.preferences.fragrance_families;
            if (preferredFamilies.some(family => product.fragrance_family.includes(family))) {
                personalScore += 0.2;
            }
            
            // Occasion preference
            if (user.preferences.occasion_preference.some(occ => product.occasions.includes(occ))) {
                personalScore += 0.15;
            }
            
            // Engagement score influence
            personalScore += (user.engagement_score / 100) * 0.1;
            
            if (personalScore > 0.3) {
                personalized.push({
                    product,
                    personal_score: personalScore,
                    reason: this.generatePersonalReason(product, user)
                });
            }
        });
        
        return personalized.sort((a, b) => b.personal_score - a.personal_score).slice(0, 3);
    }

    getPriceAlternatives() {
        const currentProduct = this.productCatalog['gabrielle-essence'];
        const alternatives = [];
        
        Object.values(this.productCatalog).forEach(product => {
            if (product.id === currentProduct.id) return;
            
            // Lower price alternatives
            if (product.price_range.max < currentProduct.price_range.min) {
                alternatives.push({
                    product,
                    type: 'budget_friendly',
                    savings: currentProduct.price_range.min - product.price_range.max,
                    reason: `Save $${Math.round(currentProduct.price_range.min - product.price_range.max)} with similar quality`
                });
            }
            
            // Higher price alternatives (luxury)
            if (product.price_range.min > currentProduct.price_range.max && product.rating >= currentProduct.rating) {
                alternatives.push({
                    product,
                    type: 'premium_upgrade',
                    additional_cost: product.price_range.min - currentProduct.price_range.max,
                    reason: `Premium upgrade with enhanced longevity and prestige`
                });
            }
        });
        
        return alternatives.slice(0, 2);
    }

    getSeasonalRecommendations() {
        const currentSeason = this.getCurrentSeason();
        const seasonal = [];
        
        Object.values(this.productCatalog).forEach(product => {
            if (product.id === 'gabrielle-essence') return;
            
            if (product.season.includes(currentSeason)) {
                seasonal.push({
                    product,
                    season: currentSeason,
                    reason: `Perfect for ${currentSeason} season`
                });
            }
        });
        
        return seasonal.sort((a, b) => b.product.rating - a.product.rating).slice(0, 2);
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    generateSimilarityReason(product, currentProduct) {
        const reasons = [];
        if (product.brand === currentProduct.brand) reasons.push('same brand');
        if (product.fragrance_family.some(f => currentProduct.fragrance_family.includes(f))) {
            reasons.push('similar fragrance profile');
        }
        if (Math.abs(product.rating - currentProduct.rating) < 0.3) reasons.push('similar rating');
        
        return `Similar because of ${reasons.join(' and ')}`;
    }

    generateComplementReason(product, currentProduct) {
        const reasons = [];
        if (!product.fragrance_family.some(f => currentProduct.fragrance_family.includes(f))) {
            reasons.push('different fragrance family for variety');
        }
        if (!product.occasions.some(o => currentProduct.occasions.includes(o))) {
            reasons.push('suitable for different occasions');
        }
        
        return `Complements your collection with ${reasons.join(' and ')}`;
    }

    generatePersonalReason(product, user) {
        const reasons = [];
        if (user.preferences.brand_affinity[product.brand]) reasons.push('your preferred brand');
        if (user.preferences.fragrance_families.some(f => product.fragrance_family.includes(f))) {
            reasons.push('matches your fragrance preferences');
        }
        
        return `Recommended based on ${reasons.join(' and ') || 'your browsing history'}`;
    }

    displayRecommendations(recommendations, context) {
        // Create or update recommendations container
        let container = document.querySelector('.ai-recommendations');
        if (!container) {
            container = document.createElement('section');
            container.className = 'ai-recommendations';
            
            // Insert after related products or at the end of main content
            const insertAfter = document.querySelector('.related-products') || 
                               document.querySelector('.main-content .container');
            if (insertAfter) {
                insertAfter.insertAdjacentElement('afterend', container);
            }
        }

        container.innerHTML = `
            <div class="recommendations-header">
                <h2><i class="fas fa-robot"></i> AI-Powered Recommendations</h2>
                <p>Personalized suggestions based on your preferences and behavior</p>
            </div>
            
            <div class="recommendation-categories">
                ${this.renderRecommendationCategory('Similar Products', recommendations.similar_products)}
                ${this.renderRecommendationCategory('Perfect Complements', recommendations.complementary_products)}
                ${this.renderRecommendationCategory('Trending Now', recommendations.trending_products)}
                ${this.renderRecommendationCategory('Just for You', recommendations.personalized_picks)}
                ${this.renderRecommendationCategory('Price Alternatives', recommendations.price_alternatives)}
                ${this.renderRecommendationCategory('Seasonal Picks', recommendations.seasonal_recommendations)}
            </div>
        `;

        // Add interaction tracking
        container.querySelectorAll('.recommendation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const productId = item.dataset.productId;
                this.trackRecommendationClick(productId, context);
            });
        });
    }

    renderRecommendationCategory(title, items) {
        if (!items || items.length === 0) return '';
        
        return `
            <div class="recommendation-category">
                <h3>${title}</h3>
                <div class="recommendation-items">
                    ${items.map(item => this.renderRecommendationItem(item)).join('')}
                </div>
            </div>
        `;
    }

    renderRecommendationItem(item) {
        const product = item.product;
        const confidence = Math.round((item.similarity_score || item.complement_score || item.personal_score || 0.8) * 100);
        
        return `
            <div class="recommendation-item" data-product-id="${product.id}">
                <div class="rec-image">
                    <div class="placeholder-image">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="confidence-badge">${confidence}% match</div>
                </div>
                <div class="rec-info">
                    <h4>${product.name}</h4>
                    <p class="rec-brand">${product.brand}</p>
                    <p class="rec-price">$${product.price_range.min} - $${product.price_range.max}</p>
                    <p class="rec-reason">${item.reason}</p>
                    <div class="rec-rating">
                        ${this.renderStars(product.rating)}
                        <span>(${product.rating})</span>
                    </div>
                    <button class="rec-btn" onclick="window.AIRecommendations.viewProduct('${product.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        return stars;
    }

    trackRecommendationClick(productId, context) {
        // Track recommendation effectiveness
        const clickData = {
            product_id: productId,
            context: context,
            timestamp: Date.now(),
            user_id: this.userProfile.id
        };
        
        // Store for analytics
        const clicks = JSON.parse(localStorage.getItem('recommendation_clicks') || '[]');
        clicks.push(clickData);
        localStorage.setItem('recommendation_clicks', JSON.stringify(clicks));
        
        // Update user preferences based on click
        this.updateUserPreferences(productId);
    }

    updateUserPreferences(productId) {
        const product = this.productCatalog[productId];
        if (!product) return;
        
        // Increase brand affinity
        if (!this.userProfile.preferences.brand_affinity[product.brand]) {
            this.userProfile.preferences.brand_affinity[product.brand] = 0;
        }
        this.userProfile.preferences.brand_affinity[product.brand] += 0.1;
        
        // Add fragrance families to preferences
        product.fragrance_family.forEach(family => {
            if (!this.userProfile.preferences.fragrance_families.includes(family)) {
                this.userProfile.preferences.fragrance_families.push(family);
            }
        });
        
        // Update engagement score
        this.userProfile.engagement_score = Math.min(100, this.userProfile.engagement_score + 5);
        
        // Save updated profile
        this.saveUserProfile();
    }

    saveUserProfile() {
        this.userProfile.last_active = new Date();
        localStorage.setItem('user_profile', JSON.stringify(this.userProfile));
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    viewProduct(productId) {
        // In a real app, navigate to product page
        console.log(`Viewing product: ${productId}`);
        alert(`Navigating to ${this.productCatalog[productId]?.name || productId} product page...`);
    }
}

class UserBehaviorTracker {
    constructor() {
        this.behaviors = [];
        this.init();
    }

    init() {
        this.trackScrollBehavior();
        this.trackTimeSpent();
        this.trackInteractions();
    }

    trackScrollBehavior() {
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            maxScroll = Math.max(maxScroll, scrollPercent);
        });

        window.addEventListener('beforeunload', () => {
            this.recordBehavior('scroll_depth', { max_scroll: maxScroll });
        });
    }

    trackTimeSpent() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.recordBehavior('time_on_page', { duration: timeSpent });
        });
    }

    trackInteractions() {
        document.addEventListener('click', (e) => {
            const element = e.target.closest('button, a, .clickable');
            if (element) {
                this.recordBehavior('interaction', {
                    element_type: element.tagName,
                    element_class: element.className,
                    element_text: element.textContent?.trim()
                });
            }
        });
    }

    recordBehavior(type, data) {
        this.behaviors.push({
            type,
            data,
            timestamp: Date.now()
        });
        
        // Store behaviors for analysis
        const stored = JSON.parse(localStorage.getItem('user_behaviors') || '[]');
        stored.push(...this.behaviors);
        localStorage.setItem('user_behaviors', JSON.stringify(stored.slice(-100))); // Keep last 100
        this.behaviors = [];
    }
}

class RecommendationModel {
    constructor() {
        this.weights = {
            similarity: 0.3,
            user_preference: 0.25,
            popularity: 0.2,
            price_sensitivity: 0.15,
            seasonal: 0.1
        };
    }

    calculateRecommendationScore(product, user, context) {
        let score = 0;
        
        // Add various scoring factors
        score += this.calculateSimilarityScore(product) * this.weights.similarity;
        score += this.calculateUserPreferenceScore(product, user) * this.weights.user_preference;
        score += product.popularity * this.weights.popularity;
        score += this.calculatePriceSensitivityScore(product, user) * this.weights.price_sensitivity;
        score += this.calculateSeasonalScore(product) * this.weights.seasonal;
        
        return Math.min(1, score);
    }

    calculateSimilarityScore(product) {
        // Implement similarity calculation logic
        return 0.7; // Placeholder
    }

    calculateUserPreferenceScore(product, user) {
        // Implement user preference scoring
        return 0.6; // Placeholder
    }

    calculatePriceSensitivityScore(product, user) {
        // Implement price sensitivity calculation
        return 0.8; // Placeholder
    }

    calculateSeasonalScore(product) {
        // Implement seasonal relevance scoring
        return 0.5; // Placeholder
    }
}

// Initialize AI Recommendations
const aiRecommendations = new AIRecommendationEngine();

// Export for global use
window.AIRecommendations = aiRecommendations;

// Auto-generate recommendations on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        aiRecommendations.generateRecommendations('page_load');
    }, 2000); // Delay to not interfere with page loading
});

console.log('🤖 AI-Powered Recommendation Engine initialized by Yassir Rzigui');
console.log('🎯 Machine Learning-based personalization active');
console.log('💡 Access recommendations via: window.AIRecommendations.generateRecommendations()');
