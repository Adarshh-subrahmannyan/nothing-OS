'use client'

import { useState, useRef } from 'react'
import { Palette, Bell, User, Shield, Monitor, Upload } from 'lucide-react'
import { useSettingsStore } from '@/core/settings/settingsStore'
import { useFilesystemStore } from '@/core/filesystem/filesystemStore'
import type { Settings } from '@/types'

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'productivity', label: 'Productivity', icon: Shield },
]

export default function Settings({ windowId }: { windowId: string }) {
  const { settings, updateSettings, resetSettings } = useSettingsStore()
  const { nodes, touch } = useFilesystemStore()
  const [section, setSection] = useState('appearance')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      // Touch creates the node and returns the ID
      const newId = touch('root', file.name, dataUrl)
      updateSettings({ wallpaper: newId })
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Find all images in the virtual filesystem
  const customImageOptions = Object.values(nodes)
    .filter(node => node.type === 'file' && node.content?.startsWith('data:image/'))
    .map(node => ({ value: node.id, label: `Image: ${node.name}` }))

  return (
    <div className="flex h-full" style={{ background: 'var(--color-os-surface)' }}>
      {/* Sidebar */}
      <div
        className="flex flex-col shrink-0 p-3 gap-1"
        style={{ width: 180, borderRight: '1px solid var(--color-os-border)', background: 'var(--color-os-elevated)' }}
      >
        <div style={{ color: 'var(--color-os-text-muted)', fontSize: 10, fontWeight: 600, letterSpacing: 1, padding: '4px 8px', marginBottom: 4 }}>
          SETTINGS
        </div>
        {SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
              style={{
                background: section === s.id ? 'rgba(163,113,247,0.12)' : 'transparent',
                color: section === s.id ? '#A371F7' : 'var(--color-os-text-secondary)',
                border: section === s.id ? '1px solid rgba(163,113,247,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={14} />
              {s.label}
            </button>
          )
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={resetSettings}
          className="text-xs px-3 py-2 rounded hover:bg-white/5 text-left"
          style={{ color: '#F85149' }}
        >
          Reset to Defaults
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {section === 'appearance' && (
          <SettingsSection title="Appearance">
            <SettingRow label="Theme" description="Interface color scheme">
              <Select
                value={settings.theme}
                options={[{ value: 'dark', label: 'Dark' }, { value: 'darker', label: 'Darker' }]}
                onChange={(v) => updateSettings({ theme: v as Settings['theme'] })}
              />
            </SettingRow>
            <SettingRow label="Wallpaper" description="Desktop background style">
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleWallpaperUpload} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs hover:bg-white/5" 
                    style={{ color: 'var(--color-os-text-secondary)', border: '1px solid var(--color-os-border)' }}
                  >
                    <Upload size={12} /> Upload New
                  </button>
                  <Select
                    value={settings.wallpaper}
                    options={[
                      { value: 'minimal', label: 'Minimal Technical' },
                      { value: 'grid', label: 'Grid Pattern' },
                      { value: 'abstract', label: 'Abstract' },
                      { value: 'confucius', label: 'Confucius Meme' },
                      ...customImageOptions,
                      ...( !['minimal', 'grid', 'abstract', 'confucius'].includes(settings.wallpaper) && !customImageOptions.find(o => o.value === settings.wallpaper)
                            ? [{ value: settings.wallpaper, label: 'Unknown Custom Image' }] 
                            : [] )
                    ]}
                    onChange={(v) => updateSettings({ wallpaper: v })}
                  />
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-os-text-muted)' }}>
                  (Upload images via the Files app to see them here)
                </div>
              </div>
            </SettingRow>
            <SettingRow label="Animation Intensity" description="Window and UI animation level">
              <Select
                value={settings.animationIntensity}
                options={[
                  { value: 'none', label: 'None (Reduced Motion)' },
                  { value: 'reduced', label: 'Reduced' },
                  { value: 'full', label: 'Full' },
                ]}
                onChange={(v) => updateSettings({ animationIntensity: v as Settings['animationIntensity'] })}
              />
            </SettingRow>
          </SettingsSection>
        )}

        {section === 'system' && (
          <SettingsSection title="System">
            <SettingRow label="Sound Effects" description="Enable system sound feedback">
              <Toggle value={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
            </SettingRow>
            <SettingRow label="Notifications" description="Show system notifications">
              <Toggle value={settings.notificationsEnabled} onChange={(v) => updateSettings({ notificationsEnabled: v })} />
            </SettingRow>
            <SettingRow label="Demo Mode" description="Preload demo data for exhibitions">
              <Toggle value={settings.demoMode} onChange={(v) => updateSettings({ demoMode: v })} />
            </SettingRow>
          </SettingsSection>
        )}

        {section === 'identity' && (
          <SettingsSection title="Identity">
            <SettingRow label="Username" description="Your system username">
              <input
                value={settings.username}
                onChange={e => updateSettings({ username: e.target.value })}
                className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--color-os-elevated)',
                  border: '1px solid var(--color-os-border)',
                  color: 'var(--color-os-text)',
                  width: 200,
                }}
                placeholder="sloth"
                aria-label="Username"
              />
            </SettingRow>
            <SettingRow label="GitHub Username" description="For Project Cemetery integration">
              <input
                value={settings.githubUsername}
                onChange={e => updateSettings({ githubUsername: e.target.value })}
                className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--color-os-elevated)',
                  border: '1px solid var(--color-os-border)',
                  color: 'var(--color-os-text)',
                  width: 200,
                }}
                placeholder="octocat"
                aria-label="GitHub username"
              />
            </SettingRow>
          </SettingsSection>
        )}

        {section === 'productivity' && (
          <SettingsSection title="Productivity Firewall">
            <SettingRow label="Productivity Firewall" description="Block productive activities">
              <Toggle value={settings.firewallEnabled} onChange={(v) => updateSettings({ firewallEnabled: v })} />
            </SettingRow>
            <SettingRow label="Threat Sensitivity" description="How easily the firewall triggers">
              <Select
                value={settings.firewallSensitivity}
                options={[
                  { value: 'low', label: 'Low (Very lenient)' },
                  { value: 'medium', label: 'Medium (Recommended)' },
                  { value: 'high', label: 'High (No mercy)' },
                ]}
                onChange={(v) => updateSettings({ firewallSensitivity: v as Settings['firewallSensitivity'] })}
              />
            </SettingRow>
            <div className="p-3 rounded-lg mt-4" style={{ background: 'rgba(163,113,247,0.08)', border: '1px solid rgba(163,113,247,0.2)' }}>
              <div style={{ color: '#A371F7', fontSize: 12, fontWeight: 500 }}>Quarantine Threshold</div>
              <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11, marginTop: 4 }}>
                After 5 consecutive productivity attempts, the system enters Quarantine mode.
                This is non-configurable. For your own good.
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ color: 'var(--color-os-text)', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{title}</h2>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-1" style={{ borderBottom: '1px solid rgba(42,48,56,0.6)' }}>
      <div>
        <div style={{ color: 'var(--color-os-text)', fontSize: 13 }}>{label}</div>
        <div style={{ color: 'var(--color-os-text-muted)', fontSize: 11, marginTop: 2 }}>{description}</div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative inline-flex items-center rounded-full transition-colors"
      style={{
        width: 40, height: 22,
        background: value ? '#A371F7' : 'var(--color-os-border)',
      }}
      role="switch"
      aria-checked={value}
    >
      <span
        className="inline-block rounded-full bg-white transition-transform"
        style={{ width: 16, height: 16, transform: value ? 'translateX(21px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

function Select({ value, options, onChange }: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg text-sm outline-none appearance-none"
      style={{
        background: 'var(--color-os-elevated)',
        border: '1px solid var(--color-os-border)',
        color: 'var(--color-os-text)',
        cursor: 'pointer',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#1D2128' }}>{o.label}</option>
      ))}
    </select>
  )
}
