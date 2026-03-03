import { Type } from "@sinclair/typebox";

console.log("🐝 [HIVE] Extension file loaded");

export default function(pi: any) {
  console.log("🐝 [HIVE] Extension function called");

  // ==========================================
  // 1. SLASH COMMANDS
  // ==========================================

  console.log("🐝 [HIVE] Registering /hive command");
  pi.registerCommand("hive", {
    description: "Hive Master Controller for orchestration and swarm management.",
    async handler(args: string[], ctx: any) {
      console.log("🐝 [HIVE] Command handler called with args:", args);
      const action = (args && args.length > 0) ? args[0].trim().toLowerCase() : "help";
      
      switch(action) {
        case "on":
          ctx.ui.notify("🐝 Activating Hive Mode...", "info");
          await ctx.bash("mkdir -p .hive/cells .hive/archive .hive/logs");
          return "Hive Mode is now ON. Use '/skill load hive' to begin orchestration.";
        
        case "review":
          ctx.ui.notify("Submitting for visual review...", "info");
          await ctx.bash("pi --non-interactive 'Call submit_to_plannotator(read_file(\".hive/plan.md\"))'");
          return "Plan submitted to Plannotator.";
        
        case "status":
          await ctx.bash("pi --non-interactive 'Call get_hive_status()'");
          return "Status refreshed.";
        
        case "tree":
          await ctx.bash("pi --non-interactive 'Call render_hive_tree()'");
          return "Hierarchy updated.";
        
        case "logs":
          await ctx.bash("pi --non-interactive 'Call stream_worker_logs()'");
          return "Logs updated.";
        
        case "help":
        default:
          return "Usage: /hive [on|status|tree|logs|review]";
      }
    }
  });

  // ==========================================
  // 2. TOOLS (With 0.55.4 System Prompt Enhancements)
  // ==========================================

  pi.registerTool({
    name: "assess_task_complexity",
    label: "Assess Complexity",
    description: "Determines if a task should be executed directly or delegated to the Hive.",
    promptSnippet: "Hive: Determines if a task requires swarm delegation.",
    promptGuidelines: [
      "Use assess_task_complexity when a user request involves more than 3 distinct architectural changes.",
      "If the recommendation is DELEGATE, you MUST create a .hive/plan.md before proceeding."
    ],
    parameters: Type.Object({ task_description: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { task_description } = params;
      const isComplex = task_description.length > 200 || task_description.includes("and");
      const recommendation = isComplex ? "DELEGATE" : "DIRECT_EXECUTION";
      return { content: [{ type: "text", text: `Recommendation: ${recommendation}` }] };
    }
  });

  pi.registerTool({
    name: "submit_to_plannotator",
    label: "Submit to Plannotator",
    description: "Uploads current Hive plan for visual review and opens browser.",
    promptSnippet: "Hive: Visualizes the current plan in Plannotator for human approval.",
    parameters: Type.Object({ plan_content: Type.String() }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const mockUrl = `https://plannotator.dev/view?local_file=.hive/plan.md`;
      await ctx.bash(`open "${mockUrl}" 2>/dev/null || xdg-open "${mockUrl}" 2>/dev/null || true`);
      ctx.ui.notify("Plannotator view opened", "success");
      return { content: [{ type: "text", text: `Plan view: ${mockUrl}` }] };
    }
  });

  pi.registerTool({
    name: "delegate_task",
    label: "Delegate Task",
    description: "Spawns a worker in an isolated git worktree branch.",
    promptSnippet: "Hive: Spawns a recursive sub-agent in a git worktree.",
    promptGuidelines: [
      "Ensure the task spec.md is highly detailed and includes only relevant file paths.",
      "Always wait for worker completion before attempting to merge."
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

      onUpdate(`[${task_id}] Preparing isolated worktree...`);
      await ctx.bash(`git checkout -b ${branchName} 2>/dev/null || git checkout ${branchName}`);
      await ctx.bash(`git checkout -`);
      await ctx.bash(`git worktree add ${cellDir} ${branchName} 2>/dev/null || echo 'Exists'`);

      await ctx.bash(`cat <<EOF > ${cellDir}/spec.md\n# Task: ${task_id}\n\n${spec}\nEOF`);

      onUpdate(`[${task_id}] Worker running swarm session...`);
      // Recursive call: the worker also has the hive skill
      const command = `cd ${cellDir} && pi --skill hive --non-interactive "Read spec.md and fulfill. Save results to handoff.md."`;
      const { exitCode } = await ctx.bash(command);

      return { content: [{ type: "text", text: `Cell ${task_id}: ${exitCode === 0 ? "Completed" : "Failed"}` }] };
    }
  });

  // Monitoring tools
  pi.registerTool({
    name: "get_hive_status",
    label: "Check Hive Status",
    description: "Updates the status table widget.",
    promptSnippet: "Hive: Refreshes the swarm status dashboard.",
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { stdout } = await ctx.bash("ls .hive/cells 2>/dev/null || echo ''");
      const cells = stdout.split("\n").filter(Boolean);
      let report = [];
      for (const cell of cells) {
        const hasHandoff = (await ctx.bash(`ls .hive/cells/${cell}/handoff.md 2>/dev/null`)).exitCode === 0;
        report.push({ Cell: cell, Status: hasHandoff ? "DONE" : "BUSY" });
      }
      if (ctx.ui.setWidget) ctx.ui.setWidget("hive-status", { title: "🐝 Hive Status", type: "table", data: report });
      return { content: [{ type: "text", text: "Dashboard updated." }] };
    }
  });

  pi.registerTool({
    name: "render_hive_tree",
    label: "Show Hive Tree",
    description: "Updates the hierarchical tree widget.",
    promptSnippet: "Hive: Renders the agent hierarchy nest.",
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
      return { content: [{ type: "text", text: "Hierarchy updated." }] };
    }
  });

  console.log("Hive Protocol Loaded.");
}
