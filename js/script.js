// --- Mock Product Catalogue Database ---
const products = [
    { id: 1, name: "NovaSound Headphones Pro", price: 129.99, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", rating: 4.5 },
    { id: 2, name: "Minimalist Leather Watch", price: 89.50, category: "Fashion", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", rating: 4.2 },
    { id: 3, name: "Ergonomic Office Chair", price: 199.99, category: "Home Decor", image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500", rating: 4.8 },
    { id: 4, name: "Ultra Gaming Mechanical Keyboard", price: 74.99, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", rating: 4.6 },
    { id: 5, name: "Classic Denim Jacket", price: 55.00, category: "Fashion", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500", rating: 4.0 },
    { id: 6, name: "Ceramic Minimalist Vase", price: 32.00, category: "Home Decor", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=500", rating: 4.3 }
];

// Initialize Cart State Memory
let cart = JSON.parse(localStorage.getItem('novashop_cart')) || [];

// Runs automatically upon window layout paint execution
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarCartCount();

    // Check which page context user environment is targeting
    if (document.getElementById('featured-grid')) {
        renderProducts(products.slice(0, 3), 'featured-grid');
    }
    if (document.getElementById('catalog-grid')) {
        renderProducts(products, 'catalog-grid');
        setupFilterListeners();
    }
    if (document.getElementById('cart-list')) {
        renderCartPage();
    }
});

// --- Dynamic Element Renderer Functions ---
function renderProducts(productsList, targetGridId) {
    const gridEl = document.getElementById(targetGridId);
    gridEl.innerHTML = "";

    if(productsList.length === 0) {
        gridEl.innerHTML = `<p class="no-products">No items found matching criteria.</p>`;
        return;
    }

    productsList.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <div class="wishlist-heart"><i class="far fa-heart"></i></div>
            <div class="product-img-wrapper">
                <img src="${prod.image}" alt="${prod.name}">
            </div>
            <div class="product-details-box">
                <div>
                    <h4 class="prod-title"><a href="product-details.html">${prod.name}</a></h4>
                    <div class="stars-row">
                        ${generateStarsHTML(prod.rating)} <span>(${prod.rating})</span>
                    </div>
                </div>
                <div class="price-row">
                    <span class="price-amt">$${prod.price.toFixed(2)}</span>
                    <button class="btn btn-primary" onclick="handleAddToCartClick(${prod.id})">
                        <i class="fas fa-shopping-cart"></i> Add
                    </button>
                </div>
            </div>
        `;
        gridEl.appendChild(card);
    });
}

function generateStarsHTML(rating) {
    let stars = '';
    for(let i = 1; i <= 5; i++) {
        if(i <= Math.floor(rating)) {
            stars += `<i class="fas fa-star"></i>`;
        } else if (i - 0.5 <= rating) {
            stars += `<i class="fas fa-star-half-alt"></i>`;
        } else {
            stars += `<i class="far fa-star"></i>`;
        }
    }
    return stars;
}

// --- Cart Core Engine Actions (Using LocalStorage) ---
function handleAddToCartClick(id) {
    const targetProduct = products.find(p => p.id === id);
    if(targetProduct) {
        addToCartWithQty(targetProduct, 1);
    }
}

function addToCartWithQty(product, qty) {
    const trackingIndex = cart.findIndex(item => item.id === product.id);

    if (trackingIndex > -1) {
        cart[trackingIndex].quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    syncCartStorage();
    showToastNotification(`${product.name} added to your cart!`);
}

function updateCartQuantity(id, changeValue) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += changeValue;
        if(item.quantity <= 0) {
            removeCartItem(id);
            return;
        }
        syncCartStorage();
        renderCartPage();
    }
}

function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    syncCartStorage();
    renderCartPage();
}

function syncCartStorage() {
    localStorage.setItem('novashop_cart', JSON.stringify(cart));
    updateNavbarCartCount();
}

function updateNavbarCartCount() {
    const countEl = document.getElementById('cart-count');
    if(countEl) {
        const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
        countEl.innerText = totalItems;
    }
}

// --- Cart Page Dynamic Panel Updating ---
function renderCartPage() {
    const listEl = document.getElementById('cart-list');
    const titleCountEl = document.getElementById('cart-title-count');
    
    if(!listEl) return;
    listEl.innerHTML = "";
    
    titleCountEl.innerText = cart.reduce((acc, curr) => acc + curr.quantity, 0);

    if(cart.length === 0) {
        listEl.innerHTML = `<p style="padding: 20px 0;">Your basket is currently empty. <a href="products.html" style="color:var(--primary-color); font-weight:600;">Go browsing items.</a></p>`;
        updateCartTotals(0);
        return;
    }

    cart.forEach(item => {
        const row = document.createElement('div');
        row.classList.add('cart-item');
        row.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="text-muted">Unit Price: $${item.price.toFixed(2)}</p>
                <button class="remove-btn" onclick="removeCartItem(${item.id})"><i class="fas fa-trash-alt"></i> Remove</button>
            </div>
            <div class="qty-selector">
                <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
            </div>
            <div style="font-weight:700; font-size:1.1rem; min-width:80px; text-align:right;">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        listEl.appendChild(row);
    });

    const runningSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    updateCartTotals(runningSubtotal);
}

function updateCartTotals(subtotal) {
    const subtotalEl = document.getElementById('subtotal-cost');
    const totalEl = document.getElementById('total-cost');
    if(subtotalEl && totalEl) {
        subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
        totalEl.innerText = `$${subtotal.toFixed(2)}`; // Matching values assuming free baseline parcel distribution standard
    }
}

// --- Filtering, Sorting, & Live Search Logic ---
function setupFilterListeners() {
    const searchInput = document.getElementById('product-search');
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const priceSortSelect = document.getElementById('price-sort');

    const executeCombinedFilters = () => {
        let processedList = [...products];

        // 1. Search Token Match Filter
        if(searchInput && searchInput.value.trim() !== "") {
            const query = searchInput.value.toLowerCase();
            processedList = processedList.filter(p => p.name.toLowerCase().includes(query));
        }

        // 2. Category Radio Filter
        const selectedCategory = document.querySelector('input[name="category"]:checked').value;
        if(selectedCategory !== "all") {
            processedList = processedList.filter(p => p.category === selectedCategory);
        }

        // 3. Sorting Execution Engine Rule
        const sortValue = priceSortSelect.value;
        if(sortValue === "low-high") {
            processedList.sort((a, b) => a.price - b.price);
        } else if (sortValue === "high-low") {
            processedList.sort((a, b) => b.price - a.price);
        }

        renderProducts(processedList, 'catalog-grid');
    };

    if(searchInput) searchInput.addEventListener('input', executeCombinedFilters);
    if(priceSortSelect) priceSortSelect.addEventListener('change', executeCombinedFilters);
    categoryRadios.forEach(radio => radio.addEventListener('change', executeCombinedFilters));
}

// --- UX Toast Alerts System ---
function showToastNotification(message) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = `<i class="fas fa-check-circle text-success"></i> ${message}`;
    
    container.appendChild(toast);
    
    // Automatically recycle and destroy element lifecycle hook
    setTimeout(() => {
        toast.remove();
    }, 3000);
}