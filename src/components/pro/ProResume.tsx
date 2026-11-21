'use client'

import { useState } from 'react'
import { Newsreader } from 'next/font/google'
import resume from '@/data/resume.json'
import { useEmail } from '@/lib/email'
import { setView } from '@/lib/view'
import { toMonths } from '@/lib/years'
import AnimeAsk from './AnimeAsk'

// The plain résumé: an ink sidebar (who, numbers, skills) beside a paper page (profile, timeline, projects),
// with one vermilion accent taken from a name seal. Read straight from resume.json so it never drifts from
// the anime site. No three.js, no sound; sections rise in with a CSS scroll-driven animation (`reveal`).
// Newsreader: an editorial serif at normal width with an ordinary upright f. (Fraunces' hooked display f read as odd,
// and Instrument Serif was too condensed: the headings looked squeezed.)
const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', axes: ['opsz'] })

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const handle = (url: string) => url.replace(/\/$/, '').split('/').pop() ?? url
const firstYear = resume.experience.at(-1)!.start.split(' ')[1]
const SHOWN = 5

// Same figures as the anime hero: "7+" is the résumé's own claim, not computed from dates.
const STATS = [
    { val: '7+', label: 'years with Appian' },
    { val: `${resume.experience.filter((e) => e.client).length}`, label: 'enterprise clients' },
    { val: '18→26', label: 'Appian versions' },
]

// Recruiters filter on the Appian certification first, so it sits under the title in the sidebar.
const appianCert = resume.certifications.find((c) => c.includes('Appian'))
// The Appian-related project leads the list for Appian roles; the rest keep their order.
const projects = [...resume.projects].sort((a, b) => Number(b.name.includes('Appian')) - Number(a.name.includes('Appian')))

// A break between two jobs that a degree explains: shown on the timeline so the gap reads as study, not silence.
const gapStudy = (job: (typeof resume.experience)[number], prev?: (typeof resume.experience)[number]) => {
    if (!prev || toMonths(job.start) - toMonths(prev.end) < 4) return null
    const [from, to] = [Number(prev.end.split(' ')[1]), Number(job.start.split(' ')[1])]
    return resume.education.find((e) => {
        const [a, b] = e.period.split(' to ').map(Number)
        return a >= from && b <= to
    }) ?? null
}

function Study({ e }: { e: (typeof resume.education)[number] }) {
    return (
        <div className="reveal relative pl-8 sm:pl-10 pb-12">
            <span className="absolute left-[5px] top-0 bottom-0 w-px border-l border-dashed border-[#1b1a17]/25" aria-hidden />
            <span className="absolute left-[1px] top-[7px] h-[9px] w-[9px] rotate-45 bg-[#f3efe6] border-2 border-[#1b1a17]/40" aria-hidden />
            <p className="font-mono text-xs text-[#1b1a17]/60">{e.period.replace(' to ', ' – ')} · Full-time study</p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-xl">{e.degree}</p>
            <p className="text-[#1b1a17]/65">{e.school}{e.note && ` · ${e.note}`}</p>
        </div>
    )
}

const RED = '#c8361f'

// A hanko, the red name seal stamped on Japanese documents: the one nod to the other version.
// The turbulence filter roughens the edge and eats into the fill the way real ink does.
function Seal({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={`-rotate-6 shrink-0 ${className}`} aria-hidden>
            <defs>
                <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
                    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" />
                    <feComposite in="SourceGraphic" operator="in" />
                </filter>
            </defs>
            <g filter="url(#ink)" fill={RED}>
                <path d="M14 8 Q50 4 88 9 Q94 50 90 89 Q50 95 11 90 Q6 50 14 8 Z M21 16 Q20 50 19 82 Q50 86 82 83 Q85 50 82 16 Q50 13 21 16 Z" fillRule="evenodd" />
                <text x="50" y="47" textAnchor="middle" fontSize="30" fontWeight="700" fontFamily="var(--font-serif), serif">M</text>
                <text x="50" y="77" textAnchor="middle" fontSize="30" fontWeight="700" fontFamily="var(--font-serif), serif">K</text>
            </g>
        </svg>
    )
}

