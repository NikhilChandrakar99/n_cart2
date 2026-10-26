/**
 * N_cart eCommerce Frontend Application Logic
 * Modular full-stack integration connecting static HTML pages with Express REST APIs.
 */

'use strict';

// ============================================================================
// 1. API Client
// ============================================================================
const NCartAPI = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `HTTP Error ${response.status}`);
        error.status = response.status;
        error.errors = data.errors || [];
        error.errorCode = data.errorCode || null;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  },

  // Products
  getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/products${qs}`);
  },

  getFeaturedProducts() {
    return this.request('/products/featured');
  },

  getProductById(id) {
    return this.request(`/products/${id}`);
  },

  // Categories
  getCategories() {
    return this.request('/categories');
  },

  // Cart
  getCart() {
    return this.request('/cart');
  },

  addToCart(payload) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateCartQuantity(productId, quantity, size = null) {
    return this.request(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, size })
    });
  },

  removeFromCart(productId, size = null) {
    const qs = size ? `?size=${encodeURIComponent(size)}` : '';
    return this.request(`/cart/items/${productId}${qs}`, {
      method: 'DELETE'
    });
  },

  clearCart() {
    return this.request('/cart', {
      method: 'DELETE'
    });
  },

  // Wishlist
  getWishlist() {
    return this.request('/wishlist');
  },

  addToWishlist(productId) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  removeFromWishlist(productId) {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE'
    });
  },

  // Orders
  createOrder(orderPayload) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  getOrderById(id) {
    return this.request(`/orders/${id}`);
  },

  // Contact
  submitContact(contactPayload) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactPayload)
    });
  }
};

// ============================================================================
// 2. Toast Notification Manager
// ============================================================================
const ToastManager = {
  container: null,

  init() {
    if (!this.container) {
      let el = document.getElementById('nc-toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'nc-toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show({ title, message, type = 'success', duration = 3500 }) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `nc-toast ${type}`;

    let iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'info') iconClass = 'fa-info-circle';

    toast.innerHTML = `
      <div class="nc-toast-icon"><i class="fas ${iconClass}"></i></div>
      <div class="nc-toast-content">
        <div class="nc-toast-title">${title || (type === 'error' ? 'Error' : 'Notification')}</div>
        <div class="nc-toast-message">${message || ''}</div>
      </div>
      <button type="button" class="nc-toast-close" aria-label="Close">&times;</button>
    `;

    const closeBtn = toast.querySelector('.nc-toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  },

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  success(message, title = 'Success') {
    this.show({ title, message, type: 'success' });
  },

  error(message, title = 'Action Failed') {
    this.show({ title, message, type: 'error' });
  },

  info(message, title = 'Information') {
    this.show({ title, message, type: 'info' });
  }
};

// ============================================================================
// 2.5 UI Helpers (Safe Modals and Standalone Offcanvas Drawers)
// ============================================================================
const UIHelper = {
  openDrawer(drawerId) {
    const el = document.getElementById(drawerId);
    if (!el) return;
    el.classList.add('show');
    let backdrop = document.getElementById(drawerId + '-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = drawerId + '-backdrop';
      backdrop.className = 'offcanvas-backdrop-custom show';
      backdrop.addEventListener('click', () => this.closeDrawer(drawerId));
      document.body.appendChild(backdrop);
    } else {
      backdrop.classList.add('show');
    }
    document.body.style.overflow = 'hidden';
  },

  closeDrawer(drawerId) {
    const el = document.getElementById(drawerId);
    if (el) el.classList.remove('show');
    const backdrop = document.getElementById(drawerId + '-backdrop');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
  },

  getModalInstance(modalEl) {
    if (!modalEl || !window.bootstrap || typeof bootstrap.Modal !== 'function') return null;
    if (typeof bootstrap.Modal.getInstance === 'function') {
      const inst = bootstrap.Modal.getInstance(modalEl);
      if (inst) return inst;
    }
    return new bootstrap.Modal(modalEl);
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    const inst = this.getModalInstance(el);
    if (inst) {
      inst.show();
    } else {
      el.classList.add('show');
      el.style.display = 'block';
    }
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    const inst = this.getModalInstance(el);
    if (inst) {
      inst.hide();
    } else {
      el.classList.remove('show');
      el.style.display = 'none';
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    }
  }
};

// ============================================================================
// 3. UI Injections (Cart Offcanvas, Modals, Wishlist)
// ============================================================================
const UIInjections = {
  injectModals() {
    // 1. Cart Offcanvas Drawer
    if (!document.getElementById('offcanvasCart')) {
      const cartHtml = `
        <div class="offcanvas offcanvas-end offcanvas-cart" tabindex="-1" id="offcanvasCart" aria-labelledby="offcanvasCartLabel">
          <div class="offcanvas-header border-bottom">
            <h5 class="offcanvas-title d-flex align-items-center" id="offcanvasCartLabel">
              <i class="fas fa-shopping-bag text-success me-2"></i> Your Cart
              <span class="badge bg-success ms-2 cart-drawer-count">0</span>
            </h5>
            <button type="button" class="btn-close text-reset" onclick="UIHelper.closeDrawer('offcanvasCart')" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body p-3" id="cart-drawer-items">
            <!-- Dynamic Cart Items -->
          </div>
          <div class="cart-drawer-footer" id="cart-drawer-footer">
            <div class="cart-summary-line">
              <span>Subtotal:</span>
              <span id="cart-drawer-subtotal">$0.00</span>
            </div>
            <div class="cart-summary-line">
              <span>Estimated Tax (8%):</span>
              <span id="cart-drawer-tax">$0.00</span>
            </div>
            <div class="cart-summary-line">
              <span>Shipping:</span>
              <span id="cart-drawer-shipping">Free</span>
            </div>
            <div class="cart-summary-line total">
              <span>Grand Total:</span>
              <span class="text-success" id="cart-drawer-total">$0.00</span>
            </div>
            <div class="d-grid gap-2 mt-3">
              <button class="btn btn-success btn-lg" id="btn-proceed-checkout">
                <i class="fas fa-lock me-1"></i> Proceed to Checkout
              </button>
              <button class="btn btn-outline-danger btn-sm" id="btn-clear-cart">
                <i class="fas fa-trash-alt me-1"></i> Clear Cart
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', cartHtml);
    }

    // 2. Wishlist Offcanvas Drawer
    if (!document.getElementById('offcanvasWishlist')) {
      const wishlistHtml = `
        <div class="offcanvas offcanvas-end offcanvas-cart" tabindex="-1" id="offcanvasWishlist" aria-labelledby="offcanvasWishlistLabel">
          <div class="offcanvas-header border-bottom">
            <h5 class="offcanvas-title d-flex align-items-center" id="offcanvasWishlistLabel">
              <i class="fas fa-heart text-danger me-2"></i> Your Wishlist
              <span class="badge bg-danger ms-2 wishlist-drawer-count">0</span>
            </h5>
            <button type="button" class="btn-close text-reset" onclick="UIHelper.closeDrawer('offcanvasWishlist')" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body p-3" id="wishlist-drawer-items">
            <!-- Dynamic Wishlist Items -->
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', wishlistHtml);
    }

    // 3. Quick View Modal
    if (!document.getElementById('quickViewModal')) {
      const qvHtml = `
        <div class="modal fade" id="quickViewModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header border-0 pb-0">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4 pt-1" id="quickViewContent">
                <!-- Dynamic Quick View Content -->
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', qvHtml);
    }

    // 4. Checkout Modal
    if (!document.getElementById('checkoutModal')) {
      const checkoutHtml = `
        <div class="modal fade" id="checkoutModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="checkoutModalTitle">
                  <i class="fas fa-shield-alt text-success me-2"></i> Secure Checkout
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="checkout-modal-close-btn"></button>
              </div>
              <div class="modal-body p-4" id="checkoutModalBody">
                <form id="checkoutForm" novalidate>
                  <div class="row g-3">
                    <div class="col-12">
                      <h6 class="text-success border-bottom pb-2">1. Customer Information</h6>
                    </div>
                    <div class="col-md-6">
                      <label for="orderName" class="form-label">Full Name *</label>
                      <input type="text" class="form-control" id="orderName" required placeholder="John Doe">
                      <div class="invalid-feedback">Please enter your full name (min 2 chars).</div>
                    </div>
                    <div class="col-md-6">
                      <label for="orderEmail" class="form-label">Email Address *</label>
                      <input type="email" class="form-control" id="orderEmail" required placeholder="john@example.com">
                      <div class="invalid-feedback">Please provide a valid email.</div>
                    </div>
                    <div class="col-md-6">
                      <label for="orderPhone" class="form-label">Phone Number</label>
                      <input type="tel" class="form-control" id="orderPhone" placeholder="+1 (555) 000-0000">
                    </div>
                    <div class="col-md-6">
                      <label for="orderPayment" class="form-label">Payment Method *</label>
                      <select class="form-select" id="orderPayment">
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="card">Credit / Debit Card (Mock)</option>
                        <option value="upi">UPI / Instant Pay (Mock)</option>
                      </select>
                    </div>

                    <div class="col-12 mt-4">
                      <h6 class="text-success border-bottom pb-2">2. Shipping Address</h6>
                    </div>
                    <div class="col-12">
                      <label for="orderAddress" class="form-label">Street Address *</label>
                      <input type="text" class="form-control" id="orderAddress" required placeholder="123 Shopping Avenue, Suite 400">
                      <div class="invalid-feedback">Please enter your shipping address.</div>
                    </div>
                    <div class="col-md-6">
                      <label for="orderCity" class="form-label">City *</label>
                      <input type="text" class="form-control" id="orderCity" required placeholder="Metropolis">
                      <div class="invalid-feedback">City is required.</div>
                    </div>
                    <div class="col-md-6">
                      <label for="orderPostal" class="form-label">Postal / ZIP Code *</label>
                      <input type="text" class="form-control" id="orderPostal" required placeholder="10001">
                      <div class="invalid-feedback">Postal code is required.</div>
                    </div>
                    <div class="col-12">
                      <label for="orderNotes" class="form-label">Delivery Instructions (Optional)</label>
                      <textarea class="form-control" id="orderNotes" rows="2" placeholder="e.g. Ring the bell twice"></textarea>
                    </div>
                  </div>

                  <div class="order-summary-box bg-light p-3 rounded mt-4 border">
                    <div class="d-flex justify-content-between mb-1">
                      <span>Total Items:</span>
                      <strong id="checkout-summary-items">0</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Order Subtotal:</span>
                      <strong id="checkout-summary-subtotal">$0.00</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Shipping:</span>
                      <strong id="checkout-summary-shipping">Free</strong>
                    </div>
                    <div class="d-flex justify-content-between pt-2 border-top">
                      <span class="h5 mb-0">Total Due:</span>
                      <span class="h5 text-success mb-0" id="checkout-summary-total">$0.00</span>
                    </div>
                  </div>

                  <div class="d-grid mt-4">
                    <button type="submit" class="btn btn-success btn-lg" id="btn-submit-order">
                      <span class="spinner-border spinner-border-sm me-2 d-none" id="order-spinner"></span>
                      Place Order Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', checkoutHtml);
    }
  }
};

// ============================================================================
// 4. Cart State & Drawer Controller
// ============================================================================
const CartController = {
  currentCart: { items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 },
  syncPromise: null,

  sync() {
    this.syncPromise = NCartAPI.getCart()
      .then(data => {
        this.currentCart = data.data || data;
        this.render();
        return this.currentCart;
      })
      .catch(err => {
        console.warn('Could not sync cart with backend:', err.message);
        return this.currentCart;
      });
    return this.syncPromise;
  },

  updateNavbarBadges() {
    const count = this.currentCart.itemCount || 0;
    document.querySelectorAll('.badge-cart-count, .cart-counter-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'inline-block';
    });
  },

  render() {
    this.updateNavbarBadges();

    const itemsContainer = document.getElementById('cart-drawer-items');
    const footer = document.getElementById('cart-drawer-footer');
    const countBadge = document.querySelector('.cart-drawer-count');

    if (countBadge) {
      countBadge.textContent = this.currentCart.itemCount || 0;
    }

    if (!itemsContainer) return;

    if (!this.currentCart.items || this.currentCart.items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state-box">
          <i class="fas fa-shopping-basket"></i>
          <h5>Your cart is empty</h5>
          <p class="text-muted small">Explore our collection and add your favorite items!</p>
          <a href="shop.html" class="btn btn-success btn-sm mt-2" data-bs-dismiss="offcanvas">
            Start Shopping
          </a>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    let html = '';
    this.currentCart.items.forEach(item => {
      html += `
        <div class="cart-item-row" data-id="${item.productId}">
          <img src="${item.image || 'assets/img/shop_01.jpg'}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">
              Size: ${item.size || 'Standard'} &bull; $${Number(item.price).toFixed(2)}
            </div>
            <div class="cart-qty-control">
              <button class="cart-qty-btn btn-cart-minus" data-id="${item.productId}" data-size="${item.size || ''}">-</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn btn-cart-plus" data-id="${item.productId}" data-size="${item.size || ''}">+</button>
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold mb-2">$${Number(item.subtotal || item.price * item.quantity).toFixed(2)}</div>
            <button class="cart-item-remove btn-cart-remove" data-id="${item.productId}" data-size="${item.size || ''}" title="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    });

    itemsContainer.innerHTML = html;

    // Update financial lines
    const subtotalEl = document.getElementById('cart-drawer-subtotal');
    const taxEl = document.getElementById('cart-drawer-tax');
    const shippingEl = document.getElementById('cart-drawer-shipping');
    const totalEl = document.getElementById('cart-drawer-total');

    if (subtotalEl) subtotalEl.textContent = `$${Number(this.currentCart.subtotal || 0).toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${Number(this.currentCart.tax || 0).toFixed(2)}`;
    if (shippingEl) {
      shippingEl.textContent = this.currentCart.shipping === 0 ? 'Free' : `$${Number(this.currentCart.shipping).toFixed(2)}`;
    }
    if (totalEl) totalEl.textContent = `$${Number(this.currentCart.total || 0).toFixed(2)}`;

    // Attach listeners
    itemsContainer.querySelectorAll('.btn-cart-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        const item = this.currentCart.items.find(i => i.productId === id && (!size || i.size === size));
        if (item) {
          this.updateQuantity(id, item.quantity - 1, size);
        }
      });
    });

    itemsContainer.querySelectorAll('.btn-cart-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        const item = this.currentCart.items.find(i => i.productId === id && (!size || i.size === size));
        if (item) {
          this.updateQuantity(id, item.quantity + 1, size);
        }
      });
    });

    itemsContainer.querySelectorAll('.btn-cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        this.removeItem(id, size);
      });
    });
  },

  async addItem(productId, quantity = 1, size = 'Standard', color = 'Default') {
    try {
      const res = await NCartAPI.addToCart({ productId, quantity, size, color });
      this.currentCart = res.data || res;
      this.render();
      ToastManager.success('Item added to shopping cart!');
      this.openDrawer();
    } catch (err) {
      ToastManager.error(err.message || 'Could not add item to cart.');
    }
  },

  async updateQuantity(productId, quantity, size = null) {
    try {
      const res = await NCartAPI.updateCartQuantity(productId, quantity, size);
      this.currentCart = res.data || res;
      this.render();
    } catch (err) {
      ToastManager.error(err.message || 'Failed to update item quantity.');
    }
  },

  async removeItem(productId, size = null) {
    try {
      const res = await NCartAPI.removeFromCart(productId, size);
      this.currentCart = res.data || res;
      this.render();
      ToastManager.info('Item removed from cart.');
    } catch (err) {
      ToastManager.error(err.message || 'Failed to remove item.');
    }
  },

  async clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
      const res = await NCartAPI.clearCart();
      this.currentCart = res.data || res;
      this.render();
      ToastManager.info('Shopping cart cleared.');
    } catch (err) {
      ToastManager.error(err.message || 'Failed to clear cart.');
    }
  },

  openDrawer() {
    UIHelper.openDrawer('offcanvasCart');
  }
};

