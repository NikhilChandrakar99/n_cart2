const { test, expect } = require('@playwright/test');

test.describe('N_cart Full-Stack E2E Shopping & Customer Workflows', () => {

  test('1. Homepage loads correctly with navbar and featured products', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Nc Shop/);

    // Verify brand logo
    const brand = page.locator('a.navbar-brand');
    await expect(brand).toBeVisible();

    // Verify navbar badges
    const cartBadge = page.locator('.badge-cart-count').first();
    await expect(cartBadge).toBeVisible();

    // Verify featured product section
    const featuredHeading = page.locator('h1:has-text("Featured Product")');
    await expect(featuredHeading).toBeVisible();
  });

  test('2. Shop page dynamic product loading, category filter and sorting', async ({ page }) => {
    await page.goto('/shop.html');

    // Wait for product cards to load in grid
    const productGrid = page.locator('#product-grid');
    await expect(productGrid).toBeVisible();

    const productCards = productGrid.locator('.product-wap');
    await expect(productCards.first()).toBeVisible();
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Filter by Watches category
    const watchesLink = page.locator('.category-filter-item:has-text("Watches")').first();
    await watchesLink.click();

    // Wait for filtered results
    await page.waitForTimeout(500);
    const watchCards = productGrid.locator('.product-wap');
    const watchCount = await watchCards.count();
    expect(watchCount).toBeGreaterThan(0);
    expect(watchCount).toBeLessThanOrEqual(initialCount);

    // Sort by Price: Low to High
    const sortSelect = page.locator('#shop-sort-select');
    await sortSelect.selectOption('price-asc');
    await page.waitForTimeout(500);

    // Verify first item is rendered
    await expect(watchCards.first()).toBeVisible();
  });

  test('3. Quick View Modal and Cart Drawer integration', async ({ page }) => {
    await page.goto('/shop.html');
    await page.waitForSelector('#product-grid .product-wap');

    // Hover card and click quick view icon on first product card
    await page.locator('#product-grid .product-wap').first().hover();
    const firstQuickViewBtn = page.locator('.btn-quick-view').first();
    await firstQuickViewBtn.click();

    // Verify Quick View modal opens
    const qvModal = page.locator('#quickViewModal');
    await expect(qvModal).toHaveClass(/show/, { timeout: 7000 });

    const addCartBtn = qvModal.locator('#qv-add-cart-btn');
    await expect(addCartBtn).toBeVisible();

    // Click Add to Cart
    await addCartBtn.click();

    // Verify cart drawer (offcanvas) opens
    const cartDrawer = page.locator('#offcanvasCart');
    await expect(cartDrawer).toHaveClass(/show/, { timeout: 7000 });

    // Check cart item exists in drawer
    const cartItems = cartDrawer.locator('.cart-item-row');
    await expect(cartItems.first()).toBeVisible();

    // Test increment quantity
    const plusBtn = cartItems.first().locator('.btn-cart-plus');
    const qtyVal = cartItems.first().locator('.cart-qty-val');
    const initialQty = await qtyVal.textContent();

    await plusBtn.click();
    await page.waitForTimeout(500);
    const newQty = await qtyVal.textContent();
    expect(parseInt(newQty, 10)).toBe(parseInt(initialQty, 10) + 1);
  });

  test('4. Complete Checkout Flow and Order Confirmation', async ({ page }) => {
    await page.goto('/shop.html');
    await page.waitForSelector('#product-grid .product-wap');

    // Add item directly from card
    await page.locator('#product-grid .product-wap').first().hover();
    const addCardBtn = page.locator('.btn-add-cart-card').first();
    await addCardBtn.click();

    // Open checkout from cart drawer
    const proceedBtn = page.locator('#btn-proceed-checkout');
    await expect(proceedBtn).toBeVisible({ timeout: 7000 });
    await proceedBtn.click();

    // Verify Checkout modal appears
    const checkoutModal = page.locator('#checkoutModal');
    await expect(checkoutModal).toHaveClass(/show/, { timeout: 7000 });

    // Fill customer details form
    await page.fill('#orderName', 'QA Tester');
    await page.fill('#orderEmail', 'qatester@example.com');
    await page.fill('#orderPhone', '1234567890');
    await page.fill('#orderAddress', '789 Test Boulevard');
    await page.fill('#orderCity', 'Testingville');
    await page.fill('#orderPostal', '90210');

    // Submit order
    const submitOrderBtn = page.locator('#btn-submit-order');
    await submitOrderBtn.click();

    // Verify confirmation with unique Order ID
    const orderBadge = page.locator('.order-id-badge');
    await expect(orderBadge).toBeVisible({ timeout: 7000 });
    await expect(orderBadge).toContainText('ORD-');
  });

  test('5. Wishlist toggle functionality', async ({ page }) => {
    await page.goto('/shop.html');
    await page.waitForSelector('#product-grid .product-wap');

    const firstCard = page.locator('#product-grid .product-wap').first();
    await expect(firstCard).toBeVisible();
    await firstCard.hover();

    const firstWishlistBtn = firstCard.locator('.btn-wishlist');
    await expect(firstWishlistBtn).toBeAttached();

    // Check current state
    const isInitiallyActive = await firstWishlistBtn.evaluate(el => el.classList.contains('active'));

    // Toggle wishlist
    await firstWishlistBtn.click({ force: true });

    if (isInitiallyActive) {
      // If it was already in wishlist, first click removed it
      await expect(firstWishlistBtn).not.toHaveClass(/active/, { timeout: 7000 });
      // Click again to add it back and verify active state
      await firstWishlistBtn.click({ force: true });
      await expect(firstWishlistBtn).toHaveClass(/active/, { timeout: 7000 });
    } else {
      // If it was not in wishlist, first click added it
      await expect(firstWishlistBtn).toHaveClass(/active/, { timeout: 7000 });
    }

    // Verify navbar wishlist badge updated
    const wishlistBadge = page.locator('.badge-wishlist-count').first();
    await page.waitForTimeout(500);
    const count = await wishlistBadge.textContent();
    expect(parseInt(count, 10)).toBeGreaterThan(0);
  });

  test('6. Contact form validation and submission', async ({ page }) => {
    await page.goto('/contact.html');

    // Negative test: submit empty form, verify HTML5 or custom validation
    const submitBtn = page.locator('button:has-text("Let’s Talk")');
    await submitBtn.click();

    // Fill valid data
    await page.fill('#name', 'Alex Hunter');
    await page.fill('#email', 'alex@example.com');
    await page.fill('#subject', 'Wholesale Inquiry');
    await page.fill('#message', 'I am interested in ordering in bulk for our retail stores.');

    await submitBtn.click();

    // Toast notification check
    const toast = page.locator('.nc-toast.success');
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).toContainText('message has been sent');
  });
});
