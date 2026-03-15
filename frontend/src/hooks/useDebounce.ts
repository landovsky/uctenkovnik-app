import { useRef, useCallback } from 'react'

export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay = 300,
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay],
  ) as unknown as T
}
