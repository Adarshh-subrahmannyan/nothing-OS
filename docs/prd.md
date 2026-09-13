# Sloth OS --- Product Requirements Document (PRD)

**Version:** 0.1.0\
**Status:** Hackathon / Experimental Prototype\
**Project Type:** Web-oriented operating environment\
**Tagline:** *An operating system for doing absolutely nothing.*

------------------------------------------------------------------------

## 1. Product Overview

Sloth OS is a browser-based operating environment designed to imitate the
structure and interaction model of an operating system while
deliberately preventing productivity.

Instead of helping users work faster, Sloth OS detects productive
behavior and actively discourages it. It provides a desktop shell,
window manager, application manager, virtual filesystem, terminal,
games, notifications, analytics, achievements, and AI-powered
procrastination tools inside one shared environment.

The project is intentionally useless in purpose but serious in
engineering.

> **Normal software helps users become productive. Sloth OS protects
> users from productivity.**

### 1.1 Product Classification

**Web-oriented OS / web-based operating environment**

Sloth OS is not a real kernel or standalone operating system. It runs
inside a web browser and implements OS-like abstractions in application
space.

### 1.2 Core Product Principle

Every application should feel like part of the same operating system
rather than an unrelated collection of web pages.

The architecture therefore centers around:

-   A shared OS core
-   An event bus
-   A window manager
-   An application manager
-   A virtual filesystem
-   A productivity classification engine
-   A productivity firewall
-   Shared persistence and system state

------------------------------------------------------------------------

# 2. Goals

## 2.1 Primary Goals

1.  Create a convincing browser-based operating environment.
2.  Demonstrate real software architecture rather than a static UI
    mockup.
3.  Provide multiple interconnected applications.
4.  Make productive behavior a detectable and blockable system event.
5.  Make the project humorous, memorable, and highly demoable.
6.  Persist user data locally.
7.  Provide a clear technical demonstration of state management,
    event-driven architecture, simulated OS services, and AI
    integration.

## 2.2 Secondary Goals

-   Make the UI visually polished.
-   Support keyboard and mouse interaction.
-   Make applications modular and extensible.
-   Provide entertaining system feedback.
-   Include enough technical depth to make the project interesting to
    developers and judges.

## 2.3 Non-Goals

Sloth OS will **not**:

-   Implement a real operating-system kernel.
-   Replace the host operating system.
-   Execute arbitrary shell commands on the user's computer.
-   Access or modify the host filesystem without explicit
    browser-supported mechanisms.
-   Control external desktop applications.
-   Guarantee that external websites can be embedded in an iframe.
-   Attempt to become a general-purpose production operating system.

------------------------------------------------------------------------

# 3. Target Users

## Primary Users

### Hackathon / Exhibition Audience

People interacting with the project during a short demonstration.

They should immediately understand:

-   This looks like an OS.
-   It is actually running in a browser.
-   It has real internal systems.
-   The system intentionally blocks productivity.

### Developers / Technical Judges

They should be able to inspect or understand:

-   Component architecture
-   State management
-   Event-driven communication
-   Virtual filesystem
-   Application lifecycle
-   Permission simulation
-   AI integration
-   Persistence

### Casual Users

They should be able to open the system and explore it without
instructions.

------------------------------------------------------------------------

# 4. Product Experience

## 4.1 Boot Experience

When Sloth OS starts, display a short fake boot sequence.

Example:

``` text
Sloth OS
v0.1.0 — Tomorrow Edition

Initializing motivation... FAILED
Loading productivity... FAILED
Loading distractions... 100%
Loading excuses... 100%
Starting Idle Engine...
SYSTEM READY
```

Requirements:

-   Boot animation should last approximately 2--4 seconds.
-   User should be able to skip the animation.
-   Boot state should transition into the desktop shell.

------------------------------------------------------------------------

# 5. Desktop Shell

The desktop is the primary system interface.

It should contain:

-   Wallpaper
-   Desktop icons
-   Taskbar
-   Start menu
-   System tray
-   Clock
-   Notifications
-   Search
-   Context menus

### Desktop Applications

Initial application registry:

  ID             Application             Priority
  -------------- ----------------------- ------------
  `notepad`      Notepad                 Must Have
  `terminal`     SlothShell               Must Have
  `games`        Games                   Must Have
  `files`        File Manager            High
  `settings`     Settings                High
  `analytics`    Uselessness Analytics   High
  `ai-excuses`   AI Excuse Generator     High
  `cemetery`     Project Cemetery        Wow Factor
  `processes`    Process Manager         Wow Factor

