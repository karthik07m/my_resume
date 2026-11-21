'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { clsx } from 'clsx'
import resume from '@/data/resume.json'
import { sfx } from '@/lib/sfx'
import { makeRand } from './BossFight'
import { ChakraSeal } from './HiddenLeafScene'

const paused = (live: boolean) => !live && '[animation-play-state:paused]'

const BLADE = 'M 50 41 C 60 20 80 16 92 26 C 76 26 66 38 59 52 C 56 47 53 43 50 41 Z'
const TOMOE = 'M 6.5 0 A 6.5 6.5 0 1 1 -6.5 0 A 6.5 6.5 0 1 1 6.5 0 Z M 0 -6.5 Q -16 -9 -21.2 12.7 Q -13 3 -6.1 2.2 Z'
export function SharinganEye({ live, awake, glow = true }: { live: boolean; awake: boolean; glow?: boolean }) {
    return (
        <span className={clsx('relative block w-full h-full rounded-full', glow && 'shadow-[0_0_30px_rgba(239,68,68,0.65)]')} style={{ background: 'radial-gradient(circle, #ef4444 0%, #dc2626 45%, #991b1b 78%, #450a0a 92%, #0a0a0a 93%)' }}>
            <svg viewBox="0 0 100 100" className={clsx('absolute inset-0 w-full h-full', awake ? 'animate-[spin_14s_linear_infinite]' : 'animate-[spin_7s_linear_infinite]', paused(live))} aria-hidden>
                {awake ? (
                    [0, 120, 240].map((deg) => <path key={deg} d={BLADE} transform={`rotate(${deg} 50 50)`} fill="#0a0a0a" />)
                ) : (
                    <>
                        <circle cx="50" cy="50" r="24" fill="none" stroke="#450a0a" strokeWidth="1.6" />
                        {[0, 120, 240].map((deg) => <path key={deg} d={TOMOE} transform={`rotate(${deg} 50 50) translate(50 26)`} fill="#0a0a0a" />)}
                    </>
                )}
            </svg>
            <span className="absolute inset-[42%] rounded-full bg-[#0a0a0a]" />
            <span className="absolute left-[24%] top-[18%] w-[20%] h-[12%] rounded-full bg-white/25 blur-[2px]" />
        </span>
    )
}
type SkillContext = { text: string; project?: string }
const CONTEXT: Record<string, SkillContext> = {
    'Appian AI': { text: 'Document classification and extraction for USAC compliance forms, plus AI-assisted expression-rule testing.' },
    'Process Models': { text: 'Conditional risk-assessment paths for HSBC and parallel approval workflows for IQVIA.' },
    'SAIL Interfaces': { text: 'Interfaces for federal compliance workflows, with performance tuning and shared design standards.' },
    'Expression Rules': { text: 'Date and time conflict checks, reusable business logic, and test cases for critical rules.' },
    'Record Types': { text: 'Record data for Appian applications across federal compliance workflows.' },
    'CDTs': { text: 'Reusable Appian data structures and review standards for consistent application design.' },
    'Connected Systems': { text: 'Reusable REST integrations against USAC’s internal validation APIs.' },
    'REST / SOAP Integrations': { text: 'Appian Connected Systems integrations and Java REST/SOAP web services.' },
    'Decision Rules': { text: 'Part of my Appian toolkit for application business logic.' },
    'Security (Groups / RBAC)': { text: 'Role-based admin interfaces and security-role review practices.' },
    'Versions 18 through 26': { text: 'Appian 18–20 at Hexaware, 20–21 at Yexle, and 23–26 at iLabs.' },
    'MySQL': { text: 'Multi-table validation, stored procedures, and performance tuning for USAC and HSBC workflows.' },
    'Stored Procedures': { text: 'Validation, retrieval and inserts in MySQL, plus the audit trail in SQL Server.' },
    'Triggers': { text: 'SQL Server triggers for the IQVIA audit-log platform.' },
    'Index Optimization': { text: 'Index optimization and fewer redundant expression-rule calls helped cut HSBC onboarding query time by about 25%.' },
    'SQL Server': { text: 'Stored procedures and triggers for the IQVIA scheduling and audit platform.' },
    'Supabase': { text: 'Backend and vector search for the Appian interview-practice site.', project: 'Appian Verse' },
    'NoSQL (basic)': { text: 'Basic NoSQL. Most of my database work is in MySQL and SQL Server.' },
    'React': { text: 'Front end for the Appian interview-practice site.', project: 'Appian Verse' },
    'Java': { text: 'Web applications, REST/SOAP services, and JUnit tests at Hebeon.' },
    'JavaScript': { text: 'Used with Electron for the cross-platform focus tracker.', project: 'Dotkin' },
    'Dart / Flutter': { text: 'Mobile apps including Visa Sage and the private expense tracker Coinly.', project: 'Visa Sage' },
    'AWS': { text: 'Part of the technology stack for my current USAC platform work.' },
    'Firebase': { text: 'Authentication and live updates for the visa-guide app.', project: 'Visa Sage' },
    'Vercel': { text: 'Hosting for the Appian interview-practice site.', project: 'Appian Verse' },
    'Cloudflare': { text: 'Domain and security services for the Appian interview-practice site.', project: 'Appian Verse' },
    'Git': { text: 'Version control in my application-development toolkit.' },
    'JIRA': { text: 'Used alongside sprint stories, acceptance criteria, and delivery planning.' },
    'Claude AI': { text: 'The Claude API powers personalized focus coaching and briefings.', project: 'Dotkin' },
    'Codex AI': { text: 'AI assistance in my development toolkit.' },
}

