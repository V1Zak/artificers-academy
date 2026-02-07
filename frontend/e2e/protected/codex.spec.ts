import { test, expect } from '../fixtures/auth'
import { setupApiMocks } from '../helpers/api-mocks'

test.describe('Codex Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupApiMocks(authenticatedPage)
    await authenticatedPage.goto('/codex')
  })

  test('displays heading', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('heading', { name: 'The Codex' })
    ).toBeVisible()
  })

  test('displays 8 lore cards', async ({ authenticatedPage }) => {
    // 8 dictionary entries from the component
    const cards = authenticatedPage.locator('[class*="perspective"]')
    await expect(cards).toHaveCount(8)
  })

  test('card front shows icon and metaphor', async ({ authenticatedPage }) => {
    // Check first card shows Planeswalker metaphor
    await expect(authenticatedPage.getByText('Planeswalker').first()).toBeVisible()
    // Check another card
    await expect(authenticatedPage.getByText('Deck / Library').first()).toBeVisible()
  })

  test('card shows technical term on front', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByText('LLM (Claude)').first()).toBeVisible()
    await expect(authenticatedPage.getByText('MCP Server').first()).toBeVisible()
  })

  test('displays quick start code blocks', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByText('Quick Start Incantation')
    ).toBeVisible()
    await expect(
      authenticatedPage.getByText('Prepare your mana base')
    ).toBeVisible()
    await expect(
      authenticatedPage.getByText('Craft your first Sorcery')
    ).toBeVisible()
  })
})
