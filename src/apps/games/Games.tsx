'use client'

import { useEffect } from 'react'
import { useProductivityStore } from '@/core/productivity/productivityEngine'

export default function Games({ windowId }: { windowId: string }) {
  const { recordGame } = useProductivityStore()

  useEffect(() => {
    // Record that the user is playing a game to increase uselessness score
    recordGame()
  }, [recordGame])

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      <iframe
        src="https://poki.com/"
        className="w-full h-full border-none absolute inset-0"
        title="Poki Games"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}
