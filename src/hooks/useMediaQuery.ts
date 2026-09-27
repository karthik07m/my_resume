'use client'

import { useSyncExternalStore } from 'react'

// True when the media query matches. Returns `false` during SSR / first paint.
export function useMediaQuery(query: string) {
    return useSyncExternalStore(
        (onChange) => {
            const mql = window.matchMedia(query)
            mql.addEventListener('change', onChange)
            return () => mql.removeEventListener('change', onChange)
        },
        () => window.matchMedia(query).matches,
        () => false,
    )
}
