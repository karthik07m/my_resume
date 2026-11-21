'use client'

import { useEffect, useRef } from 'react'
import { setView, shouldAsk } from '@/lib/view'

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

// Warm the anime site's chunk while the visitor is reaching for it, so it opens without a wait.
const prefetch = () => { void import('@/components/AnimeSite') }

// Asked on every new visit (the answer lasts for the tab), over the plain résumé: two manga panels, one per version.
// Esc, the backdrop or "professional" all keep the plain résumé and remember the answer.
// A native <dialog> gives focus trapping and Esc for free; data-lenis-prevent stops smooth scroll moving the page behind it.
export default function AnimeAsk() {
    const ref = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (shouldAsk()) ref.current?.showModal()
    }, [])

    const choose = (v: 'pro' | 'anime') => {
        ref.current?.close()
        setView(v)
    }

    return (
        <dialog
            ref={ref}
            data-lenis-prevent
            aria-labelledby="ask-title"
            onCancel={(e) => { e.preventDefault(); choose('pro') }}
            onClick={(e) => { if (e.target === e.currentTarget) choose('pro') }}
            className="ask m-auto w-[min(640px,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-visible bg-transparent p-0 text-[#1b1a17] backdrop:bg-[#141311]/75 backdrop:backdrop-blur-[3px]"
        >
            <div className="relative bg-[#f3efe6] border-[3px] border-[#141311] shadow-[10px_10px_0_#c8361f] p-5 sm:p-8">
                <p className="font-mono text-xs tracking-[0.3em] text-[#c8361f]">アニメ好き？</p>
                <h2 id="ask-title" className="mt-1 font-[family-name:var(--font-serif)] text-5xl sm:text-6xl leading-none">
                    Anime fan?
                </h2>
                <p className="mt-3 text-[15px] text-[#1b1a17]/70">
                    I made two versions of my résumé. Which one do you want to see?
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Each panel shows a real screenshot of that version (public/previews, taken from the site itself). */}
                    <button
                        type="button"
                        onClick={() => choose('pro')}
                        className="group text-left border-2 border-[#141311] bg-white hover:-translate-y-1 hover:shadow-[5px_5px_0_#141311] transition-all focus-visible:outline-3 focus-visible:outline-[#c8361f]"
                    >
                        <img src={`${base}/previews/pro.jpg`} alt="" width={720} height={394} className="block w-full aspect-[720/394] object-cover object-left-top border-b-2 border-[#141311]" />
                        <div className="p-3 sm:p-4">
                            <p className="font-semibold leading-tight">No, keep it professional</p>
                            <p className="mt-1 text-xs text-[#1b1a17]/55">Just the résumé</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => choose('anime')}
                        onPointerEnter={prefetch}
                        onFocus={prefetch}
                        className="group text-left border-2 border-[#141311] bg-[#141311] text-[#f3efe6] hover:-translate-y-1 hover:shadow-[5px_5px_0_#c8361f] transition-all focus-visible:outline-3 focus-visible:outline-[#c8361f]"
                    >
                        <img src={`${base}/previews/anime.jpg`} alt="" width={720} height={394} className="block w-full aspect-[720/394] object-cover object-left-top border-b-2 border-[#c8361f]" />
                        <div className="p-3 sm:p-4">
                            <p className="font-semibold leading-tight">Yes, show me the anime version!</p>
                            <p className="mt-1 text-xs text-[#f3efe6]/55">Dragon Ball, Naruto, One Piece and a few boss fights</p>
                        </div>
                    </button>
                </div>
            </div>
        </dialog>
    )
}
