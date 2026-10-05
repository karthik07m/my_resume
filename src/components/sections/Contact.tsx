'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import BugSmasher from '@/components/games/BugSmasher'
import MagneticButton from '@/components/ui/MagneticButton'
import resume from '@/data/resume.json'
import { sfx } from '@/lib/sfx'
import { KanjiWatermark, MangaSfx } from '@/components/ui/MangaText'

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const handle = (url: string) => url.replace(/\/$/, '').split('/').pop() ?? url

// Every channel is a breathing style, credited to the swordsman who uses that form in canon and marked with their
// haori. The colour drives the accent, and hovering a channel performs its form.
const CHANNELS = [
    { name: 'Email', value: resume.email, href: `mailto:${resume.email}`, breath: 'Thunder Breathing', kanji: '雷の呼吸', form: 'First Form: Thunderclap and Flash', formKanji: '壱ノ型 霹靂一閃', user: 'Zenitsu Agatsuma', haori: 'zenitsu', color: '#facc15', slash: 'thunder' },
    { name: 'LinkedIn', value: handle(resume.links.linkedin), href: resume.links.linkedin, breath: 'Water Breathing', kanji: '水の呼吸', form: 'Eleventh Form: Dead Calm', formKanji: '拾壱ノ型 凪', user: 'Giyu Tomioka', haori: 'giyu', color: '#38bdf8', slash: 'water' },
    { name: 'GitHub', value: handle(resume.links.github), href: resume.links.github, breath: 'Flame Breathing', kanji: '炎の呼吸', form: 'Ninth Form: Rengoku', formKanji: '玖ノ型 煉獄', user: 'Kyojuro Rengoku', haori: 'rengoku', color: '#f97316', slash: 'flame' },
    { name: 'Play Store', value: 'Visa Sage · Coinly', href: resume.projects[0].url, breath: 'Wind Breathing', kanji: '風の呼吸', form: 'First Form: Dust Whirlwind Cutter', formKanji: '壱ノ型 塵旋風・削ぎ', user: 'Sanemi Shinazugawa', haori: 'sanemi', color: '#4ade80', slash: 'wind' },
    { name: 'Résumé', value: resume.resumeFile, href: `${base}/${resume.resumeFile}`, breath: 'Sun Breathing', kanji: '日の呼吸', form: 'Hinokami Kagura: Dance', formKanji: 'ヒノカミ神楽 円舞', user: 'Tanjiro Kamado', haori: 'tanjiro', color: '#fb7185', slash: 'sun', download: true },
]

// Each wielder's haori, as a swatch on their card (viewBox 36 × 48): Zenitsu's yellow with white scale triangles,
// Giyu's split maroon and tortoiseshell, Rengoku's white with flames up the hem, Sanemi's white with 殺 on it, and
// Tanjiro's green and black check.
const HAORI = {
    zenitsu: (
        <>
            <defs>
                <linearGradient id="haori-zenitsu" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#facc15" /><stop offset="1" stopColor="#f97316" /></linearGradient>
                <pattern id="uroko" width="12" height="20" patternUnits="userSpaceOnUse"><path d="M 0 10 L 6 0 L 12 10 Z M -6 20 L 0 10 L 6 20 Z M 6 20 L 12 10 L 18 20 Z" fill="#fff" /></pattern>
            </defs>
            <rect width="36" height="48" fill="url(#haori-zenitsu)" />
            <rect width="36" height="48" fill="url(#uroko)" opacity={0.85} />
        </>
    ),
    giyu: (
        <>
            <defs>
                <pattern id="kikko" width="12" height="20.8" patternUnits="userSpaceOnUse"><path d="M 3 0 L 9 0 L 12 5.2 L 9 10.4 L 3 10.4 L 0 5.2 Z M -3 10.4 L 3 10.4 L 6 15.6 L 3 20.8 L -3 20.8 L -6 15.6 Z M 9 10.4 L 15 10.4 L 18 15.6 L 15 20.8 L 9 20.8 L 6 15.6 Z" fill="#a3a635" stroke="#f59e0b" strokeWidth={1.2} /></pattern>
            </defs>
            <rect width="18" height="48" fill="#7f1d1d" />
            <rect x="18" width="18" height="48" fill="#65a30d" />
            <rect x="18" width="18" height="48" fill="url(#kikko)" />
        </>
    ),
    rengoku: (
        <>
            <rect width="36" height="48" fill="#f8fafc" />
            <path d="M 0 48 V 30 Q 3 20 6 27 Q 8 12 13 22 Q 16 6 19 20 Q 23 10 25 23 Q 29 14 31 26 Q 34 20 36 28 V 48 Z" fill="#dc2626" />
            <path d="M 0 48 V 38 Q 4 30 7 36 Q 10 26 14 34 Q 18 24 21 33 Q 25 27 28 35 Q 32 30 36 37 V 48 Z" fill="#f97316" />
            <path d="M 0 48 V 44 Q 6 38 10 43 Q 15 36 19 42 Q 24 37 28 43 Q 32 39 36 44 V 48 Z" fill="#facc15" />
        </>
    ),
    sanemi: (
        <>
            <rect width="36" height="48" fill="#f8fafc" />
            <text x="18" y="33" textAnchor="middle" fontSize="22" fontWeight={900} fill="#111827">殺</text>
        </>
    ),
    tanjiro: (
        <>
            <defs>
                <pattern id="ichimatsu" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#0a0a0a" /><rect width="6" height="6" fill="#15803d" /><rect x="6" y="6" width="6" height="6" fill="#15803d" /></pattern>
            </defs>
            <rect width="36" height="48" fill="url(#ichimatsu)" />
        </>
    ),
}
function Haori({ kind }: { kind: keyof typeof HAORI }) {
    return (
        <svg aria-hidden viewBox="0 0 36 48" className="w-8 h-11 shrink-0 rounded-md border border-white/15 shadow-[0_0_12px_var(--breath)] overflow-hidden">
            {HAORI[kind]}
        </svg>
    )
}

