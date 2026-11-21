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
  await page.goto('/', { waitUntil: 'domcontentloaded' });
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

test('dark mobile promo banners match the rounded light-mode frame layout', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nm_theme', 'dark'));
  await page.setViewportSize({ width: 393, height: 852 });
  await openStore(page);
  const banner = page.locator('.pb').first();
  await expect(banner).toBeVisible();
  const layout = await banner.evaluate((element) => {
    const card = element.querySelector('.pbt > div')!;
    const frameBounds = element.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    return {
      width: frameBounds.width,
      height: frameBounds.height,
      radius: getComputedStyle(element).borderRadius,
      cardCenter: (cardBounds.top + cardBounds.bottom) / 2,
      frameCenter: (frameBounds.top + frameBounds.bottom) / 2,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  expect(layout.width).toBeLessThan(393);
  expect(layout.height).toBe(500);
  expect(layout.radius).toBe('10px');
  expect(Math.abs(layout.cardCenter - layout.frameCenter)).toBeLessThan(40);
  expect(layout.overflow).toBeLessThanOrEqual(0);
});

test('mobile product rows swipe horizontally and listing cards use a compact two-column grid', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await openStore(page);
  const row = page.locator('.row').nth(1);
  await expect(row).toBeVisible();
  const rowBefore = await row.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    cardWidth: element.querySelector('.card')?.getBoundingClientRect().width ?? 0,
  }));
  expect(rowBefore.scrollWidth).toBeGreaterThan(rowBefore.clientWidth);
  expect(rowBefore.cardWidth).toBeLessThanOrEqual(170);
  await row.evaluate((element) => element.scrollBy({ left: 140, behavior: 'instant' }));
  await expect.poll(() => row.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  await page.goto('/c/Furniture');
  const grid = page.locator('.grid');
  await expect(grid).toBeVisible();
  const gridLayout = await grid.evaluate((element) => ({
    columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
    cardWidth: element.querySelector('.card')?.getBoundingClientRect().width ?? 0,
  }));
  expect(gridLayout.columns).toBe(2);
  expect(gridLayout.cardWidth).toBeLessThan(200);

  await page.setViewportSize({ width: 720, height: 900 });
  const widerMobileGrid = await grid.evaluate((element) => ({
    columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
    cardWidth: element.querySelector('.card')?.getBoundingClientRect().width ?? 0,
  }));
  expect(widerMobileGrid.columns).toBeGreaterThanOrEqual(4);
  expect(widerMobileGrid.cardWidth).toBeLessThan(170);
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

test('mobile drawer keeps category subcategories with the selected card and fits the viewport', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) > 700, 'mobile drawer layout');
  await openStore(page);
  await page.getByRole('button', { name: 'Open menu' }).click();

  const drawer = page.locator('.dw');
  await expect(drawer).toBeVisible();
  const category = drawer.locator('.dw-catitem').filter({ has: page.getByRole('button', { name: /Electronics/ }) });
  await category.getByRole('button', { name: /Electronics/ }).click();
  await expect(category.locator('.dw-subs')).toBeVisible();
  await expect(category.locator('.dw-subs')).toContainText('Headphones');
  await expect(drawer.locator('.dw-catlist > .dw-catitem').first().locator('.dw-subs')).toBeVisible();

  const dimensions = await drawer.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    closeRight: element.querySelector('.dw-x')?.getBoundingClientRect().right ?? 0,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.closeRight).toBeLessThanOrEqual(page.viewportSize()!.width);
  await expect(drawer.getByRole('heading', { name: 'Popular' })).toBeVisible();
});

