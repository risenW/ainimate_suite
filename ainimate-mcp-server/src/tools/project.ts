import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getCurrentState } from "../utils/websocket.js";

export function registerProjectTools(server: McpServer) {
  server.tool(
    "get_current_project",
    {},
    () => {
      try {
        const state = getCurrentState();
        console.log("Current state:", state);
        
        if (!state.currentProject) {
          throw new Error("No project is currently loaded");
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(state.currentProject, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              message: `Failed to get current project: ${errorMessage}`
            })
          }],
          isError: true
        };
      }
    }
  );
}
