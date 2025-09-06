/**
 * Premium E-Commerce Product Interactions
 * Author: Yassir Rzigui - Full-Stack Developer & E-Commerce Specialist
 * Email: rziguiyassir@gmail.com
 * GitHub: https://github.com/yazzy01
 * LinkedIn: https://linkedin.com/in/yassir-rzigui
 */

class PremiumProductCard {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.currentProduct = {
            id: 'gabrielle-perfume',
            name: 'Gabrielle Essence Eau De Parfum',
            basePrice: 149.99,
            originalPrice: 169.99,
            image: './chanel_gabrielle_perfume_50ml_1653231087_71f33caf.jpg',
            sizes: {
                '30ml': 119.99,
                '50ml': 149.99,
                '100ml': 249.99
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeQuantity();
        this.loadWishlistState();
        this.setupAnimations();
        this.initializeProductFeatures();
    }

    setupEventListeners() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuantityChange(e.target.closest('.quantity-btn').dataset.action);
            });
        });

        // Size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSizeChange(e.target.dataset.size);
            });
        });

        // Add to cart
        document.querySelector('.cart-button').addEventListener('click', () => {
            this.addToCart();
        });

        // Buy now
        document.querySelector('.buy-now-button').addEventListener('click', () => {
            this.buyNow();
        });

        // Wishlist
        document.querySelector('.wishlist-btn').addEventListener('click', () => {
            this.toggleWishlist();
        });

        // Quick view
        document.querySelector('.quick-view-btn').addEventListener('click', () => {
            this.openQuickView();
        });

        // Related products
        document.querySelectorAll('.mini-product-card').forEach(card => {
            card.addEventListener('click', () => {
                this.viewRelatedProduct(card);
            });
        });

        // Quantity input direct change
        document.querySelector('.quantity-input').addEventListener('change', (e) => {
            this.validateQuantityInput(e.target.value);
        });
    }

    handleQuantityChange(action) {
        const quantityInput = document.querySelector('.quantity-input');
        let currentQuantity = parseInt(quantityInput.value);

        if (action === 'increase' && currentQuantity < 10) {
            currentQuantity++;
        } else if (action === 'decrease' && currentQuantity > 1) {
            currentQuantity--;
        }

        quantityInput.value = currentQuantity;
        this.updateQuantityButtons(currentQuantity);
        this.animateQuantityChange();
    }

    validateQuantityInput(value) {
        const quantityInput = document.querySelector('.quantity-input');
        let quantity = parseInt(value);

        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        } else if (quantity > 10) {
            quantity = 10;
        }

        quantityInput.value = quantity;
        this.updateQuantityButtons(quantity);
    }

    updateQuantityButtons(quantity) {
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');

        minusBtn.disabled = quantity <= 1;
        plusBtn.disabled = quantity >= 10;

        minusBtn.classList.toggle('disabled', quantity <= 1);
        plusBtn.classList.toggle('disabled', quantity >= 10);
    }

    animateQuantityChange() {
        const quantityInput = document.querySelector('.quantity-input');
        quantityInput.style.transform = 'scale(1.1)';
        setTimeout(() => {
            quantityInput.style.transform = 'scale(1)';
        }, 150);
    }

    handleSizeChange(selectedSize) {
        // Update active size button
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-size="${selectedSize}"]`).classList.add('active');

        // Update price based on size
        const newPrice = this.currentProduct.sizes[selectedSize];
        this.updatePrice(newPrice);
        
        // Update product object
        this.currentProduct.selectedSize = selectedSize;
        this.currentProduct.currentPrice = newPrice;

        // Animate price change
        this.animatePriceChange();
    }

    updatePrice(newPrice) {
        const currentPriceElement = document.querySelector('.current-price');
        const originalPriceElement = document.querySelector('.original-price');
        const saveAmountElement = document.querySelector('.save-amount');
        
        const originalPrice = this.currentProduct.originalPrice;
        const discount = originalPrice - newPrice;
        
        currentPriceElement.textContent = `$${newPrice.toFixed(2)}`;
        saveAmountElement.textContent = `You save $${discount.toFixed(2)}`;
    }

    animatePriceChange() {
        const priceContainer = document.querySelector('.price-container');
        priceContainer.style.transform = 'scale(1.05)';
        priceContainer.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
        
        setTimeout(() => {
            priceContainer.style.transform = 'scale(1)';
            priceContainer.style.backgroundColor = 'transparent';
        }, 300);
    }

    addToCart() {
        const quantity = parseInt(document.querySelector('.quantity-input').value);
        const selectedSize = document.querySelector('.size-btn.active').dataset.size;
        
        const cartItem = {
            ...this.currentProduct,
            quantity: quantity,
            selectedSize: selectedSize,
            currentPrice: this.currentProduct.sizes[selectedSize],
            addedAt: new Date().toISOString()
        };

        // Check if item already exists in cart
        const existingItemIndex = this.cart.findIndex(item => 
            item.id === cartItem.id && item.selectedSize === cartItem.selectedSize
        );

        if (existingItemIndex > -1) {
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.showCartNotification();
        this.animateAddToCart();
        this.updateCartCounter();

        // Analytics
        this.trackAddToCart(cartItem);
    }

    buyNow() {
        this.addToCart();
        
        // Simulate redirect to checkout
        setTimeout(() => {
            this.showNotification('Redirecting to checkout...', 'info');
            // In a real application, this would redirect to checkout
            console.log('Redirecting to checkout with cart:', this.cart);
        }, 1000);
    }

    toggleWishlist() {
        const wishlistBtn = document.querySelector('.wishlist-btn');
        const heartIcon = wishlistBtn.querySelector('i');
        
        const isInWishlist = this.wishlist.includes(this.currentProduct.id);
        
        if (isInWishlist) {
            this.wishlist = this.wishlist.filter(id => id !== this.currentProduct.id);
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            this.showNotification('Removed from wishlist', 'info');
        } else {
            this.wishlist.push(this.currentProduct.id);
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            this.showNotification('Added to wishlist ❤️', 'success');
        }
        
        this.saveWishlist();
        this.animateWishlistButton();
    }

    animateWishlistButton() {
        const wishlistBtn = document.querySelector('.wishlist-btn');
        wishlistBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            wishlistBtn.style.transform = 'scale(1)';
        }, 200);
    }

    animateAddToCart() {
        const cartButton = document.querySelector('.cart-button');
        const originalText = cartButton.innerHTML;
        
        cartButton.innerHTML = '<i class="fas fa-check"></i> Added!';
        cartButton.classList.add('success');
        
        setTimeout(() => {
            cartButton.innerHTML = originalText;
            cartButton.classList.remove('success');
        }, 2000);
    }

    showCartNotification() {
        const notification = document.getElementById('cart-notification');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    openQuickView() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}">
                        </div>
                        <div class="modal-info">
                            <h2>${this.currentProduct.name}</h2>
                            <div class="modal-rating">
                                <div class="stars">
                                    ${'<i class="fas fa-star"></i>'.repeat(5)}
                                </div>
                                <span>(4.9) 127 reviews</span>
                            </div>
                            <p class="modal-description">
                                A floral, solar and voluptuous interpretation composed by Olivier Polge, 
                                Perfumer-Creator for the House of CHANEL. This exquisite fragrance captures 
                                the essence of femininity with its radiant and sensual composition.
                            </p>
                            <div class="modal-features">
                                <div class="feature">✓ 100% Authentic</div>
                                <div class="feature">✓ Free Shipping</div>
                                <div class="feature">✓ 30-Day Returns</div>
                            </div>
                            <button class="modal-cart-btn">Add to Cart - $${this.currentProduct.basePrice}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeQuickView(modal);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                this.closeQuickView(modal);
            }
        });
        
        modal.querySelector('.modal-cart-btn').addEventListener('click', () => {
            this.addToCart();
            this.closeQuickView(modal);
        });
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    closeQuickView(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    viewRelatedProduct(card) {
        const productName = card.querySelector('h3').textContent;
        this.showNotification(`Viewing ${productName}...`, 'info');
        
        // In a real application, this would navigate to the product page
        console.log('Navigating to:', productName);
    }

    initializeQuantity() {
        this.updateQuantityButtons(1);
    }

    loadWishlistState() {
        const isInWishlist = this.wishlist.includes(this.currentProduct.id);
        const heartIcon = document.querySelector('.wishlist-btn i');
        
        if (isInWishlist) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
        }
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.product-card, .related-products').forEach(el => {
            observer.observe(el);
        });

        // Hover effects for product features
        document.querySelectorAll('.feature').forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                feature.style.transform = 'translateY(-2px)';
            });
            
            feature.addEventListener('mouseleave', () => {
                feature.style.transform = 'translateY(0)';
            });
        });
    }

    initializeProductFeatures() {
        // Add hover effects to size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.transform = 'scale(1.05)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });

        // Initialize product image hover effect
        const productImage = document.querySelector('.product-image');
        productImage.addEventListener('mouseenter', () => {
            productImage.querySelector('.image-overlay').style.opacity = '1';
        });
        
        productImage.addEventListener('mouseleave', () => {
            productImage.querySelector('.image-overlay').style.opacity = '0';
        });
    }

    updateCartCounter() {
        // Update cart counter if it exists
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    // Analytics tracking
    trackAddToCart(item) {
        const event = {
            event: 'add_to_cart',
            product_id: item.id,
            product_name: item.name,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.currentPrice,
            timestamp: new Date().toISOString()
        };
        
        console.log('Analytics Event:', event);
        
        // In a real application, send to analytics service
        // gtag('event', 'add_to_cart', event);
    }

    // Keyboard accessibility
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.quick-view-modal');
                if (modal) {
                    this.closeQuickView(modal);
                }
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productCard = new PremiumProductCard();
    console.log('Premium Product Card initialized by Yassir Rzigui');
});
