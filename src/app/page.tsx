'use client'

import dynamic from 'next/dynamic'
import ProResume from '@/components/pro/ProResume'
import { useView } from '@/lib/view'

// The plain résumé is prerendered and shown by default. The anime site (three.js, sound, games) is its own chunk,
// fetched only for visitors who pick it, so a recruiter's page load never pays for it.
const AnimeSite = dynamic(() => import('@/components/AnimeSite'), { ssr: false })

export default function Home() {
  return useView() === 'anime' ? <AnimeSite /> : <ProResume />
}
