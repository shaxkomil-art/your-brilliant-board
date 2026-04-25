
## Kanban Board with AI Assistant

A single-page Kanban app styled after the bold purple-sidebar reference, with three columns (To Do, In Progress, Done), drag-and-drop cards, browser-saved data, and a slide-out AI chatbot that can answer questions about your tasks.

### Visual style

- Bold indigo→purple gradient sidebar (matches reference image 2)
- White, airy board area with rounded cards and soft shadows
- Color-coded column headers: To Do (indigo), In Progress (amber), Done (emerald) — pill-shaped with count badges and `+` button
- Priority pills: Low (green), Medium (amber), High (rose)
- Status label chips above each card title (e.g. "Important", "On Track", "Not Started") in colored text
- Smooth hover lift, drag ghost, and column drop-zone highlight animations
- Fully responsive: sidebar collapses to icon rail on narrow viewports

### Layout

```text
┌─────────────┬──────────────────────────────────────────────┐
│             │  Kanban Board                       🔍 + 💬 │
│   LOGO      │  ─────────────────────────────────────────── │
│             │                                              │
│  🏠 Home    │  ┌─ To Do 4 + ┐ ┌─ In Progress 3 + ┐ ┌─ Done│
│  📋 Tasks ●│  │  [card]    │ │  [card]          │ │ [card]│
│  ⚙  Settings│  │  [card]    │ │  [card]          │ │ [card]│
│             │  │  [card]    │ │  [card]          │ │       │
│             │  │  + Add     │ │  + Add           │ │ + Add │
│  ─────      │  └────────────┘ └──────────────────┘ └──────┘│
│  Go Pro ⭐  │                                              │
└─────────────┴──────────────────────────────────────────────┘
                                                    [💬 AI] ← floating
```

### Core features

**Board**
- Three fixed columns: To Do, In Progress, Done
- Click `+` on any column to add a card via dialog
- Drag cards between/within columns to reorder and change status
- Click a card to open an edit dialog; delete from card menu
- Live search bar filters cards by title/description across all columns

**Card fields**
- Title (required)
- Description (optional, multi-line)
- Status label (free-form short tag like "Important", "On Track", "Not Started" — color auto-assigned)
- Priority: Low / Medium / High (colored pill)
- Due date (date picker)

**Persistence**
- All boards/cards saved to `localStorage` automatically on every change
- Header buttons: "Save" (manual save with toast confirmation), "Export JSON", "Import JSON", "Reset board"
- Seed with sample tasks (matching reference) on first visit so the board never looks empty

**AI Assistant (task-aware)**
- Floating chat button bottom-right; opens a slide-in chat panel
- Powered by Lovable AI (Lovable Cloud) — uses google/gemini-3-flash-preview
- Every request sends the current board state as system context, so it can answer:
  - "What's overdue?" / "What's due this week?"
  - "Summarize what's in progress"
  - "Suggest which high-priority task I should tackle first"
  - "How many tasks are done?"
- Streaming token-by-token responses, markdown rendering
- Handles 429 (rate limit) and 402 (credits) with friendly toasts

### Technical details

**Stack additions**
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop
- `react-markdown` for chat message rendering
- Existing shadcn components: Sidebar, Dialog, Popover + Calendar (date picker), Select, Input, Textarea, Button, Badge, Sheet (chat panel), Sonner (toasts)

**Files to create**
- `src/pages/Index.tsx` — replace placeholder with full layout (SidebarProvider + AppSidebar + Board + ChatPanel)
- `src/components/AppSidebar.tsx` — purple gradient sidebar with nav items
- `src/components/kanban/Board.tsx` — DnD context, columns, search, header actions
- `src/components/kanban/Column.tsx` — colored header, count badge, droppable area
- `src/components/kanban/TaskCard.tsx` — card with status label, title, description, priority pill, due date, menu
- `src/components/kanban/TaskDialog.tsx` — create/edit form (title, description, status label, priority, due date)
- `src/components/kanban/ChatPanel.tsx` — slide-in Sheet with streaming chat UI + markdown
- `src/hooks/useKanbanStore.ts` — state + localStorage sync + import/export helpers
- `src/lib/kanban-types.ts` — Task, Column, Priority types
- `src/lib/seed.ts` — initial sample tasks
- `supabase/functions/chat/index.ts` — Lovable AI streaming edge function with task context in system prompt
- `supabase/config.toml` — register `chat` function with `verify_jwt = false`

**Design system updates** (`src/index.css` + `tailwind.config.ts`)
- Add HSL tokens: `--sidebar-gradient-from`, `--sidebar-gradient-to` (indigo→violet), plus semantic tokens for column accent colors (todo/progress/done) and priority colors (low/med/high)
- Map them in tailwind config so components reference `bg-column-todo`, `text-priority-high`, etc. — no hardcoded colors in components
- Subtle card shadow utility, hover-lift transition

**Lovable Cloud**
- Cloud will be enabled to provide `LOVABLE_API_KEY` for the chat edge function
- No database tables, no auth — data stays in `localStorage` per your choice
- Edge function is the only backend piece; it injects the board snapshot the client sends into the system prompt so the AI can reason over your tasks

**Key behaviors**
- localStorage key: `kanban-board-v1`; debounced writes on every state change
- Drag-and-drop uses sortable contexts per column; cross-column drops update the card's `columnId`
- Chat keeps full message history in component state; each request resends the latest board snapshot so answers reflect current data