function RasenganOrb() {
    return (
        <span className="relative block w-full h-full rounded-full shadow-[0_0_18px_rgba(56,189,248,0.8)]" style={{ background: 'radial-gradient(circle at 38% 32%, #fff 0%, #e0f2fe 16%, #38bdf8 46%, #1d4ed8 78%, #1e3a8a 100%)' }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_1.6s_linear_infinite]" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => (
                    <path key={i} d="M 50 13 Q 80 14 84 46" transform={`rotate(${i * 45} 50 50)`} fill="none" stroke="#fff" strokeOpacity={i % 2 ? 0.5 : 0.85} strokeWidth={i % 2 ? 3 : 5} strokeLinecap="round" />
                ))}
            </svg>
            <span className="absolute inset-[36%] rounded-full bg-white blur-[2px]" />
        </span>
    )
}

const BOLTS = [0, 1].map((set) => {
    const rand = makeRand(set * 53 + 9)
    return Array.from({ length: 9 }, (_, b) => {
        const a = ((b + set * 0.5) / 9) * Math.PI * 2
        let r = 10, d = `M ${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`
        while (r < 44) {
            r += 6 + rand() * 7
            const wob = a + (rand() - 0.5) * 0.5
            d += ` L ${(50 + Math.cos(wob) * r).toFixed(1)} ${(50 + Math.sin(wob) * r).toFixed(1)}`
        }
        return d
    })
})
function ChidoriOrb() {
    return (
        <span className="relative block w-full h-full rounded-full shadow-[0_0_18px_rgba(147,197,253,0.7)]" style={{ background: 'radial-gradient(circle, #fff 0%, #dbeafe 14%, #60a5fa 32%, #1e3a8a 62%, #0b1026 100%)' }}>
            {BOLTS.map((set, s) => (
                <svg key={s} viewBox="0 0 100 100" className={clsx('absolute inset-0 w-full h-full overflow-visible', s > 0 && 'animate-[ki-bolt_0.5s_steps(1)_infinite]')} aria-hidden>
                    {set.map((d, b) => <path key={d} d={d} fill="none" stroke={b % 2 ? '#fff' : '#bfdbfe'} strokeWidth={b % 3 ? 3 : 5} strokeLinejoin="round" strokeLinecap="round" />)}
                </svg>
            ))}
        </span>
    )
}

// One jutsu per skill group: [kanji, name]. The emblem is the tab's icon and what flies across the panel when it is cast.
const JUTSU = [['螺旋丸', 'Rasengan'], ['千鳥', 'Chidori'], ['写輪眼', 'Sharingan'], ['口寄せ', 'Summoning']]
function Emblem({ index }: { index: number }) {
    if (index === 0) return <RasenganOrb />
    if (index === 1) return <ChidoriOrb />
    if (index === 2) return <SharinganEye live awake={false} glow={false} />
    return <span className="block w-full h-full text-orange-400 animate-[spin_9s_linear_infinite]"><ChakraSeal /></span>
}

// A puff of smoke: shadow clones, summonings and substitutions all arrive in one.
export function Poof() {
    return <span className="poof" aria-hidden>{[0, 60, 120, 180, 240, 300].map(a => <i key={a} style={{ '--a': `${a}deg` } as React.CSSProperties} />)}</span>
}

