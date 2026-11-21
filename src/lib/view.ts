import { useSyncExternalStore } from 'react'
import { VIEW_KEY as KEY } from './viewScript'

// Which version of the site a visitor sees. The plain résumé is the default; the anime site is opt-in.
// `?view=pro` / `?view=anime` in the link wins for that visit; otherwise the answer to the popup, remembered only until the tab closes, so every new visit is asked again.
// The same rule runs before first paint in layout.tsx (viewScript.ts), so an anime visitor never sees the plain page flash.
export type View = 'pro' | 'anime'

const listeners = new Set<() => void>()
let current: View | null = null

const fromLink = (): View | null => {
    const v = new URLSearchParams(location.search).get('view')
    return v === 'pro' || v === 'anime' ? v : null
}
const stored = (): View | null => {
    try {
        const v = sessionStorage.getItem(KEY)
        return v === 'pro' || v === 'anime' ? v : null
    } catch {
        return null
    }
}

const getView = () => (current ??= fromLink() ?? stored() ?? 'pro')
const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => { listeners.delete(l) }
}

export const useView = () => useSyncExternalStore<View>(subscribe, getView, () => 'pro')

// Ask only visitors who came without a ?view= link and haven't answered before.
export const shouldAsk = () => fromLink() === null && stored() === null

export const setView = (v: View) => {
    const changed = v !== getView()
    current = v
    try { sessionStorage.setItem(KEY, v) } catch { /* private mode: the choice lasts for this page only */ }
    document.documentElement.dataset.view = v
    if (changed) window.scrollTo(0, 0)
    listeners.forEach((l) => l())
}

