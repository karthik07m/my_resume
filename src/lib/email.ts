import { useSyncExternalStore } from 'react'
import resume from '@/data/resume.json'

// The email is kept out of the page's HTML and scripts as plain text, so simple scrapers don't pick it up:
// resume.json holds it reversed and base64-encoded, and it is put together in the browser once the page has loaded.
// The prerendered HTML and the first render have no email at all.
const decodeEmail = (code: string) => atob(code).split('').reverse().join('')
const noSubscribe = () => () => {}
export const useEmail = () => useSyncExternalStore(noSubscribe, () => decodeEmail(resume.emailCode), () => '')