// ============================================================================
// 5. Wishlist Controller
// ============================================================================
const WishlistController = {
  items: [],
  syncPromise: null,

  sync() {
    this.syncPromise = NCartAPI.getWishlist()
      .then(res => {
        this.items = res.data || [];
        this.render();
        return this.items;
      })
      .catch(err => {
        console.warn('Could not sync wishlist:', err.message);
        return [];
      });
    return this.syncPromise;
  },

  isWishlisted(productId) {
    return this.items.some(i => i.productId === productId || i.id === productId);
  },

  updateNavbarBadges() {
    const count = this.items.length;
    document.querySelectorAll('.badge-wishlist-count, .wishlist-counter-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'inline-block';
    });
  },

  render() {
    this.updateNavbarBadges();

    // Update heart icons across product cards
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      const id = btn.getAttribute('data-id');
      if (this.isWishlisted(id)) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i>';
      }
    });

    // Render Wishlist Drawer
    const container = document.getElementById('wishlist-drawer-items');
    const countBadge = document.querySelector('.wishlist-drawer-count');
    if (countBadge) countBadge.textContent = this.items.length;

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="far fa-heart"></i>
          <h5>Your wishlist is empty</h5>
          <p class="text-muted small">Tap the heart icon on any product to save items you love!</p>
          <a href="shop.html" class="btn btn-success btn-sm mt-2" data-bs-dismiss="offcanvas">
            Browse Products
          </a>
        </div>
      `;
      return;
    }

    let html = '';
    this.items.forEach(item => {
      html += `
        <div class="cart-item-row" data-id="${item.productId}">
          <img src="${item.image || 'assets/img/shop_01.jpg'}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">$${Number(item.price).toFixed(2)}</div>
            <button class="btn btn-sm btn-outline-success btn-wishlist-to-cart py-0 px-2 mt-1" data-id="${item.productId}">
              <i class="fas fa-cart-plus me-1"></i> Add to Cart
            </button>
          </div>
          <button class="cart-item-remove btn-wishlist-remove ms-2" data-id="${item.productId}" title="Remove from Wishlist">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-wishlist-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        CartController.addItem(id, 1);
      });
    });

    container.querySelectorAll('.btn-wishlist-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.toggle(id);
      });
    });
  },

  async toggle(productId) {
    if (this.syncPromise) {
      await this.syncPromise;
    }

    if (this.isWishlisted(productId)) {
      try {
        await NCartAPI.removeFromWishlist(productId);
        this.items = this.items.filter(i => i.productId !== productId && i.id !== productId);
        this.render();
        ToastManager.info('Item removed from wishlist.');
      } catch (err) {
        ToastManager.error(err.message || 'Failed to remove from wishlist.');
      }
    } else {
      try {
        const res = await NCartAPI.addToWishlist(productId);
        const item = res.data || { productId, id: productId };
        if (!this.items.some(i => i.productId === productId || i.id === productId)) {
          this.items.push(item);
        }
        this.render();
        ToastManager.success('Item saved to your wishlist!');
      } catch (err) {
        ToastManager.error(err.message || 'Could not add to wishlist.');
      }
    }
  },

  openDrawer() {
    UIHelper.openDrawer('offcanvasWishlist');
  }
};

