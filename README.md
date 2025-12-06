# Apple-Style Resume Website

A premium, interactive resume website built with Next.js, Tailwind CSS, Three.js, and Framer Motion.

## Features

- **Smooth Scrolling**: Powered by Lenis for a buttery-smooth experience.
- **3D Interactions**: Interactive 3D hero section using React Three Fiber.
- **Premium Animations**: Scroll-triggered reveals and transitions with Framer Motion.
- **Responsive Design**: Fully responsive layout for all devices.
- **Dark Mode Support**: System-aware dark mode.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **3D**: Three.js, @react-three/fiber, @react-three/drei
- **Animation**: Framer Motion, GSAP
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Customization

- **Content**: Edit the components in `src/components/sections/`.
- **3D Model**: Update `src/components/canvas/HeroModel.tsx`.
- **Colors**: Modify `src/app/globals.css`.

## Deployment

The project is ready to be deployed on Vercel.

```bash
npm run build
```
