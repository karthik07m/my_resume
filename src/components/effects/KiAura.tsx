// Deterministic so the server and the client draw the same flames (same trick as the bolts in ui/Haki.tsx).
let seed = 9
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const n = (v: number) => v.toFixed(1)

// Three flame silhouettes. CSS shows one at a time, so the aura flickers on threes like the cel animation did.
const SPIKES = 15
const FLAMES = Array.from({ length: 3 }, () => {
    const w = 100 / SPIKES
    let d = 'M0,100'
    for (let i = 0; i < SPIKES; i++) {
        const x = i * w
        const mid = (i + 0.5) / SPIKES
        const env = Math.sin(Math.PI * mid) ** 0.45 // a crown: tall across the middle, dropping off at both ends
        const h = 100 * env * (0.45 + 0.55 * rand())
        const tipX = x + w * (0.5 + (mid - 0.5) * 1.2 + (rand() - 0.5) * 0.5) // tips lean away from the centre
        const valley = i === SPIKES - 1 ? 100 : 100 - h * (0.35 + 0.25 * rand())
        // Each spike swells on the way up and comes to a sharp point
        d += ` Q${n(x + w * 0.15)},${n(100 - h * 0.5)} ${n(tipX)},${n(100 - h)} Q${n(x + w * 0.85)},${n(100 - h * 0.5)} ${n(x + w)},${n(valley)}`
    }
    return d
})

// Super Saiyan 2 and 3's lightning: a few short bolts climbing through the aura.
const BOLTS = Array.from({ length: 5 }, (_, i) => {
    let x = 6 + i * 21 + rand() * 6
    let y = 55 + rand() * 40
    const pts = [`${n(x)},${n(y)}`]
    for (let s = 0; s < 4; s++) {
        x += (rand() - 0.5) * 9
        y -= 5 + rand() * 8
        pts.push(`${n(x)},${n(y)}`)
    }
    return pts.join(' ')
})

// The flame behind the hero name. Colour comes from --aura, size and brightness from --charge (see globals.css).
export default function KiAura({ sparks }: { sparks: boolean }) {
    return (
        <div className="ki-aura absolute -inset-x-10 -top-36 bottom-0 -z-10 pointer-events-none" aria-hidden>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="ki-aura-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" style={{ stopColor: 'var(--aura)', stopOpacity: 1 }} />
                        <stop offset="0.55" style={{ stopColor: 'var(--aura)', stopOpacity: 0.4 }} />
                        <stop offset="1" style={{ stopColor: 'var(--aura)', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                {FLAMES.map((d, i) => (
                    <g key={i} style={{ animationDelay: `${i * -0.12}s` }}>
                        <path d={d} fill="url(#ki-aura-fill)" />
                        {/* The brighter core every aura has: the next frame again, smaller */}
                        <path d={FLAMES[(i + 1) % 3]} fill="url(#ki-aura-fill)" transform="translate(12 42) scale(0.76 0.58)" />
                    </g>
                ))}
                {sparks && BOLTS.map((points, i) => (
                    <polyline key={i} points={points} fill="none" stroke="#e0f2fe" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * -0.17}s` }} />
                ))}
            </svg>
        </div>
    )
}
