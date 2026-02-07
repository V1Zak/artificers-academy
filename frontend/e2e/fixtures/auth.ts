import { test as base, type Page } from '@playwright/test'

/**
 * Extended test fixture that provides an authenticated page.
 *
 * Sets the `debug-auth-bypass` cookie before navigation, which triggers
 * the bypass in layout.tsx that uses DEBUG_USER
 * (id: debug-user-12345, email: debug@artificers-academy.dev).
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Set the debug auth bypass cookie
    await page.context().addCookies([
      {
        name: 'debug-auth-bypass',
        value: 'artificer-debug-2024',
        domain: 'localhost',
        path: '/',
      },
    ])
    await use(page)
  },
})

export { expect } from '@playwright/test'