function Label({ children }: { children: React.ReactNode }) {
    return <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c8361f] mb-4">{children}</h2>
}

function Heading({ n, children, aside }: { n: string; children: React.ReactNode; aside?: string }) {
    return (
        <h2 className="reveal flex items-baseline gap-4 mb-8 font-[family-name:var(--font-serif)] text-3xl sm:text-4xl">
            <span className="font-mono text-sm text-[#c8361f]">{n}</span>
            {children}
            <span className="h-px flex-1 bg-[#1b1a17]/15 -translate-y-[0.3em]" aria-hidden />
            {aside && <span className="font-mono text-xs tracking-wider text-[#1b1a17]/50">{aside}</span>}
        </h2>
    )
}

function Job({ job, current }: { job: (typeof resume.experience)[number]; current: boolean }) {
    const [open, setOpen] = useState(false)
    const more = job.bullets.length - SHOWN
    return (
        <article className="reveal relative pl-8 sm:pl-10 pb-12 last:pb-0 break-inside-avoid">
            {/* The timeline: a hairline down the left edge, a dot per job, filled red for the current one. */}
            <span className="absolute left-[5px] top-3 bottom-0 w-px bg-[#1b1a17]/15" aria-hidden />
            <span
                className={`absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full border-2 ${current ? 'bg-[#c8361f] border-[#c8361f] shadow-[0_0_0_5px_rgba(200,54,31,0.15)]' : 'bg-[#f3efe6] border-[#1b1a17]/40'}`}
                aria-hidden
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-[#1b1a17]/60">{job.start} – {job.end}</span>
                {current && <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-[#c8361f] text-white">Current</span>}
                <span className="font-mono text-xs text-[#1b1a17]/40">{job.location}</span>
            </div>
            <h3 className="mt-1.5 font-[family-name:var(--font-serif)] text-2xl leading-tight">
                {job.role}
            </h3>
            <p className="text-lg font-medium text-[#1b1a17]/75">{job.company}</p>
            {job.client && (
                <p className="mt-2 inline-block text-sm bg-[#1b1a17]/[0.06] px-2.5 py-1 border-l-2 border-[#c8361f]">
                    <span className="font-semibold">Client:</span> {job.client}
                </p>
            )}
            <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-[#1b1a17]/85">
                {job.bullets.map((b, i) => (
                    <li
                        key={b}
                        className={`relative pl-5 before:absolute before:left-0 before:top-[0.72em] before:h-[2px] before:w-2.5 before:bg-[#c8361f] ${i >= SHOWN && !open ? 'hidden print:block' : ''}`}
                    >
                        {b}
                    </li>
                ))}
            </ul>
            {more > 0 && (
                <button type="button" onClick={() => setOpen(!open)} className="mt-3 font-mono text-xs text-[#c8361f] hover:underline underline-offset-4 print:hidden">
                    {open ? '− Show less' : `+ ${more} more`}
                </button>
            )}
            {job.award && (
                <p className="mt-4 flex gap-3 text-[15px] leading-relaxed bg-[#c8361f]/[0.07] px-4 py-3">
                    <span className="text-[#c8361f]" aria-hidden>★</span>
                    <span><span className="font-semibold">Recognition.</span> {job.award}</span>
                </p>
            )}
            <ul className="mt-4 flex flex-wrap gap-1.5">
                {job.stack.split(', ').map((t) => (
                    <li key={t} className="font-mono text-[11px] px-2 py-0.5 border border-[#1b1a17]/20 text-[#1b1a17]/70">{t}</li>
                ))}
            </ul>
        </article>
    )
}

const sideLink = 'flex items-baseline justify-between gap-4 py-2 border-b border-white/10 hover:text-white transition-colors'

export default function ProResume() {
    const email = useEmail()

    return (
        <div className={`${serif.variable} pro-view min-h-screen bg-[#f3efe6] text-[#1b1a17] [color-scheme:light] selection:bg-[#c8361f] selection:text-white`}>
            <AnimeAsk />

            <div className="lg:grid lg:grid-cols-[minmax(320px,380px)_1fr]">
                {/* Who: name, numbers, ways to reach me, the PDF. Pinned beside the page on a wide screen so the download
                    is always in reach; first thing on a phone. */}
                <header data-lenis-prevent className="ink ink-scroll relative overflow-hidden lg:overflow-y-auto bg-[#141311] text-[#f3efe6] px-5 sm:px-10 pt-10 pb-8 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col">
                    <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#f3efe6_1px,transparent_1.3px)] [background-size:6px_6px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden />
                    <div className="relative lg:flex-1 lg:flex lg:flex-col">
                        <Seal className="w-16 h-16" />
                        <h1 className="mt-6 font-[family-name:var(--font-serif)] text-[2.75rem] leading-[0.95]">
                            {resume.name.split(' ').slice(0, 2).join(' ')}
                            <span className="block text-[#f3efe6]/45">{resume.name.split(' ').slice(2).join(' ')}</span>
                        </h1>
                        <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-[#e0553d]">{resume.title}</p>
                        {appianCert && (
                            <p className="mt-4 inline-flex items-center gap-2 self-start px-3 py-1.5 text-sm font-semibold bg-[#c8361f]/15 border border-[#e0553d]/60">
                                <span className="text-[#e0553d]" aria-hidden>✓</span>{appianCert}
                            </p>
                        )}

                        <dl className="mt-8 grid grid-cols-3 border-y border-white/15 divide-x divide-white/15">
                            {STATS.map((s) => (
                                <div key={s.label} className="py-4 px-2 first:pl-0">
                                    <dt className="sr-only">{s.label}</dt>
                                    <dd className="font-[family-name:var(--font-serif)] text-3xl leading-none">{s.val}</dd>
                                    <dd className="mt-1.5 text-[11px] leading-tight text-[#f3efe6]/55">{s.label}</dd>
                                </div>
                            ))}
                        </dl>

                        <ul className="mt-6 text-sm text-[#f3efe6]/75">
                            {email && <li><a href={`mailto:${email}`} className={sideLink}><span className="text-[#f3efe6]/40">Email</span>{email}</a></li>}
                            <li><a href={resume.links.linkedin} target="_blank" rel="noopener noreferrer" className={sideLink}><span className="text-[#f3efe6]/40">LinkedIn</span>{handle(resume.links.linkedin).replace(/-[0-9a-f]{6,}$/, '')} ↗</a></li>
                            <li><a href={resume.links.github} target="_blank" rel="noopener noreferrer" className={sideLink}><span className="text-[#f3efe6]/40">GitHub</span>{handle(resume.links.github)} ↗</a></li>
                            <li className={sideLink}><span className="text-[#f3efe6]/40">Based in</span>{resume.location}</li>
                        </ul>

                        <div className="mt-6 flex gap-2 print:hidden">
                            <a href={`${base}/${resume.resumeFile}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-3 text-sm font-semibold bg-[#c8361f] text-white hover:bg-[#e0452c] transition-colors">
                                Download PDF
                            </a>
                            <a href={`${base}/${resume.resumeDocx}`} download className="px-4 py-3 text-sm font-semibold border border-white/25 hover:border-white/60 transition-colors">
                                .docx
                            </a>
                        </div>

                        <button type="button" onClick={() => setView('anime')} className="group mt-8 lg:mt-auto lg:pt-8 flex items-center gap-3 text-left text-sm text-[#f3efe6]/60 hover:text-white transition-colors print:hidden">
                            <span className="shrink-0 whitespace-nowrap font-black text-lg text-[#c8361f] -rotate-12 group-hover:scale-125 transition-transform" aria-hidden>ドン!</span>
                            <span>Anime fan? <span className="underline underline-offset-4 decoration-white/30 group-hover:decoration-white">Switch to the anime version</span> →</span>
                        </button>
                    </div>
                </header>

                <main className="px-5 sm:px-12 xl:px-20 py-14 sm:py-20 max-w-[920px] ">
                    <section className="reveal">
                        <Label>Profile</Label>
                        <p className="font-[family-name:var(--font-serif)] text-2xl sm:text-[2rem] leading-snug">
                            {resume.tagline}
                        </p>
                        <div className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-4 text-[15px] leading-relaxed text-[#1b1a17]/75">
                            {resume.about.slice(1).map((p) => <p key={p}>{p}</p>)}
                        </div>
                    </section>

                    <section className="mt-20">
                        <Heading n="01">Skills</Heading>
                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                            {resume.skills.map((s) => (
                                <div key={s.group} className="reveal">
                                    <h3 className="font-[family-name:var(--font-serif)] text-xl mb-3">{s.group}</h3>
                                    <ul className="flex flex-wrap gap-1.5">
                                        {s.items.map((it) => (
                                            <li key={it} className="text-[13px] px-2.5 py-1 bg-white/60 border border-[#1b1a17]/15 hover:border-[#c8361f] hover:text-[#c8361f] transition-colors">{it}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-20">
                        <Heading n="02" aside={`${firstYear} – now`}>Experience</Heading>
                        {resume.experience.map((job, i) => {
                            const study = gapStudy(job, resume.experience[i + 1])
                            return (
                                <div key={job.company + job.start}>
                                    <Job job={job} current={i === 0 && job.end === 'Present'} />
                                    {study && <Study e={study} />}
                                </div>
                            )
                        })}
                    </section>

                    <section className="mt-20">
                        <Heading n="03">Side projects</Heading>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {projects.map((p) => (
                                <a
                                    key={p.name}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="reveal group relative overflow-hidden flex flex-col bg-white/60 border border-[#1b1a17]/10 border-t-4 border-t-[#1b1a17] p-6 hover:border-t-[#c8361f] hover:-translate-y-1 hover:shadow-[6px_6px_0_#1b1a17] transition-all break-inside-avoid"
                                >
                                    <div className="relative flex items-start justify-between gap-3">
                                        <h3 className="font-[family-name:var(--font-serif)] text-2xl">{p.name}</h3>
                                        <span className="font-[family-name:var(--font-serif)] text-3xl leading-none text-[#1b1a17]/25 group-hover:text-[#c8361f] transition-colors">{p.year}</span>
                                    </div>
                                    <p className="relative font-mono text-[11px] uppercase tracking-wider text-[#1b1a17]/50 mt-1">{p.kind}</p>
                                    <p className="relative mt-3 text-[15px] leading-relaxed text-[#1b1a17]/80 flex-1">{p.description}</p>
                                    <span className="relative mt-4 text-sm font-medium text-[#c8361f]">{p.linkLabel} <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
                                </a>
                            ))}
                        </div>
                    </section>


                    <div className="mt-20 grid sm:grid-cols-2 gap-x-10 gap-y-12">
                        <section className="reveal">
                            <Heading n="04">Education</Heading>
                            <ul className="space-y-4 text-[15px] -mt-2">
                                {resume.education.map((e) => (
                                    <li key={e.degree}>
                                        <p className="font-semibold">{e.degree}</p>
                                        <p className="text-[#1b1a17]/60">{e.school} · {e.period}{e.note && ` · ${e.note}`}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section className="reveal">
                            <Heading n="05">Certified</Heading>
                            <ul className="space-y-3 text-[15px] -mt-2">
                                {resume.certifications.map((c) => <li key={c} className="flex gap-2 font-semibold"><span className="text-[#c8361f]">✓</span>{c}</li>)}
                            </ul>
                        </section>
                    </div>

                    <footer className="mt-20 pt-6 border-t border-[#1b1a17]/15 text-sm text-[#1b1a17]/50 print:hidden">
                        I built this site myself with Next.js.
                    </footer>
                </main>

            </div>
        </div>
    )
}
