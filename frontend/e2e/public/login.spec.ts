import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('displays welcome heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Welcome Back, Planeswalker' })
    ).toBeVisible()
  })

  test('displays email and password inputs with labels', async ({ page }) => {
    const emailLabel = page.getByLabel('Email')
    await expect(emailLabel).toBeVisible()
    await expect(emailLabel).toHaveAttribute('type', 'email')

    const passwordLabel = page.getByLabel('Password')
    await expect(passwordLabel).toBeVisible()
    await expect(passwordLabel).toHaveAttribute('type', 'password')
  })

  test('displays submit button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Enter the Academy' })
    ).toBeVisible()
  })

  test('displays signup link', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: 'Begin your initiation' })
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toHaveAttribute('href', '/signup')
  })

  test('form inputs have required attribute', async ({ page }) => {
    await expect(page.getByLabel('Email')).toHaveAttribute('required', '')
    await expect(page.getByLabel('Password')).toHaveAttribute('required', '')
  })
})
