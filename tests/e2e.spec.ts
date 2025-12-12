import { test, expect } from '@playwright/test';

test('Guest User Shopping Flow', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Youniqle/i);
    console.log('Home page loaded');

    // 2. Navigate to Products
    // Check for the link first
    const shopBtn = page.locator('text=Shop Now');
    if (await shopBtn.isVisible()) {
        await shopBtn.click();
    } else {
        await page.goto('/products');
    }

    await expect(page).toHaveURL(/.*\/products/);
    console.log('Navigated to products page');

    // 3. Select a Product
    await page.waitForSelector('.grid');
    const firstProduct = page.locator('.grid > div a').first();
    await firstProduct.click();

    // Wait for product detail
    await page.waitForSelector('h1', { timeout: 10000 });
    const productName = await page.locator('h1').innerText();
    console.log(`Viewing product: ${productName}`);

    // 4. Try to Add to Cart (Guest)
    // Setup dialog handler to accept the confirm dialog
    page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept(); // User clicks "OK" to "Go to signup?"
    });

    // Click Add to Cart
    // Use a robust selector: button containing the shopping cart icon
    const addToCartBtn = page.locator('button').filter({ has: page.locator('svg.lucide-shopping-cart') }).last();
    await addToCartBtn.click();

    // 5. Verify Redirection
    // User should be redirected to /auth/signup
    await expect(page).toHaveURL(/\/auth\/signup/);
    console.log('Verified: Redirected to signup page when guest tried to add to cart');
});

test('Login Page Check', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    console.log('Login page elements verified');
});
