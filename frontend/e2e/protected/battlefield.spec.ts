import { test, expect } from '../fixtures/auth'
import { setupApiMocks } from '../helpers/api-mocks'

test.describe('Battlefield Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
    await authenticatedPage.goto('/battlefield')
  })

  test('displays heading', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('heading', { name: 'The Battlefield' })
    ).toBeVisible()
  })

  test('displays mana icons on level cards', async ({ authenticatedPage }) => {
    // Blue mana for level 1
    await expect(authenticatedPage.getByLabel('blue mana')).toBeVisible()
  })

  test('displays progress text', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByText('0 / 3 phases')).toBeVisible()
  })

  test('displays gemstone phase orbs', async ({ authenticatedPage }) => {
    // Phase names should be visible in the orb section
    await expect(authenticatedPage.getByText('The Foundations')).toBeVisible()
    await expect(authenticatedPage.getByText('Your First Spell')).toBeVisible()
  })

  test('displays Begin Journey button', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('link', { name: 'Begin Journey' })
    ).toBeVisible()
  })

  test('navigates to level detail', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('link', { name: 'Begin Journey' }).click()
    await expect(authenticatedPage).toHaveURL(/\/battlefield\/level1/)
  })
})
