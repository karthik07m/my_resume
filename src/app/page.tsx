'use client'

import { MotionConfig } from 'framer-motion'
import { Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Experience from '@/components/sections/Experience'
import Projects from '@/components/sections/Projects'
import Contact from '@/components/sections/Contact'
import Navigation from '@/components/ui/Navigation'
import QuestLog from '@/components/ui/QuestLog'
import Loader from '@/components/ui/Loader'
import SageMode from '@/components/ui/SageMode'
import Haki from '@/components/ui/Haki'
import SoundToggle from '@/components/ui/SoundToggle'
import CursorTrail from '@/components/effects/CursorTrail'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function Home() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const hasMouse = useMediaQuery('(pointer: fine)')
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 200, damping: 26 }}>
      <main className="relative w-full min-h-screen bg-black text-white selection:bg-red-500 selection:text-white overflow-x-hidden">
        {/* Background Stars */}
        <div className="fixed inset-0 z-0 pointer-events-none sage-shift" aria-hidden>
          <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
            <Stars radius={100} depth={50} count={isDesktop ? 5000 : 1500} factor={4} saturation={0} fade speed={1} />
          </Canvas>
        </div>

        <Loader />
        <Navigation />
        <QuestLog />
        <SageMode />
        <Haki />
        <SoundToggle />
        {hasMouse && <CursorTrail />}

        <div className="relative z-10 sage-shift haki-shake">
          <div id="hero"><Hero /></div>
          <div id="about"><About /></div>
          <div id="experience"><Experience /></div>
          <div id="projects"><Projects /></div>
          <div id="contact"><Contact /></div>
        </div>
      </main>
    </MotionConfig>
  )
}
