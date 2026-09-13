# Sloth OS --- Technology Stack

**Version:** 0.1.0\
**Project:** Sloth OS\
**Classification:** Web-oriented operating environment\
**Primary Platform:** Desktop Web Browser\
**Development Model:** Two-person team

------------------------------------------------------------------------

# 1. Technology Philosophy

Sloth OS is intentionally built as a **web application that behaves like
an operating environment**.

The stack should prioritize:

-   Fast development
-   Strong component architecture
-   Type safety
-   Easy collaboration
-   Local persistence
-   Smooth desktop interactions
-   Modular applications
-   Secure AI integration
-   Easy deployment

The project should avoid unnecessary technologies.

The engineering complexity should come from the **OS-like architecture
built on top of the stack**, not from accumulating frameworks.

------------------------------------------------------------------------

# 2. Final Stack

``` text
Frontend
├── Next.js
├── React
├── TypeScript
├── Tailwind CSS
├── Framer Motion
└── Lucide React

State
└── Zustand

OS Core
├── Event Bus
├── Window Manager
├── Application Manager
├── Virtual Filesystem
├── Process Manager
├── Permission Manager
├── Productivity Engine
├── Productivity Firewall
└── Notification Manager

Persistence
└── IndexedDB

Backend
└── Next.js Route Handlers

AI
└── LLM API

External Integration
└── GitHub REST API

Optional Cloud
├── Supabase
└── PostgreSQL

Testing
├── Vitest
└── Playwright

Deployment
└── Vercel / equivalent
```

------------------------------------------------------------------------

# 3. Core Framework --- Next.js

## Choice

**Next.js**

Next.js is the primary application framework.

It provides:

-   React application structure
-   Routing
-   Server-side capabilities
-   API routes / Route Handlers
-   Build tooling
-   Production optimization
-   Easy deployment

## Why Next.js?

Sloth OS is fundamentally a browser application.

The project does not require:

-   Native desktop APIs
-   Native window management
-   Host filesystem access
-   Native subprocess execution

Therefore, Electron would introduce complexity without providing a major
advantage for the MVP.

Next.js provides everything required to build the simulated operating
environment.

------------------------------------------------------------------------

# 4. React

**React** is responsible for rendering the desktop environment and
applications.

React components will represent:

``` text
Desktop
TopBar
Dock
AppLauncher
Window
Notification
Terminal
FileManager
Notepad
Games
Settings
Analytics
AI
Cemetery
ProcessManager
```

Applications should be modular React components.

------------------------------------------------------------------------

# 5. TypeScript

**TypeScript** is mandatory for the project.

It will define shared interfaces for the simulated operating system.

Examples:

``` ts
type AppDefinition = {
  id: string
  name: string
  icon: string
  permissions: Permission[]
}

type WindowState = {
  id: string
  appId: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
}

type FileNode = {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  children?: string[]
  parentId?: string
}

type SystemEvent = {
  type: string
  timestamp: number
  payload?: unknown
}
```

TypeScript prevents mismatches between different OS subsystems.

------------------------------------------------------------------------

# 6. Styling --- Tailwind CSS

**Tailwind CSS** is the primary styling system.

It will be used for:

-   Desktop shell
-   Windows
-   Menus
-   Buttons
-   Forms
-   Sidebars
-   Cards
-   Terminal
-   Notifications
-   Settings
-   Application interfaces

Design tokens should be centralized rather than using arbitrary values
throughout the codebase.

Reference:

``` text
docs/design.md
```

The design system defines:

-   Colors
-   Typography
-   Spacing
-   Radius
-   Motion
-   Z-index
-   Component behavior

------------------------------------------------------------------------

# 7. Animation --- Framer Motion

**Framer Motion** will provide motion design.

Primary uses:

``` text
Boot sequence
Window open
Window close
Window minimize
Window maximize
Notifications
Menus
Firewall alerts
Achievement unlocks
AI generation
Score changes
Workspace transitions
```

Animation should be subtle and performant.

The goal is to make the desktop feel alive, not constantly animated.

------------------------------------------------------------------------

# 8. Icons --- Lucide React

**Lucide React** will provide the main icon system.

Advantages:

-   Consistent visual language
-   React support
-   Lightweight SVG icons
-   Large icon collection
-   Easy styling

Examples:

``` text
Folder
Terminal
FileText
Gamepad2
Settings
Bot
Cpu
Bell
Search
Power
```

