import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays hero heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: "The Artificer's Academy" })
    ).toBeVisible()
  })

  test('CTA buttons link to /login', async ({ page }) => {
    const beginButton = page.getByRole('link', { name: 'Begin Your Journey' })
    await expect(beginButton).toHaveAttribute('href', '/login')

    const codexButton = page.getByRole('link', { name: 'Browse the Codex' })
    await expect(codexButton).toHaveAttribute('href', '/login?next=/codex')
  })

  test('displays three feature cards', async ({ page }) => {
    await expect(page.getByText('The Sanctum')).toBeVisible()
    await expect(page.getByText('The Archive')).toBeVisible()
    await expect(page.getByText('The Aether')).toBeVisible()
  })

  test('displays mana pool section', async ({ page }) => {
    await expect(page.getByText('Your Mana Pool')).toBeVisible()
    await expect(page.getByText('Sign in to track your progress')).toBeVisible()
  })

  test('hero text uses responsive classes', async ({ page }) => {
    const heading = page.getByRole('heading', { name: "The Artificer's Academy" })
    await expect(heading).toHaveClass(/text-3xl/)
    await expect(heading).toHaveClass(/sm:text-5xl/)
  })
})
