'use client'

import { motion } from 'framer-motion'

import { useSettingsStore } from '@/core/settings/settingsStore'
import { useFilesystemStore } from '@/core/filesystem/filesystemStore'

export default function Wallpaper() {
  const { settings } = useSettingsStore()
  const wp = settings.wallpaper

  // Custom image check
  const customNode = useFilesystemStore(state => state.nodes[wp])
  const isCustomImage = customNode?.content?.startsWith('data:image/')

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, backgroundColor: 'var(--color-os-bg)' }}
    >
      {/* Custom Image Wallpaper */}
      {isCustomImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${customNode.content})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6
          }}
        />
      )}

      {/* Confucius Meme Wallpaper */}
      {(!isCustomImage && wp === 'confucius') && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(/default-wallpaper.jpeg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1
          }}
        />
      )}

      {/* Abstract: Animated Mesh Gradient Orbs */}
      {(!isCustomImage && wp === 'abstract') && (
        <>
          <motion.div
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
            style={{
              background: 'radial-gradient(circle, #A371F7, transparent 70%)',
              animation: 'mesh-blob-1 20s infinite alternate ease-in-out',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[80px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #58A6FF, transparent 70%)',
              animation: 'mesh-blob-2 25s infinite alternate ease-in-out',
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full mix-blend-screen filter blur-[90px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #F5A623, transparent 70%)',
              animation: 'mesh-blob-3 22s infinite alternate ease-in-out',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </>
      )}

      {/* Grid Pattern */}
      {(!isCustomImage && wp === 'grid') && (
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center'
          }}
        />
      )}

      {/* Subtle Noise / Grid Texture */}
      {(!isCustomImage && wp !== 'grid') && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* SLOTH OS branding watermark */}
      <div
        className="absolute bottom-16 right-8 text-right select-none"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.05)', letterSpacing: 8, textShadow: '0 0 30px rgba(163,113,247,0.2)' }}>
          SLOTH OS
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4, letterSpacing: 2 }}>
          PRODUCTIVITY: 2%  |  USELESSNESS: 98%
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)', marginTop: 2, letterSpacing: 4 }}>
          SYSTEM READY
        </div>
      </div>
    </div>
  )
}
