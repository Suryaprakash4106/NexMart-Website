import { test, expect, type Page } from '@playwright/test';

const products = [
  {
    id: 910001, name: 'NexSound Studio Headphones', brand: 'NexSound', category: 'Electronics',
    subcategory: 'Headphones', price: 2499, originalPrice: 3299, stock: 18, deal: true,
    featured: true, rating: 4.6, reviews: 42, description: 'Wireless over-ear headphones with clear sound and comfortable cushions.',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23e8e8e8"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" font-size="24" fill="%23253745"%3EHeadphones%3C/text%3E%3C/svg%3E',
    images: [], features: ['Bluetooth audio', 'Comfort fit'], specs: [{ k: 'Type', v: 'Over-ear' }],
  },
  {
    id: 910002, name: 'Everyday Canvas Tote', brand: 'Northline', category: 'Fashion',
    subcategory: 'Bags', price: 799, originalPrice: 999, stock: 7, deal: false,
    featured: true, rating: 4.3, reviews: 16, description: 'A durable cotton canvas tote for daily essentials.',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23e8e8e8"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" font-size="24" fill="%23253745"%3ETote%3C/text%3E%3C/svg%3E',
    images: [], features: [], specs: [],
  },
  {
    id: 910003, name: 'Oak Desk Lamp', brand: 'Hearth & Form', category: 'Furniture',
    subcategory: 'Lighting', price: 1499, originalPrice: 1499, stock: 0, deal: false,
    featured: false, rating: 0, reviews: 0, description: 'Compact desk lamp with a warm, diffused light.',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23e8e8e8"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" font-size="24" fill="%23253745"%3ELamp%3C/text%3E%3C/svg%3E',
    images: [], features: [], specs: [],
  },
];

async function openStore(page: Page) {
  await page.route('**/api/products', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ products }),
  }));
  await page.route('**/api/products/*/reviews', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ reviews: [], hist: {}, count: 0, avg: 0 }),
  }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'NEXMART' })).toBeVisible();
}

test('home page renders the store and navigates into a category', async ({ page }) => {
  await openStore(page);
  await expect(page.getByRole('heading', { name: 'Find your next favourite.' })).toBeVisible();
  await page.getByRole('button', { name: 'Show slide 1' }).click();
  await page.getByRole('button', { name: /Shop electronics/i }).click();
  await expect(page).toHaveURL(/\/c\/Electronics$/);
  await expect(page.getByRole('heading', { name: 'Electronics' })).toBeVisible();
  await expect(page.getByText('NexSound Studio Headphones')).toBeVisible();
});

test('search returns matching products and category filters stay usable', async ({ page }) => {
  await openStore(page);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('headphones');
  await page.getByRole('button', { name: 'Search', exact: true }).last().click();
  await expect(page).toHaveURL(/\/search\/headphones$/);
  await expect(page.getByText('NexSound Studio Headphones')).toBeVisible();
  await expect(page.getByText('Everyday Canvas Tote')).toHaveCount(0);
});

test('product detail, wishlist, cart quantity and removal work for a guest', async ({ page }) => {
  await openStore(page);
  await page.goto('/p/910001');
  await expect(page.getByRole('heading', { name: 'NexSound Studio Headphones' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await expect(page.getByRole('button', { name: 'Remove from wishlist' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Quantity' }).selectOption('2');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('status')).toContainText('Added to cart');
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
  await expect(page.getByText('Subtotal (2 items): ₹4,998')).toBeVisible();
  await page.getByText('Delete', { exact: true }).click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
});

test('theme switch updates the document theme and keeps the product page readable', async ({ page }) => {
  await openStore(page);
  await page.getByRole('button', { name: 'Switch light or dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-t', 'dark');
  await page.goto('/p/910002');
  await expect(page.getByRole('heading', { name: 'Everyday Canvas Tote' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  await page.getByRole('button', { name: 'Switch light or dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-t', '');
});

test('unavailable products cannot be added to cart and unknown routes recover', async ({ page }) => {
  await openStore(page);
  await page.goto('/p/910003');
  await expect(page.getByText('Out of stock')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
  await page.goto('/missing-route');
  await expect(page.getByText('Page not found.')).toBeVisible();
  await page.getByRole('link', { name: 'Go home' }).click();
  await expect(page).toHaveURL('/');
});

test('wishlist page updates and footer image credits are present', async ({ page }) => {
  await openStore(page);
  await page.goto('/p/910002');
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await page.goto('/wishlist');
  await expect(page.getByRole('heading', { name: 'My wishlist' })).toBeVisible();
  await expect(page.getByText('Everyday Canvas Tote')).toBeVisible();
  await page.getByText('Product and category photos:').scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: 'Unsplash' })).toHaveAttribute('href', 'https://unsplash.com/');
});

test('protected account routes open sign-in without changing the guest session', async ({ page }) => {
  await openStore(page);
  await page.goto('/orders');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Password (8+ characters)')).toBeVisible();
});
