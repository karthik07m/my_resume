'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Experience from '@/components/sections/Experience'
import Work from '@/components/sections/Work'
import Contact from '@/components/sections/Contact'
import Navigation from '@/components/ui/Navigation'
import { Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('hero')

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['hero', 'about', 'experience', 'work', 'contact']

          // Find the section that is currently most visible
          for (const section of sections) {
            const element = document.getElementById(section)
            if (element) {
              const rect = element.getBoundingClientRect()
              // If the top of the section is within the viewport (with some buffer)
              if (rect.top >= -window.innerHeight / 2 && rect.top < window.innerHeight / 2) {
                setActiveSection(section as string)
                break
              }
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="relative w-full min-h-screen bg-black text-white selection:bg-red-500 selection:text-white overflow-x-hidden">
      {/* Background Stars (Kept for ambiance, but no models) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Scrollable Content */}
      <div className="relative z-10">
        <div id="hero">
          <Hero />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="experience">
          <Experience />
        </div>
        <div id="work">
          <Work />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </div>
    </main>
  );
}
