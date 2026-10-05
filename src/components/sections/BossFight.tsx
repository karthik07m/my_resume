'use client'

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { sfx } from '@/lib/sfx'

// Every arc's job card opens on its island. Wano is Kaido's sky: he swims after your pointer and breathes fire on
// click. The other arcs are boss fights: Luffy on the left (Ace at Marineford), the arc's canon villain on the right,
// an HP bar sized by the job's difficulty stars, and the player's move from that arc on every click. Bosses dodge, telegraph a counterattack
// you can punch through, and go down at 0 HP.

export const makeRand = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

export type Pt = { x: number; y: number }

/* ───────────────────────── Kaido's dragon form ───────────────────────── */

// The spine is a chain of points; every frame the body, belly, back spikes, legs, head and tail are rebuilt
// around it and written straight to the DOM, so React never re-renders for the animation.
const SEGMENTS = 30
const SEGMENT_PX = 9
const MANE_END = 7 // the mane runs down the neck to this joint; back spikes take over after it
const HEAD = 1.1 // the head art's scale against the body
// Body half-width along the spine: a thick neck and chest, tapering to a thin tail.
const girth = (i: number) => { const u = i / (SEGMENTS - 1); return u < 0.15 ? 8.5 + (u / 0.15) * 3 : 11.5 * (1 - (u - 0.15) / 0.85) ** 1.1 + 1.2 }
const fmt = (q: Pt) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`
// The point `across` towards the back and `along` towards the head from `c`.
const off = (c: Pt, n: Pt, v: Pt, across: number, along = 0) => ({ x: c.x + n.x * across + v.x * along, y: c.y + n.y * across + v.y * along })
const ribbon = (center: Pt[], half: (i: number) => number, norm: Pt[]) => {
    const l = center.map((c, i) => ({ x: c.x + norm[i].x * half(i), y: c.y + norm[i].y * half(i) }))
    const r = center.map((c, i) => ({ x: c.x - norm[i].x * half(i), y: c.y - norm[i].y * half(i) }))
    return `M ${l.map(fmt).join(' L ')} L ${r.reverse().map(fmt).join(' L ')} Z`
}
// Unit tangent at every joint, pointing towards the head.
const tangents = (p: Pt[]) => p.map((_, i) => {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(SEGMENTS - 1, i + 1)]
    const len = Math.hypot(a.x - b.x, a.y - b.y) || 1
    return { x: (a.x - b.x) / len, y: (a.y - b.y) / len }
})
const LEGS = [{ at: 5, phase: 0 }, { at: 17, phase: Math.PI }]

type Palette = { body: string; edge: string; belly: string; gold: string; mane: string; whisker: string; eye?: string }
const AZURE: Palette = { body: '#2563eb', edge: '#1e3a8a', belly: '#fde68a', gold: '#f59e0b', mane: '#ef4444', whisker: '#fef3c7' }

// Returns a function that redraws the dragon inside `el` for spine `p` at time `t`.
// `stride` (0 still, 1 swimming flat out) drives the leg gait and how hard the body ripples.
function dragonDrawer(el: SVGElement) {
    const q = (sel: string) => el.querySelector<SVGElement>(`[data-${sel}]`)!
    const [body, back, belly, scutes, scales, mane, spikes, legs, claws, head, tail, whiskers, crest] =
        ['body', 'back', 'belly', 'scutes', 'scales', 'mane', 'spikes', 'legs', 'claws', 'head', 'tail', 'whiskers', 'crest'].map(q)
    // He is drawn side on, so turning around means rolling over to keep his back up. Only the head decides to roll;
    // every joint behind it takes on the roll the head had when it passed that spot, so the twist travels down the
    // body as it follows the head through the turn, the way a serpent (or a dragon-dance dragon) turns, instead of
    // the whole body flipping at once.
    let up = 1 // which side the head wants its back on
    let headRoll = 1 // eases through 0 towards `up`
    let last = 0, travelled = 0
    let prevHead: Pt | null = null
    const trail: { d: number; r: number }[] = [] // the head's roll by distance travelled
    return (p: Pt[], t: number, stride: number) => {
        // Facing is judged from the neck, with a dead zone so the side-to-side weave can't toggle it.
        const dir = { x: p[0].x - p[3].x, y: p[0].y - p[3].y }
        const facing = dir.x / (Math.hypot(dir.x, dir.y) || 1)
        if (facing > 0.35) up = 1
        else if (facing < -0.35) up = -1
        headRoll += (up - headRoll) * (1 - Math.exp(-Math.min(t - last, 100) / 60))
        last = t
        if (prevHead) travelled += Math.hypot(p[0].x - prevHead.x, p[0].y - prevHead.y)
        prevHead = { x: p[0].x, y: p[0].y }
        // Standing still, the head can roll on its own; the body only takes the roll on as it moves through.
        if (trail.length && travelled - trail[trail.length - 1].d < 0.5) trail[trail.length - 1].r = headRoll
        else trail.push({ d: travelled, r: headRoll })
        while (trail.length > 2 && trail[1].d < travelled - SEGMENTS * SEGMENT_PX - 20) trail.shift()
        const rolls: number[] = []
        for (let i = 0, j = trail.length - 1; i < SEGMENTS; i++) {
            while (j > 0 && trail[j].d > travelled - i * SEGMENT_PX) j--
            rolls.push(trail[j].r)
        }

        let tan = tangents(p)
        // A wave runs from the neck to the tail, so he swims like a serpent even in a straight line. The head is
        // left out of it, so he still looks where he is going.
        const amp = 2.5 + 3.5 * stride
        const s = p.map((c, i) => off(c, { x: tan[i].y, y: -tan[i].x }, tan[i], amp * Math.min(1, i / 6) * Math.sin(t / 240 - i * 0.5)))
        tan = tangents(s)
        const norm = tan.map((v, i) => ({ x: v.y * rolls[i], y: -v.x * rolls[i] }))

        // Where he is mid-twist he is seen edge on: features pass through the middle, and the body there narrows a little.
        body.setAttribute('d', ribbon(s, (i) => girth(i) * Math.max(Math.abs(rolls[i]), 0.65), tan.map((v) => ({ x: v.y, y: -v.x }))))
        // a darker stripe down the back and the cream belly, with its scutes and a few rows of scales between
        back.setAttribute('d', ribbon(s.map((c, i) => off(c, norm[i], tan[i], girth(i) * 0.5)), (i) => girth(i) * 0.32, norm))
        belly.setAttribute('d', ribbon(s.map((c, i) => off(c, norm[i], tan[i], -girth(i) * 0.45)), (i) => girth(i) * 0.4, norm))
        let sc = '', sk = '', mn = '', sp = ''
        for (let i = 2; i < SEGMENTS - 3; i++) {
            const r = girth(i), c = s[i], n = norm[i], v = tan[i]
            sc += `M ${fmt(off(c, n, v, -r * 0.1))} L ${fmt(off(c, n, v, -r * 0.82))} `
            const m = off(c, n, v, r * (0.08 + (i % 2) * 0.2))
            sk += `M ${fmt(off(m, n, v, 2.2))} Q ${fmt(off(m, n, v, 0, -3.2))} ${fmt(off(m, n, v, -2.2))} `
        }
        // the mane streams back off the neck and ripples; spikes run along the back from there to the tail
        for (let i = 0; i <= MANE_END; i++) {
            const r = girth(i), c = s[i], n = norm[i], v = tan[i], flow = 2.5 * Math.sin(t / 160 + i)
            mn += `M ${fmt(off(c, n, v, r * 0.7, 4))} Q ${fmt(off(c, n, v, r + 7, 3))} ${fmt(off(c, n, v, r + 8 + flow, -12))} L ${fmt(off(c, n, v, r * 0.7, -4))} Z `
        }
        for (let i = MANE_END + 1; i < SEGMENTS - 3; i += 2) {
            const r = girth(i), c = s[i], n = norm[i], v = tan[i]
            sp += `M ${fmt(off(c, n, v, r * 0.8, 3))} L ${fmt(off(c, n, v, r * 1.3 + 4, -5))} L ${fmt(off(c, n, v, r * 0.8, -3))} Z `
        }
        scutes.setAttribute('d', sc)
        scales.setAttribute('d', sk)
        mane.setAttribute('d', mn)
        spikes.setAttribute('d', sp)
        let lg = '', cl = ''
        // Both legs of a pair hang from the belly, seen side on: the far one a little behind, out of step.
        for (const { at, phase } of LEGS) for (const side of [1, -1]) {
            const r = girth(at), c = s[at], n = norm[at], v = tan[at]
            const swing = Math.sin(t / 110 + phase + (side > 0 ? 0 : Math.PI)) * 5 * stride
            const hip = off(c, n, v, -r * 0.3, side * 2.5)
            const knee = off(hip, n, v, -(r + 4), 4 + swing)
            const foot = off(knee, n, v, -5, -(6 - swing))
            lg += `M ${fmt(hip)} L ${fmt(knee)} L ${fmt(foot)} `
            for (const k of [-0.6, 0, 0.6]) {
                const dx = v.x * Math.cos(k) - v.y * Math.sin(k), dy = v.x * Math.sin(k) + v.y * Math.cos(k)
                cl += `M ${fmt(foot)} l ${(dx * 4).toFixed(1)} ${(dy * 4).toFixed(1)} `
            }
        }
        legs.setAttribute('d', lg)
        claws.setAttribute('d', cl)
        const deg = (v: Pt) => (Math.atan2(v.y, v.x) * 180) / Math.PI
        const flat = (r: number) => Math.sign(r || 1) * Math.max(Math.abs(r), 0.15) // head and tail art, mid-roll
        head.setAttribute('transform', `translate(${fmt(s[0])}) rotate(${deg(tan[0])}) scale(${HEAD} ${(HEAD * flat(rolls[0])).toFixed(2)})`)
        tail.setAttribute('transform', `translate(${fmt(s[SEGMENTS - 1])}) rotate(${(deg(tan[SEGMENTS - 1]) + Math.sin(t / 180) * 12).toFixed(1)}) scale(1 ${flat(rolls[SEGMENTS - 1]).toFixed(2)})`)
        // long whiskers and the crest on the skull drift as he swims (head coordinates)
        const w1 = Math.sin(t / 300) * 5, w2 = Math.sin(t / 300 + 1.3) * 5
        whiskers.setAttribute('d', `M 30 -5 Q 40 ${(-15 + w1).toFixed(1)} 52 ${(-12 + w2).toFixed(1)} Q 60 ${(-9 + w1).toFixed(1)} 66 ${(-14 + w2).toFixed(1)} M 28 2 Q 38 ${(12 + w2).toFixed(1)} 50 ${(10 + w1).toFixed(1)} Q 58 ${(8 + w2).toFixed(1)} 64 ${(13 + w1).toFixed(1)}`)
        crest.setAttribute('transform', `rotate(${(Math.sin(t / 200) * 6).toFixed(1)})`)
    }
}

// Back to front: tail tuft, legs, neck mane, back spikes, body with its back stripe, scales and belly, then the head.
// Paths are filled in by dragonDrawer.
function DragonParts({ c }: { c: Palette }) {
    return (
        <>
            <g data-tail>
                <path d="M 0 0 Q -8 -10 -24 -8 Q -14 -2 -26 2 Q -14 4 -22 12 Q -8 8 0 0 Z" fill={c.gold} />
            </g>
            <path data-legs fill="none" stroke={c.edge} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
            <path data-claws fill="none" stroke={c.belly} strokeWidth={1.3} strokeLinecap="round" />
            <path data-mane fill={c.mane} stroke={c.edge} strokeWidth={0.5} strokeLinejoin="round" />
            <path data-spikes fill={c.gold} stroke={c.edge} strokeWidth={0.6} />
            <path data-body fill={c.body} stroke={c.edge} strokeWidth={1.5} strokeLinejoin="round" />
            <path data-back fill={c.edge} opacity={0.45} />
            <path data-scales fill="none" stroke={c.edge} strokeWidth={0.8} opacity={0.5} />
            <path data-belly fill={c.belly} opacity={0.9} />
            <path data-scutes fill="none" stroke={c.gold} strokeWidth={0.8} opacity={0.7} />
            <g data-head>
                <path data-flame d="M 30 0 L 100 -24 Q 114 0 100 24 Z" fill="url(#bolo)" opacity={0} style={{ transformBox: 'fill-box', transformOrigin: 'left center' }} />
                {/* mane and crest flowing back off the skull */}
                <g data-crest>
                    <path d="M 2 -8 Q -14 -24 -30 -16 Q -20 -10 -30 -3 Q -18 -2 -26 9 Q -10 6 -2 11 Z" fill={c.mane} stroke={c.edge} strokeWidth={0.5} />
                    <path d="M 2 -6 Q -7 -15 -16 -11 Q -10 -4 -16 3 Q -5 3 0 6 Z" fill={c.gold} />
                </g>
                {/* branched horns */}
                <path d="M 5 -10 Q -6 -26 -22 -32 M -8 -22 L -11 -33 M -14 -27 L -23 -24 M 10 -9 Q 4 -22 -8 -30" fill="none" stroke={c.belly} strokeWidth={2.4} strokeLinecap="round" />
                {/* beard under the jaw */}
                <path d="M 2 7 Q -3 18 -14 22 Q -8 14 -10 9 Q -3 12 6 8 Z" fill={c.whisker} />
                {/* open mouth, then the lower jaw, which drops for Bolo Breath */}
                <path d="M 10 2 L 31 -1 L 27 8 Z" fill="#7f1d1d" />
                <g data-jaw style={{ transformOrigin: '-2px 5px' }}>
                    <path d="M -2 6 Q 10 10 28 7 L 25 3 L 12 3 Z" fill={c.body} stroke={c.edge} strokeWidth={0.8} />
                    <path d="M 17 4 l 1.5 -2.5 l 1.5 2.5 M 22 4 l 1.5 -2.5 l 1.5 2.5" fill="#fff" />
                </g>
                {/* upper jaw and snout, fangs, nostril */}
                <path d="M -6 -9 Q 8 -15 20 -8 L 32 -6 Q 35 -3 32 0 L 12 2 Q 0 4 -6 6 Z" fill={c.body} stroke={c.edge} strokeWidth={0.8} />
                <path d="M 16 1 l 2 3.5 l 2 -3.5 M 22 0 l 2 3.5 l 2 -3.5 M 27 -0.5 l 1.5 2.5 l 1.5 -2.5" fill="#fff" />
                <circle cx={31} cy={-4} r={1} fill={c.edge} />
                {/* heavy brow over a glowing eye */}
                <path d="M 1 -9 Q 9 -15 16 -9 Q 9 -11 1 -9 Z" fill={c.edge} stroke={c.belly} strokeWidth={0.8} />
                <ellipse cx={9} cy={-6} rx={2.8} ry={2.1} fill={c.eye ?? '#fde047'} />
                <ellipse cx={9.4} cy={-6} rx={0.7} ry={1.9} fill="#111" />
                {/* whiskers trailing from the snout, redrawn every frame */}
                <path data-whiskers fill="none" stroke={c.whisker} strokeWidth={1.2} strokeLinecap="round" />
            </g>
        </>
    )
}

export type Follow = { x: number; y: number; until: number } // pointer target in stage px, valid until `until`

// The dragon swims after the pointer while it's over its stage, weaving a wide figure-eight through it rather than
// stopping dead (a tight circle knotted his body up), and loops lazily through the sky otherwise. Coordinates are in
// "dragon units" (px / scale). The loop only runs while the stage is on screen. Kaido in the Wano stage, who swims in from off the right edge the first time it scrolls into
// view; with a green palette, Shenron in the hero (effects/Shenron.tsx), who rises from `from`.
export function Dragon({ w, h, palette, size, from, follow, breath }: {
    w: number; h: number; palette: Palette; size?: number; from?: Pt; follow: React.RefObject<Follow | null>; breath?: React.RefObject<(() => void) | null>
}) {
    const g = useRef<SVGGElement>(null)
    const inView = useInView(g)
    const pts = useRef<Pt[] | null>(null)
    const scale = size ?? h / 270

    useEffect(() => {
        const el = g.current
        if (!el || !w || !h) return
        const draw = dragonDrawer(el)
        const flame = el.querySelector<SVGPathElement>('[data-flame]')!
        const jaw = el.querySelector<SVGGElement>('[data-jaw]')!
        const W = w / scale, H = h / scale
        const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
        pts.current ??= Array.from({ length: SEGMENTS }, (_, i) =>
            from ? { x: from.x / scale, y: from.y / scale + i * SEGMENT_PX }
                : calm ? { x: W * 0.7 - i * SEGMENT_PX, y: H * 0.4 }
                    : { x: W + 30 + i * SEGMENT_PX, y: H * 0.7 + i * 1.5 })
        const p = pts.current
        let stride = 0
        if (breath) breath.current = () => {
            flame.animate(
                [{ opacity: 0, transform: 'scaleX(0.1)' }, { opacity: 0.95, transform: 'scaleX(1)', offset: 0.3 }, { opacity: 0, transform: 'scaleX(1.35)' }],
                { duration: 850, easing: 'ease-out' },
            )
            jaw.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(24deg)', offset: 0.2 }, { transform: 'rotate(24deg)', offset: 0.75 }, { transform: 'rotate(0deg)' }], { duration: 850 })
        }
        draw(p, 0, 0)
        if (!inView || calm) return

        // A bigger dragon is heavier: slower in his own units and slower on screen too, so Shenron (3x Kaido's size)
        // drifts rather than darts. Kaido's own scale is about 1.1, where this is 1.
        const slow = Math.min(1, 1.1 / scale) ** 1.5
        let raf = 0, prev = 0
        const tick = (t: number) => {
            // Movement is per 60 Hz frame; `k` rescales it so a 120 Hz screen doesn't double his speed.
            const k = prev ? Math.min(t - prev, 50) / (1000 / 60) : 1
            prev = t
            const f = follow.current
            const target = f && performance.now() < f.until
                ? { x: (f.x + Math.sin(t / 1400) * 88) / scale, y: (f.y + Math.sin(t / 700) * 29) / scale }
                : { x: W * (0.5 + 0.36 * Math.sin(t / 2600)), y: H * (0.42 + 0.2 * Math.sin((t / 2600) * 2.1)) }
            const head = p[0]
            const dx = target.x - head.x, dy = target.y - head.y, d = Math.hypot(dx, dy)
            stride += (Math.min(1, d / 30) - stride) * (1 - 0.9 ** k)
            if (d > 1) {
                // Swim, don't glide: weave side to side across the heading.
                const weave = Math.sin(t / 220) * Math.min(1, d / 40) * 3.5 * k * slow
                const step = Math.min(d * (1 - (1 - 0.1 * slow) ** k), 8 * k * slow)
                head.x += (dx / d) * step - (dy / d) * weave
                head.y += (dy / d) * step + (dx / d) * weave
            }
            for (let i = 1; i < SEGMENTS; i++) {
                const ax = p[i].x - p[i - 1].x, ay = p[i].y - p[i - 1].y, len = Math.hypot(ax, ay) || 1
                p[i].x = p[i - 1].x + (ax / len) * SEGMENT_PX
                p[i].y = p[i - 1].y + (ay / len) * SEGMENT_PX
            }
            draw(p, t, stride)
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [inView, w, h, scale, from, follow, breath])

    return (
        <g ref={g} transform={`scale(${scale})`}>
            <DragonParts c={palette} />
        </g>
    )
}

/* ───────────────────────── The fighters ───────────────────────── */
// Everyone is drawn standing with their feet at (0, 0), about 100 units tall, in one flat style: a dark outline and
// flat fills. Bosses face left, towards Luffy. `live` is false while the stage is off screen, which stops every idle
// loop; `windup` swaps in the attack pose, the way a sprite sheet swaps frames.
type ArtProps = { live: boolean; windup: boolean }
const LINE = { stroke: '#111827', strokeWidth: 1.3, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

// A limb is a thick stroke with an outline: the same path drawn twice.
function Limb({ d, w = 6, fill }: { d: string; w?: number; fill: string }) {
    return (
        <>
            <path d={d} fill="none" stroke="#111827" strokeWidth={w + 2.6} />
            <path d={d} fill="none" stroke={fill} strokeWidth={w} />
        </>
    )
}

// The player. Straw hat, scar under the eye, open red vest, blue shorts; pink in Gear 2.
// While a punch is out (`armOut`) the attack effect draws his stretched arm, so the resting one is left off.
function Luffy({ gear2, armOut, shock = false }: { gear2: boolean; armOut: boolean; shock?: boolean }) {
    const skin = gear2 ? '#f9a8d4' : '#f5c99b'
    return (
        <g {...LINE}>
            <Limb d="M -7 -62 Q -15 -54 -9 -46" w={5} fill={skin} />
            <path d="M -11 0 h 11 v -3 h -10 Z M 3 0 h 11 l -1 -3 h -10 Z" fill="#a16207" />
            <rect x={-9} y={-24} width={6} height={21} fill={skin} />
            <rect x={4} y={-24} width={6} height={21} fill={skin} />
            <path d="M -11 -42 H 12 L 12.5 -24 H 2.5 L 0.5 -31 L -1.5 -24 H -11.5 Z" fill="#2563eb" />
            <path d="M -11.5 -25 h 10 M 2.5 -25 h 10" stroke="#f8fafc" strokeWidth={2.6} />
            <rect x={-8} y={-66} width={17} height={25} rx={3} fill={skin} />
            <path d="M -9 -67 H -2.5 L -3.5 -41 H -10 Z M 10 -67 H 3.5 L 4.5 -41 H 11 Z" fill="#dc2626" />
            {!armOut && (
                <>
                    <Limb d="M 8 -62 Q 18 -58 17 -49" w={5} fill={skin} />
                    <circle cx={17} cy={-47} r={4} fill={skin} />
                </>
            )}
            <circle cx={1} cy={-78} r={11.5} fill={skin} />
            <path d="M -10.5 -79 Q -12 -92 1 -91 Q 13 -92 12.5 -80 Q 8 -86 4 -84 Q 0 -87 -4 -84 Q -8 -86 -10.5 -79 Z" fill="#111827" />
            <circle cx={5.5} cy={-79} r={1.5} fill="#111827" stroke="none" />
            <circle cx={-1.5} cy={-79} r={1.5} fill="#111827" stroke="none" />
            <path d="M 4 -76 h 3 M 4.8 -77 v 2 M 6.2 -77 v 2" strokeWidth={0.8} />
            {/* the grin, or a gasp when Ace falls */}
            {shock ? <ellipse cx={2.5} cy={-71.5} rx={2.2} ry={3} fill="#7f1d1d" strokeWidth={1} /> : <path d="M -4 -73.5 Q 2 -67 8 -73.5 Z" fill="#fff" strokeWidth={1} />}
            <ellipse cx={1} cy={-88} rx={18} ry={4.6} fill="#fbbf24" />
            <path d="M -10 -89 Q -9 -101 1 -101 Q 11 -101 12 -89 Z" fill="#fcd34d" />
            <path d="M -10 -89.5 Q 1 -86.5 12 -89.5 L 11.6 -92.5 Q 1 -89.8 -9.6 -92.5 Z" fill="#dc2626" />
        </g>
    )
}

// Portgas D. Ace, the player at Marineford: the orange cowboy hat with its two faces, freckles, open chest with the red
// bead necklace, black shorts and boots, and flames licking off his shoulders (he is a Logia, made of fire). While
// Hiken is out (`armOut`) his right arm is thrust forward and burning.
// The hat: orange crown with a dent, a band of red beads, and the two faces on the front. Brim centred on (1, -88).
const ACE_HAT = (
    <g {...LINE}>
        <ellipse cx={1} cy={-88} rx={19} ry={4.2} fill="#f97316" />
        <path d="M -9 -89 Q -10 -101 -3 -101 Q 1 -97 5 -101 Q 12 -101 11 -89 Z" fill="#fb923c" />
        <path d="M -9 -90.5 Q 1 -87.5 11 -90.5" fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="0.1 2.2" />
        <circle cx={-2.5} cy={-95} r={1.7} fill="#f8fafc" strokeWidth={0.6} />
        <circle cx={4.5} cy={-95} r={1.7} fill="#f8fafc" strokeWidth={0.6} />
    </g>
)

function Ace({ live, armOut, hatless = false }: { live: boolean; armOut: boolean; hatless?: boolean }) {
    const skin = '#eab676'
    // one flame, base at (0, 0), pointing up
    const flame = (x: number, y: number, s: number) => (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M -3 0 Q -6 -6 -1 -12 Q 0 -6 2 -5 Q 2 -10 5 -13 Q 7 -5 3 0 Z" fill="#f97316" stroke="none" />
            <path d="M -1.5 0 Q -3 -4 0 -7 Q 1 -3 2 0 Z" fill="#fde047" stroke="none" />
        </g>
    )
    return (
        <g {...LINE}>
            {/* shoulder flames, behind him, flickering while the stage is on screen */}
            <motion.g animate={{ scaleY: live ? [1, 1.3, 0.85, 1.15, 1] : 1 }} transition={{ duration: 0.7, repeat: live ? Infinity : 0 }} style={{ originX: 0.5, originY: 1 }}>
                {flame(-8, -64, 1.1)}
                {flame(10, -64, 0.9)}
            </motion.g>
            <Limb d="M -7 -62 Q -15 -54 -9 -46" w={5} fill={skin} />
            <path d="M -11 0 h 11 v -6 h -10 Z M 3 0 h 11 l -1 -6 h -10 Z" fill="#111827" />
            <rect x={-9} y={-20} width={6} height={15} fill="#1f2937" />
            <rect x={4} y={-20} width={6} height={15} fill="#1f2937" />
            <path d="M -11 -42 H 12 L 12.5 -18 H 2.5 L 0.5 -28 L -1.5 -18 H -11.5 Z" fill="#111827" />
            <rect x={-8} y={-66} width={17} height={25} rx={3} fill={skin} />
            <path d="M 0.5 -59 v 13" strokeWidth={0.6} />
            {/* belt with his "A" buckle */}
            <rect x={-11} y={-45} width={23} height={4} fill="#b45309" />
            <rect x={-2} y={-46} width={5} height={6} rx={1} fill="#facc15" strokeWidth={0.8} />
            {/* red bead necklace */}
            {[[-5, -63.5], [-2.5, -62.4], [0.5, -61.9], [3.5, -62.4], [6, -63.5]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={1.4} fill="#dc2626" strokeWidth={0.6} />)}
            {armOut ? (
                <>
                    <Limb d="M 8 -62 L 28 -62" w={5} fill={skin} />
                    <circle cx={30} cy={-62} r={4.5} fill="#f97316" />
                    {flame(30, -60, 1.2)}
                </>
            ) : (
                <>
                    <Limb d="M 8 -62 Q 18 -58 17 -49" w={5} fill={skin} />
                    <circle cx={17} cy={-47} r={4} fill={skin} />
                </>
            )}
            <circle cx={1} cy={-78} r={11.5} fill={skin} />
            <path d="M -11 -78 Q -13 -93 1 -92 Q 14 -92 13 -79 L 11 -80 Q 9 -86 4 -84 Q 0 -87 -4 -84 Q -8 -86 -9 -79 L -12 -71 Z" fill="#111827" />
            <circle cx={5.5} cy={-79} r={1.4} fill="#111827" stroke="none" />
            <circle cx={-1.5} cy={-79} r={1.4} fill="#111827" stroke="none" />
            {/* freckles and a confident grin */}
            <path d="M 3.6 -75.6 h 0.1 M 5.2 -74.9 h 0.1 M 6.8 -75.6 h 0.1 M -3.2 -75.6 h 0.1 M -1.6 -74.9 h 0.1" stroke="#9a3412" strokeWidth={1} />
            <path d="M -2 -72 Q 3 -68.5 7.5 -72.5" fill="none" strokeWidth={1.1} />
            {!hatless && <g transform="rotate(-7 1 -88)">{ACE_HAT}</g>}
        </g>
    )
}

// Ace's last moment, as in the anime: Luffy is behind him; Ace has turned to face his brother, so Akainu's magma takes
// him in the back (a glow and a wisp of steam, nothing graphic); his hat falls, and he slumps onto Luffy's shoulder,
// still smiling. Drawn at the player's spot, feet at (0, 0).
function AceFall() {
    return (
        <g>
            <motion.g initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
                <Luffy gear2={false} armOut={false} shock />
            </motion.g>
            {/* Ace between Luffy and Akainu, facing Luffy; his knees give and he leans onto him, feet still on the ground */}
            <motion.g initial={{ x: 34, rotate: 0, scaleY: 1 }} animate={{ x: 27, rotate: -12, scaleY: 0.93 }} transition={{ delay: 0.7, duration: 1.3, ease: [0.4, 0, 0.7, 1] }} style={{ originX: 0.5, originY: 1 }}>
                <g transform="scale(-1 1)"><Ace live={false} armOut={false} hatless /></g>
                {/* the magma, on his back */}
                <motion.circle cx={9} cy={-56} fill="#f97316" stroke="none" initial={{ r: 0, opacity: 0 }} animate={{ r: [0, 13, 7], opacity: [0, 0.9, 0.55] }} transition={{ duration: 0.8 }} />
                <motion.circle cx={9} cy={-56} fill="#fde047" stroke="none" initial={{ r: 0, opacity: 0 }} animate={{ r: [0, 6, 3], opacity: [0, 1, 0.7] }} transition={{ duration: 0.8 }} />
                {[0, 1, 2].map((i) => (
                    <motion.circle key={i} cx={11 + i * 3} r={2.5} fill="#e5e7eb" stroke="none" initial={{ cy: -58, opacity: 0 }} animate={{ cy: [-58, -84], opacity: [0, 0.6, 0] }} transition={{ delay: 0.5 + i * 0.35, duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }} />
                ))}
            </motion.g>
            {/* his hat comes off, tumbles, and comes to rest on its brim in front of them */}
            <motion.g initial={{ x: 34, y: 0, rotate: 0 }} animate={{ x: [34, 50, 58], y: [0, 30, 83], rotate: [0, 35, 6] }} transition={{ delay: 0.35, duration: 1.1, times: [0, 0.45, 1], ease: 'easeIn' }} style={{ originX: 0.5, originY: 0.5 }}>
                <g transform="scale(-1 1)">{ACE_HAT}</g>
            </motion.g>
        </g>
    )
}

// Arlong: the saw nose, the Sun Pirates brand, an open shirt and the fin on his back.
function Arlong({ windup }: ArtProps) {
    const skin = '#7dd3fc'
    return (
        <g {...LINE}>
            <path d="M 11 -68 L 31 -54 L 13 -44 Z" fill="#38bdf8" />
            <path d="M 3 -93 Q 21 -88 19 -58 L 11 -61 Q 13 -80 2 -84 Z" fill="#111827" />
            <path d="M -14 0 h 12 v -3 h -11 Z M 2 0 h 12 l -1 -3 h -11 Z" fill="#78350f" />
            <rect x={-11} y={-24} width={8} height={21} fill={skin} />
            <rect x={3} y={-24} width={8} height={21} fill={skin} />
            <path d="M -13 -38 H 13 V -21 H 2 L 0 -28 L -2 -21 H -13 Z" fill="#1e293b" />
            <path d="M -14 -69 H 14 L 12 -36 H -12 Z" fill={skin} />
            <circle cx={-1} cy={-55} r={3} fill="#dc2626" stroke="none" />
            <path d="M -1 -60.5 v -2.5 M -1 -49.5 v 2.5 M -6.5 -55 h -2.5 M 4.5 -55 h 2.5 M -4.9 -58.9 l -1.8 -1.8 M 2.9 -51.1 l 1.8 1.8 M -4.9 -51.1 l -1.8 1.8 M 2.9 -58.9 l 1.8 -1.8" stroke="#dc2626" strokeWidth={1.2} />
            <path d="M -15 -70 L -7 -69 L -9 -36 L -14 -36 Z M 15 -70 L 6 -69 L 8 -36 L 14 -36 Z" fill="#facc15" />
            <path d="M 11 -58 h 0.1 M -11.5 -48 h 0.1 M 10.5 -44 h 0.1" stroke="#ea580c" strokeWidth={3} />
            {/* fist at his side, or cocked back for Shark on Darts */}
            <Limb d={windup ? 'M -13 -63 Q -25 -76 -17 -90' : 'M -13 -63 Q -27 -58 -27 -45'} fill={skin} />
            <circle cx={windup ? -17 : -27} cy={windup ? -92 : -43} r={4.6} fill={skin} />
            <circle cx={0} cy={-81} r={13} fill={skin} />
            <path d="M 8 -77 h 4 M 8 -74 h 4 M 8 -71 h 4" strokeWidth={0.9} />
            <path d="M -13 -87 Q -1 -106 14 -88 Q 0 -94 -13 -87 Z" fill="#92400e" />
            <path d="M -10 -84 L -56 -82 L -56 -78 L -10 -76 Z" fill="#e0f2fe" />
            <path d="M -50 -82 l 2 -4 l 2 4 M -42 -82.4 l 2 -4 l 2 4 M -34 -82.8 l 2 -4 l 2 4 M -26 -83.2 l 2 -4 l 2 4 M -18 -83.6 l 2 -4 l 2 4 M -50 -78 l 2 4 l 2 -4 M -42 -77.6 l 2 4 l 2 -4 M -34 -77.2 l 2 4 l 2 -4 M -26 -76.8 l 2 4 l 2 -4 M -18 -76.4 l 2 4 l 2 -4" fill="#fff" strokeWidth={0.7} />
            <path d="M -9 -72 Q -1 -64 8 -72 Z" fill="#fff" strokeWidth={1} />
            <path d="M -7 -71.6 l 2 2.6 l 2 -2.6 l 2 2.6 l 2 -2.6 l 2 2.6 l 2 -2.6" fill="none" strokeWidth={0.7} />
            <path d="M -9 -90 L -1 -87" strokeWidth={2} />
            <circle cx={-5} cy={-86.2} r={1.5} fill="#111827" stroke="none" />
        </g>
    )
}

// Crocodile: fur-collared coat, striped vest and cravat, the stitched scar, a cigar, and the golden hook.
function Crocodile({ live, windup }: ArtProps) {
    const hook = windup ? 'M -30 -90 Q -41 -103 -28 -108 Q -20 -108 -22 -100' : 'M -36 -41 Q -48 -36 -46 -24 Q -43 -18 -37 -23'
    return (
        <g {...LINE}>
            <path d="M -24 -66 Q -30 -30 -27 -4 H 27 Q 30 -30 24 -66 Z" fill="#1c1917" />
            <path d="M -12 0 h 11 v -3 h -10 Z M 1 0 h 11 l -1 -3 h -10 Z" fill="#0c0a09" />
            <rect x={-10} y={-30} width={8} height={27} fill="#292524" />
            <rect x={2} y={-30} width={8} height={27} fill="#292524" />
            <path d="M -11 -66 H 11 L 10 -28 H -10 Z" fill="#ea580c" />
            <path d="M -11 -58 h 22 M -10.8 -50 h 21.6 M -10.6 -42 h 21.2 M -10.4 -34 h 20.8" stroke="#9a3412" strokeWidth={0.8} />
            <path d="M -5 -66 L 0 -55 L 5 -66 Z" fill="#15803d" />
            <path d="M -26 -68 Q -13 -58 0 -65 Q 13 -58 26 -68 Q 15 -52 0 -58 Q -15 -52 -26 -68 Z" fill="#a8a29e" />
            {/* the hook: lowered, or raised for Desert Spada */}
            <Limb d={windup ? 'M -22 -60 Q -34 -72 -30 -88' : 'M -22 -60 Q -34 -54 -36 -44'} w={7} fill="#1c1917" />
            <path d={hook} fill="none" strokeWidth={5.6} />
            <path d={hook} fill="none" stroke="#facc15" strokeWidth={3.2} />
            <circle cx={0} cy={-79} r={12} fill="#f1c27d" />
            <path d="M -12 -82 Q -8 -96 3 -93 Q 13 -94 12.5 -80 Q 6 -88 -12 -82 Z" fill="#111827" />
            <path d="M -12 -78 L 11 -80" stroke="#7c2d12" strokeWidth={1.2} />
            <path d="M -8 -80.4 v 3 M -3 -80.8 v 3 M 2 -81.2 v 3 M 7 -81.6 v 3" stroke="#7c2d12" strokeWidth={0.7} />
            <path d="M -9 -85.5 l 5 1.4" strokeWidth={1.6} />
            <circle cx={-5.5} cy={-83} r={1.3} fill="#111827" stroke="none" />
            <rect x={-21} y={-74} width={11} height={3} rx={1} fill="#78350f" />
            {live && <motion.circle cx={-22} fill="#d6d3d1" stroke="none" initial={{ cy: -76, r: 2, opacity: 0.7 }} animate={{ cy: [-76, -98], opacity: [0.7, 0], r: [2, 5] }} transition={{ duration: 2, repeat: Infinity }} />}
        </g>
    )
}

// Rob Lucci: black suit and top hat, Hattori the pigeon on his shoulder, one finger out for Shigan.
function Lucci({ live, windup }: ArtProps) {
    return (
        <g {...LINE}>
            <path d="M 9 -84 Q 20 -66 15 -44 L 10 -47 Q 13 -66 5 -80 Z" fill="#111827" />
            <path d="M 1 0 h 11 l -1 -3 h -10 Z" fill="#000" />
            <rect x={2} y={-32} width={8} height={29} fill="#0a0a0a" />
            {/* the other leg: planted, or drawn up for Rankyaku */}
            {windup ? (
                <Limb d="M -6 -32 L -20 -34 L -34 -26" w={7} fill="#0a0a0a" />
            ) : (
                <>
                    <path d="M -12 0 h 11 v -3 h -10 Z" fill="#000" />
                    <rect x={-10} y={-32} width={8} height={29} fill="#0a0a0a" />
                </>
            )}
            <path d="M -16 -68 H 16 L 14 -30 H -14 Z" fill="#111827" />
            <path d="M -5 -68 L 0 -50 L 5 -68 Z" fill="#f9fafb" />
            <path d="M -1.2 -66 h 2.4 l 1 12 l -2.2 3 l -2.2 -3 Z" fill="#111827" strokeWidth={0.8} />
            <Limb d="M -15 -62 L -36 -59" w={6.5} fill="#111827" />
            <path d="M -38 -60 h -8" strokeWidth={4.6} />
            <path d="M -38 -60 h -8" stroke="#f1c27d" strokeWidth={2.4} />
            <circle cx={0} cy={-79} r={11} fill="#f1c27d" />
            <path d="M -9 -73 Q 0 -63 9 -73 Q 0 -68 -9 -73 Z" fill="#111827" />
            <path d="M -8 -82.5 l 5 1.2" strokeWidth={1.6} />
            <circle cx={-5} cy={-80} r={1.2} fill="#111827" stroke="none" />
            <rect x={-15} y={-92} width={30} height={4} rx={1} fill="#0a0a0a" />
            <rect x={-10} y={-110} width={20} height={18} fill="#0a0a0a" />
            <motion.g animate={{ y: live ? [0, -2.5, 0] : 0 }} transition={{ duration: 0.9, repeat: live ? Infinity : 0 }}>
                <ellipse cx={18} cy={-73} rx={7} ry={5} fill="#f9fafb" />
                <circle cx={13} cy={-78.5} r={3.6} fill="#f9fafb" />
                <path d="M 9.6 -78.5 l -3 1 l 3 1 Z" fill="#f59e0b" strokeWidth={0.7} />
                <path d="M 14 -74 l 2.5 4 l 2 -4 Z" fill="#dc2626" strokeWidth={0.7} />
                <circle cx={12} cy={-79.5} r={0.7} fill="#111827" stroke="none" />
            </motion.g>
        </g>
    )
}

// Akainu: Marine cap, maroon suit with a rose, the admiral's coat on his shoulders, and one fist of magma.
function Akainu({ live, windup }: ArtProps) {
    const fist = windup ? { x: -29, y: -90, r: 12 } : { x: -38, y: -48, r: 9 }
    return (
        <g {...LINE}>
            <path d="M -20 -70 Q -27 -36 -23 -4 H -13 L -12 -62 Z M 20 -70 Q 27 -36 23 -4 H 13 L 12 -62 Z" fill="#f8fafc" />
            <path d="M -25 -70 h 11 M 14 -70 h 11" strokeWidth={5.6} />
            <path d="M -25 -70 h 11 M 14 -70 h 11" stroke="#facc15" strokeWidth={3.2} />
            <path d="M -13 0 h 12 v -3 h -11 Z M 1 0 h 12 l -1 -3 h -11 Z" fill="#111827" />
            <rect x={-11} y={-32} width={9} height={29} fill="#7f1d1d" />
            <rect x={2} y={-32} width={9} height={29} fill="#7f1d1d" />
            <path d="M -15 -68 H 15 L 13 -30 H -13 Z" fill="#991b1b" />
            <path d="M -4.5 -68 L 0 -53 L 4.5 -68 Z" fill="#fda4af" />
            <circle cx={8} cy={-58} r={3} fill="#f472b6" strokeWidth={0.9} />
            {/* the magma fist: at his side, or drawn up for Great Eruption */}
            <Limb d={`M -14 -62 L ${fist.x + 7} ${fist.y + (windup ? 8 : 3)}`} w={7} fill="#991b1b" />
            <motion.g animate={{ scale: live ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.8, repeat: live ? Infinity : 0 }}>
                {/* the glow is a plain halo: a drop-shadow here would be re-filtered on every frame of the pulse */}
                <circle cx={fist.x} cy={fist.y} r={fist.r * 1.6} fill="#f97316" opacity={0.3} stroke="none" />
                <circle cx={fist.x} cy={fist.y} r={fist.r} fill="#f97316" />
                <circle cx={fist.x} cy={fist.y} r={fist.r * 0.55} fill="#fde047" stroke="none" />
                <path d={`M ${fist.x - 4} ${fist.y + fist.r} q 1 6 -1 9 M ${fist.x + 3} ${fist.y + fist.r} q 1 5 0 7`} stroke="#f97316" strokeWidth={2.5} fill="none" />
            </motion.g>
            {/* a drop of magma falls from the fist and hisses out on the ground */}
            {live && !windup && <motion.circle cx={fist.x - 2} r={1.8} fill="#fb923c" stroke="none" initial={{ cy: fist.y + fist.r + 8, opacity: 1 }} animate={{ cy: [fist.y + fist.r + 8, -1.5], opacity: [1, 1, 0] }} transition={{ duration: 0.8, times: [0, 0.85, 1], repeat: Infinity, repeatDelay: 0.5, ease: 'easeIn' }} />}
            <circle cx={0} cy={-79} r={11.5} fill="#e7b48a" />
            <path d="M -8.5 -81.5 l 6 2 M 2.5 -79.5 l 6 -2" strokeWidth={1.8} />
            <path d="M -5.5 -77.6 h 0.1 M 5.5 -77.6 h 0.1" strokeWidth={2.4} />
            <path d="M -4 -71 q 4 -2 8 0" fill="none" strokeWidth={1.2} />
            <path d="M -13 -85 Q 0 -100 13 -85 Z" fill="#f8fafc" />
            <path d="M -14.5 -87 h 29 v 4 h -29 Z" fill="#1e3a8a" />
            <path d="M -14.5 -83 q -8 0 -10 3.5 h 10 Z" fill="#1e3a8a" />
        </g>
    )
}

/* ───────────────────────── Luffy's attacks ───────────────────────── */

// `from` is Luffy's shoulder and `k` the art scale, both taken when the punch was thrown.
// `n` is the hit's place in a combo (0 for a miss).
type Fx = { id: number; x: number; y: number; hit: boolean; counter: boolean; k: number; from: Pt; n: number }

// Gomu Gomu no Pistol: the arm stretches from Luffy's shoulder to where you clicked, snaps back, and is gone.
function Pistol({ fx, jet = false }: { fx: Fx; jet?: boolean }) {
    const { from, k } = fx
    const snap = { duration: jet ? 0.3 : 0.5, times: [0, 0.3, 0.6, 1], ease: 'easeOut' as const }
    const out = { x: [from.x, fx.x, fx.x, from.x], y: [from.y, fx.y, fx.y, from.y] }
    const skin = jet ? '#f9a8d4' : '#f5c99b' // Gear 2 runs pink
    const arm = { x1: from.x, y1: from.y, strokeLinecap: 'round' as const, initial: { x2: from.x, y2: from.y }, animate: { x2: out.x, y2: out.y }, transition: snap }
    return (
        <motion.g initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ duration: snap.duration + 0.06, times: [0, 0.94, 1] }}>
            {jet && [0, 1, 2].map((i) => (
                <motion.circle key={i} cx={from.x - 6 * k + i * 6 * k} fill="#fbcfe8" initial={{ opacity: 0.8, cy: from.y, r: 5 * k }} animate={{ opacity: 0, cy: from.y - (26 + i * 7) * k, r: 10 * k }} transition={{ duration: 0.7, delay: i * 0.05 }} />
            ))}
            <motion.line {...arm} stroke="#111827" strokeWidth={7.6 * k} />
            <motion.line {...arm} stroke={skin} strokeWidth={5 * k} />
            <motion.circle r={7 * k} fill={skin} stroke="#111827" strokeWidth={1.3 * k} initial={{ cx: from.x, cy: from.y }} animate={{ cx: out.x, cy: out.y }} transition={snap} />
        </motion.g>
    )
}
const JetPistol = ({ fx }: { fx: Fx }) => <Pistol fx={fx} jet />

// Water Luffy: the punch arrives soaked and bursts into droplets, the one thing that lands on a sand Logia.
function WaterPistol({ fx }: { fx: Fx }) {
    const rand = makeRand(fx.id * 17 + 5)
    return (
        <g>
            <Pistol fx={fx} />
            <motion.circle cx={fx.x} cy={fx.y} r={10} fill="none" stroke="#7dd3fc" strokeWidth={3} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 5, opacity: [0, 1, 0] }} transition={{ duration: 0.6, delay: 0.14 }} />
            {Array.from({ length: 16 }, (_, i) => {
                const a = rand() * Math.PI * 2, d = 30 + rand() * 50
                return <motion.circle key={i} r={2 + rand() * 3} fill="#38bdf8" initial={{ cx: fx.x, cy: fx.y, opacity: 0 }} animate={{ cx: fx.x + Math.cos(a) * d, cy: fx.y + Math.sin(a) * d + 20, opacity: [0, 1, 0] }} transition={{ duration: 0.7, delay: 0.14, ease: 'easeOut' }} />
            })}
        </g>
    )
}

// Ace's fire, thrown from his burning fist (`from` is his shoulder; the fist is 23 units further forward).
// Hiken (Fire Fist): a fist of fire roars to where you clicked, sheds embers and bursts. Three hits in a row add
// Hotarubi: green fireflies drift onto the target and flare up (Hidaruma). A counter is Entei: a small sun rises
// over Ace and comes down on the target.
const HIKEN_S = 0.28 // flight time; the hit lands when the fire arrives
function Hiken({ fx }: { fx: Fx }) {
    const { k } = fx
    const sx = fx.from.x + 23 * k, sy = fx.from.y - k
    const deg = (Math.atan2(fx.y - sy, fx.x - sx) * 180) / Math.PI
    const rand = makeRand(fx.id * 31 + 7)
    if (fx.counter) return <Entei fx={fx} sx={sx} sy={sy} />
    return (
        <g>
            {/* embers shed along the way */}
            {Array.from({ length: 8 }, (_, i) => {
                const u = (i + 1) / 9, x = sx + (fx.x - sx) * u, y = sy + (fx.y - sy) * u
                return <motion.circle key={i} r={(1.5 + rand() * 2) * k} fill={i % 2 ? '#fde047' : '#f97316'} initial={{ cx: x, cy: y, opacity: 0 }} animate={{ cy: y - (8 + rand() * 14) * k, opacity: [0, 1, 0] }} transition={{ delay: u * HIKEN_S, duration: 0.5 }} />
            })}
            <motion.g initial={{ x: sx, y: sy, opacity: 1 }} animate={{ x: fx.x, y: fx.y, opacity: [1, 1, 0] }} transition={{ duration: HIKEN_S + 0.05, ease: 'easeIn', opacity: { duration: HIKEN_S + 0.05, times: [0, 0.85, 1] } }}>
                <g transform={`rotate(${deg.toFixed(1)}) scale(${k})`}>
                    <motion.g animate={{ scaleY: [1, 1.2, 0.85, 1.1] }} transition={{ duration: HIKEN_S, ease: 'linear' }}>
                        <path d="M 14 0 Q 6 -15 -18 -12 Q -8 -6 -36 -4 Q -10 0 -36 4 Q -8 6 -18 12 Q 6 15 14 0 Z" fill="#dc2626" />
                        <path d="M 12 0 Q 5 -11 -12 -9 Q -5 -4 -26 -2 Q -6 0 -26 2 Q -5 4 -12 9 Q 5 11 12 0 Z" fill="#f97316" />
                        <circle cx={5} r={6} fill="#fde047" />
                    </motion.g>
                </g>
            </motion.g>
            {/* it bursts where it lands */}
            <motion.circle cx={fx.x} cy={fx.y} r={10 * k} fill="#f97316" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2.6], opacity: [0, 0.75, 0] }} transition={{ delay: HIKEN_S, duration: 0.4, ease: 'easeOut' }} />
            {fx.hit && fx.n >= 3 && <Hotarubi fx={fx} sx={sx} sy={sy} />}
        </g>
    )
}

function Hotarubi({ fx, sx, sy }: { fx: Fx; sx: number; sy: number }) {
    const { k } = fx
    const rand = makeRand(fx.id * 53 + 3)
    return (
        <g>
            {Array.from({ length: 12 }, (_, i) => {
                const x0 = sx + (rand() - 0.5) * 70 * k, y0 = sy - rand() * 50 * k
                const mx = (x0 + fx.x) / 2 + (rand() - 0.5) * 40 * k, my = Math.min(y0, fx.y) - (20 + rand() * 30) * k
                return (
                    <motion.g key={i} initial={{ x: x0, y: y0, opacity: 0 }} animate={{ x: [x0, mx, fx.x], y: [y0, my, fx.y], opacity: [0, 1, 1, 0] }} transition={{ duration: 0.75, delay: i * 0.025, ease: 'easeInOut', opacity: { duration: 0.8, times: [0, 0.15, 0.85, 1], delay: i * 0.025 } }}>
                        <circle r={3.2 * k} fill="#a3e635" opacity={0.35} />
                        <circle r={1.5 * k} fill="#ecfccb" />
                    </motion.g>
                )
            })}
            {/* Hidaruma: they flare up together */}
            <motion.circle cx={fx.x} cy={fx.y} r={16 * k} fill="none" stroke="#a3e635" strokeWidth={3 * k} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2], opacity: [0, 1, 0] }} transition={{ delay: 0.8, duration: 0.3 }} />
            <Pop x={fx.x} y={fx.y - 46 * k} text="HOTARUBI · HIDARUMA!" size={14} fill="#bef264" />
        </g>
    )
}

function Entei({ fx, sx, sy }: { fx: Fx; sx: number; sy: number }) {
    const { k } = fx
    const up = { x: sx + 14 * k, y: sy - 36 * k } // over his raised fist, clear of the stage header
    return (
        <g>
            <motion.g initial={{ x: up.x, y: up.y, scale: 0 }} animate={{ x: [up.x, up.x, fx.x], y: [up.y, up.y, fx.y], scale: [0, 1, 1.25] }} transition={{ duration: 0.42, times: [0, 0.4, 1], ease: 'easeIn' }}>
                <g transform={`scale(${k})`}>
                    <circle r={38} fill="#f97316" opacity={0.3} />
                    <circle r={26} fill="#ea580c" />
                    <circle r={18} fill="#fbbf24" />
                    <circle r={9} fill="#fef3c7" />
                </g>
            </motion.g>
            <motion.circle cx={fx.x} cy={fx.y} r={22 * k} fill="#fb923c" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 3.2], opacity: [0, 0.8, 0] }} transition={{ delay: 0.42, duration: 0.5, ease: 'easeOut' }} />
        </g>
    )
}

// Where a punch lands: eight spikes that snap outwards. Gold on a counter.
const SPIKES = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.2
    return `M ${(Math.cos(a) * 9).toFixed(1)} ${(Math.sin(a) * 9).toFixed(1)} L ${(Math.cos(a) * (i % 2 ? 20 : 27)).toFixed(1)} ${(Math.sin(a) * (i % 2 ? 20 : 27)).toFixed(1)}`
}).join(' ')
function Impact({ fx, delay }: { fx: Fx; delay: number }) {
    return (
        <g transform={`translate(${fx.x} ${fx.y}) scale(${fx.k})`}>
            <motion.path d={SPIKES} fill="none" stroke={fx.counter ? '#fde047' : '#fff'} strokeWidth={3.2} strokeLinecap="round" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1.25, opacity: [0, 1, 0] }} transition={{ duration: 0.32, delay, ease: 'easeOut' }} />
        </g>
    )
}

// Manga sound-effect text: pops in, holds, fades.
function Pop({ x, y, text, size = 22, fill = '#fff' }: { x: number; y: number; text: string; size?: number; fill?: string }) {
    return (
        <motion.text
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={size}
            fontWeight={900}
            fontStyle="italic"
            fill={fill}
            stroke="#000"
            strokeWidth={size / 8}
            paintOrder="stroke"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 1], y: [0, -6, -10, -18] }}
            transition={{ duration: 1 }}
        >
            {text}
        </motion.text>
    )
}

/* ───────────────────────── Finishers ───────────────────────── */

// Every arc ends the way it ends in canon. `ms` is how long the finisher runs (the K.O. card waits for it) and `hit`
// when it connects (the stage shakes then).
type FinishKind = 'ono' | 'storm' | 'jet' | 'entei'
const FINISH: Record<FinishKind, { ms: number; hit: number }> = {
    ono: { ms: 1400, hit: 840 }, // Arlong Park: Gomu Gomu no Ono, the heel dropped from the sky
    storm: { ms: 1700, hit: 600 }, // Alabasta: Gomu Gomu no Storm sends Crocodile up through the rock, then it rains
    jet: { ms: 1300, hit: 580 }, // Enies Lobby: Gear 2 Jet Gatling
    entei: { ms: 1600, hit: 900 }, // Marineford: Ace's Entei
}

// The move's name, called out across the stage while it plays.
function Callout({ x, y, text, ms, fill }: { x: number; y: number; text: string; ms: number; fill: string }) {
    return (
        <motion.text x={x} y={y} textAnchor="middle" fontSize={30} fontWeight={900} fontStyle="italic" fill={fill} stroke="#000" strokeWidth={4} paintOrder="stroke"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.15, 1, 1] }} transition={{ duration: ms / 1000, times: [0, 0.12, 0.85, 1] }}>
            {text}
        </motion.text>
    )
}

// A stretched rubber limb, drawn like Pistol's: outline, skin, and a fist (or heel) at the end.
function RubberLimb({ x1, y1, xs, ys, times, duration, delay = 0, k, skin, end = 7 }: {
    x1: number; y1: number; xs: number[]; ys: number[]; times: number[]; duration: number; delay?: number; k: number; skin: string; end?: number
}) {
    const t = { duration, delay, times, ease: 'easeOut' as const }
    return (
        <g>
            <motion.line x1={x1} y1={y1} stroke="#111827" strokeWidth={7.6 * k} strokeLinecap="round" initial={{ x2: x1, y2: y1 }} animate={{ x2: xs, y2: ys }} transition={t} />
            <motion.line x1={x1} y1={y1} stroke={skin} strokeWidth={5 * k} strokeLinecap="round" initial={{ x2: x1, y2: y1 }} animate={{ x2: xs, y2: ys }} transition={t} />
            <motion.circle r={end * k} fill={skin} stroke="#111827" strokeWidth={1.3 * k} initial={{ cx: x1, cy: y1 }} animate={{ cx: xs, cy: ys }} transition={t} />
        </g>
    )
}

function Finisher({ kind, text, from, boss, ground, k, w, h, live }: {
    kind: FinishKind; text: string; from: Pt; boss: Pt; ground: number; k: number; w: number; h: number; live: boolean
}) {
    const { ms, hit } = FINISH[kind]
    const rand = makeRand(7)
    const call = <Callout x={w / 2} y={h * 0.3} text={text} ms={ms} fill={kind === 'storm' ? '#7dd3fc' : kind === 'jet' ? '#f9a8d4' : kind === 'entei' ? '#fdba74' : '#fde047'} />
    // dust and a shockwave on the ground where it connects
    const quake = (delay: number) => (
        <>
            <motion.ellipse cx={boss.x} cy={ground} ry={6 * k} fill="none" stroke="#fff" strokeWidth={3} initial={{ rx: 0, opacity: 0 }} animate={{ rx: [0, 90 * k], opacity: [0, 1, 0] }} transition={{ delay, duration: 0.5 }} />
            {Array.from({ length: 10 }, (_, i) => {
                const dx = (rand() - 0.5) * 100 * k, up = (10 + rand() * 30) * k
                return <motion.circle key={i} r={(4 + rand() * 6) * k} fill="#d6d3d1" initial={{ cx: boss.x, cy: ground, opacity: 0 }} animate={{ cx: boss.x + dx, cy: ground - up, opacity: [0, 0.8, 0] }} transition={{ delay, duration: 0.7, ease: 'easeOut' }} />
            })}
        </>
    )
    if (kind === 'ono') {
        // The leg goes straight up into the sky over Luffy, arcs over to Arlong, and the heel comes down on him like an
        // axe. Drawn as a curve from the hip through a point high in the sky, so it always comes down from above.
        const hip = { x: from.x - 4 * k, y: ground - 26 * k }, top = Math.max(14, ground - 150 * k), mid = (hip.x + boss.x) / 2
        const heel = [[hip.x, hip.y], [hip.x + 8 * k, top], [boss.x, top], [boss.x, ground - 40 * k], [boss.x, ground - 40 * k], [hip.x, hip.y]]
        const bend = [[hip.x, hip.y], [hip.x + 4 * k, (hip.y + top) / 2], [mid, top - 30 * k], [mid, top - 30 * k], [mid, top - 30 * k], [hip.x, hip.y]]
        const leg = heel.map(([x, y], i) => `M ${hip.x.toFixed(1)} ${hip.y.toFixed(1)} Q ${bend[i][0].toFixed(1)} ${bend[i][1].toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`)
        const t = { duration: ms / 1000, times: [0, 0.25, 0.48, hit / ms, 0.85, 1], ease: 'easeIn' as const }
        return (
            <g>
                <motion.path fill="none" stroke="#111827" strokeWidth={7.6 * k} strokeLinecap="round" initial={{ d: leg[0] }} animate={{ d: leg }} transition={t} />
                <motion.path fill="none" stroke="#f5c99b" strokeWidth={5 * k} strokeLinecap="round" initial={{ d: leg[0] }} animate={{ d: leg }} transition={t} />
                <motion.ellipse rx={7 * k} ry={5 * k} fill="#a16207" stroke="#111827" strokeWidth={1.3 * k} initial={{ cx: hip.x, cy: hip.y }} animate={{ cx: heel.map((q) => q[0]), cy: heel.map((q) => q[1]) }} transition={t} />
                {quake(hit / 1000)}
                {call}
            </g>
        )
    }
    if (kind === 'storm') {
        // a barrage of fists that keeps hitting him as he goes up, then rain over Alabasta
        const rise = (t: number) => (t < hit ? 0 : ((t - hit) / (ms - hit)) * (ground + 40 * k))
        return (
            <g>
                {Array.from({ length: 18 }, (_, i) => {
                    const at = i * 55, tx = boss.x + (rand() - 0.5) * 40 * k, ty = boss.y - rise(at + 90) + (rand() - 0.5) * 50 * k
                    return <RubberLimb key={i} x1={from.x} y1={from.y} xs={[from.x, tx, from.x]} ys={[from.y, ty, from.y]} times={[0, 0.5, 1]} duration={0.18} delay={at / 1000} k={k} skin="#f5c99b" />
                })}
                {call}
                {/* rain clouds roll over, and the rain comes down */}
                <motion.rect width={w} height={h} fill="#1e293b" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: ms / 1000 - 0.4, duration: 0.8 }} />
                {Array.from({ length: 60 }, (_, i) => {
                    const x = rand() * (w + 40), d = 0.5 + rand() * 0.35
                    return <motion.line key={`r${i}`} x1={x} x2={x - 8} stroke="#dbeafe" strokeOpacity={0.85} strokeWidth={2} initial={{ y1: -20, y2: -4, opacity: 0 }} animate={{ y1: [-20, h], y2: [-4, h + 16], opacity: 1 }} transition={{ delay: ms / 1000 - 0.3 + rand() * 0.6, duration: d, repeat: live ? Infinity : 0, ease: 'linear' }} />
                })}
            </g>
        )
    }
    if (kind === 'jet') {
        // pink after-images of fists, faster than the eye, and Gear 2 steam pouring off him
        return (
            <g>
                {Array.from({ length: 14 }, (_, i) => {
                    const tx = boss.x + (rand() - 0.5) * 50 * k, ty = boss.y + (rand() - 0.5) * 70 * k
                    return <g key={i} opacity={0.75}><RubberLimb x1={from.x} y1={from.y} xs={[from.x, tx, from.x]} ys={[from.y, ty, from.y]} times={[0, 0.5, 1]} duration={0.12} delay={i * 0.035} k={k} skin="#f9a8d4" /></g>
                })}
                {Array.from({ length: 6 }, (_, i) => (
                    <motion.circle key={`s${i}`} cx={from.x - (8 - i * 3) * k} fill="#fbcfe8" initial={{ cy: from.y, r: 4 * k, opacity: 0.8 }} animate={{ cy: from.y - (30 + i * 8) * k, r: 11 * k, opacity: 0 }} transition={{ delay: i * 0.08, duration: 0.9 }} />
                ))}
                <motion.circle cx={boss.x} cy={boss.y} r={20 * k} fill="none" stroke="#fff" strokeWidth={4} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 3], opacity: [0, 1, 0] }} transition={{ delay: hit / 1000, duration: 0.4 }} />
                {call}
            </g>
        )
    }
    // entei: a sun far bigger than the counter's rises over Ace and comes down on Akainu
    const up = { x: from.x + 40 * k, y: Math.max(60 * k, ground - 120 * k) }
    return (
        <g>
            <motion.g initial={{ x: up.x, y: up.y, scale: 0 }} animate={{ x: [up.x, up.x, boss.x], y: [up.y, up.y, boss.y], scale: [0, 1, 1.15] }} transition={{ duration: hit / 1000, times: [0, 0.6, 1], ease: 'easeIn' }}>
                <motion.g animate={{ opacity: [1, 1, 0] }} transition={{ duration: hit / 1000 + 0.1, times: [0, 0.95, 1] }}>
                    <g transform={`scale(${k * 1.8})`}>
                        <circle r={38} fill="#f97316" opacity={0.3} />
                        <circle r={26} fill="#ea580c" />
                        <circle r={18} fill="#fbbf24" />
                        <circle r={9} fill="#fef3c7" />
                    </g>
                </motion.g>
            </motion.g>
            <motion.circle cx={boss.x} cy={boss.y} r={30 * k} fill="#fb923c" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 4], opacity: [0, 0.9, 0] }} transition={{ delay: hit / 1000, duration: 0.7, ease: 'easeOut' }} />
            {quake(hit / 1000)}
            {call}
        </g>
    )
}

/* ───────────────────────── The stage ───────────────────────── */

type Dodge = 'stand' | 'slide' | 'soru' | 'sand'
type Shot = 'magma' | 'rankyaku' | 'sand' | 'shark'
// `armMs` is how long the player's own arm is out for the move. `travel` (s) is how long the attack takes to reach the
// target, if it is thrown rather than a punch: the hit flash, shake and impact wait for it. `hero` swaps the player.
type BossCfg = {
    name: string; title: string; move: string; sfx: string; win: string; bounty: string; counter: string; shot: Shot
    Art: (p: ArtProps) => React.ReactElement; dodge: Dodge; Attack: (p: { fx: Fx }) => React.ReactElement; armMs: number
    travel?: number; counterSfx?: string; hero?: 'ace'; finish: { kind: FinishKind; text: string }
}
// `bounty` is the player's canon bounty after that arc (Ace's is his last one).
const BOSSES: Record<string, BossCfg> = {
    // Marineford is Ace's fight: in canon Akainu's magma beat his fire. Here you can rewrite that.
    marineford: { name: 'Akainu', title: 'Admiral · Magma-Magma', move: 'Hiken · Fire Fist', sfx: 'HIKEN!', counterSfx: 'ENTEI!', win: 'This time, Ace lives. The Fire Fist burns on.', bounty: '550,000,000', counter: 'Great Eruption', shot: 'magma', Art: Akainu, dodge: 'slide', Attack: Hiken, armMs: 300, travel: HIKEN_S, hero: 'ace', finish: { kind: 'entei', text: 'HIKEN · ENTEI!!' } },
    enies: { name: 'Rob Lucci', title: 'CP9 · Rokushiki', move: 'Gear 2 · Jet Pistol', sfx: 'JET!', win: 'Lucci is down. Robin is free.', bounty: '300,000,000', counter: 'Rankyaku', shot: 'rankyaku', Art: Lucci, dodge: 'soru', Attack: JetPistol, armMs: 360, finish: { kind: 'jet', text: 'GEAR 2 · JET GATLING!!' } },
    alabasta: { name: 'Crocodile', title: 'Warlord · Sand-Sand', move: 'Water Luffy', sfx: 'SPLASH!', win: 'Rain returns to Alabasta.', bounty: '100,000,000', counter: 'Desert Spada', shot: 'sand', Art: Crocodile, dodge: 'sand', Attack: WaterPistol, armMs: 560, finish: { kind: 'storm', text: 'GOMU GOMU NO… STORM!!' } },
    eastblue: { name: 'Arlong', title: 'Saw-Tooth Fishman', move: 'Gomu Gomu no Pistol', sfx: 'BAM!', win: 'Arlong Park comes down. Nami is free.', bounty: '30,000,000', counter: 'Shark on Darts', shot: 'shark', Art: Arlong, dodge: 'stand', Attack: Pistol, armMs: 560, finish: { kind: 'ono', text: 'GOMU GOMU NO… ONO!!' } },
}

// The boss's counterattack, flying from the boss to the player.
function ShotFx({ kind, from, to }: { kind: Shot; from: Pt; to: Pt }) {
    const glow = (c: string) => ({ filter: `drop-shadow(0 0 8px ${c})` })
    const shape = {
        // Dai Funka: a giant fist of magma, knuckles first, dripping as it flies
        magma: (
            <g style={glow('#f97316')} transform="scale(1.7)">
                <path d="M -14 -16 Q -26 -16 -26 0 Q -26 16 -14 16 L 6 14 Q 22 10 34 0 Q 22 -10 6 -14 Z" fill="#ea580c" stroke="#7c2d12" strokeWidth={2} />
                <path d="M -19 -10 v 20 M -12 -14 v 28" stroke="#7c2d12" strokeWidth={1.6} />
                <circle cx={2} r={7} fill="#fde047" />
                <path d="M 8 14 q 2 6 -1 10 M 18 9 q 2 5 0 8" stroke="#f97316" strokeWidth={3} fill="none" strokeLinecap="round" />
            </g>
        ),
        rankyaku: <path d="M 6 -30 Q -22 0 6 30 Q -8 0 6 -30 Z" fill="#f8fafc" style={glow('#e0f2fe')} />,
        sand: <g style={glow('#fbbf24')}><path d="M 30 -5 L -30 0 L 30 5 Z" fill="#fcd34d" /><path d="M 40 -12 L 0 -4 M 40 12 L 0 4" stroke="#d97706" strokeWidth={2} /></g>,
        shark: <path d="M 16 -14 L -28 0 L 16 14 L 8 0 Z" fill="#93c5fd" stroke="#1e3a8a" strokeWidth={2} />,
    }[kind]
    return (
        <motion.g initial={{ x: from.x, y: from.y, opacity: 1 }} animate={{ x: to.x, y: to.y, opacity: [1, 1, 0] }} transition={{ duration: 0.5, ease: 'easeIn' }}>
            {shape}
        </motion.g>
    )
}

export function useSize(ref: React.RefObject<HTMLElement | null>) {
    const [size, setSize] = useState({ w: 0, h: 0 })
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
        ro.observe(el)
        return () => ro.disconnect()
    }, [ref])
    return size
}

// setTimeout that is cancelled if the component unmounts first, so nothing fires into a fight (or a jutsu) that is gone.
export function useLater() {
    const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
    useEffect(() => {
        const pending = timers.current
        return () => pending.forEach(clearTimeout)
    }, [])
    return useCallback((fn: () => void, ms: number) => {
        const t = setTimeout(() => { timers.current.delete(t); fn() }, ms)
        timers.current.add(t)
    }, [])
}

const LIVES = 3
const WINDUP_MS = 900 // how long a counterattack is telegraphed before it lands
const DOWN_MS = 2800 // after a loss, clicks are ignored this long, so a player mashing attack still sees the moment

// What every stage shares: the island scene, which paints sky, sea and ground from edge to edge (the gradient under
// it only shows until the scene has mounted), and a scrim behind the header so it reads on any sky.
// Stage-specific layers go in `children`, above that.
function StageShell({ stageRef, sky, header, island, className, children, ...rest }: {
    stageRef: React.RefObject<HTMLDivElement | null>; sky: [string, string]; header: React.ReactNode; island: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            ref={stageRef}
            {...rest}
            className={clsx('relative h-[210px] md:h-[300px] lg:h-[340px] overflow-hidden select-none touch-manipulation', className)}
            style={{ background: `linear-gradient(${sky[0]}, ${sky[1]})` }}
        >
            <div className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full">{island}</div>
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
            <div className="absolute left-4 md:left-6 top-3 pointer-events-none [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.6)]">{header}</div>
            {children}
        </div>
    )
}

function BossName({ title, name, children }: { title: string; name: string; children?: React.ReactNode }) {
    return (
        <div className="absolute right-4 md:right-6 top-3 text-right pointer-events-none [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.6)]">
            <div className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">{title}</div>
            <div className="text-sm md:text-base font-black text-white leading-tight">{name}</div>
            {children}
        </div>
    )
}

// Wano: no fight. Kaido follows the pointer around the sky while it moves (or swims to where you tap), then goes
// back to his lazy loop when it rests, so he isn't forever turning around on the spot. He breathes Bolo Breath and
// laughs on click. He keeps his azure dragon colours even when Gear 5 turns the scene white.
export function KaidoStage({ sky, header, island }: { sky: [string, string]; header: React.ReactNode; island: React.ReactNode }) {
    const stage = useRef<HTMLDivElement>(null)
    const { w, h } = useSize(stage)
    const follow = useRef<Follow | null>(null)
    const breath = useRef<(() => void) | null>(null)
    const touch = useRef(false)
    const [played, setPlayed] = useState(false)
    const [roar, setRoar] = useState<{ id: number; x: number; y: number } | null>(null)
    const aim = (e: React.PointerEvent | React.MouseEvent, ms: number) => {
        const r = stage.current!.getBoundingClientRect()
        const point = { x: e.clientX - r.left, y: e.clientY - r.top }
        follow.current = { ...point, until: performance.now() + ms }
        return point
    }
    const fire = (e: React.PointerEvent | React.MouseEvent) => {
        const point = aim(e, 2500)
        breath.current?.()
        sfx.whoosh()
        setRoar((r) => ({ id: (r?.id ?? 0) + 1, x: point.x, y: Math.max(60, point.y - 34) }))
        setPlayed(true)
    }
    return (
        <StageShell
            stageRef={stage}
            sky={sky}
            header={header}
            island={island}
            role="img"
            aria-label="Kaido in dragon form, following your pointer. Click and he breathes fire."
            className="cursor-pointer"
            onPointerMove={(e) => { aim(e, 2500); if (!played) setPlayed(true) }}
            onPointerLeave={() => { follow.current = null }}
            // A mouse fires on press. Touch waits for the tap to finish, so a finger that lands here to scroll the page does not.
            onPointerDown={(e) => { touch.current = e.pointerType !== 'mouse'; if (!touch.current) fire(e) }}
            onClick={(e) => { if (touch.current) fire(e) }}
        >
            <svg className="absolute inset-0 w-full h-full" aria-hidden>
                <defs>
                    <linearGradient id="bolo" x1="0" x2="1">
                        <stop offset="0" stopColor="#fef08a" />
                        <stop offset="0.4" stopColor="#f97316" />
                        <stop offset="1" stopColor="#dc2626" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {w > 0 && <Dragon w={w} h={h} palette={AZURE} follow={follow} breath={breath} />}
                {/* his laugh */}
                {roar && <Pop key={roar.id} x={roar.x} y={roar.y} text="WORORORO!" size={h > 250 ? 26 : 18} fill="#fde047" />}
            </svg>
            <BossName title="King of the Beasts" name="Kaido" />
            <AnimatePresence>
                {!played && (
                    <motion.div key="hint" exit={{ opacity: 0 }} className="absolute left-4 md:left-6 bottom-[22%] pointer-events-none font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-white bg-black/55 px-2 py-1 rounded">
                        <span className="animate-pulse">▶</span> <span className="sm:hidden">Tap the sky, Kaido follows</span><span className="hidden sm:inline">Move your mouse, Kaido follows · click for Bolo Breath</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </StageShell>
    )
}

export function BossStage({ arcId, maxHp, sky, header, island }: {
    arcId: string; maxHp: number; sky: [string, string]; header: React.ReactNode; island: React.ReactNode
}) {
    const cfg = BOSSES[arcId]
    const stage = useRef<HTMLDivElement>(null)
    const boss = useRef<SVGGElement>(null)
    const { w, h } = useSize(stage)
    const inView = useInView(stage)
    const calm = useReducedMotion()
    const later = useLater()
    const [hp, setHp] = useState(maxHp)
    const dueHp = useRef(maxHp) // HP once every attack in flight has landed
    const downAt = useRef(0)
    const [lives, setLives] = useState(LIVES)
    const [started, setStarted] = useState(false)
    const [windup, setWindup] = useState(false) // boss is charging a counterattack; punch now to interrupt it
    const [cycle, setCycle] = useState(0) // bumps to schedule the next counterattack
    const [fx, setFx] = useState<Fx[]>([])
    const [shots, setShots] = useState<{ id: number; from: Pt }[]>([])
    const [hurt, setHurt] = useState(0)
    const [punches, setPunches] = useState(0)
    const [armsOut, setArmsOut] = useState(0) // punches whose stretched arm is still on screen
    const [combo, setCombo] = useState<{ id: number; n: number; counter: boolean } | null>(null)
    const [pos, setPos] = useState(0.7) // boss x as a fraction of the stage width
    const [ghost, setGhost] = useState<{ id: number; pos: number } | null>(null) // where a dodging boss just was
    const [hits, setHits] = useState(0)
    const seq = useRef(0)
    const chain = useRef({ at: 0, n: 0 })
    const lastAction = useRef(0)
    const touch = useRef(false)
    const won = hp <= 0
    const lost = lives <= 0
    useEffect(() => { if (lost) downAt.current = performance.now() }, [lost])
    const fin = FINISH[cfg.finish.kind]
    // The finisher connects: a big shake.
    useEffect(() => {
        if (!won || calm) return
        stage.current?.animate([0, -10, 10, -6, 6, -3, 0].map((dy) => ({ transform: `translateY(${dy}px)` })), { duration: 450, delay: fin.hit })
    }, [won, calm, fin.hit])
    const k = h / 170 // art scale
    const by = h * 0.9 // the ground line both fighters stand on
    const bx = pos * w
    const lx = Math.max(30 * k, w * 0.09) // the player
    const hero = cfg.hero === 'ace'
        ? { name: 'Ace', life: '🔥', down: 'Ace is down…', retry: '…magma beats fire, but this is your story. Click to retry.' }
        : { name: 'Luffy', life: '👒', down: 'Luffy is down…', retry: '…but he always gets back up. Click to retry.' }
    const land = (cfg.travel ?? 0) * 1000 // ms until a thrown attack arrives
    const geo = useRef({ bx, by, k, lx })
    useEffect(() => { geo.current = { bx, by, k, lx } })

    // Once the fight starts the boss attacks back on a timer: a wind-up you can punch through, then the hit.
    // The boss holds off while the stage is off screen or you've stopped clicking for a few seconds, so nobody
    // loses a fight by scrolling past it or stopping to read the card.
    useEffect(() => {
        if (!started || won || lost || !inView) return
        const delay = 2400 + Math.random() * 1600 - maxHp * 80
        const idle = () => performance.now() - lastAction.current > 5000
        const charge = setTimeout(() => (idle() ? setCycle((c) => c + 1) : setWindup(true)), delay)
        const strike = setTimeout(() => {
            setWindup(false)
            if (idle()) { setCycle((c) => c + 1); return }
            const g = geo.current
            const id = seq.current++
            setShots((s) => [...s, { id, from: { x: g.bx - 34 * g.k, y: g.by - 60 * g.k } }])
            later(() => setShots((s) => s.filter((q) => q.id !== id)), 600)
            later(() => { setLives((l) => l - 1); setHurt((n) => n + 1); sfx.pop() }, 450)
            setCycle((c) => c + 1)
        }, delay + WINDUP_MS)
        return () => { clearTimeout(charge); clearTimeout(strike) }
    }, [started, won, lost, inView, cycle, maxHp, later])

    const attack = (x: number, y: number) => {
        if (lost && performance.now() - downAt.current < DOWN_MS) return
        if (won || lost) {
            setHp(maxHp); dueHp.current = maxHp; setLives(LIVES); setPos(0.7); setHits(0); setStarted(false); setWindup(false); setCombo(null)
            return
        }
        setStarted(true)
        lastAction.current = performance.now()
        setPunches((n) => n + 1)
        if (cfg.armMs) { setArmsOut((n) => n + 1); later(() => setArmsOut((n) => n - 1), cfg.armMs) }
        // A generous hitbox: a near miss on a small target reads as the game being unfair.
        const hit = Math.abs(x - bx) < 44 * k && y > by - 124 * k && y < by + 8 * k
        const counter = hit && windup
        const id = seq.current++
        const now = performance.now()
        if (hit) chain.current = { at: now, n: now - chain.current.at < 900 ? chain.current.n + 1 : 1 }
        setFx((f) => [...f.slice(-5), { id, x, y, hit, counter, k, from: { x: lx + 9 * k, y: by - 61 * k }, n: hit ? chain.current.n : 0 }])
        later(() => setFx((f) => f.filter((q) => q.id !== id)), 1200)
        sfx.whoosh()
        if (!hit) return
        // Every hit that lands shakes the stage, a counter hard; then the boss flashes white. Both wait for a thrown
        // attack to arrive. A Web Animation leaves no filter behind once it ends.
        if (!calm) {
            const a = counter ? 9 : 3
            stage.current?.animate([0, -a, a, -a / 2, a / 2, 0].map((dx) => ({ transform: `translateX(${dx}px)` })), { duration: 300, delay: land })
        }
        boss.current?.animate([{ filter: 'brightness(3)' }, { filter: 'brightness(1)' }], { duration: 300, delay: land })
        // A counter cancels the wind-up at once, so the boss's strike can't land while a thrown attack is in flight.
        if (counter) { setWindup(false); setCycle((c) => c + 1) }
        const n = chain.current.n, before = dueHp.current
        const left = dueHp.current = Math.max(0, before - (counter ? 2 : 1))
        // The rest (damage, recoil, combo, dodge, K.O.) happens when the attack arrives.
        const arrive = () => {
            setHp(left)
            if (n >= 2 || counter) setCombo({ id, n, counter })
            setHits((h) => h + 1)
            if (left <= 0) { if (before > 0) later(() => sfx.levelUp(), 250); return }
            if (cfg.dodge !== 'stand') {
                // Dodge away from the punch, somewhere on the right two-thirds of the stage.
                setGhost({ id, pos })
                later(() => setGhost(null), 700)
                setPos(0.4 + Math.random() * 0.48)
            }
        }
        if (land) later(arrive, land)
        else arrive()
    }

    const at = (e: React.PointerEvent | React.MouseEvent) => {
        const r = stage.current!.getBoundingClientRect()
        attack(e.clientX - r.left, e.clientY - r.top)
    }
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        attack(bx, by - 60 * k)
    }

    const dodgeTransition = cfg.dodge === 'soru' ? { duration: 0.06 } : cfg.dodge === 'sand' ? { duration: 0 } : { type: 'spring' as const, stiffness: 180, damping: 16 }
    // No filter at all outside a wind-up: a permanent one would be re-applied on every frame of the idle loop.
    const charging = { filter: windup ? 'drop-shadow(0 0 14px #ef4444)' : undefined, transition: 'filter 0.2s' }
    const label = won ? `${cfg.name} defeated. Press to rematch.` : lost ? `${hero.name} is down. Press to retry.` : `Fight ${cfg.name}: ${hp} of ${maxHp} HP left, ${hero.name} has ${lives} lives. Press to attack with ${cfg.move}.`
    const feet = { originX: 0.5, originY: 1 } // poses pivot and squash from the ground up
    // how the boss leaves when the finisher lands: driven into the ground, launched into the sky, flung off the edge,
    // or burnt away
    const exit = {
        ono: { a: { scaleY: [1, 1, 0.2], y: [0, 0, 4], opacity: [1, 1, 0] }, times: [0, fin.hit / fin.ms, 1] },
        storm: { a: { y: [0, 0, -(by / k) - 160], rotate: [0, 0, -540] }, times: [0, fin.hit / fin.ms, 1] },
        jet: { a: { x: [0, 0, (w - bx) / k + 160], y: [0, 0, -40], rotate: [0, 0, 420] }, times: [0, fin.hit / fin.ms, 1] },
        entei: { a: { opacity: [1, 1, 0], scale: [1, 1, 0.5] }, times: [0, fin.hit / fin.ms, 1] },
    }[cfg.finish.kind]
    const throwing = won && cfg.finish.kind !== 'ono' // the player's arm is out for the whole finisher

    return (
        <StageShell
            stageRef={stage}
            sky={sky}
            header={header}
            island={island}
            role="button"
            tabIndex={0}
            aria-label={label}
            // A mouse attacks on press. Touch waits for the tap to finish, so a finger that lands on the stage to
            // scroll the page does not throw a punch and start the fight.
            onPointerDown={(e) => { touch.current = e.pointerType !== 'mouse'; if (!touch.current) at(e) }}
            onClick={(e) => { if (touch.current) at(e) }}
            onKeyDown={onKeyDown}
            className="cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
            <svg className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
                {w > 0 && (
                    <>
                        <g transform={`translate(${lx} ${by}) scale(${k})`}>
                            {cfg.hero === 'ace' && lost ? <AceFall /> : (
                            /* knocked back by every hit he takes, and flat on his back when the hats run out */
                            <motion.g key={`hurt${hurt}`} initial={hurt ? { x: -14 } : false} animate={lost ? { x: -8, y: -4, rotate: -84 } : { x: 0, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} style={feet}>
                                {/* lunges into every punch, breathes in between */}
                                <motion.g
                                    key={`punch${punches}`}
                                    initial={punches ? { x: 9 } : false}
                                    animate={{ x: 0, scaleY: inView && !lost ? [1, 1.03, 1] : 1 }}
                                    transition={{ x: { type: 'spring', stiffness: 420, damping: 15 }, scaleY: inView && !lost ? { duration: 1.8, repeat: Infinity } : { duration: 0.2 } }}
                                    style={feet}
                                >
                                    {cfg.hero === 'ace' ? <Ace live={inView && !lost} armOut={armsOut > 0 || throwing} /> : <Luffy gear2={arcId === 'enies'} armOut={armsOut > 0 || throwing} />}
                                </motion.g>
                            </motion.g>
                            )}
                        </g>
                        {ghost && cfg.dodge === 'soru' && (
                            <motion.g key={`g${ghost.id}`} transform={`translate(${ghost.pos * w} ${by}) scale(${k})`} initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                                <cfg.Art live={false} windup={false} />
                            </motion.g>
                        )}
                        {ghost && cfg.dodge === 'sand' && <SandBurst key={`s${ghost.id}`} x={ghost.pos * w} y={by - 50 * k} />}
                        <motion.g initial={false} animate={{ x: bx }} transition={dodgeTransition}>
                            <g transform={`translate(0 ${by}) scale(${k})`}>
                                {/* before the first punch, a ring shows what to hit */}
                                {inView && !started && <circle cx={-4} cy={-58} r={58} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={1.6} strokeDasharray="7 7" className="animate-pulse" />}
                                <g ref={boss} style={charging}>
                                    {/* Recoils and squashes when hit, leans back into a wind-up, breathes in between. The loop only runs on screen. */}
                                    <motion.g
                                        key={hits}
                                        initial={hits ? { x: 12, scaleX: 0.9, scaleY: 1.08, opacity: 1 } : false}
                                        animate={won ? exit.a : { x: 0, y: 0, opacity: 1, scaleX: 1, rotate: windup ? 7 : 0, scaleY: inView && !windup ? [1, 1.025, 1] : 1 }}
                                        transition={won ? { duration: fin.ms / 1000, times: exit.times, ease: 'easeIn' } : { x: { type: 'spring', stiffness: 300, damping: 12 }, rotate: { duration: 0.25 }, scaleY: inView && !windup ? { duration: 2.2, repeat: Infinity } : { duration: 0.2 } }}
                                        style={feet}
                                    >
                                        {cfg.dodge === 'sand' && hits > 0 && !won ? (
                                            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.3 }}><cfg.Art live={inView} windup={windup} /></motion.g>
                                        ) : <cfg.Art live={inView} windup={windup} />}
                                    </motion.g>
                                </g>
                                {/* the wind-up, telegraphed: a ring closes on the boss for exactly as long as you have to counter */}
                                {windup && (
                                    <>
                                        <motion.circle cx={-4} cy={-58} fill="none" stroke="#ef4444" strokeWidth={2.4} initial={{ r: 84, opacity: 0.25 }} animate={{ r: 34, opacity: 1 }} transition={{ duration: WINDUP_MS / 1000, ease: 'linear' }} />
                                        <motion.text x={0} y={-128} textAnchor="middle" fontSize={34} fontWeight={900} fill="#ef4444" stroke="#000" strokeWidth={3} paintOrder="stroke" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.25 }}>!</motion.text>
                                    </>
                                )}
                            </g>
                        </motion.g>
                    </>
                )}
                {shots.map((s) => <ShotFx key={s.id} kind={cfg.shot} from={s.from} to={{ x: lx, y: by - 48 * k }} />)}
                {won && w > 0 && <Finisher kind={cfg.finish.kind} text={cfg.finish.text} from={{ x: lx + 9 * k, y: by - 61 * k }} boss={{ x: bx, y: by - 58 * k }} ground={by} k={k} w={w} h={h} live={inView} />}
                {/* Akainu's line when his magma lands on Ace */}
                {cfg.hero === 'ace' && hurt > 0 && <Pop key={`burn${hurt}`} x={lx + 52 * k} y={by - 84 * k} text="MAGMA > FIRE" size={16} fill="#fdba74" />}
                {fx.map((f) => (
                    <g key={f.id}>
                        <cfg.Attack fx={f} />
                        {f.hit && <Impact fx={f} delay={cfg.travel ?? (cfg.armMs ? 0.12 : 0)} />}
                        <Pop x={f.x} y={f.y - 26} text={f.counter ? cfg.counterSfx ?? 'COUNTER!' : f.hit ? cfg.sfx : 'MISS'} size={f.hit ? (f.counter ? 30 : 24) : 16} fill={f.counter ? '#fde047' : f.hit ? '#fff' : '#cbd5e1'} />
                    </g>
                ))}
            </svg>

            {/* the player takes a hit: red flash */}
            {hurt > 0 && <motion.div key={hurt} className="absolute inset-0 pointer-events-none bg-red-600" initial={{ opacity: 0.45 }} animate={{ opacity: 0 }} transition={{ duration: 0.45 }} />}

            {/* boss name, HP and combo counter, top right */}
            <BossName title={cfg.title} name={cfg.name}>
                <div className="mt-1 flex justify-end gap-0.5" aria-hidden>
                    {Array.from({ length: maxHp }, (_, i) => (
                        <span key={i} className={clsx('h-2 w-3 md:w-4 rounded-[2px] border border-black/40 transition-colors duration-300', i < hp ? 'bg-red-500' : 'bg-white/15')} />
                    ))}
                </div>
                <AnimatePresence>
                    {combo && !won && (
                        <motion.div key={combo.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: [0, 1, 1, 0], x: 0 }} transition={{ duration: 1.1 }} className="mt-1 text-sm md:text-lg font-black italic text-yellow-300 [-webkit-text-stroke:1px_#000]">
                            {combo.counter ? 'COUNTER! ×2 DMG' : `×${combo.n} COMBO!`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </BossName>
            {/* the same state for screen readers, announced as it changes */}
            <span className="sr-only" role="status">{started ? label : ''}</span>

            {/* counterattack warning */}
            <AnimatePresence>
                {windup && (
                    <motion.div key="warn" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-1/2 -translate-x-1/2 top-[30%] pointer-events-none px-3 py-1 rounded bg-red-600 text-white text-xs md:text-sm font-black uppercase tracking-widest shadow-lg animate-pulse whitespace-nowrap">
                        ⚠ {cfg.counter}!<span className="hidden sm:inline"> Punch now to counter</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* the player's lives, on the ground under him */}
            <div className="absolute left-3 md:left-5 bottom-[1%] pointer-events-none flex items-center gap-1">
                <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-widest text-white/90 [text-shadow:0_1px_2px_#000]">{hero.name}</span>
                {Array.from({ length: LIVES }, (_, i) => (
                    <motion.span key={i} animate={{ opacity: i < lives ? 1 : 0.2, scale: i < lives ? 1 : 0.8 }} className="text-sm md:text-base leading-none" aria-hidden>{hero.life}</motion.span>
                ))}
            </div>

            <AnimatePresence>
                {won ? (
                    <motion.div key="ko" initial={{ opacity: 0, scale: 1.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: fin.ms / 1000 + 0.15, type: 'spring', stiffness: 260, damping: 18 }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                        <div className="text-5xl md:text-7xl font-black italic text-white [-webkit-text-stroke:2px_#000] drop-shadow-[4px_4px_0_#000]">K.O.!</div>
                        <div className="mt-2 text-xs md:text-sm font-bold text-white bg-black/60 px-3 py-1 rounded">{cfg.win}</div>
                        <motion.div initial={{ scale: 2, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: -4, opacity: 1 }} transition={{ delay: fin.ms / 1000 + 0.75, type: 'spring', stiffness: 300, damping: 14 }} className="mt-3 px-3 py-1 bg-[#f5e6c8] text-[#3b2a1a] border-2 border-[#3b2a1a] font-black tracking-wider text-xs md:text-base shadow-[3px_3px_0_#000]">
                            NEW BOUNTY · ฿{cfg.bounty}
                        </motion.div>
                        <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/80">Click to rematch</div>
                    </motion.div>
                ) : lost && cfg.hero === 'ace' ? (
                    // Ace's last words, over the scene rather than hiding it
                    <motion.div key="lost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} transition={{ delay: 1.6, duration: 1.2 }} className="absolute inset-x-0 top-0 pt-14 md:pt-16 pb-10 flex flex-col items-center pointer-events-none text-center px-4 bg-gradient-to-b from-black/75 via-black/45 to-transparent">
                        <div className="text-xl md:text-3xl font-black text-white tracking-wide [text-shadow:0_2px_8px_#000]">愛してくれて…ありがとう</div>
                        <div className="mt-1 text-sm md:text-lg italic text-orange-100/95 [text-shadow:0_2px_6px_#000]">&ldquo;Thank you… for loving me.&rdquo;</div>
                        <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/70">Portgas D. Ace · Marineford · click to rewrite history</div>
                    </motion.div>
                ) : lost ? (
                    <motion.div key="lost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4 bg-black/55">
                        <div className="text-3xl md:text-5xl font-black italic text-white [-webkit-text-stroke:1.5px_#000]">{hero.down}</div>
                        <div className="mt-2 text-xs md:text-sm text-white/85">{hero.retry}</div>
                    </motion.div>
                ) : !started && (
                    <motion.div key="hint" exit={{ opacity: 0 }} className="absolute left-1/2 -translate-x-1/2 bottom-[13%] pointer-events-none font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-white bg-black/60 px-2 py-1 rounded leading-relaxed text-center whitespace-nowrap">
                        {/* a phone stage is too small for the full line */}
                        <div><span className="animate-pulse">▶</span> <span className="sm:hidden">Tap {cfg.name}</span><span className="hidden sm:inline">Click {cfg.name} · {cfg.move}</span></div>
                        <div className="hidden sm:block text-white/85">Punch during <span className="text-red-400">⚠</span> to counter</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StageShell>
    )
}

// Crocodile turning to sand to dodge: grains scatter from where he stood.
function SandBurst({ x, y }: { x: number; y: number }) {
    const rand = makeRand(Math.round(x * 13 + y))
    return (
        <g>
            {Array.from({ length: 40 }, (_, i) => {
                const a = rand() * Math.PI * 2, d = 20 + rand() * 60
                return <motion.circle key={i} r={1.5 + rand() * 2} fill={rand() > 0.5 ? '#fcd34d' : '#d97706'} initial={{ cx: x + (rand() - 0.5) * 30, cy: y + (rand() - 0.5) * 80, opacity: 1 }} animate={{ cx: x + Math.cos(a) * d + 40, cy: y + Math.sin(a) * d - 20, opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
            })}
        </g>
    )
}
