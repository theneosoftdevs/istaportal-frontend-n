// src/lib/studentStatus.ts

/**
 * Harmonise les statuts étudiants venant de différentes sources backend
 * (legacy UI + statuts académiques API) pour la logique de filtre/KPI.
 */
const normalize = (status?: string | null) => (status || "").trim().toLowerCase()

const PENDING = new Set(["pending", "en_attente", "en attente"])
const ACTIVE = new Set(["active", "en_cours", "en cours", "admis", "redoublant"])

export function isPendingStudentStatus(status?: string | null) {
  return PENDING.has(normalize(status))
}

export function isActiveStudentStatus(status?: string | null) {
  return ACTIVE.has(normalize(status))
}

export function matchesStudentStatusFilter(
  studentStatus: string | undefined,
  filterStatus: string,
) {
  if (filterStatus === "all") return true

  const normalizedFilter = normalize(filterStatus)
  const normalizedStudentStatus = normalize(studentStatus)

  if (normalizedFilter === "active") return isActiveStudentStatus(studentStatus)
  if (normalizedFilter === "pending") return isPendingStudentStatus(studentStatus)

  return normalizedStudentStatus === normalizedFilter
}