------------------------------------------------------------------------

# 6. Window Manager

The Window Manager is one of the core technical systems.

It must support:

-   Open
-   Close
-   Minimize
-   Maximize
-   Restore
-   Focus
-   Z-index management
-   Dragging
-   Resizing
-   Multiple simultaneous windows

A reusable window component should provide consistent behavior to every
application.

### Example State

``` ts
type WindowState = {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  focused: boolean
  zIndex: number
}
```

------------------------------------------------------------------------

# 7. Application Manager

Applications should be registered through a centralized application
registry.

Example conceptual model:

``` ts
type AppDefinition = {
  id: string
  name: string
  icon: string
  component: React.ComponentType
  permissions: Permission[]
}
```

Opening an application should follow:

``` text
User Action
    ↓
Application Manager
    ↓
Productivity Engine
    ↓
Permission Check
    ↓
Window Manager
    ↓
Application Instance
```

This prevents each application from implementing its own unrelated
window logic.

------------------------------------------------------------------------

# 8. OS Core and Event Bus

The OS Core is responsible for communication between applications and
system services.

Applications should emit events instead of directly depending on every
other application.

### Example Events

``` text
APP_OPENED
APP_CLOSED
WINDOW_FOCUSED
WINDOW_MINIMIZED
FILE_CREATED
FILE_DELETED
FILE_OPENED
NOTE_EDITED
NOTE_SAVED
COMMAND_EXECUTED
GAME_STARTED
GAME_FINISHED
TASK_CREATED
PRODUCTIVITY_DETECTED
ACHIEVEMENT_UNLOCKED
NOTIFICATION_CREATED
```

### Event Flow

``` text
Application
    ↓
Event Bus
    ↓
System Services
    ├── Analytics
    ├── Productivity Engine
    ├── Notifications
    ├── Achievements
    └── Persistence
```

This architecture makes the system extensible.

------------------------------------------------------------------------

# 9. Virtual Filesystem

Sloth OS must provide a simulated filesystem entirely inside the browser.

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

### File Model

``` ts
type FileNode = {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  children?: string[]
  parentId?: string
  createdAt: number
  updatedAt: number
}
```

### Requirements

-   Create file
-   Delete file
-   Create directory
-   Rename
-   Read
-   Write
-   Navigate directories
-   Persist data
-   Enforce simulated permissions

The filesystem must never be confused with the host computer's actual
filesystem.

------------------------------------------------------------------------

# 10. Notepad

Notepad should behave like a real lightweight text editor.

### Requirements

-   Create new document
-   Edit text
-   Open files
-   Save files
-   Autosave
-   Search
-   Word count
-   Character count
-   Download `.txt`
-   Store documents in the virtual filesystem

Example:

``` text
Untitled.txt

Words: 147
Characters: 821
Status: Saved
```

Saving a document should emit:

``` text
NOTE_SAVED
FILE_CREATED / FILE_UPDATED
```

------------------------------------------------------------------------

# 11. SlothShell Terminal

SlothShell is a simulated terminal.

Prompt:

``` text
idle@nothing:~$
```

### Built-in Commands

``` text
help
clear
echo
pwd
ls
cd
cat
mkdir
touch
rm
neofetch
fortune
games
notes
about
productivity
ai
```

### Example `neofetch`

``` text
OS: Sloth OS
Kernel: Definitely Linux
Shell: SlothShell
CPU: Doing nothing
RAM: Mostly unused
Motivation: 2%
Uselessness: 98%
```

### Security Requirement

SlothShell must never execute arbitrary host shell commands.

Command execution must use a controlled parser and operate only on the
virtual filesystem and simulated OS state.

AI-generated terminal responses must never be interpreted as executable
commands.

------------------------------------------------------------------------

# 12. Games

The Games application provides intentional distractions.

Initial games:

-   Snake
-   2048
-   Reaction test
-   Memory game

At least 1--2 games are required for the first release.

Games should integrate with:

-   Window Manager
-   Event Bus
-   Achievements
-   Analytics
-   Productivity Engine

Example:

``` text
GAME_STARTED
GAME_FINISHED
SCORE_RECORDED
ACHIEVEMENT_UNLOCKED
```

External game platforms may be linked or embedded only when technically
and legally permitted. The system must not depend on third-party iframe
embedding.

