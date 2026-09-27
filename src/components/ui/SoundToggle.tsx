'use client'

import { sfx, useSfxEnabled } from '@/lib/sfx'

export default function SoundToggle() {
    const on = useSfxEnabled()
    return (
        <button
            type="button"
            onClick={() => sfx.toggle()}
            aria-pressed={on}
            aria-label={on ? 'Turn sound off' : 'Turn sound on'}
            title={on ? 'Sound on' : 'Sound off'}
            className="fixed bottom-4 left-4 z-[60] w-9 h-9 rounded-full bg-black/70 backdrop-blur border border-green-500/30 text-base leading-none hover:bg-green-500/10 transition-colors"
        >
            {on ? '🔊' : '🔇'}
        </button>
    )
}