test('mobile drawer navigation links close the menu including same-route links', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) > 700, 'mobile drawer navigation');
  await openStore(page);
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Open menu' }).click();

  const drawer = page.locator('.dw');
  await drawer.getByRole('link', { name: 'All products' }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(drawer).not.toHaveClass(/\bon\b/);

  await page.getByRole('button', { name: 'Open menu' }).click();
  await drawer.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(drawer).not.toHaveClass(/\bon\b/);

  await page.goto('/shop');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await drawer.getByRole('link', { name: 'Hot deals' }).click();
  await expect(page).toHaveURL(/\/deals$/);
  await expect(drawer).not.toHaveClass(/\bon\b/);

  await page.getByRole('button', { name: 'Open menu' }).click();
  await drawer.getByRole('link', { name: 'My wishlist' }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(drawer).not.toHaveClass(/\bon\b/);

  for (const linkName of ['My account', 'My orders']) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await drawer.getByRole('link', { name: linkName }).click();
    await expect(drawer).not.toHaveClass(/\bon\b/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.locator('.ov.on').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('.ov')).not.toHaveClass(/\bon\b/);
  }

  await page.getByRole('button', { name: 'Open menu' }).click();
  await drawer.getByRole('button', { name: 'Sign in' }).click();
  await expect(drawer).not.toHaveClass(/\bon\b/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('mobile public routes and home hero fit narrow phone widths without clipping header actions', async ({ page }) => {
  await openStore(page);
  for (const width of [360, 320]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/shop', '/deals', '/c/Electronics', '/search/headphones', '/p/910001', '/cart', '/wishlist']) {
      await page.evaluate((nextPath) => {
        window.history.pushState({}, '', nextPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, path);
      await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
      await expect(page.locator('.hrow')).toBeVisible();
      const layout = await page.evaluate(() => {
        const bounds = (selector: string) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const { left, right } = element.getBoundingClientRect();
          return { left, right };
        };
        return {
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          header: bounds('.hrow'),
          brand: bounds('.wm'),
          actions: bounds('.hr'),
          heroCopy: bounds('.lcopy'),
          heroButton: bounds('.lcopy .lbtn'),
        };
      });
      expect(layout.document, `${path} at ${width}px has horizontal overflow`).toBeLessThanOrEqual(width);
      for (const [name, rect] of Object.entries({ header: layout.header, brand: layout.brand, actions: layout.actions, heroCopy: layout.heroCopy, heroButton: layout.heroButton })) {
        if (!rect) continue;
        expect(rect.left, `${name} on ${path} extends left`).toBeGreaterThanOrEqual(0);
        expect(rect.right, `${name} on ${path} extends right`).toBeLessThanOrEqual(width);
      }
    }
  }
  await page.evaluate(() => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.getByRole('button', { name: 'Switch light or dark mode' }).click();
  const darkHeader = await page.locator('.hrow').evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(darkHeader.scrollWidth).toBeLessThanOrEqual(darkHeader.clientWidth);
});

test('long signed-in name stays on one line and scales down to fit the mobile drawer', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('nm_user', JSON.stringify({ name: 'SURYAPRAKASH' }));
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await openStore(page);
  await page.getByRole('button', { name: 'Open menu' }).click();
  const greeting = page.locator('.dw-hi');
  await expect(greeting).toHaveText('Hi, SURYAPRAKASH');
  const textFit = await greeting.evaluate((element) => ({
    fontSize: parseFloat(getComputedStyle(element).fontSize),
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    whiteSpace: getComputedStyle(element).whiteSpace,
  }));
  expect(textFit.fontSize).toBeLessThan(29);
  expect(textFit.scrollWidth).toBeLessThanOrEqual(textFit.clientWidth);
  expect(textFit.whiteSpace).toBe('nowrap');
});

test('signed-in account, checkout and admin pages stay within a narrow mobile viewport', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('nm_user', JSON.stringify({
      name: 'Suryaprakash', email: 'surya@example.test', phone: '9876543210', role: 'admin', addresses: [],
    }));
    localStorage.setItem('nm_cart', JSON.stringify([{ id: 910001, qty: 1 }]));
  });
  await openStore(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.route('**/api/admin/**', (route) => route.abort());
  await page.route('**/api/orders', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ orders: [] }) }));

  for (const path of ['/account', '/account/security', '/account/addresses', '/account/payments', '/orders', '/checkout', '/admin']) {
    await page.evaluate((nextPath) => {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
    await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
    await expect(page.locator('.hrow')).toBeVisible();
    const width = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(width.document, `${path} overflows at ${width.viewport}px`).toBeLessThanOrEqual(width.viewport);
  }
});
