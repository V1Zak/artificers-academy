import { test, expect } from '../fixtures/auth'
import { setupApiMocks, MOCK_PHASE_CONTENT } from '../helpers/api-mocks'

test.describe('Battlefield Phase Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
    await authenticatedPage.goto('/battlefield/level1/phase1')
  })

  test('displays navigation header with phase count', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByText('Phase 1 of 3')).toBeVisible()
  })

  test('displays back link to level', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('link', { name: /The Sanctum/ })
    ).toBeVisible()
  })

  test('renders markdown content', async ({ authenticatedPage }) => {
    // Page title rendered as h1
    await expect(authenticatedPage.locator('h1', { hasText: 'The Foundations' })).toBeVisible()
    // Markdown content rendered below
    await expect(authenticatedPage.getByText('What is MCP?')).toBeVisible()
  })

  test('shows phase type label', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByText('Lesson')).toBeVisible()
  })

  test('displays complete/next button', async ({ authenticatedPage }) => {
    // Phase 1 has a next phase, so the button should show phase2 title
    await expect(
      authenticatedPage.getByRole('button', { name: /Your First Spell/ })
    ).toBeVisible()
  })

  test('shows validate button for tutorial phases with validation', async ({
    authenticatedPage,
  }) => {
    // Navigate to phase2 which has validation_required
    await authenticatedPage.goto('/battlefield/level1/phase2')

    // Update the phase content mock for phase2
    await authenticatedPage.route('**/api/levels/*/phases/*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...MOCK_PHASE_CONTENT,
          phase_id: 'phase2',
          title: 'Your First Spell',
        }),
      })
    })

    await authenticatedPage.goto('/battlefield/level1/phase2')
    await expect(
      authenticatedPage.getByRole('button', { name: 'Validate Code' })
    ).toBeVisible()
  })
})
