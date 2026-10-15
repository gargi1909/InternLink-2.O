/**
 * Smart Internship Match Score Utility
 * 
 * Rule-based, explainable skill matcher:
 * Match Score = (Number of matched unique required skills / Total number of unique required skills) * 100
 * 
 * Safe against missing/null values, JSON strings, arrays, zero-division, and duplicate skills.
 */

export interface SkillMatchResult {
  score: number // 0 to 100
  matchedSkills: string[]
  missingSkills: string[]
  totalRequired: number
  matchedCount: number
  hasRequiredSkills: boolean
  hasStudentSkills: boolean
  message?: string
}

/**
 * Normalizes an unknown skills input into an array of clean strings.
 */
export function normalizeSkillsList(skillsInput: unknown): string[] {
  if (!skillsInput) return []

  let list: unknown[] = []

  if (Array.isArray(skillsInput)) {
    list = skillsInput
  } else if (typeof skillsInput === 'string') {
    const trimmed = skillsInput.trim()
    if (!trimmed) return []

    // Try JSON parse first
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) list = parsed
      } catch {
        list = trimmed.slice(1, -1).split(',')
      }
    } else {
      // Split by comma
      list = trimmed.split(',')
    }
  }

  // Flatten and normalize strings
  const stringItems: string[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const clean = item.trim()
      if (clean) stringItems.push(clean)
    }
  }

  return stringItems
}

/**
 * Calculates rule-based match score between a student's skills and an internship's required skills.
 */
export function calculateSkillMatch(
  studentSkillsInput: unknown,
  requiredSkillsInput: unknown
): SkillMatchResult {
  const studentSkillsRaw = normalizeSkillsList(studentSkillsInput)
  const requiredSkillsRaw = normalizeSkillsList(requiredSkillsInput)

  // Deduplicate case-insensitively, keeping the original display representation
  const studentSkillsMap = new Map<string, string>()
  for (const s of studentSkillsRaw) {
    const key = s.toLowerCase()
    if (!studentSkillsMap.has(key)) {
      studentSkillsMap.set(key, s)
    }
  }

  const requiredSkillsMap = new Map<string, string>()
  for (const r of requiredSkillsRaw) {
    const key = r.toLowerCase()
    if (!requiredSkillsMap.has(key)) {
      requiredSkillsMap.set(key, r)
    }
  }

  const uniqueRequiredKeys = Array.from(requiredSkillsMap.keys())
  const totalRequired = uniqueRequiredKeys.length
  const totalStudentSkills = studentSkillsMap.size

  // Case 1: No required skills defined on the internship
  if (totalRequired === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      matchedCount: 0,
      hasRequiredSkills: false,
      hasStudentSkills: totalStudentSkills > 0,
      message: 'Not enough data to calculate match',
    }
  }

  // Case 2: Student has no skills recorded in their profile
  if (totalStudentSkills === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: Array.from(requiredSkillsMap.values()),
      totalRequired,
      matchedCount: 0,
      hasRequiredSkills: true,
      hasStudentSkills: false,
      message: 'Complete your profile skills to view your match score',
    }
  }

  // Case 3: Calculate intersection
  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  for (const key of uniqueRequiredKeys) {
    const displayVal = requiredSkillsMap.get(key)!
    if (studentSkillsMap.has(key)) {
      matchedSkills.push(displayVal)
    } else {
      missingSkills.push(displayVal)
    }
  }

  const matchedCount = matchedSkills.length
  const score = Math.round((matchedCount / totalRequired) * 100)

  return {
    score,
    matchedSkills,
    missingSkills,
    totalRequired,
    matchedCount,
    hasRequiredSkills: true,
    hasStudentSkills: true,
  }
}

/**
 * Returns color tokens for badge & progress bar based on score.
 */
export function getScoreColorTokens(score: number): {
  text: string
  bg: string
  border: string
  progressBg: string
} {
  if (score >= 75) {
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      progressBg: 'bg-emerald-500',
    }
  }
  if (score >= 50) {
    return {
      text: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800',
      progressBg: 'bg-blue-500',
    }
  }
  if (score >= 25) {
    return {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      progressBg: 'bg-amber-500',
    }
  }
  return {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    progressBg: 'bg-rose-500',
  }
}
