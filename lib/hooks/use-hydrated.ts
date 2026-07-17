import { useState, useEffect } from 'react'

/** Returns true only after the client has mounted and Zustand has rehydrated from localStorage. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])
  return hydrated
}
