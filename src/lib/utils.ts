import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a user object by splitting a "name" property into first_name, middle_name, and last_name.
 */
export function normalizeUser<T extends { name?: string; first_name?: string; middle_name?: string; last_name?: string }>(u: T): T & { first_name: string; middle_name: string; last_name: string } {
  const result = { ...u } as any
  
  if (u.name && !u.first_name) {
    const parts = u.name.trim().split(/\s+/)
    result.first_name = parts[0] || ""
    result.middle_name = parts.length > 1 ? parts[1] : ""
    result.last_name = parts.length > 2 ? parts.slice(2).join(" ") : ""
  } else {
    result.first_name = u.first_name || ""
    result.middle_name = u.middle_name || ""
    result.last_name = (u as any).last_name || ""
  }
  
  return result
}

/**
 * Generates initials from names.
 */
export function getInitials(first_name?: string, middle_name?: string, last_name?: string) {
  return ((first_name?.[0] || "") + (middle_name?.[0] || "") + (last_name?.[0] || "")).toUpperCase()
}
