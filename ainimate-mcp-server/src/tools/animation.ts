import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createElement, captureFrame } from "../utils/websocket.js";

/**
 * Registers animation tools with the MCP server
 * @param server - The MCP server instance
 */
export function registerAnimationTools(server: McpServer): void {
  // Create Animation Sequence Tool
  server.tool(
    "create-animation",
    {
      sceneId: z.string().describe("Scene ID"),
      frameCount: z.number().min(1).describe("Number of frames to create"),
      elements: z.array(z.object({
        layerId: z.string(),
        type: z.string(),
        properties: z.record(z.any()),
        startPosition: z.object({
          x: z.number(),
          y: z.number()
        }),
        endPosition: z.object({
          x: z.number(),
          y: z.number()
        }).optional()
      })).describe("Elements to animate"),
    },
    async ({ sceneId, frameCount, elements }) => {
      try {
        const results = [];

        // For each frame
        for (let frame = 0; frame < frameCount; frame++) {
          // Create interpolated elements for this frame
          for (const element of elements) {
            const position = element.endPosition 
              ? {
                  x: element.startPosition.x + (element.endPosition.x - element.startPosition.x) * (frame / (frameCount - 1)),
                  y: element.startPosition.y + (element.endPosition.y - element.startPosition.y) * (frame / (frameCount - 1))
                }
              : element.startPosition;

            // Create the element using WebSocket
            await createElement({
              type: element.type as 'shape' | 'text',
              layerType: 'midground',
              sceneId,
              layerId: element.layerId,
              position,
              properties: element.properties
            });
          }

          // Capture the frame using WebSocket
          const frameResponse = await captureFrame({
            sceneId,
            frameNumber: frame
          });

          results.push(frameResponse);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Created animation sequence with ${frameCount} frames`,
                frames: results
              })
            }
          ]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                message: `Failed to create animation: ${errorMessage}`,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );
} 
