import { test, expect } from '@playwright/test'

test.describe('Auth Redirect', () => {
  const protectedRoutes = ['/dashboard', '/battlefield', '/codex', '/inspector']

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login without auth`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/)
    })
  }

  test('debug cookie bypasses redirect', async ({ page }) => {
    // Set the debug auth bypass cookie
    await page.context().addCookies([
      {
        name: 'debug-auth-bypass',
        value: 'artificer-debug-2024',
        domain: 'localhost',
        path: '/',
      },
    ])

    // Mock API calls so the page can load
    await page.route('**/api/curriculum', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ levels: [] }),
      })
    })
    await page.route('**/api/progress/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user_id: 'debug-user-12345', progress: [] }),
      })
    })

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
