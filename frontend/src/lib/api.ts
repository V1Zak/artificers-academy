/**
 * API client for The Artificer's Academy backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
 * Validate MCP server code
 */
export async function validateCode(code: string): Promise<ValidationResponse> {
  const response = await fetch(`${API_URL}/api/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to validate code')
    throw new Error(message)
  }

  return response.json()
}

/**
 * Get user progress
 */
export async function getProgress(userId: string): Promise<ProgressResponse> {
  const response = await fetch(`${API_URL}/api/progress/${userId}`)

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch progress')
    throw new Error(message)
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
  codeSnapshot?: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/progress/${userId}`, {
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
  })

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to update progress')
    throw new Error(message)
  }
}
