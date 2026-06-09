// src/hooks/useCurrentUser.ts
// Centralises the "find the entity that matches the logged-in user" logic
// so every page uses the same resolution instead of duplicating it.
import { useAuth } from "@/contexts/AuthContext"
import type { AppData, Student, Teacher } from "@/types"

/**
 * Returns the Student record linked to the currently authenticated user.
 * Falls back to the first student in the store so demo mode always works,
 * but with RoleGuard in place an unauthenticated/wrong-role call is unreachable.
 */
export function useCurrentStudent(store: AppData): Student | null {
  const { user } = useAuth()
  if (!user) return null
  return (
    store.students.find((s) => s.user_id === user.id) ||
    store.students[0] ||
    null
  )
}

/**
 * Returns the Teacher record linked to the currently authenticated user.
 */
export function useCurrentTeacher(store: AppData): Teacher | null {
  const { user } = useAuth()
  if (!user) return null
  return (
    store.teachers.find((t) => t.user_id === user.id) ||
    store.teachers[0] ||
    null
  )
}
