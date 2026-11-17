'use client'

import Section from '@/components/ui/Section'
import resume from '@/data/resume.json'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import JutsuCards, { SharinganEye } from './Jutsu'
import BellTest from './BellTest'
import { LeafSymbol } from './HiddenLeafScene'

const skillCount = resume.skills.reduce((n, g) => n + g.items.length, 0)

const clientCount = new Set(resume.experience.map(job => job.client).filter(Boolean)).size
const stats = [
    { label: 'Appian experience', value: '7+ years' },
    { label: 'Clients', value: String(clientCount) },
    { label: 'Certification', value: 'Appian L2' },
    { label: 'Technologies', value: String(skillCount) },
]

// How far an iris can travel from the centre of its eye, in px. Eyes are wider than they are tall.
const REACH = { x: 4, y: 3 }
const SETTLE_MS = 60 // how quickly the gaze closes on its target: quick like a glance, not a slow glide
const IDLE_MS = 2500 // with nothing moving for this long, the eyes come back to look at you

// A pair of Sharingan that watch the pointer, built to move the way eyes do:
// - they look together. One gaze, taken from the middle of the pair, drives both irises, so they never cross.
// - the gaze spans the screen. The iris reaches the corner of the eye only when the pointer reaches the edge of the
//   window, so where the eyes point always matches where the pointer is.
// - a glance is quick and then still. The gaze closes most of the gap within a few frames and stops.
// - an eye is a ball. The iris narrows as it turns away, the glint on its surface lags behind it, and the upper
//   lid follows the gaze down.
// - attention follows movement. When the pointer has been still for a while, or has left, they look back at you.
// Bring the pointer right up to them and they awaken into the Mangekyō. They blink. Nothing runs off screen.
function SharinganEyes() {
    const box = useRef<HTMLDivElement>(null)
    const watching = useInView(box)
    const [awake, setAwake] = useState(false)
    const reducedMotion = useReducedMotion()

    useEffect(() => {
        const el = box.current
        if (!el || !watching || reducedMotion) return
        const eyes = [...el.querySelectorAll<HTMLElement>('[data-eye]')]
        const gaze = { x: 0, y: 0, tx: 0, ty: 0 } // where the pair is looking and where it is heading, each -1..1
        let frame = 0, last = 0, idle = 0, near = false

        const draw = (now: number) => {
            const k = 1 - Math.exp(-Math.min(50, now - last) / SETTLE_MS)
            last = now
            gaze.x += (gaze.tx - gaze.x) * k
            gaze.y += (gaze.ty - gaze.y) * k
            const settled = Math.abs(gaze.tx - gaze.x) + Math.abs(gaze.ty - gaze.y) < 0.004
            if (settled) { gaze.x = gaze.tx; gaze.y = gaze.ty }
            for (const eye of eyes) {
                eye.style.setProperty('--gx', `${(gaze.x * REACH.x).toFixed(2)}px`)
                eye.style.setProperty('--gy', `${(gaze.y * REACH.y).toFixed(2)}px`)
                // turned away, a round iris is seen at an angle
                eye.style.setProperty('--sx', (1 - 0.14 * Math.abs(gaze.x)).toFixed(3))
                eye.style.setProperty('--sy', (1 - 0.1 * Math.abs(gaze.y)).toFixed(3))
            }
            frame = settled ? 0 : requestAnimationFrame(draw)
        }
        const lookAt = (at: { x: number; y: number } | null) => {
            if (!at) {
                gaze.tx = 0; gaze.ty = 0
            } else {
                const pair = el.getBoundingClientRect()
                const cx = pair.left + pair.width / 2, cy = pair.top + pair.height / 2
                const dx = at.x - cx, dy = at.y - cy
                // 1 at the edge of the window in that direction, 0 on the eyes themselves
                let nx = dx / Math.max(1, dx > 0 ? innerWidth - cx : cx)
                let ny = dy / Math.max(1, dy > 0 ? innerHeight - cy : cy)
                // a little more turn for a pointer that is close, so the eyes are never sluggish
                nx = Math.sign(nx) * Math.min(1, Math.abs(nx)) ** 0.75
                ny = Math.sign(ny) * Math.min(1, Math.abs(ny)) ** 0.75
                const over = Math.hypot(nx, ny)
                gaze.tx = over > 1 ? nx / over : nx
                gaze.ty = over > 1 ? ny / over : ny
                // awakens when the pointer is close, and holds until it has clearly gone, so it never flickers at the line
                const far = Math.hypot(dx, dy)
                if (far < 90) near = true
                else if (far > 140) near = false
            }
            if (!at) near = false
            setAwake(near)
            if (!frame) { last = performance.now(); frame = requestAnimationFrame(draw) }
        }
        const onMove = (e: PointerEvent) => {
            lookAt({ x: e.clientX, y: e.clientY })
            clearTimeout(idle)
            idle = window.setTimeout(() => lookAt(null), IDLE_MS)
        }
        const onLeave = () => { clearTimeout(idle); lookAt(null) }
        window.addEventListener('pointermove', onMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onLeave)
        return () => {
            window.removeEventListener('pointermove', onMove)
            document.documentElement.removeEventListener('pointerleave', onLeave)
            clearTimeout(idle)
            cancelAnimationFrame(frame)
        }
    }, [watching, reducedMotion])

    return (
        <div ref={box} className="sharingan-signet" title="Sharingan" aria-hidden>
            {['tomoe'].map((side) => (
                <div key={side} data-eye className="relative w-8 h-8 rounded-full bg-[#17090c] border border-red-500/40 p-[3px] overflow-hidden shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                    <div className="absolute inset-[3px] will-change-transform [transform:translate(var(--gx,0px),var(--gy,0px))_scale(var(--sx,1),var(--sy,1))]">
                        <SharinganEye live={watching && !reducedMotion} awake={awake} glow={false} />
                        {/* the glint is a reflection on the surface, so it lags behind the iris as the eye turns under it */}
                        <div className="absolute left-[24%] top-[16%] w-[24%] h-[24%] rounded-full bg-white/70 [transform:translate(calc(var(--gx,0px)*-0.35),calc(var(--gy,0px)*-0.35))]" />
                    </div>
                    {/* the shadow of the upper lid, which comes down with the gaze */}
                    <div className="absolute inset-x-0 -top-1 h-[62%] bg-gradient-to-b from-black/60 via-black/15 to-transparent [transform:translateY(calc(var(--gy,0px)*0.7))]" />
                    {/* the lid: drops shut for an instant every few seconds */}
                    <div className={clsx('absolute inset-0 origin-top [transform:scaleY(0)] bg-[#1c1206]', watching && 'motion-safe:animate-[blink-lid_5.5s_ease-in-out_infinite]')} style={{ animationDelay: '1.5s' }} />
                </div>
            ))}
        </div>
    )
}

