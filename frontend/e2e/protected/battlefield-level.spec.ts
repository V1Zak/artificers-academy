import { test, expect } from '../fixtures/auth'
import { setupApiMocks } from '../helpers/api-mocks'

test.describe('Battlefield Level Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
    await authenticatedPage.goto('/battlefield/level1')
  })

  test('displays back link to battlefield', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('link', { name: /Back to Battlefield/ })
    ).toBeVisible()
  })

  test('displays level header', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('heading', { name: 'The Sanctum' })
    ).toBeVisible()
    await expect(authenticatedPage.getByText('MTG Card Oracle', { exact: true })).toBeVisible()
  })

  test('displays phase cards with types', async ({ authenticatedPage }) => {
    // Lesson type
    await expect(authenticatedPage.getByText('Lesson').first()).toBeVisible()
    // Tutorial type
    await expect(authenticatedPage.getByText('Tutorial').first()).toBeVisible()
  })

  test('shows unlock status for phases', async ({ authenticatedPage }) => {
    // First phase should have Start button (unlocked)
    await expect(
      authenticatedPage.getByRole('link', { name: 'Start' }).first()
    ).toBeVisible()
  })

  test('navigates to phase content', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('link', { name: 'Start' }).first().click()
    await expect(authenticatedPage).toHaveURL(/\/battlefield\/level1\/phase1/)
  })
})
