/**
 * API client for The Artificer's Academy backend
 *
 * Features:
 * - Request timeout (30s default)
 * - AbortController support for cleanup
 * - Proper error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DEFAULT_TIMEOUT = 30000 // 30 seconds

export interface ValidationError {
  type: string
  line: number | null
  message: string
}

export interface ValidationResponse {
  valid: boolean
  errors: ValidationError[]
  tools_found: string[]
  resources_found: string[]
  prompts_found: string[]
}

export interface ProgressEntry {
  level_id: string
  phase_id: string
  completed: boolean
  code_snapshot: string | null
}

export interface ProgressResponse {
  user_id: string
  progress: ProgressEntry[]
}

/**
 * Custom error class for API errors with status codes
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const error = await response.json()
    return error.detail || error.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number; signal?: AbortSignal } = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, signal: externalSignal, ...fetchOptions } = options

  // Create timeout controller
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout)

  // Combine external signal with timeout signal
  const combinedSignal = externalSignal
    ? combineAbortSignals(externalSignal, timeoutController.signal)
    : timeoutController.signal

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: combinedSignal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Combine multiple abort signals into one
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  return controller.signal
}

/**
 * Validate MCP server code
 */
export async function validateCode(
  code: string,
  options?: { signal?: AbortSignal }
): Promise<ValidationResponse> {
  const response = await fetchWithTimeout(`${API_URL}/api/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
    signal: options?.signal,
  })

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to validate code')
    throw new ApiError(message, response.status)
  }

  return response.json()
}

/**
 * Get user progress
 */
export async function getProgress(
  userId: string,
  options?: { signal?: AbortSignal }
): Promise<ProgressResponse> {
  const response = await fetchWithTimeout(`${API_URL}/api/progress/${encodeURIComponent(userId)}`, {
    signal: options?.signal,
  })

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch progress')
    throw new ApiError(message, response.status)
  }

  return response.json()
}

/**
 * Update user progress
 */
export async function updateProgress(
  userId: string,
  levelId: string,
  phaseId: string,
  completed: boolean,
  codeSnapshot?: string,
  options?: { signal?: AbortSignal }
): Promise<void> {
  const response = await fetchWithTimeout(`${API_URL}/api/progress/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      level_id: levelId,
      phase_id: phaseId,
      completed,
      code_snapshot: codeSnapshot,
    }),
    signal: options?.signal,
  })

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to update progress')
    throw new ApiError(message, response.status)
  }
}

// ==========================================
// Curriculum API
// ==========================================

export interface Phase {
  id: string
  title: string
  description: string
  type: 'lesson' | 'tutorial'
  content_file: string
  validation_required?: boolean
}

export interface Level {
  id: string
  title: string
  subtitle: string
  description: string
  mana_color: string
  phases: Phase[]
  locked?: boolean
}

export interface CurriculumResponse {
  levels: Level[]
}

export interface PhaseContentResponse {
  level_id: string
  phase_id: string
  title: string
  content: string
}

/**
 * Get the full curriculum structure
 */
export async function getCurriculum(
  options?: { signal?: AbortSignal }
): Promise<CurriculumResponse> {
  const response = await fetchWithTimeout(`${API_URL}/api/curriculum`, {
    signal: options?.signal,
  })

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch curriculum')
    throw new ApiError(message, response.status)
  }

  return response.json()
}

/**
 * Get a specific level by ID
 */
export async function getLevel(
  levelId: string,
  options?: { signal?: AbortSignal }
): Promise<Level> {
  const response = await fetchWithTimeout(
    `${API_URL}/api/levels/${encodeURIComponent(levelId)}`,
    { signal: options?.signal }
  )

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch level')
    throw new ApiError(message, response.status)
  }

  return response.json()
}

/**
 * Get phase content (markdown)
 */
export async function getPhaseContent(
  levelId: string,
  phaseId: string,
  options?: { signal?: AbortSignal }
): Promise<PhaseContentResponse> {
  const response = await fetchWithTimeout(
    `${API_URL}/api/levels/${encodeURIComponent(levelId)}/phases/${encodeURIComponent(phaseId)}`,
    { signal: options?.signal }
  )

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch phase content')
    throw new ApiError(message, response.status)
  }

  return response.json()
}
