# 🐝 Pi-Hive

**Pi-Hive** is an advanced orchestration protocol for [Pi.dev](https://pi.dev). It implements a hierarchical agent swarm using isolated git worktrees and visual planning via [Plannotator](https://github.com/backnotprop/plannotator).

## 🚀 One-Step Installation

### Option A: Quick Shell Installer (Recommended)
This is the fastest way to install Pi-Hive globally on your machine.
```bash
curl -fsSL https://raw.githubusercontent.com/renatocaliari/pi-hive/main/install.sh | bash
```

### Option B: Local Clone & Install
If you want to manage the code yourself:
```bash
git clone https://github.com/renatocaliari/pi-hive.git
cd pi-hive
npm run install-local
```

### Option C: Skills.sh (Npx)
```bash
npx skills add renatocaliari/pi-hive
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

## 📖 Commands

- `/hive on`: Initialize Hive mode in the current project.
- `/hive status`: Refresh the UI status widget.
- `/hive tree`: View the hierarchical agent nest.
- `/hive logs`: Stream recent worker activity.
- `/hive plan`: Review the current `plan.md`.
- `/hive review`: Re-submit the plan to Plannotator.

## 📜 License

MIT