------------------------------------------------------------------------

# 13. Productivity Engine

The Productivity Engine is the central intelligence behind the project's
concept.

It classifies user actions into:

``` text
PRODUCTIVE
NEUTRAL
USELESS
HIGHLY_USELESS
```

### Example Classification

  Action            Classification
  ----------------- -------------------
  Open Work         Productive
  Open Study        Productive
  Open GitHub       Highly Productive
  Open Calculator   Suspicious
  Open Games        Useless
  Open AI Excuses   Highly Useless
  Do Nothing        Perfect

The engine should initially use deterministic rules for predictable
behavior.

AI-based intent classification may be added as a second layer.

------------------------------------------------------------------------

# 14. Productivity Firewall™

The Productivity Firewall is the signature feature.

When productive behavior is detected, the firewall intervenes.

Example:

``` text
🚨 PRODUCTIVITY FIREWALL

Productive activity detected.

Application: WORK
Threat Level: CRITICAL

This application has been blocked
for your own protection.

Recommended:

🎮 Play a game
🧠 Overthink something
🤖 Generate an excuse
🪦 Visit abandoned projects

[ ACCEPT MY FATE ]
```

### Firewall Actions

Depending on severity:

-   Warning
-   Block
-   Redirect
-   Open distraction recommendation
-   Increase productivity threat score
-   Trigger notification
-   Trigger achievement

------------------------------------------------------------------------

# 15. Intent-Based Detection

The system may classify the user's intent rather than relying only on
application names.

Examples:

``` text
"I need to finish my assignment."
→ PRODUCTIVE
→ BLOCK

"I want to research why penguins can't fly."
→ USELESS
→ ALLOW

"I should start studying."
→ PRODUCTIVE
→ BLOCK

"I want to find a completely unnecessary fact."
→ USELESS
→ ALLOW
```

AI classification should be used only after deterministic rules are
established.

------------------------------------------------------------------------

# 16. Productivity Quarantine

Repeated productivity attempts should eventually trigger a special
system state.

Example:

``` text
PRODUCTIVITY QUARANTINE

You have attempted to be productive
5 times in the last 10 minutes.

Productivity has been temporarily disabled.

Please return to wasting time.
```

The exact threshold should be configurable.

------------------------------------------------------------------------

# 17. Uselessness Score

Sloth OS tracks the inverse of productivity.

Example:

``` text
Productivity: 6%
Uselessness: 94%
```

Possible score inputs:

-   Games played
-   Useless searches
-   Excuses generated
-   Productive actions blocked
-   Time spent idle
-   Overthinking sessions
-   Random activity
-   Tasks avoided

The score should be persistent.

------------------------------------------------------------------------

# 18. Uselessness Analytics

Analytics should convert system events into humorous metrics.

Example:

``` text
Actual Work              12m
Thinking About Work      37m
Avoiding Work            3h 41m
Random Activity          1h 12m

Productivity             8%
Uselessness              92%
```

### Metrics

-   Tasks created
-   Tasks completed
-   Tasks avoided
-   Productivity attempts blocked
-   Procrastination sessions
-   Longest idle session
-   Uselessness score
-   Games played
-   Excuses generated

Analytics should be derived from event history where practical.

------------------------------------------------------------------------

# 19. Achievements

Achievements provide progression and humor.

Initial achievements:

``` text
First Procrastination
Almost Productive
Professional Procrastinator
Legendary
Final Boss
```

Additional achievements may be triggered by:

-   First blocked productive action
-   10 minutes of idling
-   Multiple games
-   Multiple excuses
-   Repeated productivity attempts
-   Extreme uselessness score

------------------------------------------------------------------------

# 20. AI Procrastination Assistant

The AI system should provide entertaining productivity-avoidance
functionality.

### Features

#### AI Excuse Generator

Modes:

-   Professional
-   Corporate
-   Ridiculous

Example:

``` text
Reality:
You watched YouTube for 3 hours.

Generated excuse:
"I encountered an unexpected cognitive
optimization period that temporarily
reduced my execution velocity."
```

Actions:

-   Generate again
-   More convincing
-   Corporate
-   Ridiculous

#### Overthinking Engine

Input:

``` text
Tea or coffee?
```

Output should create an absurd decision tree and eventually conclude:

``` text
Decision postponed until tomorrow.
```

#### AI Distraction Generator

Input:

``` text
Study DSA
```

Output examples:

