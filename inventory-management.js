/**
 * Advanced Inventory Management System
 * Real-time stock tracking with predictive analytics
 * 
 * @author Yassir Rzigui
 * @version 2.0.0
 * @github https://github.com/yazzy01
 */

class InventoryManager {
    constructor() {
        this.products = new Map();
        this.stockAlerts = [];
        this.demandForecasting = new DemandForecast();
        this.init();
    }

    init() {
        this.loadInventoryData();
        this.setupStockMonitoring();
        this.initializePredictiveAnalytics();
        this.setupRealtimeUpdates();
    }

    loadInventoryData() {
        // Sample product data - in real app, load from API
        const sampleProducts = [
            {
                id: 'gabrielle-essence',
                name: 'Gabrielle Essence Eau De Parfum',
                sku: 'CHN-GAB-50ML',
                sizes: {
                    '30ml': { stock: 15, price: 99.99, reserved: 2 },
                    '50ml': { stock: 8, price: 149.99, reserved: 1 },
                    '100ml': { stock: 3, price: 199.99, reserved: 0 }
                },
                category: 'luxury-perfume',
                brand: 'Chanel',
                costPrice: 75.00,
                minStockLevel: 5,
                maxStockLevel: 50,
                reorderPoint: 10,
                supplier: 'Luxury Fragrances Inc',
                leadTime: 14, // days
                lastRestocked: new Date('2025-01-15'),
                popularity: 0.85,
                seasonalFactor: 1.2
            }
        ];

        sampleProducts.forEach(product => {
            this.products.set(product.id, product);
        });
    }

    getProductStock(productId, size = '50ml') {
        const product = this.products.get(productId);
        if (!product || !product.sizes[size]) return 0;
        
        return product.sizes[size].stock - product.sizes[size].reserved;
    }

    updateStock(productId, size, quantity, operation = 'subtract') {
        const product = this.products.get(productId);
        if (!product || !product.sizes[size]) return false;

        const currentStock = product.sizes[size].stock;
        const newStock = operation === 'add' ? 
            currentStock + quantity : 
            currentStock - quantity;

        if (newStock < 0) {
            this.triggerStockAlert(productId, size, 'insufficient_stock');
            return false;
        }

        product.sizes[size].stock = newStock;
        this.checkStockLevels(productId, size);
        this.updateUI(productId, size);
        this.logInventoryTransaction(productId, size, quantity, operation);
        
        return true;
    }

    reserveStock(productId, size, quantity) {
        const product = this.products.get(productId);
        if (!product || !product.sizes[size]) return false;

        const availableStock = this.getProductStock(productId, size);
        if (availableStock < quantity) return false;

        product.sizes[size].reserved += quantity;
        this.updateUI(productId, size);
        
        // Auto-release reservation after 15 minutes
        setTimeout(() => {
            this.releaseReservation(productId, size, quantity);
        }, 15 * 60 * 1000);

        return true;
    }

    releaseReservation(productId, size, quantity) {
        const product = this.products.get(productId);
        if (!product || !product.sizes[size]) return false;

        product.sizes[size].reserved = Math.max(0, product.sizes[size].reserved - quantity);
        this.updateUI(productId, size);
        return true;
    }

    checkStockLevels(productId, size) {
        const product = this.products.get(productId);
        if (!product || !product.sizes[size]) return;

        const currentStock = product.sizes[size].stock;
        const reorderPoint = product.reorderPoint;
        const minStock = product.minStockLevel;

        if (currentStock <= minStock) {
            this.triggerStockAlert(productId, size, 'critical_low_stock');
        } else if (currentStock <= reorderPoint) {
            this.triggerStockAlert(productId, size, 'reorder_needed');
        }
    }

    triggerStockAlert(productId, size, alertType) {
        const alert = {
            id: Date.now().toString(),
            productId,
            size,
            type: alertType,
            timestamp: new Date(),
            resolved: false
        };

        this.stockAlerts.push(alert);
        this.displayStockAlert(alert);
        
        // Auto-generate reorder suggestion
        if (alertType === 'reorder_needed') {
            this.generateReorderSuggestion(productId, size);
        }
    }

