import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers prompts with the MCP server
 * @param server - The MCP server instance
 */
export function registerPrompts(server: McpServer): void {
  // Create a stick figure prompt
  server.prompt(
    "create-stick-figure",
    {
      sceneId: z.string(),
      layerId: z.string(),
    },
    ({ sceneId, layerId }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a stick figure in scene ${sceneId} on layer ${layerId}:
- Head: circle at (300, 100)
- Body: line from (300, 150) to (300, 250)
- Left arm: line from (300, 180) to (250, 200)
- Right arm: line from (300, 180) to (350, 200)
- Left leg: line from (300, 250) to (250, 350)
- Right leg: line from (300, 250) to (350, 350)

You can use the create-shape tool to create each part of the stick figure.`
          }
        }
      ]
    })
  );

  // Create a bouncing ball animation prompt
  server.prompt(
    "create-bouncing-ball",
    {
      sceneId: z.string(),
      layerId: z.string(),
    },
    ({ sceneId, layerId }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a bouncing ball animation in scene ${sceneId} on layer ${layerId}:
1. Create a red circle at (500, 50)
2. Add keyframe at frame 0 with y=50
3. Add keyframe at frame 15 with y=450 and easeIn
4. Add keyframe at frame 30 with y=150 and easeOut

You can use the create-shape tool to create the ball and the capture-frame tool to create keyframes.`
          }
        }
      ]
    })
  );

  // Create Scene prompt
  server.prompt(
    "create-scene",
    {
      name: z.string().describe("Scene name"),
    },
    ({ name }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a new scene called '${name}'`
          }
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `I'll help you create a new scene called '${name}'.\n\nLet me use the create-scene tool to set this up.`
          }
        }
      ]
    })
  );

  // Add Layer prompt
  server.prompt(
    "add-layer",
    {
      name: z.string().describe("Layer name"),
      type: z.enum(["background", "midground", "foreground"]).describe("Layer type"),
    },
    ({ name, type }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Add a ${type} layer called '${name}'`
          }
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `I'll help you add a ${type} layer named '${name}' to the current scene.\n\nFirst, let me get the current scene and check existing layers, then I'll create the new layer.`
          }
        }
      ]
    })
  );

  // Get Layer Info prompt
  server.prompt(
    "get-layer-info",
    {},
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "What is the current layer?"
          }
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: "I'll retrieve information about the current layer for you."
          }
        }
      ]
    })
  );
} 