export default function About() {
    const reducedMotion = useReducedMotion()
    // Everything that loops in this section runs only while it is on screen (`data-live`, see globals.css).
    const fx = useRef<HTMLDivElement>(null)
    const live = useInView(fx)
    useEffect(() => { fx.current?.closest('section')?.toggleAttribute('data-live', live) }, [live])
    const aside = useRef<HTMLElement>(null)
    const cloned = useInView(aside, { once: true, amount: 0.5 })
    const reveal = {
        initial: reducedMotion ? false as const : { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.3 },
    }
    return (
        <Section id="about" className="naruto-about relative md:min-h-0 justify-start py-10 md:py-14">
            {/* Leaves of the Hidden Leaf drifting down through the section. */}
            <div ref={fx} className="naruto-fx" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => <svg key={i} viewBox="0 0 24 24" className="konoha-leaf" style={{ left: `${4 + i * 11}%`, animationDuration: `${9 + (i * 5) % 7}s`, animationDelay: `${-(i * 3.7) % 11}s`, scale: 0.8 + (i % 3) * 0.3 }}><path d="M12 2C6 6 4 12 6 18c1 2 3 3.5 6 4 3-.5 5-2 6-4 2-6 0-12-6-16Z" fill="currentColor" /><path d="M12 5v16" stroke="#14532d" strokeWidth="1.2" /></svg>)}
            </div>
            <motion.header {...reveal} className="relative mb-6">
                <LeafSymbol className="leaf-mark" />
                <div className="relative flex items-center gap-3 mb-3 pr-12">
                    <SharinganEyes />
                    <p className="section-kicker">Personnel file · Hidden Leaf</p>
                </div>
                <h2 className="about-title text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-300">MANI KARTHIK</h2>
                {/* Kakashi's bell test: the bells dodge the pointer, the third grab catches one, both is a pass */}
                <div className="relative mt-4 md:mt-0 md:absolute md:right-0 md:bottom-0"><BellTest /></div>
            </motion.header>

            <div className="grid lg:grid-cols-12 gap-4 items-start">
                <motion.article {...reveal} className="about-overview dossier-card lg:col-span-7 p-5 sm:p-6">
                    <div className="dossier-heading mb-4">
                        <p className="section-kicker">Mission profile · 001</p>
                        <h3 className="mt-1 text-xl font-bold text-white">{resume.title}</h3>
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-zinc-300">I build enterprise Appian applications, tune the databases behind them, and help teams deliver reliable software.</p>
                    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-400">
                        <li><strong className="text-zinc-200 font-semibold">Enterprise delivery:</strong> federal compliance and funding at USAC, loan onboarding for HSBC, and scheduling for IQVIA.</li>
                        <li><strong className="text-zinc-200 font-semibold">Technical leadership:</strong> performance tuning, reusable design patterns, code reviews, and mentoring junior developers.</li>
                        <li><strong className="text-zinc-200 font-semibold">Beyond Appian:</strong> React, Java, and Flutter for web apps, mobile products, and integrations.</li>
                    </ul>
                    <details className="about-background mt-4 border-t border-white/10 pt-3">
                        <summary className="cursor-pointer w-fit py-2 text-sm font-semibold text-red-300 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300">Full background</summary>
                        <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400">{resume.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
                    </details>
                </motion.article>
                <aside ref={aside} data-cloned={cloned} className="about-aside relative lg:col-span-5 space-y-4">
                    {cloned && <span className="jutsu-shout clone-shout" aria-hidden>影分身の術<small>Shadow Clone Jutsu</small></span>}
                    <dl className="grid grid-cols-2 gap-3">
                        {stats.map(stat => <div key={stat.label} className="about-stat px-4 py-3"><dt className="about-stat-label">{stat.label}</dt><dd className="mt-1 text-xl font-bold text-white">{stat.value}</dd></div>)}
                    </dl>
                    <div className="about-education p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Education & certifications</h3>
                        <ul className="space-y-3">{resume.education.map(edu => <li key={edu.degree}><div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm"><span className="text-zinc-200 font-medium">{edu.degree}</span><span className="text-xs text-zinc-500">{edu.period}</span></div><p className="mt-1 text-xs text-zinc-400">{edu.school}{edu.note && ` · ${edu.note}`}</p></li>)}</ul>
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">{resume.certifications.map(cert => <span key={cert} className="credential-tag">{cert}</span>)}</div>
                    </div>
                </aside>
            </div>
            <motion.div {...reveal} className="mt-7"><JutsuCards /></motion.div>
        </Section>
    )
}