// Nezuko's asa-no-ha (hemp leaf) pattern: a triangular lattice with every triangle's centre joined to its corners.
const ASA = (() => {
    const s = 24, r = (s * Math.sqrt(3)) / 2
    let d = ''
    const tri = (a: number[], b: number[], c: number[]) => {
        const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3]
        d += `M ${a} L ${b} L ${c} Z ` + [a, b, c].map((v) => `M ${m} L ${v} `).join('')
    }
    for (let j = 0; j < 2; j++) for (let i = -1; i < 2; i++) {
        const x = i * s + (j % 2) * (s / 2), y0 = j * r, y1 = y0 + r
        tri([x, y0], [x + s, y0], [x + s / 2, y1])
        tri([x + s / 2, y1], [x + (3 * s) / 2, y1], [x + s, y0])
    }
    return { d, w: s, h: 2 * r }
})()

// Each form's cut, drawn across the card (viewBox 400 × 80, stretched to fit) as the pointer arrives.
// Thunderclap and Flash is one instant zigzag; Dead Calm is the still water line; Rengoku is a huge arc of fire;
// Dust Whirlwind Cutter spirals; Hinokami Kagura's Dance is a full circle.
const SLASHES = {
    thunder: { ms: 140, paths: ['M -10 30 L 80 22 L 68 48 L 170 36 L 158 60 L 260 44 L 248 66 L 410 50'], width: 2.5 },
    water: { ms: 550, paths: ['M -10 50 C 60 20, 120 80, 200 45 S 340 15, 410 40', 'M -10 60 C 70 34, 130 88, 210 56 S 340 30, 410 52'], width: 2.5 },
    flame: { ms: 380, paths: ['M -10 74 Q 200 -40 410 66'], width: 7 },
    wind: { ms: 450, paths: ['M -10 62 C 80 72, 120 8, 180 30 C 232 50, 200 76, 168 60 C 148 48, 190 18, 262 26 C 332 34, 362 62, 410 22'], width: 2.5 },
    sun: { ms: 600, paths: ['M 200 76 A 190 36 0 1 0 198 76'], width: 3.5 },
}
function BreathSlash({ kind }: { kind: keyof typeof SLASHES }) {
    const { ms, paths, width } = SLASHES[kind]
    return (
        <svg aria-hidden viewBox="0 0 400 80" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 drop-shadow-[0_0_6px_var(--breath)]">
            {paths.map((d, i) => (
                <path
                    key={d}
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke="var(--breath)"
                    strokeWidth={i ? width * 0.6 : width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transitionDuration: `${ms}ms`, transitionDelay: `${i * 80}ms` }}
                    className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0] transition-[stroke-dashoffset] ease-out motion-reduce:[stroke-dashoffset:0]"
                />
            ))}
            {/* Rengoku burns: a hotter core inside the arc */}
            {kind === 'flame' && <path d={paths[0]} pathLength={1} fill="none" stroke="#fde047" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ transitionDuration: `${ms}ms` }} className="[stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0] transition-[stroke-dashoffset] ease-out motion-reduce:[stroke-dashoffset:0]" />}
        </svg>
    )
}

