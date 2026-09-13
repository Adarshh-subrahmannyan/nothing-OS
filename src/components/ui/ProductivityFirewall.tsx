'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useProductivityStore } from '@/core/productivity/productivityEngine'
import { useWindowStore } from '@/core/windows/windowStore'
import { APP_REGISTRY } from '@/core/apps/appRegistry'
import { MinusCircle, Gamepad2, Bot, Skull, Brain } from 'lucide-react'

export default function ProductivityFirewall() {
  const {
    firewallActive, firewallAppId,
    quarantineActive, consecutiveProductivityAttempts,
    dismissFirewall, dismissQuarantine,
  } = useProductivityStore()
  const { openWindow } = useWindowStore()

  const handleDistraction = (appId: string) => {
    dismissFirewall()
    if (firewallAppId) {
      const { windows, closeWindow } = useWindowStore.getState()
      const win = windows.find(w => w.appId === firewallAppId)
      if (win) closeWindow(win.id)
    }
    const app = APP_REGISTRY[appId]
    if (app) openWindow(appId, app.name)
  }

  const distractions = [
    { icon: <Gamepad2 size={24} strokeWidth={1.5} />, label: 'Play Game', appId: 'games' },
    { icon: <Bot size={24} strokeWidth={1.5} />, label: 'Excuses', appId: 'ai' },
    { icon: <Brain size={24} strokeWidth={1.5} />, label: 'Overthink', appId: 'ai' },
    { icon: <Skull size={24} strokeWidth={1.5} />, label: 'Cemetery', appId: 'cemetery' },
  ]

  const isVisible = firewallActive || quarantineActive

  const quotes = [
    "ഇതൊക്കെ എന്തിനാ?",
    "അത്ര വലിയ ബന്ധങ്ങളിലേക്ക് പോണോ ശിവൻകുട്ടീ… റേഷൻ കട മറന്ന് മണ്ണെണ്ണ വാങ്ങണോ?",
    "എന്തിനാ ഇത്ര serious?",
    "വെറുതെ ഇരുന്നാൽ പോരേ?",
    "പഠിച്ചിട്ട് എന്ത് കിട്ടാനാ?"
  ]
  const quote = quarantineActive ? "ഇത്രയും മതി." : (firewallAppId === 'notepad' ? "എഴുതി വെച്ചിട്ട് എന്ത് കാര്യം?" : quotes[consecutiveProductivityAttempts % 5])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="firewall-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={quarantineActive ? undefined : dismissFirewall}
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <motion.div
            key="firewall-card"
            initial={{ scale: 0.96, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 15, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="flex flex-col items-center text-center"
            style={{
              width: '100%', maxWidth: 540,
              padding: '50px 40px',
              borderRadius: 24,
              background: '#0A0A0C',
              border: '1px solid rgba(255,255,255,0.03)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Top Red Icon */}
            <div 
              className="flex items-center justify-center rounded-full mb-8"
              style={{
                width: 90, height: 90,
                background: 'rgba(239, 68, 68, 0.04)',
              }}
            >
              <MinusCircle size={52} color="#EF4444" strokeWidth={2} />
            </div>

            {/* Titles */}
            <h2 style={{
              color: '#F9FAFB',
              fontSize: 26,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              letterSpacing: '0.08em',
              marginBottom: 16
            }}>
              {quarantineActive ? 'Productivity Quarantine' : 'Productivity Blocked'}
            </h2>

            <p style={{
              color: '#6B7280',
              fontSize: 15,
              fontFamily: 'var(--font-sans)',
              marginBottom: 36
            }}>
              {quarantineActive 
                ? `You have attempted to be productive ${consecutiveProductivityAttempts} times recently.`
                : `This app is too productive for you right now.`}
            </p>

            {/* Separator Line */}
            <div style={{
              width: 32,
              height: 1,
              background: '#374151',
              marginBottom: 36
            }} />

            {/* Quote */}
            <p style={{
              color: '#F3F4F6', // Lighter color for highlight
              fontSize: 18, // Increased size
              fontWeight: 500, // Slightly bolder
              fontFamily: 'var(--font-sans)',
              fontStyle: 'italic',
              marginBottom: 50,
              lineHeight: 1.6,
              textShadow: '0 2px 10px rgba(255,255,255,0.1)'
            }}>
              &ldquo;{quote}&rdquo;
            </p>

            {/* Alternatives Row */}
            {!quarantineActive && (
              <div className="flex items-center justify-center gap-14 w-full">
                {distractions.map(({ icon, label, appId }) => (
                  <button
                    key={label}
                    onClick={() => handleDistraction(appId)}
                    className="flex flex-col items-center gap-4 transition-colors hover:text-white group"
                    style={{
                      color: '#6B7280',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {icon}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {quarantineActive ? (
              <button
                onClick={dismissQuarantine}
                style={{
                  padding: '12px 32px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #374151',
                  color: '#9CA3AF',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover:bg-white/5 hover:text-white mt-10"
              >
                Acknowledge Quarantine
              </button>
            ) : (
              <button
                onClick={dismissFirewall}
                style={{
                  padding: '12px 32px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #374151',
                  color: '#9CA3AF',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 40
                }}
                className="hover:bg-white/5 hover:text-white"
              >
                Accept My Fate
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