Emoji should not replace system icons.

Emoji can still be used inside humorous content.

------------------------------------------------------------------------

# 9. Global State --- Zustand

**Zustand** will manage shared runtime state.

Potential stores:

``` text
useWindowStore
useAppStore
useFilesystemStore
useNotificationStore
useSettingsStore
useProductivityStore
useAchievementStore
useProcessStore
useGameStore
```

Example conceptual structure:

``` ts
type WindowStore = {
  windows: WindowState[]
  activeWindowId: string | null

  openWindow: (appId: string) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
}
```

Zustand should manage runtime state.

Persistent data should be synchronized with IndexedDB rather than
treating Zustand itself as the database.

------------------------------------------------------------------------

# 10. OS Core

The OS Core is custom application logic.

It is the most important architectural layer.

``` text
src/core/

├── events/
├── windows/
├── apps/
├── filesystem/
├── processes/
├── permissions/
├── productivity/
├── notifications/
└── persistence/
```

The OS Core should not depend on individual applications.

Applications depend on the OS Core.

------------------------------------------------------------------------

# 11. Event Bus

The Event Bus provides event-driven communication.

Example:

``` ts
eventBus.emit({
  type: "APP_OPENED",
  timestamp: Date.now(),
  payload: {
    appId: "terminal"
  }
})
```

Listeners:

``` text
Analytics
Productivity Engine
Notification Manager
Achievement Manager
Persistence
Process Manager
```

This avoids tightly coupling applications.

------------------------------------------------------------------------

# 12. Window Manager

The Window Manager controls application windows.

Responsibilities:

``` text
Create window
Close window
Focus window
Minimize
Maximize
Restore
Move
Resize
Z-index
```

Applications should not implement their own window lifecycle.

All applications should run through the shared Window Manager.

------------------------------------------------------------------------

# 13. Application Manager

The Application Manager maintains the application registry.

Example:

``` ts
const apps = {
  terminal: {
    id: "terminal",
    name: "SlothShell",
    icon: TerminalIcon,
    permissions: []
  },

  notepad: {
    id: "notepad",
    name: "Notepad",
    icon: FileTextIcon,
    permissions: ["filesystem.read", "filesystem.write"]
  }
}
```

Responsibilities:

-   Register applications
-   Launch applications
-   Check permissions
-   Create windows
-   Track running applications
-   Terminate application instances

------------------------------------------------------------------------

# 14. Virtual Filesystem

The filesystem is a browser-side simulation.

It must never be confused with the host computer's filesystem.

Example:

``` text
/
├── Desktop/
├── Documents/
├── Downloads/
├── Games/
├── Notes/
└── Projects/
```

Operations:

``` text
mkdir
touch
read
write
rename
delete
list
navigate
```

Applications interact with the filesystem through a controlled API.

Example:

``` ts
filesystem.createFile("/Notes/todo.txt")
filesystem.writeFile("/Notes/todo.txt", content)
filesystem.readFile("/Notes/todo.txt")
```

------------------------------------------------------------------------

# 15. Persistence --- IndexedDB

**IndexedDB** is the primary persistence layer.

Store:

``` text
Virtual filesystem
Notes
Settings
Achievements
Analytics
Game scores
Session history
Event history
```

The persistence layer should expose a clean API so applications do not
directly manipulate IndexedDB.

Example:

``` text
Application
    ↓
OS Persistence API
    ↓
IndexedDB
```

This makes it possible to replace IndexedDB with another backend later.

------------------------------------------------------------------------

# 16. Backend --- Next.js Route Handlers

No separate Express server is required for the MVP.

Next.js Route Handlers provide server-side endpoints.

Example:

``` text
/api/ai
/api/github
```

Responsibilities:

-   AI requests
-   GitHub API requests
-   Secret management
-   Server-side validation
-   Optional cloud operations

Client applications should never receive private API keys.

------------------------------------------------------------------------

# 17. AI Layer

The AI layer powers:

``` text
Intent classification
Excuse Generator
Distraction Generator
Overthinking Engine
Productivity Roast
AI Terminal
```

Architecture:

``` text
User
 ↓
React Application
 ↓
Next.js Route Handler
 ↓
LLM API
 ↓
Structured Response
 ↓
Sloth OS
```

AI should be treated as a service.

Applications should not contain provider-specific implementation
wherever possible.

------------------------------------------------------------------------

# 18. AI Intent Classification

Classification should use a two-stage approach.