    generateReorderSuggestion(productId, size) {
        const product = this.products.get(productId);
        const demandForecast = this.demandForecasting.predictDemand(productId, size, 30);
        const leadTimeDemand = this.demandForecasting.predictDemand(productId, size, product.leadTime);
        
        const suggestedOrderQuantity = Math.ceil(
            (product.maxStockLevel - product.sizes[size].stock) + 
            (leadTimeDemand * 1.2) // Safety stock
        );

        const reorderSuggestion = {
            productId,
            size,
            currentStock: product.sizes[size].stock,
            suggestedQuantity: suggestedOrderQuantity,
            estimatedCost: suggestedOrderQuantity * product.costPrice,
            leadTime: product.leadTime,
            supplier: product.supplier,
            urgency: product.sizes[size].stock <= product.minStockLevel ? 'high' : 'medium'
        };

        this.displayReorderSuggestion(reorderSuggestion);
        return reorderSuggestion;
    }

    setupStockMonitoring() {
        // Real-time stock level monitoring
        setInterval(() => {
            this.products.forEach((product, productId) => {
                Object.keys(product.sizes).forEach(size => {
                    this.checkStockLevels(productId, size);
                });
            });
        }, 60000); // Check every minute

        // Update stock display every 30 seconds
        setInterval(() => {
            this.updateAllStockDisplays();
        }, 30000);
    }

    updateUI(productId, size) {
        const availableStock = this.getProductStock(productId, size);
        const stockDisplay = document.querySelector(`[data-stock-display="${productId}-${size}"]`);
        
        if (stockDisplay) {
            stockDisplay.textContent = availableStock;
            stockDisplay.className = this.getStockStatusClass(availableStock);
        }

        // Update size button availability
        const sizeButton = document.querySelector(`[data-size="${size}"]`);
        if (sizeButton) {
            if (availableStock === 0) {
                sizeButton.disabled = true;
                sizeButton.classList.add('out-of-stock');
                sizeButton.innerHTML += ' <span class="stock-status">Out of Stock</span>';
            } else if (availableStock <= 3) {
                sizeButton.classList.add('low-stock');
                sizeButton.innerHTML += ` <span class="stock-status">Only ${availableStock} left</span>`;
            }
        }

        // Update add to cart button
        const addToCartBtn = document.querySelector('.cart-button');
        if (addToCartBtn && availableStock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.classList.add('disabled');
        }
    }

    getStockStatusClass(stock) {
        if (stock === 0) return 'stock-out';
        if (stock <= 3) return 'stock-low';
        if (stock <= 10) return 'stock-medium';
        return 'stock-high';
    }

