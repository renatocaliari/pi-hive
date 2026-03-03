import { Type } from "@sinclair/typebox";
import fs from "node:fs";
import path from "node:path";

export default function(pi: any) {

  // ==========================================
  // 1. SLASH COMMANDS
  // ==========================================
  
  pi.registerCommand("hive", {
    description: "Hive Master Controller",
    async handler(args: string[], ctx: any) {
      const action = args[0];
      
      switch(action) {
        case "on":
        case "start":
          ctx.ui.notify("🐝 Activating Hive Mode...", "info");
          await ctx.bash("mkdir -p .hive/cells .hive/archive .hive/logs");
          return "Hive Mode is now ON. Use /skill load hive.md to begin orchestration.";
        case "status":
          await ctx.bash("pi --non-interactive 'Call get_hive_status()'");
          return "Status refreshed.";
        case "tree":
          await ctx.bash("pi --non-interactive 'Call render_hive_tree()'");
          return "Hierarchy updated.";
        default:
          ctx.ui.notify("Usage: /hive [on|start|status|tree|review]", "info");
          return;
      }
    }
  });

  // ==========================================
  // 2. PLANNING & TRIAGE (Enhanced with 0.55.4 features)
  // ==========================================

  pi.registerTool({
    name: "assess_task_complexity",
    label: "Assess Complexity",
    description: "Determines if a task should be executed directly or delegated to the Hive.",
    // NEW in 0.55.4: Guidelines injected directly into system prompt
    promptGuidelines: [
      "Use assess_task_complexity when a user request involves more than 3 distinct steps.",
      "If the recommendation is DELEGATE, you MUST create a .hive/plan.md."
    ],
    parameters: Type.Object({ task_description: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { task_description } = params;
      const isComplex = task_description.length > 200 || task_description.includes("and");
      const recommendation = isComplex ? "DELEGATE" : "DIRECT_EXECUTION";
      return { 
        content: [{ type: "text", text: `Recommendation: ${recommendation}` }]
      };
    }
  });

  pi.registerTool({
    name: "submit_to_plannotator",
    label: "Submit to Plannotator",
    description: "Uploads plan for visual review.",
    promptSnippet: "Hive Tool: Submits plans to Plannotator for visual human approval.",
    parameters: Type.Object({ plan_content: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const mockUrl = `https://plannotator.dev/view?local_file=.hive/plan.md`;
      await ctx.bash(`open "${mockUrl}" 2>/dev/null || xdg-open "${mockUrl}" 2>/dev/null || true`);
      return { content: [{ type: "text", text: `View plan: ${mockUrl}` }] };
    }
  });

  pi.registerTool({
    name: "delegate_task",
    label: "Delegate Task",
    description: "Spawns a worker in an isolated git worktree branch.",
    promptGuidelines: [
      "Each delegated task must have a clear spec.md.",
      "Always use worktrees to keep the main workspace clean."
    ],
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
      await ctx.bash(`git worktree add ${cellDir} ${branchName} 2>/dev/null || echo 'Exists'`);

      await ctx.bash(`cat <<EOF > ${cellDir}/spec.md\n# Task: ${task_id}\n\n${spec}\nEOF`);

      onUpdate(`[${task_id}] Worker running...`);
      const command = `cd ${cellDir} && pi --skill hive.md --non-interactive "Read spec.md and fulfill. Save to handoff.md."`;
      const { exitCode } = await ctx.bash(command);

      return { content: [{ type: "text", text: `Cell ${task_id}: ${exitCode === 0 ? "Completed" : "Failed"}` }] };
    }
  });

  // Monitoring tools (status, tree, etc.)
  pi.registerTool({
    name: "get_hive_status",
    label: "Check Hive Status",
    description: "Updates the status widget.",
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { stdout } = await ctx.bash("ls .hive/cells 2>/dev/null || echo ''");
      const cells = stdout.split("\n").filter(Boolean);
      let report = [];
      for (const cell of cells) {
        const hasHandoff = (await ctx.bash(`ls .hive/cells/${cell}/handoff.md 2>/dev/null`)).exitCode === 0;
        report.push({ Cell: cell, Status: hasHandoff ? "DONE" : "BUSY" });
      }
      if (ctx.ui.setWidget) ctx.ui.setWidget("hive-status", { title: "🐝 Hive Status", type: "table", data: report });
      return { content: [{ type: "text", text: "Status updated." }] };
    }
  });

  pi.registerTool({
    name: "render_hive_tree",
    label: "Show Hive Tree",
    description: "Updates the tree widget.",
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
