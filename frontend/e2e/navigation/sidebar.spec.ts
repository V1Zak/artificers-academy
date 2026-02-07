import { test, expect } from '@playwright/test'
import { setupApiMocks } from '../helpers/api-mocks'

test.describe('Desktop Sidebar', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'debug-auth-bypass',
        value: 'artificer-debug-2024',
        domain: 'localhost',
        path: '/',
      },
    ])
    await setupApiMocks(page)
  })

  test('sidebar is visible on desktop', async ({ page }) => {
    await page.goto('/dashboard')
    // Desktop sidebar (hidden md:flex) — look for the aside with desktop nav
    const sidebar = page.locator('aside.hidden.md\\:flex')
    await expect(sidebar).toBeVisible()
  })

  test('displays four navigation links', async ({ page }) => {
    await page.goto('/dashboard')
    const nav = page.locator('aside.hidden.md\\:flex nav')
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'The Battlefield' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'The Codex' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'The Inspector' })).toBeVisible()
  })

  test('displays user email', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(
      page.locator('aside.hidden.md\\:flex').getByText('debug@artificers-academy.dev')
    ).toBeVisible()
  })

  test('displays sign out button', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(
      page.locator('aside.hidden.md\\:flex').getByRole('button', { name: 'Sign out' })
    ).toBeVisible()
  })
})

test.describe('Mobile Sidebar', () => {
  test.use({ viewport: { width: 393, height: 851 } }) // Pixel 5

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'debug-auth-bypass',
        value: 'artificer-debug-2024',
        domain: 'localhost',
        path: '/',
      },
    ])
    await setupApiMocks(page)
  })

  test('sidebar is hidden on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    // Desktop sidebar should not be visible on mobile
    const desktopSidebar = page.locator('aside.hidden.md\\:flex')
    await expect(desktopSidebar).not.toBeVisible()
  })

  test('hamburger button is visible on mobile', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(
      page.getByRole('button', { name: 'Open navigation menu' })
    ).toBeVisible()
  })

  test('opens mobile drawer on hamburger click', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Open navigation menu' }).click()

    // Mobile sidebar should now be visible
    const navLinks = page.locator('aside.md\\:hidden nav')
    await expect(navLinks.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(navLinks.getByRole('link', { name: 'The Battlefield' })).toBeVisible()
  })
})