``` text
Research penguins
Organize Downloads
Learn why bananas curve
Read random Wikipedia articles
Start another project
```

------------------------------------------------------------------------

# 21. Project Cemetery

Project Cemetery stores abandoned-project records.

Example:

``` text
🪦 AI Chatbot

Last activity: 847 days ago
Commits: 3

Cause of death:
Started another project.
```

Potential data sources:

-   User-entered projects
-   Public GitHub repositories
-   Optional GitHub account integration

The first implementation should work without authentication using
manually entered or demo data.

------------------------------------------------------------------------

# 22. Anti-Pomodoro

Instead of encouraging work intervals, Sloth OS encourages
procrastination intervals.

Example:

``` text
PROCRASTINATION SESSION

25:00
████████████████████

Do absolutely nothing.
```

After completion:

``` text
Congratulations!

You successfully wasted 25 minutes.
```

------------------------------------------------------------------------

# 23. Notifications

The notification system should behave like an operating-system
notification center.

Notification types:

-   Productivity detected
-   Productivity blocked
-   Critical productivity
-   Achievement unlocked
-   Game result
-   System event
-   Project Cemetery update
-   AI response

Notifications should support:

-   Queue
-   Read/unread state
-   Auto-dismiss
-   Click action
-   Priority

------------------------------------------------------------------------

# 24. Simulated Process Manager

Sloth OS may simulate processes.

Example:

``` text
PID    PROCESS
101    desktop
102    terminal
103    notepad
104    games
105    idle-engine
```

Opening an application creates a simulated process.

Closing it terminates the process.

This does not represent real OS processes.

Optional fake metrics:

``` text
CPU: 3%
Memory: 41%
Motivation: 2%
Uselessness: 98%
```

------------------------------------------------------------------------

# 25. Simulated Permissions

Applications should optionally have permissions over the virtual
filesystem.

Example:

``` text
Games
✓ Read /Games
✓ Write /Games
✗ Read /Notes
✗ Write /Projects
```

Unauthorized access should produce:

``` text
Permission denied.

This application is not allowed
to become productive.
```

------------------------------------------------------------------------

# 26. Settings

Settings should include:

-   Theme
-   Wallpaper
-   Sound effects
-   Animation intensity
-   Username
-   Notifications
-   GitHub username
-   Demo mode

Settings should persist locally.

------------------------------------------------------------------------

# 27. Easter Eggs

Potential easter eggs:

### Konami Code

Unlock:

``` text
ULTRA IDLE MODE
```

### Clock Interaction

``` text
You really have nothing better to do, huh?
```

### Productivity Search

``` text
No results found.
Try searching for something less productive.
```

### Close Attempt

``` text
You could be doing something productive.

Are you sure you want to escape?
```

### Hidden Terminal Commands

Additional humorous commands can be hidden in `help`.

------------------------------------------------------------------------

# 28. Persistence

## Local Persistence

Use IndexedDB for:

-   Virtual filesystem
-   Notes
-   Settings
-   Analytics
-   Achievements
-   Session history
-   Game scores

A lightweight state store such as Zustand can manage runtime state.

## Optional Cloud Persistence

Supabase/PostgreSQL may be added for:

-   Accounts
-   Cloud profiles
-   Leaderboards
-   Project Cemetery records
-   Cross-device persistence

Cloud persistence is optional and should not block the core demo.

------------------------------------------------------------------------

# 29. Technology Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Framer Motion
-   Lucide React

## State

-   Zustand

## Persistence

-   IndexedDB

## Backend

-   Next.js Route Handlers

## Optional Database

-   Supabase
-   PostgreSQL

## AI

-   LLM API through a secure server-side route

## External Integration

-   GitHub REST API

### Architecture

``` text
Browser
│
├── Desktop Shell
│
├── Window Manager
├── Application Manager
├── OS Core
│   └── Event Bus
│
├── Applications
│   ├── Notepad
│   ├── Terminal
│   ├── Games
│   ├── File Manager
│   ├── Settings
│   ├── Analytics
│   └── AI Tools
│
├── System Services
│   ├── Virtual Filesystem
│   ├── Productivity Engine
│   ├── Productivity Firewall
│   ├── Notifications
│   ├── Achievements
│   └── Process Simulation
│
└── Persistence
    └── IndexedDB
```

------------------------------------------------------------------------

# 30. AI Architecture

AI requests should never be sent directly from the browser with a secret
API key.

Recommended flow:

