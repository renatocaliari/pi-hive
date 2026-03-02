# 🐝 Pi-Hive

**Pi-Hive** is an advanced extension for [Pi.dev](https://pi.dev) (pi-coding-agent) that implements a hierarchical agent orchestration protocol. It is inspired by the philosophy of [Agent-Hive](https://github.com/tctinh/agent-hive) and the visual mapping of [Plannotator](https://github.com/backnotprop/plannotator).

## 🚀 Features

- **Hierarchical Swarm:** The "Hive Queen" (Main Session) decomposes complex problems into isolated "Cells" (Tasks).
- **Strict Isolation:** Uses `git worktree` to run Workers in isolated branches/directories, preventing workspace pollution.
- **Recursive Delegation:** Workers can become Sub-Queens, creating their own sub-hives for massive scale.
- **Visual Planning:** Automatic integration with **Plannotator** for visual review and approval of plans.
- **Complexity Triage:** Automatic assessment to decide when to delegate vs execute directly.
- **Judge Cells:** Dedicated workers (Judges) review code changes before they are merged into the main branch.
- **TUI Dashboard:** Real-time status widgets and activity logs directly in your terminal.

## 📦 Installation

1. Copy the contents of `src/index.ts` to your `.pi/extensions/hive.ts`.
2. Copy `skills/hive.md` to `.pi/skills/hive.md`.
3. Load the skill in Pi:
   ```bash
   /skill load .pi/skills/hive.md
   ```

## 🛠 Usage

- **Activate:** Just run `/hive on` in any project.
- **Plan:** Provide a complex task. Pi will create a `.hive/plan.md`.
- **Review:** Pi will automatically open the plan in **Plannotator**. Approve it there.
- **Delegate:** Once approved, Pi will spawn Workers for each cell.
- **Monitor:** Use `/hive status` or `/hive tree` to see progress.
- **Merge:** When a task is DONE, use `/hive merge [id]` or ask Pi to merge it.

## 📖 Commands

- `/hive on`: Initialize Hive mode in the current project.
- `/hive status`: Refresh the UI status widget.
- `/hive tree`: View the hierarchical agent nest.
- `/hive logs`: Stream recent worker activity.
- `/hive plan`: Review the current `plan.md`.
- `/hive review`: Re-submit the plan to Plannotator.

## 📜 License

MIT
