import { test, expect } from '../fixtures/auth'
import {
  setupApiMocks,
  MOCK_VALIDATION_SUCCESS,
  MOCK_VALIDATION_FAILURE,
} from '../helpers/api-mocks'

test.describe('Inspector Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
    await authenticatedPage.goto('/inspector')
  })

  test('displays heading', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('heading', { name: 'The Inspector' })
    ).toBeVisible()
  })

  test('Monaco editor loads', async ({ authenticatedPage }) => {
    // Wait for "Loading editor..." to disappear
    await expect(authenticatedPage.getByText('Loading editor...')).toBeHidden({
      timeout: 15000,
    })
  })

  test('submit button is present', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('button', { name: 'Submit for Inspection' })
    ).toBeVisible()
  })

  test('shows success result on valid code', async ({ authenticatedPage }) => {
    // Wait for editor to load
    await expect(authenticatedPage.getByText('Loading editor...')).toBeHidden({
      timeout: 15000,
    })

    // Override validation route for success
    await authenticatedPage.route('**/api/validate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_VALIDATION_SUCCESS),
      })
    })

    await authenticatedPage
      .getByRole('button', { name: 'Submit for Inspection' })
      .click()

    // Should show success alert (exact match to avoid toast text collision)
    await expect(
      authenticatedPage.getByText('Spell Resolves Successfully!', { exact: true })
    ).toBeVisible({ timeout: 10000 })
  })

  test('shows error result on invalid code', async ({ authenticatedPage }) => {
    // Wait for editor to load
    await expect(authenticatedPage.getByText('Loading editor...')).toBeHidden({
      timeout: 15000,
    })

    // Override validation route for failure
    await authenticatedPage.route('**/api/validate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_VALIDATION_FAILURE),
      })
    })

    await authenticatedPage
      .getByRole('button', { name: 'Submit for Inspection' })
      .click()

    // Should show error alert
    await expect(
      authenticatedPage.getByText(/missing a docstring/)
    ).toBeVisible({ timeout: 10000 })
  })

  test('displays reference cards', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByText('Quick Reference')).toBeVisible()
    await expect(authenticatedPage.getByText('Sorceries')).toBeVisible()
    await expect(authenticatedPage.getByText('Permanents')).toBeVisible()
    await expect(authenticatedPage.getByText('Tutors')).toBeVisible()
  })

  test('shows loading state during validation', async ({ authenticatedPage }) => {
    // Wait for editor to load
    await expect(authenticatedPage.getByText('Loading editor...')).toBeHidden({
      timeout: 15000,
    })

    // Add delay to validation response
    await authenticatedPage.route('**/api/validate', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_VALIDATION_SUCCESS),
        })
      }, 2000)
    })

    await authenticatedPage
      .getByRole('button', { name: 'Submit for Inspection' })
      .click()

    // Button should show "Inspecting..." while loading
    await expect(
      authenticatedPage.getByRole('button', { name: 'Inspecting...' })
    ).toBeVisible()
  })
})
