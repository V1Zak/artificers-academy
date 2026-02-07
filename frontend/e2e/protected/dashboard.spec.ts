import { test, expect } from '../fixtures/auth'
import {
  setupApiMocks,
  setupDelayedApiMocks,
  setupErrorApiMocks,
  MOCK_PROGRESS_EMPTY,
} from '../helpers/api-mocks'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
  })

  test('displays welcome heading', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(
      authenticatedPage.getByRole('heading', { name: 'Welcome, Artificer' })
    ).toBeVisible()
  })

  test('renders level cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage.getByText('The Sanctum')).toBeVisible()
    await expect(authenticatedPage.getByText('The Archive')).toBeVisible()
  })

  test('displays progress bar', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage.getByText('Levels Completed')).toBeVisible()
    await expect(authenticatedPage.getByRole('heading', { name: 'Your Journey' })).toBeVisible()
  })

  test('shows Available status badge for first level', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage.getByText('Available')).toBeVisible()
  })

  test('shows Locked status for locked level', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await expect(authenticatedPage.getByText('Locked')).toBeVisible()
  })

  test('shows mana color border on level cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    // Level 1 has blue border
    const level1Card = authenticatedPage.locator('.border-l-mana-blue').first()
    await expect(level1Card).toBeVisible()
  })

  test('shows error state on API failure', async ({ authenticatedPage }) => {
    // Override with error mocks
    await setupErrorApiMocks(authenticatedPage)
    await authenticatedPage.goto('/dashboard')
    await expect(
      authenticatedPage.getByText('Failed to load curriculum')
    ).toBeVisible()
    await expect(
      authenticatedPage.getByRole('button', { name: 'Try Again' })
    ).toBeVisible()
  })
})

test.describe('Dashboard Loading State', () => {
  test('shows skeleton while loading', async ({ authenticatedPage }) => {
    await setupDelayedApiMocks(authenticatedPage, 2000)
    await authenticatedPage.goto('/dashboard')

    // Skeleton elements should be visible while loading
    const skeletons = authenticatedPage.locator('.animate-pulse')
    await expect(skeletons.first()).toBeVisible()
  })
})