``` text
User action / intent
        ↓
Deterministic rules
        ↓
Clear classification?
   ↙           ↘
 YES            NO
  ↓              ↓
Result       AI classifier
                ↓
             Result
```

Possible results:

``` text
PRODUCTIVE
NEUTRAL
USELESS
HIGHLY_USELESS
```

Deterministic rules should be preferred for predictable common actions.

AI should handle ambiguous natural-language intent.

------------------------------------------------------------------------

# 19. AI Safety Architecture

AI output must be treated as untrusted data.

Never allow:

``` text
AI response
    ↓
Command execution
```

Instead:

``` text
AI response
    ↓
Text / structured data
    ↓
UI
```

For terminal interactions:

``` text
User command
    ↓
Local command parser
    ↓
Known built-in command?
    ↓
Execute simulated operation
```

AI must never gain direct shell access.

------------------------------------------------------------------------

# 20. Productivity Engine

The Productivity Engine consumes system events.

Example:

``` text
APP_OPENED
     ↓
Productivity Engine
     ↓
Classification
     ↓
Productivity Score
     ↓
Firewall
```

It should classify:

``` text
PRODUCTIVE
NEUTRAL
USELESS
HIGHLY_USELESS
```

Example rules:

``` text
Open Games
→ USELESS

Open Settings
→ NEUTRAL

Open Study
→ PRODUCTIVE

Open GitHub
→ PRODUCTIVE / HIGHLY_PRODUCTIVE

Open AI Excuse Generator
→ HIGHLY_USELESS
```

------------------------------------------------------------------------

# 21. Productivity Firewall

The Productivity Firewall consumes Productivity Engine results.

Responsibilities:

-   Detect productive activity
-   Determine severity
-   Block actions
-   Show warnings
-   Redirect to distractions
-   Trigger notifications
-   Increase threat statistics
-   Trigger quarantine

Example:

``` text
Productive Action
       ↓
Threat Assessment
       ↓
LOW / MEDIUM / HIGH / CRITICAL
       ↓
Firewall Response
```

------------------------------------------------------------------------

# 22. Notification System

The Notification Manager is a system service.

It should receive events from:

``` text
Productivity Firewall
Achievements
Games
AI
System
Applications
```

Example:

``` ts
notificationManager.notify({
  title: "Productivity Firewall",
  message: "Productive activity detected.",
  priority: "critical"
})
```

Notifications should be centralized so every application uses the same
system.

------------------------------------------------------------------------

# 23. Process Simulation

The Process Manager simulates operating-system processes.

Example:

``` text
PID    PROCESS
101    desktop
102    terminal
103    notepad
104    games
105    idle-engine
```

Opening an application:

``` text
Application launched
        ↓
Process created
```

Closing:

``` text
Application closed
        ↓
Process terminated
```

These are simulated processes and must never be presented as actual
Linux processes.

------------------------------------------------------------------------

# 24. Permission System

A simulated permission layer controls application access to the virtual
filesystem.

Example:

``` text
Games
✓ /Games read
✓ /Games write
✗ /Notes read
✗ /Projects write
```

Possible permission types:

``` text
filesystem.read
filesystem.write
filesystem.delete
games.read
games.write
settings.read
settings.write
```

This demonstrates OS-like security concepts without accessing real
system resources.

------------------------------------------------------------------------

# 25. GitHub Integration

GitHub integration is optional.

Purpose:

**Project Cemetery**

Potential data:

``` text
Repository
Description
Last activity
Commit count
Created date
Updated date
```

Flow:

``` text
GitHub REST API
       ↓
Next.js Route Handler
       ↓
Normalize repository data
       ↓
Project Cemetery
```

Authentication should be added only if necessary.

The core product must work without GitHub authentication.

------------------------------------------------------------------------

# 26. Games

Games should be written directly in:

``` text
React
+
TypeScript
```

Initial games:

``` text
Snake
2048
Reaction Test
Memory
```

Game state should integrate with:

``` text
Event Bus
Analytics
Achievements
Productivity Engine
```

------------------------------------------------------------------------

# 27. Testing Stack

Recommended testing tools:

## Vitest

Use for:

-   OS Core logic
-   Event Bus
-   Filesystem
-   Productivity Engine
-   Firewall rules
-   Utility functions

## Playwright

Use for:

-   Desktop startup
-   Application launch
-   Window interaction
-   Terminal
-   Notepad
-   Firewall flow
-   Critical demo scenario

