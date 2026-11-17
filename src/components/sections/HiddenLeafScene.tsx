'use client'

import { useId } from 'react'

export function LeafSymbol({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" width="24" height="24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M13 12a1.6 1.6 0 0 1 3.2 0 3.4 3.4 0 0 1-6.8 0 5.2 5.2 0 0 1 10.4 0 7 7 0 0 1-12 4.9" />
            <path d="m7.8 16.9-5.8 3.1 2.2-6.8Z" fill="currentColor" />
        </svg>
    )
}

// Original vector art: a symbolic shinobi avatar, rather than a likeness of the portfolio owner.
export function ShinobiAvatar({ sage }: { sage: boolean }) {
    const id = useId()
    return (
        <svg viewBox="0 0 180 210" className="h-full w-full" role="img" aria-label="Illustrated shinobi avatar wearing a Hidden Leaf headband">
            <defs>
                <linearGradient id={`${id}-sky`} x2="0" y2="1">
                    <stop stopColor={sage ? '#431b0b' : '#101014'} /><stop offset="1" stopColor="#050505" />
                </linearGradient>
            </defs>
            <rect width="180" height="210" rx="6" fill={`url(#${id}-sky)`} />
            <circle cx="91" cy="88" r="64" fill="none" stroke={sage ? '#fbbf24' : '#fb923c'} strokeOpacity=".3" />
            <circle cx="91" cy="88" r="53" fill="none" stroke="#fb923c" strokeOpacity=".15" strokeDasharray="3 7" />
            <path d="M9 210v-25q20-36 62-38h38q39 2 62 38v25" fill="#18181b" stroke="#09090b" strokeWidth="3" />
            <path d="m48 163 24-16 18 14 19-14 23 16-10 47H59Z" fill="#b45309" />
            <path d="M74 126h32v34q-16 18-32 0Z" fill="#bf885e" />
            <path d="M49 77q-9-8-6 14l7 16m81-30q9-8 6 14l-7 16" fill="#d4a477" stroke="#724c35" strokeWidth="2" />
            <path d="M49 65q41-35 82 0v38q-7 39-41 45-34-6-41-45Z" fill="#dbac7d" stroke="#724c35" strokeWidth="2" />
            <path d="m42 64-8-22 21 4 2-22 20 13 12-24 14 24 19-14 3 22 21-3-8 25Z" fill="#121b18" />
            <path d="m44 53 90-2 1 28-91 1Z" fill="#1e2933" stroke="#111c23" strokeWidth="3" />
            <rect x="60" y="54" width="61" height="23" rx="4" fill="#bbc4c1" stroke="#53645c" strokeWidth="2" />
            <circle cx="65" cy="59" r="1.5" fill="#53645c" /><circle cx="116" cy="59" r="1.5" fill="#53645c" />
            <g transform="translate(80 56) scale(.8)" color="#384e42"><LeafSymbol /></g>
            <path d="M57 91q10-7 20 0m26 0q10-7 20 0" fill="none" stroke="#453424" strokeWidth="2.5" strokeLinecap="round" />
            {sage && <g fill="#e9681b"><path d="m53 87 27-3 1 18-28 1Z" /><path d="m100 84 27 3v16l-28-1Z" /></g>}
            <path d="M58 95q10-6 19 0-9 10-19 0m45 0q10-6 19 0-9 10-19 0" fill={sage ? '#fde68a' : '#ede6ce'} stroke="#453424" strokeWidth="1.5" />
            {sage ? <path d="M64 96h8m37 0h8" stroke="#292a1e" strokeWidth="3" /> : <g fill="#384839"><circle cx="68" cy="95" r="3" /><circle cx="113" cy="95" r="3" /></g>}
            <path d="m90 100-3 12h6m-12 14q9 5 18 0" fill="none" stroke="#85543d" strokeWidth="2" strokeLinecap="round" />
            <path d="m43 147 29-7 18 12 19-12 29 7-15 23H58Z" fill="#27272a" stroke="#09090b" strokeWidth="3" />
            <path d="M89 173v37" stroke="#e6b87b" strokeWidth="2" />
            <text x="90" y="197" textAnchor="middle" fontSize="12" letterSpacing="4" fill="#f1cb94" fontFamily="monospace">MK</text>
        </svg>
    )
}

export function ChakraSeal() {
    return (
        <svg viewBox="0 0 300 300" className="chakra-seal" aria-hidden fill="none" stroke="currentColor">
            <circle cx="150" cy="150" r="141" strokeWidth="2" /><circle cx="150" cy="150" r="128" strokeDasharray="3 8" />
            <circle cx="150" cy="150" r="102" strokeWidth="2" /><circle cx="150" cy="150" r="95" />
            {[0, 60, 120, 180, 240, 300].map(angle => <g key={angle} transform={`rotate(${angle} 150 150)`}><path d="M143 17h14m-7 0v32m-9-10 9 10 9-10" strokeWidth="3" /><path d="M146 60h8v16h-8Z" /></g>)}
            <path d="M150 125q36-24 45 13t-31 48q-51 7-61-40t32-66q73-20 96 49" strokeWidth="4" strokeLinecap="round" />
        </svg>
    )
}

export default function HiddenLeafScene({ sage }: { sage: boolean }) {
    return (
        <div className="leaf-environment" aria-hidden>
            <div className="leaf-ink-texture" />
            <svg viewBox="0 0 1200 440" preserveAspectRatio="xMidYMax slice" className="leaf-village" fill="currentColor">
                <path d="M0 170 60 142 130 154 187 108 231 128 279 58 354 92 418 38 471 70 518 45 587 91 650 41 729 85 792 58 856 117 918 96 982 136 1088 122 1200 176V440H0Z" opacity=".2" />
                <path d="M0 269h70v-40h25v-26h21v26h36v40h75v-48h59v-26h46v26h47v60h54v-40h60v-64h38v-19h58v19h38v64h62v-34h72v-62h57v-36h19v36h45v62h44v35h45v-55h73v-22h44v22h45v58h83v-38h32v-23h28v23h42v38h49V440H0Z" opacity=".45" />
                <path d="m61 229 46-32 54 32Zm162-8 86-41 75 41Zm253-44 70-32 77 32Zm243 48 65-28 64 28Zm209-2 66-36 70 36Z" />
                <path d="M0 355q80-22 148 0t132-6 152 12 142-2 132 1 172-7 159 3 163-1V440H0Z" opacity=".65" />
                {[18, 93, 1070, 1148].map((x,i) => <g key={x} transform={`translate(${x} ${i%2 ? 15 : 0})`}><path d="m0 175-33 62h18l-25 51h23l-31 53h41v99h14v-99h41l-31-53h23l-25-51h18Z" opacity=".8" /></g>)}
            </svg>
            <div className={`leaf-natural-energy ${sage ? 'is-active' : ''}`}>
                {Array.from({length: 12}, (_,i) => <span key={i} style={{left: `${6+i*8}%`, animationDelay: `${i*.65}s`, animationDuration: `${6+i%4}s`}} />)}
            </div>
        </div>
    )
}
