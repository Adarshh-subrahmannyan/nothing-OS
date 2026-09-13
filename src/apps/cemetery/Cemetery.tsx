'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DownloadCloud, Loader2 } from 'lucide-react'

type Project = {
  id: string
  name: string
  description: string
  lastActivity: string
  daysAgo: number
  commits: number
  cause: string
  language: string
  aiRoast?: string
}

const DEMO_PROJECTS: Project[] = [
  {
    id: '1', name: 'AI Chatbot', description: 'Totally going to change the world.',
    lastActivity: '847 days ago', daysAgo: 847, commits: 3,
    cause: 'Started another project.',
    language: 'Python',
  },
  {
    id: '2', name: 'my-portfolio-v7', description: 'This one will actually be finished.',
    lastActivity: '412 days ago', daysAgo: 412, commits: 12,
    cause: 'Got distracted redesigning it.',
    language: 'TypeScript',
  },
  {
    id: '3', name: 'blockchain-todo', description: 'Decentralized task management for the modern procrastinator.',
    lastActivity: '629 days ago', daysAgo: 629, commits: 1,
    cause: 'Realized no one asked for this.',
    language: 'Solidity',
  },
  {
    id: '4', name: 'learn-rust', description: '... actually learning Rust this time.',
    lastActivity: '203 days ago', daysAgo: 203, commits: 0,
    cause: 'The borrow checker looked at me funny.',
    language: 'Rust',
  },
  {
    id: '5', name: 'fitness-tracker', description: 'Track workouts. Built instead of doing workouts.',
    lastActivity: '1,204 days ago', daysAgo: 1204, commits: 7,
    cause: 'Got too tired from coding to exercise.',
    language: 'Swift',
  },
]

