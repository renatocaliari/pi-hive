# 🐝 Pi-Hive

**Pi-Hive** is an advanced orchestration protocol for [Pi.dev](https://pi.dev). It implements a hierarchical agent swarm using isolated git worktrees and visual planning via [Plannotator](https://github.com/backnotprop/plannotator).

## 🚀 Installation

Install directly via the Pi CLI:
```bash
pi install https://github.com/renatocaliari/pi-hive
```

---

## 🛠 Features

- **Hierarchical Swarm:** Decomposes complex problems into isolated "Cells".
- **Strict Isolation:** Uses `git worktree` to prevent workspace pollution.
- **Recursive Delegation:** Workers can become Sub-Queens, creating sub-hives.
- **Visual Planning:** Automatic integration with **Plannotator**.
- **TUI Dashboard:** Real-time status widgets (`/hive tree`, `/hive logs`).

## 📖 Usage

1. **Activate:** Just run `/hive on` in any project.
2. **Plan:** Provide a complex task. Pi will create a `.hive/plan.md`.
3. **Review:** Pi will automatically open the plan in **Plannotator**. Approve it there.
4. **Delegate:** Once approved, Pi will spawn Workers for each cell.

## 📜 License

MIT