// Plays once each time a skill group is opened: the group's jutsu goes off across the panel and its kanji stays behind.
function Cast({ index }: { index: number }) {
    return (
        <div className="jutsu-cast" data-jutsu={index} aria-hidden>
            <span className="jutsu-kanji">{JUTSU[index][0]}<small>{JUTSU[index][1]}</small></span>
            <span className="jutsu-proj"><Emblem index={index} /></span>
            {index === 1 && <svg className="jutsu-bolts" viewBox="0 0 100 40" preserveAspectRatio="none">
                {['M0 12 L14 18 L22 8 L38 20 L52 11 L66 24 L80 14 L100 20', 'M0 26 L12 20 L26 30 L40 22 L58 32 L72 21 L88 29 L100 24', 'M0 19 L18 14 L30 24 L46 15 L60 22 L78 12 L100 16'].map((d, i) => <path key={d} d={d} fill="none" stroke={i === 1 ? '#fff' : '#93c5fd'} strokeWidth={i === 1 ? 1.5 : 2.5} vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * 0.08}s` }} />)}
            </svg>}
            {index === 3 && <Poof />}
        </div>
    )
}

export default function JutsuCards() {
    const reducedMotion = useReducedMotion()
    const [activeGroup, setActiveGroup] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [copyStatus, setCopyStatus] = useState('')
    const group = resume.skills[activeGroup]
    const context = selected ? CONTEXT[selected] : null
    const projectIndex = context?.project ? resume.projects.findIndex(project => project.name === context.project) : -1
    const copySkills = async () => {
        try {
            await navigator.clipboard.writeText(resume.skills.map(group => `${group.group}: ${group.items.join(', ')}`).join('\n'))
            setCopyStatus('Copied')
        } catch { setCopyStatus('Select the text to copy it') }
    }
    return (
        <div className="skills-section">
            <div className="skills-heading flex flex-wrap justify-between items-end gap-3 mb-4">
                <div><p className="section-kicker">FIELD NOTES · NINJA TOOLKIT</p><h3 className="mt-1 text-xl font-bold text-white">Skills & expertise</h3></div>
                <div className="flex items-center gap-2"><span role="status" className="text-xs text-red-300">{copyStatus}</span><button type="button" onClick={copySkills} className="skills-copy">Copy skills</button></div>
            </div>
            <div role="group" aria-label="Filter skills by category" className="skill-filters flex flex-wrap gap-2 mb-3">
                {resume.skills.map((item, index) => <button
                    type="button" key={item.group} aria-pressed={activeGroup === index}
                    onClick={() => { setActiveGroup(index); setSelected(null); sfx.whoosh() }}
                    className={clsx('skill-filter', activeGroup === index && 'is-active')}
                ><span className="jutsu-emblem"><Emblem index={index} /></span>{item.group}</button>)}
            </div>
            <AnimatePresence mode="wait" initial={false}>
                <motion.article key={group.group} className="skill-group p-4 sm:p-5"
                    initial={reducedMotion ? false : {opacity:0, y:6}}
                    animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}}
                    transition={{duration:reducedMotion ? 0 : .16}}
                >
                    <Cast index={activeGroup} />
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3"><span className="h-px w-5 bg-red-500/80" />{group.group}</div>
                    <div className="flex flex-wrap gap-2">
                        {group.items.map(skill => <button
                            type="button" key={skill} aria-pressed={selected === skill}
                            onClick={() => setSelected(selected === skill ? null : skill)}
                            className={clsx('skill-chip', selected === skill && 'is-selected')}
                        >{skill}</button>)}
                    </div>
                    <AnimatePresence initial={false}>
                        {selected && context && <motion.div
                            key={selected} role="region" aria-label={`${selected} experience`}
                            initial={reducedMotion ? false : {height:0,opacity:0}}
                            animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                            transition={{duration:reducedMotion ? 0 : .18}} className="overflow-hidden"
                        ><div className="skill-context mt-4 pt-3 border-t">
                            <p className="skill-context-label">{context.project ? `PROJECT NOTE · ${context.project}` : 'FIELD NOTE · EXPERIENCE'}</p>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-300">{context.text}</p>
                            <a href={projectIndex >= 0 ? `#project-${projectIndex}` : '#experience'} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-300 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-red-300 rounded py-1">{projectIndex >= 0 ? `View ${context.project}` : 'View experience'} <span aria-hidden>↗</span></a>
                        </div></motion.div>}
                    </AnimatePresence>
                </motion.article>
            </AnimatePresence>
        </div>
    )
}