// ============================================================================
// 6. Quick View Manager
// ============================================================================
const QuickViewManager = {
  async open(productId) {
    const modalEl = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    if (!modalEl || !content) return;

    content.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

    UIHelper.openModal('quickViewModal');

    try {
      const res = await NCartAPI.getProductById(productId);
      const product = res.data;
      if (!product) throw new Error('Product not found');

      const stars = Array.from({ length: 5 }, (_, i) => {
        return i < Math.floor(product.rating || 5)
          ? '<i class="text-warning fa fa-star"></i>'
          : '<i class="text-muted fa fa-star"></i>';
      }).join('');

      const sizeButtons = (product.sizes || ['Standard'])
        .map((s, idx) => `<button type="button" class="btn btn-outline-success btn-sm qv-size-btn ${idx === 0 ? 'active' : ''}">${s}</button>`)
        .join(' ');

      content.innerHTML = `
        <div class="row align-items-center">
          <div class="col-md-6 mb-3 mb-md-0">
            <img src="${product.image || 'assets/img/shop_01.jpg'}" alt="${product.name}" class="quick-view-img">
          </div>
          <div class="col-md-6">
            <span class="badge bg-light text-success border border-success mb-2 text-uppercase">${product.category}</span>
            <h3 class="h3 mb-2">${product.name}</h3>
            <div class="mb-2">
              ${stars}
              <span class="text-muted small ms-2">(${product.reviews || 0} reviews)</span>
            </div>
            <p class="h4 text-success fw-bold mb-3">$${Number(product.price).toFixed(2)}</p>
            <p class="text-muted small">${product.description || 'Premium eCommerce merchandise with top-grade materials.'}</p>
            
            <div class="mb-3">
              <label class="form-label small fw-bold">Size:</label>
              <div class="d-flex gap-2" id="qv-sizes-group">
                ${sizeButtons}
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold">Quantity:</label>
              <div class="input-group" style="width: 140px;">
                <button class="btn btn-outline-secondary" type="button" id="qv-qty-minus">-</button>
                <input type="text" class="form-control text-center" id="qv-qty-val" value="1" readonly>
                <button class="btn btn-outline-secondary" type="button" id="qv-qty-plus">+</button>
              </div>
            </div>

            <div class="d-grid gap-2">
              <button class="btn btn-success btn-lg" id="qv-add-cart-btn">
                <i class="fas fa-cart-plus me-1"></i> Add to Cart
              </button>
              <a href="shop-single.html?id=${product.id}" class="btn btn-link text-decoration-none text-muted small">
                View Full Product Details &rarr;
              </a>
            </div>
          </div>
        </div>
      `;

      // Size selectors
      const sizeBtns = content.querySelectorAll('.qv-size-btn');
      let selectedSize = product.sizes ? product.sizes[0] : 'Standard';
      sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          sizeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedSize = btn.textContent.trim();
        });
      });

      // Quantity controls
      const qtyVal = document.getElementById('qv-qty-val');
      document.getElementById('qv-qty-minus').addEventListener('click', () => {
        let val = parseInt(qtyVal.value, 10) || 1;
        if (val > 1) qtyVal.value = val - 1;
      });
      document.getElementById('qv-qty-plus').addEventListener('click', () => {
        let val = parseInt(qtyVal.value, 10) || 1;
        if (val < 99) qtyVal.value = val + 1;
      });

      // Add to cart
      document.getElementById('qv-add-cart-btn').addEventListener('click', () => {
        const qty = parseInt(qtyVal.value, 10) || 1;
        UIHelper.closeModal('quickViewModal');
        CartController.addItem(product.id, qty, selectedSize);
      });
    } catch (err) {
      content.innerHTML = `
        <div class="alert alert-danger my-3">
          Failed to load product details: ${err.message}
        </div>
      `;
    }
  }
};

