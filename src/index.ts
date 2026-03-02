import { Type } from "@sinclair/typebox";

export default function(pi: any) {

  // ==========================================
  // 1. PLANNOTATOR BIDIRECTIONAL TOOL
  // ==========================================
  
  pi.registerTool({
    name: "wait_for_plan_approval",
    label: "Wait for Approval",
    description: "Polls the .hive/plan.md for a Plannotator approval signature (APPROVED or REVISION_REQUESTED).",
    parameters: Type.Object({
      timeout_seconds: Type.Number({ default: 300 })
    }),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      const { timeout_seconds } = params;
      const startTime = Date.now();
      
      onUpdate("Waiting for Plannotator decision... (Check the browser tab)");
      ctx.ui.notify("Awaiting your approval in Plannotator.", "info");

      // Polling loop
      while (Date.now() - startTime < timeout_seconds * 1000) {
        const { stdout } = await ctx.bash("head -n 10 .hive/plan.md");
        
        if (stdout.includes("status: APPROVED")) {
          ctx.ui.notify("Plan Approved! Proceeding...", "success");
          return { content: [{ type: "text", text: "APPROVED" }] };
        }
        
        if (stdout.includes("status: REVISION_REQUESTED")) {
          const feedback = stdout.split("feedback:")[1]?.split("\n")[0] || "User requested changes.";
          ctx.ui.notify("Revision Requested!", "warning");
          return { content: [{ type: "text", text: `REVISION_REQUESTED: ${feedback}` }] };
        }

        // Wait 2 seconds before next poll
        await new Promise(r => setTimeout(r, 2000));
        if (signal?.aborted) return { content: [{ type: "text", text: "Polling cancelled." }] };
      }

      return { content: [{ type: "text", text: "TIMEOUT: No decision detected. Please approve manually or try again." }] };
    }
  });

  // ==========================================
  // 2. ENHANCED HIVE UI (The Nest Tree)
  // ==========================================

  pi.registerTool({
    name: "render_hive_tree",
    label: "Show Hive Hierarchy",
    description: "Renders a visual tree of the Queen and all Workers in a UI widget.",
    parameters: Type.Object({}),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      // We scan .hive/cells recursively to find nested hives
      const { stdout } = await ctx.bash("find .hive/cells -name '.hive' -type d 2>/dev/null | wc -l");
      const nestedCount = parseInt(stdout.trim());
      
      const { stdout: cells } = await ctx.bash("ls .hive/cells 2>/dev/null || echo ''");
      const activeCells = cells.split("\n").filter(Boolean);

      if (ctx.ui.setWidget) {
        // Creating a hierarchical view in the Pi UI
        ctx.ui.setWidget("hive-tree", {
          title: "🌳 The Hive Nest",
          type: "tree",
          data: {
            label: "Queen (Main)",
            children: activeCells.map(cell => ({
              label: `Worker: ${cell}`,
              status: "Active",
              children: nestedCount > 0 ? [{ label: "Sub-Hive detected" }] : []
            }))
          }
        });
      }

      return { content: [{ type: "text", text: `Tree updated with ${activeCells.length} workers.` }] };
    }
  });

  // ==========================================
  // 3. WORKER LOG STREAMER
  // ==========================================

  pi.registerTool({
    name: "stream_worker_logs",
    label: "Stream Logs",
    description: "Shows the last lines of activity from all active workers in a widget.",
    parameters: Type.Object({}),
    async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
      // We tail the result.md or handoff.md of each cell
      const { stdout } = await ctx.bash("tail -n 3 .hive/cells/*/handoff.md .hive/cells/*/spec.md 2>/dev/null || echo 'No logs yet'");
      
      if (ctx.ui.setWidget) {
        ctx.ui.setWidget("hive-logs", {
          title: "📜 Worker Activity",
          type: "text",
          content: stdout
        });
      }
      return { content: [{ type: "text", text: "Logs streamed to widget." }] };
    }
  });

  // Update slash command to include these
  pi.registerCommand("hive", {
    description: "Hive Master Controller",
    async handler(args: string[], ctx: any) {
      const cmd = args[0];
      if (cmd === "tree") {
        await ctx.bash("pi --non-interactive 'Call render_hive_tree()'");
      } else if (cmd === "logs") {
        await ctx.bash("pi --non-interactive 'Call stream_worker_logs()'");
      } else {
        ctx.ui.notify("Usage: /hive [tree|logs|status|review|plan]", "info");
      }
    }
  });

  console.log("Hive Protocol v5 (Visual Tree & Bidirectional Plannotator) Loaded.");
}