Testing priority should focus on core systems and the demo path.

------------------------------------------------------------------------

# 28. Code Quality

Recommended tools:

``` text
ESLint
Prettier
TypeScript strict mode
```

Rules:

-   Avoid `any` unless genuinely necessary.
-   Keep OS Core independent from application UI.
-   Avoid circular dependencies.
-   Prefer small reusable components.
-   Keep side effects isolated.
-   Validate external API responses.
-   Never commit secrets.

------------------------------------------------------------------------

# 29. Suggested Project Structure

``` text
idle-os/
│
├── docs/
│   ├── prd.md
│   ├── design.md
│   └── techstack.md
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   └── github/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── core/
│   │   ├── events/
│   │   ├── windows/
│   │   ├── apps/
│   │   ├── filesystem/
│   │   ├── processes/
│   │   ├── permissions/
│   │   ├── productivity/
│   │   ├── notifications/
│   │   └── persistence/
│   │
│   ├── shell/
│   │   ├── desktop/
│   │   ├── topbar/
│   │   ├── dock/
│   │   ├── launcher/
│   │   └── context-menu/
│   │
│   ├── apps/
│   │   ├── terminal/
│   │   ├── notepad/
│   │   ├── files/
│   │   ├── games/
│   │   ├── settings/
│   │   ├── analytics/
│   │   ├── ai/
│   │   ├── cemetery/
│   │   └── processes/
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   │
│   ├── stores/
│   │
│   ├── lib/
│   │
│   └── types/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── package.json
├── tsconfig.json
├── eslint.config.*
└── README.md
```

------------------------------------------------------------------------

# 30. Dependency Rules

The architecture should enforce this dependency direction:

``` text
UI / Apps
    ↓
OS Core
    ↓
Persistence / External Services
```

Avoid:

``` text
App A
 ↓
App B
 ↓
App C
```

Instead:

``` text
App A
  ↓
Event Bus
  ↓
OS Services
```

This prevents tightly coupled applications.

------------------------------------------------------------------------

# 31. Two-Person Team Strategy

The project is being developed by two people.

The repository should be organized to minimize merge conflicts.

## Developer 1 --- Core / Platform

Primary ownership:

``` text
src/core/
src/shell/
```

Responsibilities:

-   Window Manager
-   Application Manager
-   Event Bus
-   Virtual Filesystem
-   Persistence
-   Productivity Engine
-   Productivity Firewall
-   Desktop shell
-   Dock
-   Launcher

## Developer 2 --- Applications / Experiences

Primary ownership:

``` text
src/apps/
```

Responsibilities:

-   Notepad
-   Terminal
-   Games
-   Settings
-   Analytics
-   AI tools
-   Project Cemetery
-   Achievements

Both developers should agree on shared interfaces before implementing
dependent features.

------------------------------------------------------------------------

# 32. Git Workflow

Use GitHub with feature branches.

Recommended:

``` text
main
│
├── feature/window-manager
├── feature/event-bus
├── feature/virtual-filesystem
├── feature/notepad
├── feature/terminal
├── feature/games
└── feature/ai
```

Workflow:

``` text
Create branch
     ↓
Implement feature
     ↓
Run tests
     ↓
Commit
     ↓
Push
     ↓
Pull Request
     ↓
Review
     ↓
Merge
```

Do not use `main` as a personal development branch.

------------------------------------------------------------------------

# 33. Environment Configuration

Use environment variables for secrets.

Example:

``` text
.env.local
```

Potential variables:

``` text
LLM_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Never commit:

``` text
.env
.env.local
API keys
OAuth secrets
private tokens
```

Provide:

``` text
.env.example
```

with placeholder values.

------------------------------------------------------------------------

# 34. Deployment

Primary deployment target:

**Vercel or equivalent Next.js-compatible hosting.**

Deployment should provide:

``` text
Production URL
```

so judges can open Sloth OS directly in a browser.

The application should not require a local development environment for
demonstration.

------------------------------------------------------------------------

# 35. Offline / Demo Resilience

The core OS should remain functional even if external services fail.

Required fallback:

``` text
AI unavailable
     ↓
Local canned responses

GitHub unavailable
     ↓
Demo Cemetery data

Cloud database unavailable
     ↓
