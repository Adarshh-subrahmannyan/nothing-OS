'use client'

import { useState, useEffect } from 'react'
import BootScreen from '@/shell/boot/BootScreen'
import Desktop from '@/shell/desktop/Desktop'

export default function Home() {
  const [booted, setBooted] = useState(false)

  return (
    <div className="w-full h-full" style={{ background: 'var(--color-os-bg)' }}>
      {!booted ? (
        <BootScreen onComplete={() => setBooted(true)} />
      ) : (
        <Desktop />
      )}
    </div>
  )
}