const EASE = [0.22, 1, 0.36, 1] as const

// Water Breathing: three layered waves drifting across the bottom of the section at different speeds.
const WAVE = 'M0 70 C 150 10, 300 130, 600 70 S 1050 10, 1200 70'
const LAYERS = [
    { color: '#ec4899', fill: 0.14, speed: 26, top: 0 },
    { color: '#a855f7', fill: 0.16, speed: 18, top: 22 },
    { color: '#38bdf8', fill: 0.22, speed: 12, top: 44 },
]
function Waves() {
    return (
        <div className="absolute inset-x-0 bottom-0 h-44 md:h-56 pointer-events-none" aria-hidden>
            {LAYERS.map((w) => (
                <motion.svg
                    key={w.color}
                    viewBox="0 0 2400 160"
                    preserveAspectRatio="none"
                    className="absolute left-0 w-[200%] h-full"
                    style={{ top: w.top }}
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: w.speed, repeat: Infinity, ease: 'linear' }}
                >
                    {[0, 1200].map((dx) => (
                        <g key={dx} transform={`translate(${dx} 0)`}>
                            <path d={`${WAVE} V 160 H 0 Z`} fill={w.color} fillOpacity={w.fill} />
                            <path d={WAVE} fill="none" stroke={w.color} strokeOpacity={0.7} strokeWidth={2} />
                        </g>
                    ))}
                </motion.svg>
            ))}
        </div>
    )
}

