import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a user object by splitting a "name" property into firstName, familyName, and lastName.
 */
export function normalizeUser<T extends { name?: string; firstName?: string; familyName?: string; lastName?: string }>(u: T): T & { firstName: string; familyName: string; lastName: string } {
  const result = { ...u } as T & { firstName: string; familyName: string; lastName: string }
  
  if (u.name && !u.firstName) {
    const parts = u.name.trim().split(/\s+/)
    result.firstName = parts[0] || ""
    result.familyName = parts.length > 1 ? parts[1] : ""
    result.lastName = parts.length > 2 ? parts.slice(2).join(" ") : ""
  } else {
    result.firstName = u.firstName || ""
    result.familyName = u.familyName || ""
    result.lastName = u.lastName || ""
  }
  
  return result
}

/**
 * Generates initials from names.
 */
export function getInitials(firstName?: string, familyName?: string, lastName?: string) {
  return ((firstName?.[0] || "") + (familyName?.[0] || "") + (lastName?.[0] || "")).toUpperCase()
}