// ============================================================================
// 7. Checkout Manager
// ============================================================================
const CheckoutManager = {
  open() {
    const cart = CartController.currentCart;
    if (!cart.items || cart.items.length === 0) {
      ToastManager.error('Your shopping cart is empty. Add items before checking out.');
      return;
    }

    // Populate summary numbers
    const itemsEl = document.getElementById('checkout-summary-items');
    const subtotalEl = document.getElementById('checkout-summary-subtotal');
    const shippingEl = document.getElementById('checkout-summary-shipping');
    const totalEl = document.getElementById('checkout-summary-total');

    if (itemsEl) itemsEl.textContent = cart.itemCount || 0;
    if (subtotalEl) subtotalEl.textContent = `$${Number(cart.subtotal || 0).toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = cart.shipping === 0 ? 'Free' : `$${Number(cart.shipping).toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${Number(cart.total || 0).toFixed(2)}`;

    // Close offcanvas cart if open
    UIHelper.closeDrawer('offcanvasCart');
    UIHelper.openModal('checkoutModal');
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const name = document.getElementById('orderName').value;
    const email = document.getElementById('orderEmail').value;
    const phone = document.getElementById('orderPhone').value;
    const address = document.getElementById('orderAddress').value;
    const city = document.getElementById('orderCity').value;
    const postalCode = document.getElementById('orderPostal').value;
    const paymentMethod = document.getElementById('orderPayment').value;
    const notes = document.getElementById('orderNotes').value;

    const btn = document.getElementById('btn-submit-order');
    const spinner = document.getElementById('order-spinner');

    btn.disabled = true;
    if (spinner) spinner.classList.remove('d-none');

    try {
      const res = await NCartAPI.createOrder({
        customer: { name, email, phone, address, city, postalCode },
        paymentMethod,
        notes
      });

      const order = res.data;

      // Render Order Confirmation inside modal
      const modalBody = document.getElementById('checkoutModalBody');
      const modalTitle = document.getElementById('checkoutModalTitle');
      if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Order Placed!';

      modalBody.innerHTML = `
        <div class="text-center py-4">
          <div class="order-success-icon">
            <i class="fas fa-check"></i>
          </div>
          <h3 class="h4 mb-2">Thank You for Your Order!</h3>
          <p class="text-muted">Your order has been placed and is being processed.</p>
          <div class="my-3">
            <span class="order-id-badge">Order ID: <strong>${order.orderNumber}</strong></span>
          </div>
          <div class="card p-3 my-4 text-start bg-light">
            <div class="d-flex justify-content-between mb-1">
              <span>Customer:</span>
              <strong>${order.customer.name}</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Delivery Address:</span>
              <span>${order.customer.address}, ${order.customer.city}</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Payment Mode:</span>
              <span class="text-uppercase">${order.paymentMethod}</span>
            </div>
            <div class="d-flex justify-content-between pt-2 border-top mt-2">
              <span class="fw-bold">Total Paid:</span>
              <span class="fw-bold text-success">$${Number(order.financials.total).toFixed(2)}</span>
            </div>
          </div>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-outline-secondary" onclick="window.print()">
              <i class="fas fa-print me-1"></i> Print Receipt
            </button>
            <a href="shop.html" class="btn btn-success" data-bs-dismiss="modal">
              Continue Shopping
            </a>
          </div>
        </div>
      `;

      // Update cart state
      CartController.currentCart = { items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 };
      CartController.render();
      ToastManager.success(`Order #${order.orderNumber} placed successfully!`);
    } catch (err) {
      btn.disabled = false;
      if (spinner) spinner.classList.add('d-none');
      ToastManager.error(err.message || 'Failed to place order.');
    }
  }
};