export default function Contact() {
    const [playing, setPlaying] = useState(false)
    const [crow, setCrow] = useState(false)
    const [copied, setCopied] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)
    const near = useInView(sectionRef, { margin: '20% 0px' })

    const sendCrow = () => {
        setCrow(true)
        sfx.whoosh()
        setTimeout(() => { window.location.href = `mailto:${resume.email}` }, 900)
    }
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(resume.email)
            setCopied(true)
            sfx.click()
            setTimeout(() => setCopied(false), 1800)
        } catch { window.location.href = `mailto:${resume.email}` }
    }

    return (
        <section ref={sectionRef} className="relative md:min-h-screen w-full flex flex-col justify-center pt-16 pb-28 md:pt-24 md:pb-44 bg-transparent overflow-hidden">
            <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none [mask-image:radial-gradient(ellipse_at_20%_40%,#000,transparent_65%)]">
                <defs><pattern id="asa-no-ha" width={ASA.w} height={ASA.h} patternUnits="userSpaceOnUse"><path d={ASA.d} fill="none" stroke="#f472b6" strokeWidth={0.7} strokeOpacity={0.16} /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#asa-no-ha)" />
            </svg>
            {near && <Waves />}

            <div className="relative z-20 w-full max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">

                {/* Left: pitch and the two things a recruiter actually clicks */}
                <div className="relative isolate space-y-6">
                    {/* 鬼滅: Demon Slayer, as on the Corps' own banner */}
                    <KanjiWatermark text="鬼滅" color="#f472b6" className="hidden xl:block -left-[146px] top-16" />
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 backdrop-blur-xl"
                    >
                        <span className="grid place-items-center w-6 h-6 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-200 text-xs font-black" title="滅: the mark on every Demon Slayer Corps uniform">滅</span>
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-pink-400">Total Concentration Breathing</span>
                    </motion.div>

                    {/* Heading revealed by a katana slash */}
                    <div className="relative inline-block">
                        <motion.h2
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.95]"
                        >
                            BREATH OF<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">CODE</span>
                        </motion.h2>
                        <motion.span
                            aria-hidden
                            initial={{ left: '0%', opacity: 1 }}
                            whileInView={{ left: '100%', opacity: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                            className="absolute top-0 bottom-0 w-[3px] -skew-x-12 bg-white shadow-[0_0_18px_#f0abfc]"
                        />
                        {/* Rengoku's last words to Tanjiro */}
                        <MangaSfx jp="心を燃やせ!" en="Set your heart ablaze" color="#fb923c" tilt={-7} className="mt-3 md:mt-0 md:absolute md:left-full md:ml-2 md:bottom-2" />
                    </div>
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-pink-300/70"><span className="font-sans tracking-[0.15em] mr-2">全集中の呼吸</span>First Form: Contact</p>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-white/75 max-w-xl leading-relaxed"
                    >
                        Building an Appian platform, hiring a lead, or just want to{' '}
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            className="text-pink-400 underline decoration-dotted underline-offset-4 hover:text-pink-300 transition-colors"
                        >
                            slay some bugs
                        </button>
                        ? Send a crow. I read every one.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-3 pt-2"
                    >
                        <div className="relative">
                            <MagneticButton
                                onClick={sendCrow}
                                className="w-full sm:w-auto whitespace-nowrap px-10 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm tracking-widest hover:brightness-110 transition-all shadow-lg shadow-pink-500/25"
                            >
                                SEND KASUGAI CROW
                            </MagneticButton>
                            <AnimatePresence>
                                {crow && (
                                    <motion.span
                                        key="crow"
                                        initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 1, rotate: 0 }}
                                        animate={{ x: 'calc(-50% + 280px)', y: 'calc(-50% - 260px)', opacity: 0, scale: 0.3, rotate: -25 }}
                                        transition={{ duration: 0.9, ease: 'easeIn' }}
                                        onAnimationComplete={() => setCrow(false)}
                                        className="absolute left-1/2 top-1/2 pointer-events-none z-30 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                                        aria-hidden
                                    >
                                        {/* the Kasugai crow, shouting its orders as it goes, as they do in canon */}
                                        <span className="absolute -top-7 left-8 whitespace-nowrap rounded bg-white px-2 py-0.5 text-[11px] font-black text-black">カァー! CAW! New mission!</span>
                                        <svg viewBox="0 0 64 40" className="w-16 h-10"><path d="M 2 20 Q 14 2 30 16 Q 40 0 62 6 Q 46 14 42 22 L 52 26 L 40 27 Q 34 34 24 30 Q 14 30 10 24 Z" fill="#0a0a0a" stroke="#f9a8d4" strokeWidth={0.8} /><circle cx="44" cy="20" r="1.4" fill="#f9a8d4" /><path d="M 52 26 L 60 25 L 52 28 Z" fill="#facc15" /></svg>
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            type="button"
                            onClick={copyEmail}
                            className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-widest hover:bg-white/10 hover:border-pink-400/60 transition-colors font-mono"
                        >
                            {copied ? 'COPIED ✓' : resume.email}
                        </button>
                    </motion.div>

                    <p className="text-xs font-mono text-white/60">
                        <span className="text-pink-300/85">柱 Hashira rank</span> · {resume.title} · {resume.location} · <a href={`${base}/${resume.resumeDocx}`} download className="underline decoration-dotted underline-offset-4 hover:text-white/70">Résumé as .docx</a>
                    </p>
                </div>

                {/* Right: every channel, one breathing style each */}
                <ul className="space-y-3 min-w-0">
                    {CHANNELS.map((c, i) => (
                        <motion.li
                            key={c.name}
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-10%' }}
                            transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 220, damping: 24 }}
                        >
                            <a
                                href={c.href}
                                download={c.download || undefined}
                                target={c.href.startsWith('http') ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                style={{ '--breath': c.color } as React.CSSProperties}
                                className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--breath)] hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                            >
                                <Haori kind={c.haori as keyof typeof HAORI} />
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-baseline justify-between gap-3">
                                        <span className="font-bold text-white tracking-wide">{c.name}</span>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--breath)] opacity-90 whitespace-nowrap"><span className="font-sans font-bold not-italic tracking-normal mr-1.5">{c.kanji}</span><span className="hidden xl:inline">{c.breath}</span></span>
                                    </span>
                                    <span className="flex items-baseline justify-between gap-3">
                                        <span className="min-w-0 text-sm text-white/60 truncate group-hover:text-white/90 transition-colors">{c.value}</span>
                                        <span className="hidden sm:inline text-[10px] text-white/65 whitespace-nowrap">{c.user}</span>
                                    </span>
                                    <span className="block text-[10px] font-mono text-white/60 group-hover:text-[var(--breath)] transition-colors truncate"><span className="sm:hidden">{c.user} · </span>{c.formKanji} · <span className="xl:hidden">{c.breath}, </span>{c.form}</span>
                                </span>
                                <span className="text-white/30 group-hover:text-[var(--breath)] group-hover:translate-x-1 transition-all">↗</span>
                                <BreathSlash kind={c.slash as keyof typeof SLASHES} />
                            </a>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Pinned to the foot of the section on its own backing: in the flow it landed among the wave lines and was
                drawn through. Higher up on phones, clear of the floating buttons in the corners. */}
            <p className="absolute z-20 inset-x-0 bottom-16 md:bottom-4 text-center text-xs font-mono">
                <span className="inline-block rounded-full bg-black/60 px-3 py-1 text-white/70">© {new Date().getFullYear()} {resume.name}</span>
            </p>

            <AnimatePresence>
                {playing && <BugSmasher onClose={() => setPlaying(false)} />}
            </AnimatePresence>
        </section>
    )
}
