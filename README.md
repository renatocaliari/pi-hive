# 🐝 Pi-Hive

**Pi-Hive** is an advanced orchestration protocol for [Pi.dev](https://pi.dev). It implements a hierarchical agent swarm using isolated git worktrees and visual planning via [Plannotator](https://github.com/backnotprop/plannotator).

## 🚀 Installation

```bash
pi install git:github.com/renatocaliari/pi-hive
```

---

## 📖 How to Use

### 1. Activate Hive Mode

In any project directory:

```bash
/hive on
```

This creates the Hive structure:
```
.hive/
├── cells/     # Worker isolation directories
├── archive/   # Completed cell archives
└── logs/      # Worker execution logs
```

### 2. Describe a Complex Task

After activation, describe your task in natural language. The Hive Protocol will automatically:

1. **Assess** if the task requires delegation
2. **Plan** by creating `.hive/plan.md` with task breakdown
3. **Visualize** by opening the plan in Plannotator for your approval
4. **Delegate** by spawning workers in isolated git worktrees
5. **Monitor** progress with status widgets
6. **Merge** completed work

### Example

```
User: "Add user authentication with login, logout, and session management"

Hive will:
1. Break down into cells (database, endpoints, middleware, frontend)
2. Create .hive/plan.md
3. Open Plannotator for visual review
4. Spawn workers after approval
5. Each worker executes in isolation
6. Merge results when complete
```

---

## 🛠 Features

| Feature | Description |
|---------|-------------|
| **Hierarchical Swarm** | Decomposes problems into isolated "Cells" |
| **Strict Isolation** | Uses `git worktree` to prevent workspace pollution |
| **Recursive Delegation** | Workers can become Sub-Queens with nested hives |
| **Visual Planning** | Automatic Plannotator integration |
| **Handoff-based Communication** | Workers use `handoff.md` instead of chat history |

---

## 🧠 Hive Protocol

```
┌─────────────┐
│   User      │ Describes task
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Hive Queen                  │
│ • assess_task_complexity()  │
│ • Write .hive/plan.md       │
│ • submit_to_plannotator()   │
└──────────────┬──────────────┘
       │
       ▼
 [User Approves]
       │
       ▼
┌──────────────────────────────┐
│ Workers (git worktrees)      │
│ • delegate_task(cell-1)      │
│ • delegate_task(cell-2)      │
│ • ...                        │
└──────────────┬───────────────┘
       │
       ▼
 [Execution]
       │
       ▼
┌──────────────────────────────┐
│ Monitor & Merge              │
│ • get_hive_status()          │
│ • render_hive_tree()         │
│ • Merge handoff.md           │
└──────────────────────────────┘
```

---

## 📜 License

MIT