``` text
User
 ↓
React Application
 ↓
Next.js API Route
 ↓
LLM Provider
 ↓
Structured Response
 ↓
Application
```

For intent classification:

``` text
User Intent
 ↓
Deterministic Rules
 ↓
If uncertain
 ↓
AI Classifier
 ↓
PRODUCTIVE / NEUTRAL / USELESS
 ↓
Productivity Firewall
```

AI output must remain data, not executable instructions.

------------------------------------------------------------------------

# 31. Security Requirements

1.  Never execute arbitrary terminal commands.
2.  Never expose LLM API keys to the browser.
3.  Sanitize user-generated filesystem content before rendering as HTML.
4.  Treat AI output as untrusted data.
5.  Restrict GitHub integration to the required API scopes.
6.  Do not allow simulated permissions to become actual browser/host
    permissions.
7.  Do not assume third-party websites are safe or embeddable.
8.  Keep the virtual filesystem isolated from the host filesystem.

------------------------------------------------------------------------

# 32. Performance Requirements

Target:

-   Smooth desktop interactions.
-   Responsive window dragging.
-   Minimal unnecessary React re-renders.
-   Fast application startup.
-   Local persistence without noticeable UI blocking.
-   Game interactions should remain responsive.

The application should remain usable with multiple open windows.

------------------------------------------------------------------------

# 33. Accessibility Requirements

The UI should support:

-   Keyboard navigation
-   Visible focus states
-   Accessible labels
-   Sufficient text contrast
-   Reduced-motion preference where practical
-   Logical tab order
-   Keyboard shortcuts for common actions

------------------------------------------------------------------------

# 34. Responsive Requirements

Primary target:

**Desktop browser**

Secondary:

**Large tablets**

Mobile support is optional because the operating-system metaphor works
best with a desktop viewport.

------------------------------------------------------------------------

# 35. Demo Mode

A dedicated Demo Mode should be available for exhibitions.

It may:

-   Preload example files
-   Show fake system activity
-   Provide demo projects
-   Include sample achievements
-   Enable fast AI responses
-   Provide a predictable productivity-firewall demonstration

Demo Mode must make the system reliably demonstrable without requiring
account setup.

------------------------------------------------------------------------

# 36. MVP Scope

## Must Have

-   Boot screen
-   Desktop shell
-   Taskbar
-   Start menu
-   Window Manager
-   Application Manager
-   OS Core / Event Bus
-   Virtual filesystem
-   Notepad
-   Terminal
-   Games
-   Productivity Engine
-   Productivity Firewall
-   Notifications
-   Local persistence

## High Priority

-   Uselessness Analytics
-   Achievements
-   AI Assistant
-   AI Excuse Generator
-   AI Distraction Generator
-   Overthinking Engine

## Wow Factor

-   Project Cemetery
-   GitHub integration
-   Simulated permissions
-   Process Manager
-   Anti-Pomodoro
-   Fake system events
-   Easter eggs
-   Multiple games

------------------------------------------------------------------------

# 37. Development Roadmap

## Phase 1 --- Shell

``` text
Boot
 ↓
Desktop
 ↓
Taskbar
 ↓
Start Menu
```

## Phase 2 --- Windowing

``` text
Window Manager
 ↓
Application Manager
 ↓
Multiple Windows
```

## Phase 3 --- Core

``` text
OS Core
 ↓
Event Bus
 ↓
Virtual Filesystem
 ↓
Persistence
```

## Phase 4 --- Applications

``` text
Notepad
Terminal
File Manager
Games
Settings
```

## Phase 5 --- Identity

``` text
Productivity Engine
 ↓
Productivity Firewall
 ↓
Notifications
 ↓
Uselessness Score
 ↓
Achievements
```

## Phase 6 --- AI

``` text
AI Terminal
AI Excuse Generator
Overthinking Engine
Distraction Generator
```

## Phase 7 --- Polish

``` text
Project Cemetery
Process Manager
Permissions
Easter Eggs
Demo Mode
Animations
Performance
```

------------------------------------------------------------------------

# 38. Acceptance Criteria

The MVP is considered successful when:

### Desktop

-   [ ] System boots into a functional desktop.
-   [ ] Applications can be launched.
-   [ ] Multiple application windows can coexist.
-   [ ] Windows can be moved, minimized, maximized, restored, and
    closed.
-   [ ] Taskbar reflects open applications.

### Core

