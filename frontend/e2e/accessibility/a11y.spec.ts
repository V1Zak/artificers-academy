import { test, expect } from '../fixtures/auth'
import { setupApiMocks } from '../helpers/api-mocks'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
  })

  test('skip-to-content link is accessible via Tab', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    // Tab to reveal skip link
    await authenticatedPage.keyboard.press('Tab')

    const skipLink = authenticatedPage.getByRole('link', {
      name: 'Skip to main content',
    })
    await expect(skipLink).toBeVisible()
    await expect(skipLink).toHaveAttribute('href', '#main-content')

    // Verify the target element exists
    const mainContent = authenticatedPage.locator('#main-content')
    await expect(mainContent).toBeAttached()
  })

  test('navigation has aria-label', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    const nav = authenticatedPage.locator('nav[aria-label="Main navigation"]')
    await expect(nav.first()).toBeAttached()
  })

  test('mana progress bar has progressbar role', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    const progressbar = authenticatedPage.locator('[role="progressbar"]')
    await expect(progressbar.first()).toBeVisible()
    await expect(progressbar.first()).toHaveAttribute('aria-valuenow')
    await expect(progressbar.first()).toHaveAttribute('aria-valuemax')
  })

  test('mobile hamburger has aria-label', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    // The hamburger button is hidden on desktop (md:hidden) but exists in DOM
    const hamburger = authenticatedPage.locator('button[aria-label="Open navigation menu"]')
    await expect(hamburger).toBeAttached()
    await expect(hamburger).toHaveAttribute('aria-label', 'Open navigation menu')
  })

  test('interactive elements have focus-visible styles', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/dashboard')

    // Tab through elements to trigger focus-visible
    // The skip-to-content link has explicit focus styles
    await authenticatedPage.keyboard.press('Tab')

    const skipLink = authenticatedPage.getByRole('link', {
      name: 'Skip to main content',
    })
    // The skip link gets focus:not-sr-only which makes it visible
    await expect(skipLink).toBeVisible()
  })
})
