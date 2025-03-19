import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getActiveScene, getCurrentLayer, createLayer } from "../utils/websocket.js";

/**
 * Registers scene management tools with the MCP server
 * @param server - The MCP server instance
 */
export function registerSceneTools(server: McpServer): void {
  // Get Current Scene Tool
  server.tool(
    "get-current-scene",
    {},
    async () => {
      const activeScene = getActiveScene();
      
      if (!activeScene) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "No active scene found",
              }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              scene: activeScene,
            }),
          },
        ],
      };
    }
  );

  // Get Current Layer Tool
  server.tool(
    "get-current-layer",
    {},
    async () => {
      const activeLayer = getCurrentLayer();
      
      if (!activeLayer) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "No active layer found",
              }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              layer: activeLayer,
            }),
          },
        ],
      };
    }
  );

  // Create Layer Tool
  server.tool(
    "create-layer",
    {
      sceneId: z.string().describe("Scene ID"),
      name: z.string().describe("Layer name"),
      type: z.enum(["background", "midground", "foreground"]).describe("Layer type"),
    },
    async ({ sceneId, name, type }) => {
      try {
        const response = await createLayer({
          sceneId,
          name,
          type
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                message: `Failed to create layer: ${errorMessage}`,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );
} 