    displayStockAlert(alert) {
        const alertContainer = document.querySelector('.stock-alerts') || this.createAlertContainer();
        
        const alertElement = document.createElement('div');
        alertElement.className = `stock-alert alert-${alert.type}`;
        alertElement.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="alert-text">
                    <strong>${this.getAlertTitle(alert.type)}</strong>
                    <p>${this.getAlertMessage(alert)}</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        alertContainer.appendChild(alertElement);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alertElement.parentElement) {
                alertElement.remove();
            }
        }, 10000);
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.className = 'stock-alerts';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    getAlertTitle(type) {
        const titles = {
            'critical_low_stock': '🚨 Critical Stock Level',
            'reorder_needed': '📦 Reorder Required',
            'insufficient_stock': '❌ Insufficient Stock'
        };
        return titles[type] || 'Stock Alert';
    }

    getAlertMessage(alert) {
        const product = this.products.get(alert.productId);
        const productName = product ? product.name : alert.productId;
        
        const messages = {
            'critical_low_stock': `${productName} (${alert.size}) is critically low in stock!`,
            'reorder_needed': `Time to reorder ${productName} (${alert.size})`,
            'insufficient_stock': `Cannot fulfill order - insufficient ${productName} (${alert.size}) stock`
        };
        return messages[alert.type] || 'Stock level requires attention';
    }

    logInventoryTransaction(productId, size, quantity, operation) {
        const transaction = {
            id: Date.now().toString(),
            productId,
            size,
            quantity,
            operation,
            timestamp: new Date(),
            user: 'system' // In real app, get from auth
        };

        // Store in localStorage for demo (use database in production)
        const transactions = JSON.parse(localStorage.getItem('inventory_transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('inventory_transactions', JSON.stringify(transactions));
    }

    generateInventoryReport() {
        const report = {
            timestamp: new Date(),
            totalProducts: this.products.size,
            lowStockItems: [],
            outOfStockItems: [],
            reorderSuggestions: [],
            totalValue: 0
        };

        this.products.forEach((product, productId) => {
            Object.entries(product.sizes).forEach(([size, sizeData]) => {
                const availableStock = sizeData.stock - sizeData.reserved;
                const itemValue = availableStock * sizeData.price;
                report.totalValue += itemValue;

                if (availableStock === 0) {
                    report.outOfStockItems.push({ productId, size, product: product.name });
                } else if (availableStock <= product.minStockLevel) {
                    report.lowStockItems.push({ 
                        productId, 
                        size, 
                        product: product.name, 
                        currentStock: availableStock,
                        minLevel: product.minStockLevel
                    });
                }

                if (availableStock <= product.reorderPoint) {
                    report.reorderSuggestions.push(
                        this.generateReorderSuggestion(productId, size)
                    );
                }
            });
        });

        return report;
    }
}

class DemandForecast {
    constructor() {
        this.historicalData = this.loadHistoricalData();
    }

    loadHistoricalData() {
        // Simulated historical sales data
        return {
            'gabrielle-essence': {
                '30ml': [5, 7, 6, 8, 9, 7, 6, 5, 8, 9, 10, 8], // Last 12 periods
                '50ml': [10, 12, 11, 15, 16, 14, 12, 10, 15, 17, 18, 16],
                '100ml': [3, 4, 3, 5, 6, 5, 4, 3, 5, 6, 7, 5]
            }
        };
    }

    predictDemand(productId, size, days) {
        const historical = this.historicalData[productId]?.[size] || [5, 5, 5, 5, 5];
        const average = historical.reduce((sum, val) => sum + val, 0) / historical.length;
        
        // Simple linear trend calculation
        const trend = this.calculateTrend(historical);
        const seasonal = this.getSeasonalFactor();
        
        // Predict demand for the given period
        const dailyDemand = (average + trend) * seasonal / 30; // Convert monthly to daily
        return Math.ceil(dailyDemand * days);
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const n = data.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = data.reduce((sum, val) => sum + val, 0);
        const sumXY = data.reduce((sum, val, index) => sum + val * (index + 1), 0);
        const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    getSeasonalFactor() {
        const month = new Date().getMonth();
        // Higher demand during holiday seasons
        const seasonalFactors = [1.0, 1.4, 1.2, 1.0, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.3, 1.5];
        return seasonalFactors[month];
    }
}

// Initialize inventory management
const inventoryManager = new InventoryManager();

// Export for global use
window.InventoryManager = inventoryManager;

// Add stock information to UI
document.addEventListener('DOMContentLoaded', () => {
    // Add stock display to size buttons
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        const size = btn.dataset.size;
        const stock = inventoryManager.getProductStock('gabrielle-essence', size);
        
        if (stock <= 3 && stock > 0) {
            const stockSpan = document.createElement('span');
            stockSpan.className = 'stock-indicator low-stock';
            stockSpan.textContent = `(${stock} left)`;
            btn.appendChild(stockSpan);
        } else if (stock === 0) {
            btn.disabled = true;
            btn.classList.add('out-of-stock');
            btn.textContent += ' - Out of Stock';
        }
    });

    // Reserve stock when adding to cart
    const addToCartBtn = document.querySelector('.cart-button');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const selectedSize = document.querySelector('.size-btn.active')?.dataset.size || '50ml';
            const quantity = parseInt(document.querySelector('.quantity-input')?.value || 1);
            
            if (inventoryManager.reserveStock('gabrielle-essence', selectedSize, quantity)) {
                console.log(`Reserved ${quantity} units of ${selectedSize} size`);
            } else {
                alert('Sorry, insufficient stock available!');
            }
        });
    }
});

console.log('📦 Advanced Inventory Management System initialized by Yassir Rzigui');
console.log('📊 Real-time stock tracking and demand forecasting active');
console.log('💡 Access inventory report via: window.InventoryManager.generateInventoryReport()');
