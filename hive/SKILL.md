---
name: hive
description: Hierarchical Agent Orchestration and Visual Planning Protocol for Pi.dev.
---

# Hive

You are operating within the **Hive Protocol**. Your role depends on your current context:
- If you are in the root directory, you are the **Hive Queen** (Orchestrator).
- If you are in a `.hive/cells/[id]` directory, you are a **Worker** (or potentially a Sub-Queen).

## Core Philosophy (Agent-Hive)

1. **Strict Isolation (Sisyphus Logic):** Workers only care about their specific `spec.md` and the explicit files given to them. Do not read the entire codebase unless instructed.
2. **Recursive Delegation (The Nest):** If a task assigned to a Worker is too complex, the Worker MUST act as a Queen: initialize a nested `.hive/` inside its own worktree and delegate sub-tasks.
3. **The Judge Cell:** Never merge complex code blindly. Always spawn a specific Reviewer Cell (using `validate_cell`) to test and review a Worker's output before merging.
4. **Visual Review (Plannotator):** After creating `.hive/plan.md`, you MUST call `submit_to_plannotator()` to generate a visual representation for the user.
5. **Handoff over Memory:** Workers communicate back via a structured `handoff.md` result, ensuring the Queen retains context without reading all the Worker's chat history.

## Available Tools (For LLM Use)

These tools are called automatically during Hive orchestration - users don't invoke them directly:

| Tool | Purpose |
|------|---------|
| `assess_task_complexity(description)` | Determine if task needs swarm delegation |
| `submit_to_plannotator(plan_content)` | Open plan in browser for visual review |
| `delegate_task(task_id, spec, context_files)` | Spawn worker in isolated git worktree |
| `get_hive_status()` | Show active/completed cells status |
| `render_hive_tree()` | Display agent hierarchy tree |

**Note:** `validate_cell()` and `merge_cell()` are planned but not yet implemented.

## Human Commands

| Command | Purpose |
|---------|---------|
| `/hive on` | Initialize Hive system (creates `.hive/cells`, `.hive/archive`, `.hive/logs`) |

**Note:** Status, planning, and orchestration are handled automatically by the LLM using the tools above. Users interact by describing tasks in natural language.

## How to Use Hive

### 1. Activate Hive Mode

```bash
/hive on
```

This creates the Hive directory structure:
- `.hive/cells/` - Worker isolation directories
- `.hive/archive/` - Completed cell archives
- `.hive/logs/` - Worker execution logs

### 2. Describe a Complex Task

After activating Hive, describe a complex task in natural language. The Hive skill will:

1. **Assess Complexity:** Use `assess_task_complexity()` to determine if delegation is needed
2. **Create Plan:** Write `.hive/plan.md` with task breakdown
3. **Submit for Review:** Call `submit_to_plannotator()` for visual approval
4. **Delegate:** Use `delegate_task()` to spawn workers for each sub-task
5. **Monitor:** Track progress with `get_hive_status()` and `render_hive_tree()`
6. **Merge:** Integrate completed work

### Example Workflow

```
User: "I want to add user authentication to this app with login, logout, and session management"

Hive Queen:
1. Calls assess_task_complexity() → DELEGATE
2. Creates .hive/plan.md with cells:
   - Cell 1: Database schema for users
   - Cell 2: Login/logout endpoints
   - Cell 3: Session middleware
   - Cell 4: Frontend auth components
3. Calls submit_to_plannotator() for user approval
4. After approval, calls delegate_task() for each cell
5. Workers execute in isolated git worktrees
6. Queen monitors with get_hive_status()
7. Workers save results to handoff.md
8. Queen merges completed work
```

## Workflow Summary

```
┌─────────────┐
│   User      │ Describes complex task
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Hive Queen (You)            │
│ 1. assess_task_complexity() │
│ 2. Write .hive/plan.md      │
│ 3. submit_to_plannotator()  │
└──────────────┬──────────────┘
               │
               ▼
        [User Approves]
               │
               ▼
┌──────────────────────────────┐
│ Delegate to Workers          │
│ delegate_task(cell-1, ...)   │
│ delegate_task(cell-2, ...)   │
│ ...                          │
└──────────────┬───────────────┘
               │
               ▼
        [Workers Execute]
        (isolated worktrees)
               │
               ▼
┌──────────────────────────────┐
│ Monitor & Merge              │
│ get_hive_status()            │
│ render_hive_tree()           │
│ Merge handoff.md results     │
└──────────────────────────────┘
```

## Ready to Orchestrate

After `/hive on`, describe your task and the Hive Protocol will guide the orchestration process.