IndexedDB
```

The main demo must not depend on:

-   AI availability
-   GitHub availability
-   Cloud database availability

------------------------------------------------------------------------

# 36. Performance Strategy

Primary performance priorities:

1.  Smooth window movement
2.  Fast application launching
3.  Minimal unnecessary React renders
4.  Responsive terminal
5.  Responsive games
6.  Fast filesystem operations
7.  Smooth animations

Techniques:

-   Zustand selectors
-   Memoized components where appropriate
-   CSS transforms for window movement
-   Avoid unnecessary global state updates
-   Lazy-load large applications
-   Keep animation effects lightweight

------------------------------------------------------------------------

# 37. Security Model

Sloth OS is a browser application, so security boundaries must remain
explicit.

### Never

``` text
Browser
 ↓
Arbitrary shell
```

### Never

``` text
AI
 ↓
Shell
```

### Never

``` text
Virtual filesystem
 ↓
Host filesystem
```

### Correct

``` text
Browser
 ↓
Sloth OS Core
 ↓
Simulated resources
```

The browser remains the security boundary.

------------------------------------------------------------------------

# 38. Why Not Electron?

Electron was considered because Sloth OS resembles a desktop operating
system.

Electron provides:

-   Native filesystem access
-   Native windows
-   System tray
-   Subprocesses
-   Desktop integration

However, those capabilities are not required for the core product.

Electron would introduce additional:

-   Packaging complexity
-   Security considerations
-   Platform-specific behavior
-   Larger application footprint
-   Development overhead

Next.js is therefore the preferred MVP technology.

Electron can be considered later if Sloth OS needs to become a true
installable desktop application.

------------------------------------------------------------------------

# 39. Why Not Build a Real Linux OS?

A real operating system would require:

``` text
Bootloader
Kernel
Memory management
Process scheduling
Interrupt handling
Drivers
Filesystem
Networking
System calls
User space
Desktop environment
```

That is outside the scope of the project.

Sloth OS instead implements **OS-like abstractions at application
level**.

This provides the desired user experience while keeping the project
feasible for a two-person team and a hackathon timeline.

------------------------------------------------------------------------

# 40. Technology Decision Summary

  Technology               Role                    Required
  ------------------------ ----------------------- ---------------
  Next.js                  Application framework   ✅
  React                    UI                      ✅
  TypeScript               Type safety             ✅
  Tailwind CSS             Styling                 ✅
  Framer Motion            Animation               ✅
  Lucide React             Icons                   ✅
  Zustand                  Runtime state           ✅
  IndexedDB                Local persistence       ✅
  Next.js Route Handlers   Backend/API             ✅
  LLM API                  AI                      High Priority
  GitHub REST API          Cemetery                Optional
  Supabase                 Cloud persistence       Optional
  PostgreSQL               Cloud database          Optional
  Vitest                   Unit tests              Recommended
  Playwright               E2E tests               Recommended
  ESLint                   Code quality            Recommended
  Prettier                 Formatting              Recommended
  Vercel                   Deployment              Recommended

------------------------------------------------------------------------

# 41. Final Architecture

``` text
                         Sloth OS
                            │
                     ┌──────▼──────┐
                     │   Next.js   │
                     │ React + TS  │
                     └──────┬──────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Shell           Apps          System UI
             │              │              │
             └──────────────┼──────────────┘
                            │
                     ┌──────▼──────┐
                     │   OS Core   │
                     └──────┬──────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    Event Bus          Window Manager       App Manager
        │
        ├──────────────┐
        ▼              ▼
 Productivity       Analytics
 Engine
        │
        ▼
 Productivity
 Firewall
        │
        ├──────────────┐
        ▼              ▼
 Virtual FS        Notifications
        │
        ▼
   IndexedDB

External Services
        │
   ┌────┴────┐
   ▼         ▼
  LLM      GitHub
   │         │
   └────┬────┘
        ▼
 Next.js API Routes
```

------------------------------------------------------------------------

# 42. Final Technology Principle

The stack should remain intentionally simple:

``` text
Next.js
+
React
+
TypeScript
+
Tailwind
+
Zustand
+
IndexedDB
+
Custom OS Core
+
AI
```

The sophistication comes from the architecture:

``` text
Web Technologies
        ↓
OS Abstractions
        ↓
Event-Driven System
        ↓
Interconnected Applications
        ↓
Productivity Firewall
        ↓
Sloth OS
```

**The technology stack is modern web development.**

**The architecture is what makes it an operating environment.**

**The product is useless by design.**

**The engineering is not.**