-   [ ] Applications communicate through the event system.
-   [ ] Events can be observed by system services.
-   [ ] State persists across page reloads.

### Filesystem

-   [ ] Files and directories can be created.
-   [ ] Files can be read and edited.
-   [ ] Notepad can save files.
-   [ ] Terminal can interact with virtual files.
-   [ ] No host filesystem access is performed by terminal commands.

### Productivity Firewall

-   [ ] Productive actions are detected.
-   [ ] Productive actions can be blocked.
-   [ ] Useless actions are allowed.
-   [ ] Notifications are generated.
-   [ ] Productivity statistics update.

### AI

-   [ ] AI requests are routed through a secure backend.
-   [ ] AI can generate excuses.
-   [ ] AI can generate distractions.
-   [ ] AI intent classification can be used when deterministic rules
    are insufficient.
-   [ ] AI output cannot execute commands.

### Demo

-   [ ] Demo Mode can be started quickly.
-   [ ] A complete firewall demonstration can be performed in under two
    minutes.
-   [ ] The project works without requiring external accounts for the
    core experience.

------------------------------------------------------------------------

# 39. Key Demo Scenario

The recommended live demonstration:

``` text
1. Boot Sloth OS
        ↓
2. Show desktop
        ↓
3. Open Notepad
        ↓
4. Attempt to write a "study plan"
        ↓
5. Productivity Engine detects productive intent
        ↓
6. Productivity Firewall activates
        ↓
7. System blocks the activity
        ↓
8. Notification appears
        ↓
9. System recommends Games / Excuses / Overthinking
        ↓
10. Open Games
        ↓
11. Play a mini-game
        ↓
12. Uselessness score increases
        ↓
13. Open SlothShell
        ↓
14. Run `neofetch`
        ↓
15. Run `ai why am I procrastinating?`
        ↓
16. Open Project Cemetery
        ↓
17. Show abandoned project
        ↓
18. Finish with:
```

``` text
Sloth OS

Productivity: 3%
Uselessness: 97%

SYSTEM STATUS:
Working perfectly.
```

------------------------------------------------------------------------

# 40. Success Metrics

Because this is an intentionally useless product, conventional
productivity metrics are inappropriate.

Success should instead be measured by:

### Technical Success

-   Number of interconnected system components
-   Number of reusable applications
-   Event coverage
-   Persistence reliability
-   UI responsiveness
-   Architecture quality

### Demo Success

-   Time required to understand the concept
-   Audience interaction
-   Number of unexpected/funny reactions
-   Reliability of the live demo
-   Technical questions generated by judges

### Product Success

The project succeeds if a user can immediately understand:

> **"This is a fake operating system that is actually engineered like a
> real software platform---and its entire purpose is to stop me from
> being productive."**

------------------------------------------------------------------------

# 41. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Window manager becomes  High                    Build it before
  complex                                         individual apps

  Too many features       High                    Lock MVP scope

  AI API failure          Medium                  Provide deterministic
                                                  fallback responses

  External iframe blocked Medium                  Use native mini-games
                                                  or external navigation

  Browser performance     Medium                  Centralize state and
                                                  optimize rendering

  Data loss               Medium                  Persist important state
                                                  in IndexedDB

  Terminal security issue Critical                Never execute host
                                                  shell commands

  AI output behaves       Medium                  Treat AI output as
  unexpectedly                                    untrusted data

  GitHub API/auth         Medium                  Make integration
  complexity                                      optional

  Demo internet failure   High                    Provide offline/demo
                                                  fallback
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 42. Future Expansion

Potential future versions:

-   Multiplayer idle world
-   Global uselessness leaderboard
-   More simulated system services
-   Plugin architecture
-   Custom themes
-   User-created applications
-   Virtual package manager
-   Simulated networking
-   Virtual email client
-   Fake system updates
-   Procedurally generated distractions
-   More sophisticated AI agents

------------------------------------------------------------------------

# 43. Final Product Definition

**Sloth OS is a web-oriented operating environment that recreates the
architecture and interaction patterns of an operating system inside a
browser, while deliberately optimizing for procrastination instead of
productivity.**

Its engineering value comes from the underlying systems:

``` text
Desktop
   +
Window Manager
   +
Application Manager
   +
OS Core
   +
Event Bus
   +
Virtual Filesystem
   +
Persistence
   +
Productivity Engine
   +
Productivity Firewall
   +
AI Services
   =
Sloth OS
```

The product is useless by design.

The engineering is not.