// ============================================================================
// 8. Page Specific Handlers
// ============================================================================

// 8A. Shop Page (shop.html)
const ShopPageHandler = {
  currentCategory: 'all',
  currentSort: 'featured',
  currentQuery: '',
  currentPage: 1,

  init() {
    if (!document.getElementById('product-grid') && !document.querySelector('.shop-top-menu')) {
      return;
    }

    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) this.currentCategory = params.get('category');
    if (params.get('q')) this.currentQuery = params.get('q');
    if (params.get('sort')) this.currentSort = params.get('sort');
    if (params.get('page')) this.currentPage = parseInt(params.get('page'), 10) || 1;

    // Attach sort selector
    const sortSelect = document.querySelector('select.form-control, #shop-sort-select');
    if (sortSelect) {
      sortSelect.id = 'shop-sort-select';
      sortSelect.innerHTML = `
        <option value="featured" ${this.currentSort === 'featured' ? 'selected' : ''}>Featured</option>
        <option value="price-asc" ${this.currentSort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
        <option value="price-desc" ${this.currentSort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
        <option value="name-asc" ${this.currentSort === 'name-asc' ? 'selected' : ''}>Name: A to Z</option>
        <option value="name-desc" ${this.currentSort === 'name-desc' ? 'selected' : ''}>Name: Z to A</option>
        <option value="rating" ${this.currentSort === 'rating' ? 'selected' : ''}>Top Rated</option>
      `;
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    // Setup Category click handlers
    document.querySelectorAll('.templatemo-accordion a, .shop-top-menu a').forEach(link => {
      link.addEventListener('click', (e) => {
        const text = link.textContent.trim().toLowerCase();
        if (['gender', 'sale', 'product'].includes(text)) return; // Accordion headers

        e.preventDefault();
        if (text === 'all') {
          this.currentCategory = 'all';
        } else {
          this.currentCategory = text.replace(/[^a-z0-9]+/g, '');
        }
        this.currentPage = 1;
        this.loadProducts();
      });
    });

    // Setup Search Inputs
    const modalSearchForm = document.querySelector('#templatemo_search form');
    if (modalSearchForm) {
      modalSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = modalSearchForm.querySelector('input[name="q"]');
        if (input) {
          this.currentQuery = input.value.trim();
          this.currentPage = 1;
          const searchModalEl = document.getElementById('templatemo_search');
          if (searchModalEl && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(searchModalEl);
            if (bsModal) bsModal.hide();
          }
          this.loadProducts();
        }
      });
    }

    const mobileSearchInput = document.getElementById('inputMobileSearch');
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.currentQuery = mobileSearchInput.value.trim();
          this.currentPage = 1;
          this.loadProducts();
        }
      });
    }

    this.loadProducts();
  },

  async loadProducts() {
    const grid = this.getOrCreateGridContainer();
    if (!grid) return;

    // Ensure wishlist items are loaded so hearts render in accurate active/inactive state
    if (WishlistController.syncPromise) {
      await WishlistController.syncPromise;
    }

    // Show skeletons
    grid.innerHTML = Array.from({ length: 6 }, () => `
      <div class="col-md-4">
        <div class="skeleton-card">
          <div class="skeleton-shimmer skeleton-image"></div>
          <div class="skeleton-shimmer skeleton-line"></div>
          <div class="skeleton-shimmer skeleton-line short"></div>
          <div class="skeleton-shimmer skeleton-line price"></div>
        </div>
      </div>
    `).join('');

    try {
      const res = await NCartAPI.getProducts({
        category: this.currentCategory,
        q: this.currentQuery,
        sort: this.currentSort,
        page: this.currentPage,
        limit: 9
      });

      const products = res.data || [];
      const pagination = res.meta || {};

      if (products.length === 0) {
        grid.innerHTML = `
          <div class="col-12">
            <div class="empty-state-box">
              <i class="fas fa-search"></i>
              <h4>No matching products found</h4>
              <p class="text-muted">Try clearing your filters or search keywords.</p>
              <button class="btn btn-success btn-sm mt-2" id="btn-reset-filters">
                Reset All Filters
              </button>
            </div>
          </div>
        `;
        const resetBtn = grid.querySelector('#btn-reset-filters');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.currentCategory = 'all';
            this.currentQuery = '';
            this.currentSort = 'featured';
            this.currentPage = 1;
            this.loadProducts();
          });
        }
        this.renderPagination(pagination);
        return;
      }

      let html = '';
      products.forEach(p => {
        const isWish = WishlistController.isWishlisted(p.id);
        const stars = Array.from({ length: 5 }, (_, i) => {
          return i < Math.floor(p.rating || 5)
            ? '<i class="text-warning fa fa-star"></i>'
            : '<i class="text-muted fa fa-star"></i>';
        }).join('');

        html += `
          <div class="col-md-4 mb-4">
            <div class="card mb-4 product-wap rounded-0 h-100">
              <div class="card rounded-0 position-relative overflow-hidden">
                <img class="card-img rounded-0 img-fluid" src="${p.image || 'assets/img/shop_01.jpg'}" alt="${p.name}">
                <div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                  <ul class="list-unstyled d-flex gap-2 mb-0">
                    <li>
                      <a class="btn btn-success text-white btn-wishlist ${isWish ? 'active' : ''}" data-id="${p.id}" href="javascript:void(0);" title="Save to Wishlist">
                        <i class="${isWish ? 'fas fa-heart text-danger' : 'far fa-heart'}"></i>
                      </a>
                    </li>
                    <li>
                      <a class="btn btn-success text-white btn-quick-view" data-id="${p.id}" href="javascript:void(0);" title="Quick View">
                        <i class="far fa-eye"></i>
                      </a>
                    </li>
                    <li>
                      <a class="btn btn-success text-white btn-add-cart-card" data-id="${p.id}" href="javascript:void(0);" title="Add to Cart">
                        <i class="fas fa-cart-plus"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="card-body d-flex flex-column justify-content-between text-center">
                <div>
                  <a href="shop-single.html?id=${p.id}" class="h3 text-decoration-none text-dark fw-bold">${p.name}</a>
                  <ul class="list-unstyled d-flex justify-content-center my-2">
                    <li>${stars}</li>
                  </ul>
                </div>
                <p class="text-center text-success fw-bold fs-5 mb-0">$${Number(p.price).toFixed(2)}</p>
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;

      // Attach card action listeners
      grid.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          WishlistController.toggle(id);
        });
      });

      grid.querySelectorAll('.btn-quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          QuickViewManager.open(id);
        });
      });

      grid.querySelectorAll('.btn-add-cart-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          CartController.addItem(id, 1);
        });
      });

      this.renderPagination(pagination);
    } catch (err) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            Failed to load products: ${err.message}. Please verify the backend is running.
          </div>
        </div>
      `;
    }
  },

  getOrCreateGridContainer() {
    let grid = document.getElementById('product-grid');
    if (!grid) {
      // Find the row containing product-wap cards inside col-lg-9
      const shopCol = document.querySelector('.col-lg-9');
      if (shopCol) {
        const rows = shopCol.querySelectorAll('.row');
        // Second row in col-lg-9 is usually the product grid
        if (rows.length >= 2) {
          grid = rows[1];
          grid.id = 'product-grid';
        }
      }
    }
    return grid;
  },

  renderPagination(pagination) {
    let paginationEl = document.getElementById('shop-pagination');
    if (!paginationEl) {
      const parent = document.querySelector('.col-lg-9');
      if (parent) {
        const existing = parent.querySelector('div[role="row"] ul.pagination, ul.pagination');
        if (existing) {
          paginationEl = existing.parentElement;
          paginationEl.id = 'shop-pagination';
        }
      }
    }

    if (!paginationEl || !pagination.totalPages || pagination.totalPages <= 1) {
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const { currentPage, totalPages } = pagination;
    let html = '<ul class="pagination pagination-lg justify-content-end">';

    // Prev
    html += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link rounded-0 mr-3 shadow-sm border-top-0 border-left-0 text-dark" href="#" data-page="${currentPage - 1}">&laquo;</a>
      </li>
    `;

    // Pages
    for (let p = 1; p <= totalPages; p++) {
      html += `
        <li class="page-item ${p === currentPage ? 'active' : ''}">
          <a class="page-link ${p === currentPage ? 'bg-success text-white' : 'text-dark'} rounded-0 mr-3 shadow-sm border-top-0 border-left-0" href="#" data-page="${p}">${p}</a>
        </li>
      `;
    }

    // Next
    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link rounded-0 shadow-sm border-top-0 border-left-0 text-dark" href="#" data-page="${currentPage + 1}">&raquo;</a>
      </li>
    `;
    html += '</ul>';

    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('a.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const p = parseInt(link.getAttribute('data-page'), 10);
        if (p && p >= 1 && p <= totalPages && p !== currentPage) {
          this.currentPage = p;
          this.loadProducts();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      });
    });
  }
};

