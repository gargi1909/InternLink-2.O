/**
 * Smart Internship Match Score Utility (Backend & Shared)
 * 
 * Rule-based, explainable skill matcher:
 * Match Score = (Number of matched unique required skills / Total number of unique required skills) * 100
 */

export interface SkillMatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  totalRequired: number
  matchedCount: number
  hasRequiredSkills: boolean
  hasStudentSkills: boolean
  message?: string
}

export function normalizeSkillsList(skillsInput: unknown): string[] {
  if (!skillsInput) return []

  let list: unknown[] = []

  if (Array.isArray(skillsInput)) {
    list = skillsInput
  } else if (typeof skillsInput === 'string') {
    const trimmed = skillsInput.trim()
    if (!trimmed) return []

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) list = parsed
      } catch {
        list = trimmed.slice(1, -1).split(',')
      }
    } else {
      list = trimmed.split(',')
    }
  }

  const stringItems: string[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const clean = item.trim()
      if (clean) stringItems.push(clean)
    }
  }

  return stringItems
}

export function calculateSkillMatch(
  studentSkillsInput: unknown,
  requiredSkillsInput: unknown
): SkillMatchResult {
  const studentSkillsRaw = normalizeSkillsList(studentSkillsInput)
  const requiredSkillsRaw = normalizeSkillsList(requiredSkillsInput)

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
