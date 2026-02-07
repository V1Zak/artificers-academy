import type { Page } from '@playwright/test'

// ==========================================
// Mock Data Constants
// ==========================================

export const MOCK_LEVELS = [
  {
    id: 'level1',
    title: 'The Sanctum',
    subtitle: 'MTG Card Oracle',
    description: 'Learn the fundamentals by building an MTG card oracle server.',
    mana_color: 'blue',
    phases: [
      {
        id: 'phase1',
        title: 'The Foundations',
        description: 'Learn what MCP is and why it matters.',
        type: 'lesson',
        content_file: 'level1/phase1.md',
      },
      {
        id: 'phase2',
        title: 'Your First Spell',
        description: 'Build your first MCP tool.',
        type: 'tutorial',
        content_file: 'level1/phase2.md',
        validation_required: true,
      },
      {
        id: 'phase3',
        title: 'The Oracle',
        description: 'Connect to the Scryfall API.',
        type: 'tutorial',
        content_file: 'level1/phase3.md',
        validation_required: true,
      },
    ],
  },
  {
    id: 'level2',
    title: 'The Archive',
    subtitle: 'Filesystem Access',
    description: 'Master filesystem access with the Librarian server.',
    mana_color: 'black',
    locked: true,
    phases: [
      {
        id: 'phase1',
        title: 'The Librarian',
        description: 'Learn to read and manage files.',
        type: 'lesson',
        content_file: 'level2/phase1.md',
      },
    ],
  },
]

export const MOCK_CURRICULUM = {
  levels: MOCK_LEVELS,
}

export const MOCK_LEVEL1 = MOCK_LEVELS[0]

export const MOCK_PHASE_CONTENT = {
  level_id: 'level1',
  phase_id: 'phase1',
  title: 'The Foundations',
  content: '# The Foundations\n\nWelcome to the first phase of your journey.\n\n## What is MCP?\n\nThe Model Context Protocol allows AI models to connect to external tools.',
}

export const MOCK_PROGRESS_EMPTY = {
  user_id: 'debug-user-12345',
  progress: [],
}

export const MOCK_VALIDATION_SUCCESS = {
  valid: true,
  errors: [],
  tools_found: ['search_card'],
  resources_found: [],
  prompts_found: [],
}

export const MOCK_VALIDATION_FAILURE = {
  valid: false,
  errors: [
    {
      type: 'missing_docstring',
      line: 5,
      message: 'Tool function is missing a docstring (Oracle Text)',
    },
  ],
  tools_found: [],
  resources_found: [],
  prompts_found: [],
}

// ==========================================
// Route Setup
// ==========================================

/**
 * Set up all API mock routes for a page.
 * Individual tests can override specific routes after calling this.
 */
export async function setupApiMocks(page: Page) {
  // Curriculum
  await page.route('**/api/curriculum', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CURRICULUM),
    })
  })

  // Individual level
  await page.route('**/api/levels/level1', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LEVEL1),
    })
  })

  await page.route('**/api/levels/level2', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LEVELS[1]),
    })
  })

  // Phase content
  await page.route('**/api/levels/*/phases/*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PHASE_CONTENT),
    })
  })

  // Progress
  await page.route('**/api/progress/**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PROGRESS_EMPTY),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    }
  })

  // Validation
  await page.route('**/api/validate', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_VALIDATION_SUCCESS),
    })
  })
}

/**
 * Set up API mock that responds with a delay (for testing loading states).
 */
export async function setupDelayedApiMocks(page: Page, delayMs: number = 1000) {
  await page.route('**/api/curriculum', (route) => {
    setTimeout(() => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CURRICULUM),
      })
    }, delayMs)
  })

  await page.route('**/api/progress/**', (route) => {
    if (route.request().method() === 'GET') {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_PROGRESS_EMPTY),
        })
      }, delayMs)
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    }
  })
}

/**
 * Set up API mock that returns an error (for testing error states).
 */
export async function setupErrorApiMocks(page: Page) {
  await page.route('**/api/curriculum', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Internal server error' }),
    })
  })

  await page.route('**/api/progress/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PROGRESS_EMPTY),
    })
  })
}