// 8B. Single Product Details Page (shop-single.html)
const SingleProductHandler = {
  currentProduct: null,

  async init() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || 'prod-001';

    try {
      const res = await NCartAPI.getProductById(productId);
      this.currentProduct = res.data;
      if (!this.currentProduct) return;

      this.populateDetails();
    } catch (err) {
      console.warn('Could not load specific single product details:', err.message);
    }
  },

  populateDetails() {
    const p = this.currentProduct;

    // Main title & price
    const titleEl = document.querySelector('.card-body h1.h2');
    if (titleEl) titleEl.textContent = p.name;

    const priceEl = document.querySelector('.card-body p.h3');
    if (priceEl) priceEl.textContent = `$${Number(p.price).toFixed(2)}`;

    // Description
    const descEl = document.querySelector('.card-body h6 + p');
    if (descEl && p.description) descEl.textContent = p.description;

    // Main Image
    const mainImg = document.getElementById('product-detail');
    if (mainImg && p.image) mainImg.src = p.image;

    // Carousel thumbnails
    if (Array.isArray(p.images) && p.images.length > 0) {
      const thumbs = document.querySelectorAll('.product-links-wap img');
      thumbs.forEach((thumb, idx) => {
        if (p.images[idx]) thumb.src = p.images[idx];
      });
    }

    // Specifications
    if (Array.isArray(p.specifications) && p.specifications.length > 0) {
      const specList = document.querySelector('.card-body ul.list-unstyled.pb-3');
      if (specList) {
        specList.innerHTML = p.specifications.map(s => `<li>${s}</li>`).join('');
      }
    }

    // Hook Form Buy and Add To Cart buttons
    const form = document.querySelector('.card-body form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitter = e.submitter || document.activeElement;
        const action = submitter ? submitter.getAttribute('value') : 'addtocard';
        const qty = parseInt(document.getElementById('var-value').textContent, 10) || 1;
        const size = document.getElementById('product-size').value || 'Standard';

        if (action === 'buy') {
          CartController.addItem(p.id, qty, size);
          setTimeout(() => CheckoutManager.open(), 400);
        } else {
          CartController.addItem(p.id, qty, size);
        }
      });
    }
  }
};

