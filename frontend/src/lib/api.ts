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
export async function getCurriculum(): Promise<CurriculumResponse> {
  const response = await fetch(`${API_URL}/api/curriculum`)

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch curriculum')
    throw new Error(message)
  }

  return response.json()
}

/**
 * Get a specific level by ID
 */
export async function getLevel(levelId: string): Promise<Level> {
  const response = await fetch(`${API_URL}/api/levels/${levelId}`)

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch level')
    throw new Error(message)
  }

  return response.json()
}

/**
 * Get phase content (markdown)
 */
export async function getPhaseContent(
  levelId: string,
  phaseId: string
): Promise<PhaseContentResponse> {
  const response = await fetch(`${API_URL}/api/levels/${levelId}/phases/${phaseId}`)

  if (!response.ok) {
    const message = await parseErrorResponse(response, 'Failed to fetch phase content')
    throw new Error(message)
  }

  return response.json()
}
