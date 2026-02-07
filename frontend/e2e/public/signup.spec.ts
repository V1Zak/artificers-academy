import { test, expect } from '@playwright/test'

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('displays join heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Join the Academy' })
    ).toBeVisible()
  })

  test('displays three input fields', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
  })

  test('displays link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'Enter the Academy' })
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/login')
  })

  test('shows password mismatch validation', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm Password').fill('differentpassword')

    // Mock the signup API to prevent actual requests
    await page.route('**/api/auth/signup', (route) => {
      route.abort()
    })

    await page.getByRole('button', { name: 'Begin Initiation' }).click()
    await expect(page.getByText('Your incantations do not match!')).toBeVisible()
  })
})
