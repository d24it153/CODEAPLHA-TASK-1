// app.js - Main frontend logic

// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = localStorage.getItem('username') || null;
let token = localStorage.getItem('token') || null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();
    updateCartCount();

    // Check current page to initialize specific logic
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        loadProducts();
    } else if (path.includes('product.html')) {
        loadProductDetail();
    } else if (path.includes('cart.html')) {
        renderCart();
    } else if (path.includes('orders.html')) {
        if (!token) window.location.href = 'login.html';
        loadOrders();
    }
});

// Update Navigation based on Auth state
function updateNavAuth() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    if (currentUser && token) {
        authLinks.innerHTML = `
            <a href="orders.html">My Orders</a>
            <span style="color: var(--text-muted);">Hi, ${currentUser}</span>
            <a href="#" onclick="logout(event)">Logout</a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}

function logout(e) {
    if(e) e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    currentUser = null;
    token = null;
    updateNavAuth();
    showToast('Logged out successfully');
    if (window.location.pathname.includes('orders.html') || window.location.pathname.includes('cart.html')) {
        window.location.href = 'index.html';
    }
}

// Fetch all products
async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        
        container.innerHTML = '';
        products.forEach(p => {
            container.innerHTML += `
                <div class="product-card">
                    <img src="${p.image}" alt="${p.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${p.name}</h3>
                        <p class="product-desc">${p.description}</p>
                        <div class="product-footer">
                            <span class="product-price">$${p.price.toFixed(2)}</span>
                            <button class="btn" onclick="viewProduct(${p.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error('Error loading products', err);
        container.innerHTML = '<p style="color: var(--danger)">Failed to load products.</p>';
    }
}

// Navigate to product detail
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// Load single product details
async function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('product-detail-container');
    
    if (!id || !container) return;

    try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const p = await res.json();
        
        container.innerHTML = `
            <img src="${p.image}" alt="${p.name}" class="detail-img">
            <div class="detail-info">
                <h1 class="detail-title">${p.name}</h1>
                <div class="detail-price">$${p.price.toFixed(2)}</div>
                <p class="detail-desc">${p.description}</p>
                <div style="display: flex; gap: 1rem; margin-top: auto;">
                    <button class="btn" style="flex-grow: 1" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.image}')">Add to Cart</button>
                    <button class="btn btn-outline" onclick="window.history.back()">Back</button>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = '<p style="color: var(--danger)">Product not found.</p>';
    }
}

// Cart Functions
function addToCart(id, name, price, image) {
    const existing = cart.find(item => item.productId === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId: id, name, price, image, quantity: 1 });
    }
    saveCart();
    showToast(`${name} added to cart!`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = total;
    if (total === 0) {
        countEl.style.display = 'none';
    } else {
        countEl.style.display = 'block';
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="index.html" style="color:var(--primary)">Continue shopping</a>.</p>';
        subtotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${index})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `;
    });

    subtotalEl.textContent = `$${total.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

async function checkout() {
    if (!token) {
        showToast('Please login to checkout', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: cart, totalPrice: total })
        });
        
        const data = await res.json();
        if (res.ok) {
            cart = [];
            saveCart();
            showToast('Order placed successfully!');
            setTimeout(() => window.location.href = 'orders.html', 1500);
        } else {
            showToast(data.error || 'Checkout failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

// Load Orders
async function loadOrders() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    try {
        const res = await fetch('/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                logout();
            }
            throw new Error('Failed to load orders');
        }
        
        const orders = await res.json();
        
        if (orders.length === 0) {
            container.innerHTML = '<p>You have no orders yet.</p>';
            return;
        }
        
        container.innerHTML = '';
        orders.forEach(o => {
            const date = new Date(o.created_at).toLocaleString();
            container.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${o.id}</span>
                        <span class="order-date">${date}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 1.25rem; font-weight: 700;">$${o.total_price.toFixed(2)}</div>
                        <div class="order-status">${o.status}</div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        container.innerHTML = '<p style="color: var(--danger)">Failed to load orders.</p>';
    }
}

// Authentication Handlers
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const btn = form.querySelector('button');
    
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = 'index.html';
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const btn = form.querySelector('button');
    
    btn.disabled = true;
    btn.textContent = 'Registering...';

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (res.ok) {
            showToast('Registration successful! Please login.');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            showToast(data.error || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Register';
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    if (type === 'error') {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
