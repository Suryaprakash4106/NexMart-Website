import { test, expect } from '@playwright/test';

const apiUrl = (process.env.PLAYWRIGHT_API_URL || '').replace(/\/$/, '');

test.skip(!apiUrl, 'Set PLAYWRIGHT_API_URL to run read-only backend + MongoDB integration tests.');

test('live catalog, Vite API proxy and guest cart work end to end with MongoDB', async ({ page, request }) => {
  const healthResponse = await request.get(`${apiUrl}/api/health`);
  expect(healthResponse.ok()).toBeTruthy();
  expect(await healthResponse.json()).toMatchObject({ ok: true, db: true });

  const catalogResponse = await request.get(`${apiUrl}/api/products`);
  expect(catalogResponse.ok()).toBeTruthy();
  const catalog = await catalogResponse.json();
  expect(Array.isArray(catalog.products)).toBeTruthy();
  expect(catalog.products.length).toBeGreaterThan(0);
  const product = catalog.products.find((item: { stock?: number }) => item.stock > 0);
  expect(product).toBeTruthy();
  expect(new Set(catalog.products.map((item: { id: number }) => item.id)).size).toBe(catalog.products.length);

  // Vite proxies the browser request to the actual backend; cart mutations remain in this test's localStorage.
  await page.goto(`/p/${product.id}`);
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('/cart');
  await expect(page.getByText(product.name, { exact: true })).toBeVisible();
  await expect(page.getByText('Subtotal (1 items):', { exact: false })).toBeVisible();
});