export default function Cemetery({ windowId }: { windowId: string }) {
  const [selected, setSelected] = useState<Project | null>(null)
  const [adding, setAdding] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [githubInput, setGithubInput] = useState('')
  const [newProject, setNewProject] = useState({ name: '', cause: '', commits: '' })
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS)
  const [generatingRoast, setGeneratingRoast] = useState(false)

  const fetchGithub = async () => {
    if (!githubInput.trim()) return
    setIsFetching(true)
    try {
      const res = await fetch(`https://api.github.com/users/${githubInput.trim()}/repos?sort=pushed&direction=asc&per_page=50`)
      if (!res.ok) throw new Error('Failed to fetch')
      const repos = await res.json()
      
      const newProjects: Project[] = repos.map((repo: any) => {
        const pushedDate = new Date(repo.pushed_at || repo.created_at)
        const daysAgo = Math.floor((Date.now() - pushedDate.getTime()) / (1000 * 60 * 60 * 24))
        const yearsAgo = Math.floor(daysAgo / 365)
        
        let cause = 'Passed away shortly after birth. Typical.'
        if (yearsAgo >= 5) {
          cause = `Abandoned ${yearsAgo} years ago. You were a different person back then, but equally unproductive.`
        } else if (yearsAgo >= 3) {
          cause = `${yearsAgo} years of neglect. The framework this was built on probably doesn't even exist anymore.`
        } else if (yearsAgo >= 1) {
          cause = `Over a year of silence. You probably don't even remember what this code does, do you?`
        } else if (daysAgo > 100) {
          cause = `You dropped this like a bad habit ${daysAgo} days ago. RIP.`
        } else if (daysAgo > 30) {
          cause = `The classic "I will finish this on the weekend". That was ${daysAgo} days ago.`
        }

        return {
          id: repo.id.toString(),
          name: repo.name,
          description: repo.fork ? 'Forked it, stared at it, abandoned it.' : (repo.description || 'A monument to your lack of follow-through.'),
          lastActivity: `${daysAgo} days ago`,
          daysAgo,
          commits: repo.stargazers_count || 0, // Using stars as fake commits
          cause,
          language: repo.language || 'Unknown'
        }
      })
      
      setProjects(prev => {
        // filter out duplicates
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNew = newProjects.filter(p => !existingIds.has(p.id))
        return [...uniqueNew, ...prev]
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleAdd = () => {
    if (!newProject.name.trim()) return
    const p: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: 'Another dream, laid to rest.',
      lastActivity: 'just now',
      daysAgo: 0,
      commits: parseInt(newProject.commits) || 0,
      cause: newProject.cause || 'Unknown cause of death.',
      language: 'Unknown',
    }
    setProjects(prev => [p, ...prev])
    setNewProject({ name: '', cause: '', commits: '' })
    setAdding(false)
  }

  const handleGenerateRoast = async (project: Project) => {
    if (project.aiRoast || generatingRoast) return
    setGeneratingRoast(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'roast_repo',
          repoName: project.name,
          description: project.description,
          language: project.language
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, aiRoast: data.result } : p))
        if (selected?.id === project.id) {
          setSelected(prev => prev ? { ...prev, aiRoast: data.result } : prev)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingRoast(false)
    }
  }

  return (
    <div className="flex h-full" style={{ background: '#0D0F12' }}>
      {/* List */}
      <div
        className="flex flex-col shrink-0 overflow-y-auto"
        style={{ width: 240, borderRight: '1px solid rgba(42,48,56,0.8)' }}
      >
        {/* Header */}
        <div className="px-4 py-4 shrink-0">
          <div style={{ color: '#6F7782', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 2 }}>
            PROJECT CEMETERY
          </div>
          <div style={{ color: '#A8AFB9', fontSize: 12, marginTop: 4 }}>
            {projects.length} projects at rest
          </div>
        </div>

        {/* Add button */}
        <div className="px-3 pb-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={githubInput}
              onChange={e => setGithubInput(e.target.value)}
              placeholder="GitHub username..."
              className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: 'rgba(23,26,31,0.8)',
                border: '1px solid rgba(42,48,56,0.8)',
                color: '#A8AFB9'
              }}
              onKeyDown={e => e.key === 'Enter' && fetchGithub()}
            />
            <button
              onClick={fetchGithub}
              disabled={isFetching || !githubInput.trim()}
              className="px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{
                border: '1px solid rgba(42,48,56,0.8)',
                color: '#A8AFB9',
                background: 'rgba(255,255,255,0.02)'
              }}
              title="Import Repositories"
            >
              {isFetching ? <Loader2 size={14} className="animate-spin" /> : <DownloadCloud size={14} />}
            </button>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="w-full py-2 rounded-lg text-xs font-medium"
            style={{
              border: '1px dashed rgba(42,48,56,0.8)',
              color: '#6F7782',
            }}
          >
            + Add your fallen project
          </button>
        </div>

        {/* Projects */}
        <div className="flex flex-col">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/3"
              style={{
                borderBottom: '1px solid rgba(42,48,56,0.5)',
                background: selected?.id === p.id ? 'rgba(255,255,255,0.04)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 16 }}>🪦</span>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ color: '#A8AFB9', fontSize: 12, fontWeight: 500 }}>{p.name}</div>
                <div style={{ color: '#6F7782', fontSize: 10, marginTop: 1 }}>{p.lastActivity}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail / Add */}
      <div className="flex-1 overflow-y-auto">
        {adding ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex flex-col gap-4">
            <div style={{ color: '#A8AFB9', fontSize: 14, fontWeight: 600 }}>🪦 Bury a Project</div>
            {[
              { key: 'name', label: 'Project Name', placeholder: 'my-great-idea' },
              { key: 'cause', label: 'Cause of Death', placeholder: 'Started another project.' },
              { key: 'commits', label: 'Commits (approx)', placeholder: '3' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ color: '#6F7782', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{field.label.toUpperCase()}:</label>
                <input
                  value={newProject[field.key as keyof typeof newProject]}
                  onChange={e => setNewProject(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(23,26,31,0.8)', border: '1px solid rgba(42,48,56,0.8)', color: '#A8AFB9' }}
                  aria-label={field.label}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#A371F7', color: '#fff' }}>
                Lay to Rest
              </button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#6F7782', border: '1px solid rgba(42,48,56,0.8)' }}>
                Cancel
              </button>
            </div>
          </motion.div>
        ) : selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex flex-col items-center justify-center min-h-full">
            <div 
              className="relative flex flex-col items-center justify-start p-8 shadow-2xl"
              style={{
                width: 320,
                minHeight: 440,
                background: 'linear-gradient(180deg, #5C626A 0%, #3B3E43 100%)',
                borderRadius: '160px 160px 12px 12px',
                borderTop: '2px solid rgba(255,255,255,0.1)',
                borderLeft: '2px solid rgba(255,255,255,0.05)',
                borderRight: '2px solid rgba(0,0,0,0.4)',
                borderBottom: '8px solid #2A2D31',
                boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.2), 0 20px 50px rgba(0,0,0,0.5)',
                fontFamily: 'serif'
              }}
            >
              {/* R.I.P Header */}
              <div 
                style={{ 
                  fontSize: 36, 
                  fontWeight: 900,
                  color: '#2A2C30',
                  textShadow: '1px 1px 0px rgba(255,255,255,0.1), -1px -1px 0px rgba(0,0,0,0.5)',
                  marginTop: 24,
                  letterSpacing: 4
                }}
              >
                R. I. P.
              </div>

              {/* Name */}
              <h2 
                className="mt-8 text-center leading-tight"
                style={{ 
                  color: '#2A2C30',
                  fontSize: 26, 
                  fontWeight: 800,
                  textShadow: '1px 1px 0px rgba(255,255,255,0.1), -1px -1px 0px rgba(0,0,0,0.5)',
                  wordBreak: 'break-word'
                }}
              >
                {selected.name.toUpperCase()}
              </h2>

              {/* Description */}
              <p 
                className="text-center mt-4 px-4 line-clamp-3"
                style={{ 
                  color: '#36393E', 
                  fontSize: 13, 
                  fontStyle: 'italic',
                  textShadow: '1px 1px 0px rgba(255,255,255,0.05), -1px -1px 0px rgba(0,0,0,0.3)',
                }}
              >
                {selected.description}
              </p>

              <div className="w-3/4 h-px bg-black/40 my-6 shadow-[0_1px_0_rgba(255,255,255,0.1)]" />

              {/* Cause of Death */}
              <div className="text-center px-4 w-full flex-1 flex flex-col justify-center">
                <div 
                  style={{ 
                    fontSize: 11, 
                    fontWeight: 'bold', 
                    letterSpacing: 2, 
                    color: '#2A2C30',
                    textShadow: '1px 1px 0px rgba(255,255,255,0.05), -1px -1px 0px rgba(0,0,0,0.3)',
                  }}
                >
                  CAUSE OF DEATH
                </div>
                <div 
                  className="mt-3"
                  style={{
                    color: '#1A1C1E',
                    fontSize: 15,
                    fontWeight: 700,
                    textShadow: '1px 1px 0px rgba(255,255,255,0.05), -1px -1px 0px rgba(0,0,0,0.3)',
                    lineHeight: 1.4
                  }}
                >
                  "{selected.cause}"
                </div>
                {selected.aiRoast ? (
                  <div 
                    className="mt-4 p-3 rounded-lg"
                    style={{
                      background: 'rgba(0,0,0,0.1)',
                      border: '1px dashed rgba(255,255,255,0.2)',
                      color: '#000',
                      fontSize: 13,
                      fontStyle: 'italic',
                      textShadow: '1px 1px 0px rgba(255,255,255,0.1)',
                    }}
                  >
                    <span className="font-bold block mb-1" style={{ fontSize: 10, color: '#2A2C30' }}>AI'S REAL CAUSE OF DEATH:</span>
                    {selected.aiRoast}
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateRoast(selected)}
                    disabled={generatingRoast}
                    className="mt-4 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-black/10 disabled:opacity-50 mx-auto"
                    style={{
                      border: '1px solid rgba(0,0,0,0.2)',
                      color: '#2A2C30',
                      textShadow: '1px 1px 0px rgba(255,255,255,0.1)',
                    }}
                  >
                    {generatingRoast ? <Loader2 size={12} className="animate-spin inline mr-1" /> : '🤖 '}
                    {generatingRoast ? 'Communing with the dead...' : 'Real Cause'}
                  </button>
                )}
              </div>

              {/* Footer text */}
              <div 
                className="mt-6"
                style={{ 
                  fontSize: 10,
                  color: '#2A2C30',
                  textShadow: '1px 1px 0px rgba(255,255,255,0.05), -1px -1px 0px rgba(0,0,0,0.3)',
                  fontWeight: 600
                }}
              >
                Last active: {selected.lastActivity}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: '#6F7782' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🪦</div>
            <div style={{ fontSize: 13 }}>Select a project to pay your respects.</div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: '#6F7782', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ color: '#A8AFB9', fontSize: 12 }}>{value}</span>
    </div>
  )
}
