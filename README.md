# 🐝 Pi-Hive

**Pi-Hive** is an advanced extension for [Pi.dev](https://pi.dev) (pi-coding-agent) that implements a hierarchical agent orchestration protocol. It is inspired by the philosophy of [Agent-Hive](https://github.com/tctinh/agent-hive) and the visual mapping of [Plannotator](https://github.com/backnotprop/plannotator).

## 🚀 Features

- **Hierarchical Swarm:** The "Hive Queen" (Main Session) decomposes complex problems into isolated "Cells" (Tasks).
- **Strict Isolation:** Uses `git worktree` to run Workers in isolated branches/directories, preventing workspace pollution.
- **Recursive Delegation:** Workers can become Sub-Queens, creating their own sub-hives for massive scale.
- **Visual Planning:** Automatic integration with **Plannotator** for visual review and approval of plans.
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

1. **Initialize:** Ask Pi to "Initialize Hive structure".
2. **Plan:** Provide a complex task. Pi will create a `.hive/plan.md`.
3. **Review:** Pi will automatically open the plan in **Plannotator**. Approve it there.
4. **Delegate:** Once approved, Pi will spawn Workers for each cell.
5. **Merge:** When a task is DONE, use `/hive merge [id]` or ask Pi to merge it.

## 📖 Commands

- `/hive status`: Refresh the UI status widget.
- `/hive tree`: View the hierarchical agent nest.
- `/hive logs`: Stream recent worker activity.
- `/hive plan`: Review the current `plan.md`.
- `/hive review`: Re-submit the plan to Plannotator.

## 📜 License

MIT
