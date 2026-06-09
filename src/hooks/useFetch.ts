// src/hooks/useFetch.ts
import { useState, useEffect, useCallback } from "react"
import { ApiError } from "@/api/client"

interface UseFetchResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : (err?.message || "Erreur"))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, isLoading, error, refetch: execute }
}
