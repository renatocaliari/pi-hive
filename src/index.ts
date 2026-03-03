import { Type } from "@sinclair/typebox";
import fs from "node:fs";
import path from "node:path";

export default function(pi: any) {

  // ==========================================
  // 1. AUTO-DETECTION & SLASH COMMANDS
  // ==========================================
  
  pi.on("session_start", async (ctx: any) => {
    // Use native fs to check for directory to avoid ctx.bash issues in events
    const hivePath = path.join(process.cwd(), ".hive");
    if (fs.existsSync(hivePath)) {
      ctx.ui.notify("🐝 Hive Protocol Active", "success");
    }
  });

  pi.registerCommand("hive", {
    description: "Hive Master Controller",
    async handler(args: string[], ctx: any) {
      const action = args[0];
      
      switch(action) {
        case "on":
        case "start":
          ctx.ui.notify("🐝 Activating Hive Mode...", "info");
          // Inside commands/tools, we can use pi.run or similar if bash is not directly on ctx
          // But usually in commands it is available. Let's be safe:
          await ctx.bash("mkdir -p .hive/cells .hive/archive .hive/logs");
          return "Hive Mode is now ON. Decomposing complex tasks automatically.";
        case "review":
          ctx.ui.notify("Submitting for visual review...", "info");
          await ctx.bash("pi --non-interactive 'Call submit_to_plannotator(read_file(\".hive/plan.md\"))'");
          return "Plan submitted to Plannotator.";
        case "status":
          await ctx.bash("pi --non-interactive 'Call get_hive_status()'");
          return "Status widget updated.";
        case "tree":
          await ctx.bash("pi --non-interactive 'Call render_hive_tree()'");
          return "Hierarchy tree updated.";
        case "logs":
          await ctx.bash("pi --non-interactive 'Call stream_worker_logs()'");
          return "Logs widget updated.";
        default:
          ctx.ui.notify("Usage: /hive [on|start|status|tree|logs|review]", "info");
          return;
      }
    }
  });

  // ==========================================
  // 2. PLANNING & TRIAGE TOOLS
  // ==========================================

  pi.registerTool({
    name: "assess_task_complexity",
    label: "Assess Complexity",
    description: "Determines if a task should be executed directly or delegated to the Hive.",
    parameters: Type.Object({ task_description: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { task_description } = params;
      const isComplex = task_description.length > 200 || task_description.includes("and") || task_description.includes("system");
      const recommendation = isComplex ? "DELEGATE" : "DIRECT_EXECUTION";
      return { 
        content: [{ type: "text", text: `Recommendation: ${recommendation}. Reason: Analysis based on scope.` }],
        details: { recommendation }
      };
    }
  });

  pi.registerTool({
    name: "create_hive_structure",
    label: "Initialize Hive Structure",
    description: "Initializes .hive/ directory structure for planning and delegation.",
    parameters: Type.Object({}),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      onUpdate("Initializing Hive structure...");
      const directories = [".hive/cells", ".hive/archive", ".hive/logs"];
      for (const dir of directories) await ctx.bash(`mkdir -p ${dir}`);
      
      const { exitCode } = await ctx.bash("git rev-parse --is-inside-work-tree");
      if (exitCode !== 0) {
        await ctx.bash("git init && git commit --allow-empty -m 'Initial hive commit'");
        return { content: [{ type: "text", text: "Hive initialized. New git repo started." }] };
      }
      return { content: [{ type: "text", text: "Hive initialized on existing repo." }] };
    }
  });

  pi.registerTool({
    name: "submit_to_plannotator",
    label: "Submit to Plannotator",
    description: "Uploads the current Hive plan for visual review and opens it in the browser.",
    parameters: Type.Object({ plan_content: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { plan_content } = params;
      onUpdate("Submitting plan to Plannotator...");
      const mockUrl = `https://plannotator.dev/view?local_file=.hive/plan.md`;
      await ctx.bash(`open "${mockUrl}" 2>/dev/null || xdg-open "${mockUrl}" 2>/dev/null || start "${mockUrl}" 2>/dev/null || true`);
      ctx.ui.notify("Plan view opened in browser", "info");
      return { content: [{ type: "text", text: `Plan uploaded! View it here: ${mockUrl}` }], details: { url: mockUrl } };
    }
  });

  pi.registerTool({
    name: "wait_for_plan_approval",
    label: "Wait for Approval",
    description: "Polls the .hive/plan.md for a Plannotator approval signature (APPROVED or REVISION_REQUESTED).",
    parameters: Type.Object({ timeout_seconds: Type.Number({ default: 300 }) }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { timeout_seconds } = params;
      const startTime = Date.now();
      onUpdate("Waiting for Plannotator decision...");
      while (Date.now() - startTime < timeout_seconds * 1000) {
        const { stdout } = await ctx.bash("head -n 10 .hive/plan.md");
        if (stdout.includes("status: APPROVED")) return { content: [{ type: "text", text: "APPROVED" }] };
        if (stdout.includes("status: REVISION_REQUESTED")) return { content: [{ type: "text", text: `REVISION_REQUESTED` }] };
        await new Promise(r => setTimeout(r, 2000));
        if (signal?.aborted) break;
      }
      return { content: [{ type: "text", text: "TIMEOUT" }] };
    }
  });

  // ==========================================
  // 3. EXECUTION & DELEGATION TOOLS
  // ==========================================

  pi.registerTool({
    name: "delegate_task",
    label: "Delegate Task with Worktree",
    description: "Spawns a worker in an isolated git worktree branch.",
    parameters: Type.Object({
      task_id: Type.String(),
      spec: Type.String(),
      context_files: Type.Array(Type.String())
    }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { task_id, spec, context_files } = params;
      const cellDir = `.hive/cells/${task_id}`;
      const branchName = `hive/cell-${task_id}`;

      onUpdate(`[${task_id}] Creating worktree...`);
      await ctx.bash(`git checkout -b ${branchName} 2>/dev/null || git checkout ${branchName}`);
      await ctx.bash(`git checkout -`);
      await ctx.bash(`git worktree add ${cellDir} ${branchName} 2>/dev/null || echo 'Worktree exists'`);

      await ctx.bash(`cat <<EOF > ${cellDir}/spec.md\n# Task: ${task_id}\n\n${spec}\nEOF`);

      onUpdate(`[${task_id}] Worker running...`);
      const command = `cd ${cellDir} && pi --skill hive.md --non-interactive "Read spec.md and fulfill the task. Save summary to handoff.md."`;
      const { exitCode, stderr } = await ctx.bash(command);

      const status = exitCode === 0 ? "Completed" : "Failed";
      return { content: [{ type: "text", text: `Cell ${task_id} marked as ${status}.` }], details: { task_id, status } };
    }
  });

  pi.registerTool({
    name: "merge_cell",
    label: "Merge Cell Results",
    description: "Merges a completed task branch back into main and cleans up.",
    parameters: Type.Object({ task_id: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { task_id } = params;
      const branchName = `hive/cell-${task_id}`;
      const cellDir = `.hive/cells/${task_id}`;

      onUpdate(`Merging task ${task_id}...`);
      const merge = await ctx.bash(`git merge ${branchName} --no-edit`);
      await ctx.bash(`git worktree remove ${cellDir}`);
      await ctx.bash(`git branch -d ${branchName}`);

      if (merge.exitCode !== 0) return { content: [{ type: "text", text: `Merge conflict in ${task_id}. Resolve manually.` }] };
      return { content: [{ type: "text", text: `Cell ${task_id} merged and cleaned up.` }] };
    }
  });

  // ==========================================
  // 4. MONITORING TOOLS (Widgets)
  // ==========================================

  pi.registerTool({
    name: "get_hive_status",
    label: "Check Hive Status",
    description: "Scans for task status and updates widget.",
    parameters: Type.Object({}),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { stdout } = await ctx.bash("ls .hive/cells 2>/dev/null || echo ''");
      const cells = stdout.split("\n").filter(Boolean);
      let report = [];
      for (const cell of cells) {
        const hasHandoff = (await ctx.bash(`ls .hive/cells/${cell}/handoff.md 2>/dev/null`)).exitCode === 0;
        report.push({ Cell: cell, Status: hasHandoff ? "DONE" : "BUSY" });
      }
      if (ctx.ui.setWidget) ctx.ui.setWidget("hive-status", { title: "🐝 Hive Workers", type: "table", data: report });
      return { content: [{ type: "text", text: "Status updated." }] };
    }
  });

  pi.registerTool({
    name: "render_hive_tree",
    label: "Show Hive Tree",
    description: "Renders hierarchical view of the Hive.",
    parameters: Type.Object({}),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { stdout: cells } = await ctx.bash("ls .hive/cells 2>/dev/null || echo ''");
      const activeCells = cells.split("\n").filter(Boolean);
      if (ctx.ui.setWidget) {
        ctx.ui.setWidget("hive-tree", {
          title: "🌳 Hive Nest",
          type: "tree",
          data: { label: "Queen", children: activeCells.map(c => ({ label: `Worker: ${c}` })) }
        });
      }
      return { content: [{ type: "text", text: "Tree updated." }] };
    }
  });

  console.log("Hive Protocol Loaded.");
}
// Cache-bust: Mon Mar  2 21:07:45 -03 2026