// 8C. Contact Page (contact.html)
const ContactPageHandler = {
  init() {
    const contactForm = document.querySelector('form[method="post"][role="form"], .col-md-9 form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = contactForm.querySelector('#name, input[name="name"]');
      const emailInput = contactForm.querySelector('#email, input[name="email"]');
      const subjectInput = contactForm.querySelector('#subject, input[name="subject"]');
      const messageInput = contactForm.querySelector('#message, textarea[name="message"]');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // Client-side validations
      if (name.length < 2) {
        ToastManager.error('Please enter a valid name (min 2 characters).');
        if (nameInput) nameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        ToastManager.error('Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (subject.length < 3) {
        ToastManager.error('Subject must be at least 3 characters.');
        if (subjectInput) subjectInput.focus();
        return;
      }

      if (message.length < 10) {
        ToastManager.error('Message must be at least 10 characters.');
        if (messageInput) messageInput.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
      }

      try {
        await NCartAPI.submitContact({ name, email, subject, message });
        ToastManager.success('Thank you! Your message has been sent successfully.');
        contactForm.reset();
      } catch (err) {
        ToastManager.error(err.message || 'Failed to send message. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Let's Talk";
        }
      }
    });
  }
};

// 8D. Homepage (index.html) Featured Products
const HomePageHandler = {
  async init() {
    const featuredSection = document.querySelector('section.bg-light .container .row:nth-of-type(2)');
    if (!featuredSection) return;

    try {
      const res = await NCartAPI.getFeaturedProducts();
      const products = res.data;
      if (!products || products.length === 0) return;

      let html = '';
      products.slice(0, 3).forEach(p => {
        const stars = Array.from({ length: 5 }, (_, i) => {
          return i < Math.floor(p.rating || 5)
            ? '<i class="text-warning fa fa-star"></i>'
            : '<i class="text-muted fa fa-star"></i>';
        }).join('');

        html += `
          <div class="col-12 col-md-4 mb-4">
            <div class="card h-100 product-wap">
              <a href="shop-single.html?id=${p.id}">
                <img src="${p.image || 'assets/img/feature_prod_01.jpg'}" class="card-img-top" alt="${p.name}">
              </a>
              <div class="card-body d-flex flex-column justify-content-between">
                <div>
                  <ul class="list-unstyled d-flex justify-content-between mb-2">
                    <li>${stars}</li>
                    <li class="text-muted text-right fw-bold text-success">$${Number(p.price).toFixed(2)}</li>
                  </ul>
                  <a href="shop-single.html?id=${p.id}" class="h2 text-decoration-none text-dark">${p.name}</a>
                  <p class="card-text text-muted small mt-2">
                    ${p.description || ''}
                  </p>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <p class="text-muted mb-0 small">Reviews (${p.reviews || 0})</p>
                  <button class="btn btn-outline-success btn-sm btn-home-add-cart" data-id="${p.id}">
                    <i class="fas fa-cart-plus me-1"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      featuredSection.innerHTML = html;

      featuredSection.querySelectorAll('.btn-home-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          CartController.addItem(id, 1);
        });
      });
    } catch (err) {
      console.warn('Could not load live featured products:', err.message);
    }
  }
};

// ============================================================================
// 9. Application Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Inject reusable drawers and modals
  UIInjections.injectModals();

  // Attach navbar icons
  const cartNavIcons = document.querySelectorAll('a[href*="cart"], .fa-cart-arrow-down, .fa-shopping-cart');
  cartNavIcons.forEach(icon => {
    const parentLink = icon.closest('a') || icon;
    parentLink.style.cursor = 'pointer';
    parentLink.addEventListener('click', (e) => {
      e.preventDefault();
      CartController.openDrawer();
    });
  });

  // Attach Checkout Button
  const checkoutBtn = document.getElementById('btn-proceed-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => CheckoutManager.open());
  }

  // Attach Clear Cart Button
  const clearCartBtn = document.getElementById('btn-clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => CartController.clearCart());
  }

  // Attach Checkout Form Submit
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => CheckoutManager.handleFormSubmit(e));
  }

  // Global search form handler for pages other than shop.html
  const globalSearchForm = document.querySelector('#templatemo_search form');
  if (globalSearchForm && !window.location.pathname.includes('shop.html')) {
    globalSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const qInput = globalSearchForm.querySelector('input[name="q"]');
      const q = qInput ? qInput.value.trim() : '';
      if (q) {
        window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // Attach Wishlist Nav Icons
  document.querySelectorAll('.btn-wishlist-nav, a[href*="wishlist"]').forEach(icon => {
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      WishlistController.openDrawer();
    });
  });

  // Sync Initial State
  CartController.sync();
  WishlistController.sync();

  // Initialize Page-Specific Handlers
  ShopPageHandler.init();
  SingleProductHandler.init();
  ContactPageHandler.init();
  HomePageHandler.init();
});
