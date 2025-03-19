import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createElement, captureFrame } from "../utils/websocket.js";

/**
 * Registers element creation tools with the MCP server
 * @param server - The MCP server instance
 */
export function registerElementTools(server: McpServer): void {
  // Shape creation tool
  server.tool(
    "create-shape",
    {
      sceneId: z.string().describe("Scene ID"),
      layerId: z.string().describe("Layer ID"),
      shapeType: z.enum(["rectangle", "circle", "ellipse", "line"]).describe("Shape type"),
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().optional().describe("Width (for rectangle, ellipse)"),
      height: z.number().optional().describe("Height (for rectangle, ellipse)"),
      radius: z.number().optional().describe("Radius (for circle)"),
      fill: z.string().optional().describe("Fill color (hex)"),
      stroke: z.string().optional().describe("Stroke color (hex)"),
      strokeWidth: z.number().optional().describe("Stroke width"),
    },
    async ({ sceneId, layerId, shapeType, x, y, width, height, radius, fill, stroke, strokeWidth }) => {
      try {
        // Create the element
        const elementResponse = await createElement({
          type: 'shape',
          layerType: 'midground',
          sceneId,
          layerId,
          position: { x, y },
          properties: {
            shapeType,
            width: width || (radius ? radius * 2 : 100),
            height: height || (radius ? radius * 2 : 100),
            fill: fill || '#000000',
            stroke: stroke || '#000000',
            strokeWidth: strokeWidth || 1,
          },
        });

        if (!elementResponse.success) {
          throw new Error(elementResponse.message);
        }

        // Capture the frame to make the element visible
        const frameResponse = await captureFrame({ sceneId });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                element: elementResponse.element,
                frame: frameResponse
              }),
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
                message: `Failed to create shape: ${errorMessage}`,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Text creation tool
  server.tool(
    "create-text",
    {
      sceneId: z.string().describe("Scene ID"),
      layerId: z.string().describe("Layer ID"),
      text: z.string().describe("Text content"),
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      fontSize: z.number().optional().describe("Font size"),
      fontFamily: z.string().optional().describe("Font family"),
      fill: z.string().optional().describe("Text color (hex)"),
    },
    async ({ sceneId, layerId, text, x, y, fontSize, fontFamily, fill }) => {
      try {
        // Create the text element
        const elementResponse = await createElement({
          type: 'text',
          layerType: 'midground',
          sceneId,
          layerId,
          position: { x, y },
          properties: {
            text,
            fontSize: fontSize || 24,
            fontFamily: fontFamily || 'Arial',
            fill: fill || '#000000',
          },
        });

        if (!elementResponse.success) {
          throw new Error(elementResponse.message);
        }

        // Capture the frame to make the element visible
        const frameResponse = await captureFrame({ sceneId });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                element: elementResponse.element,
                frame: frameResponse
              }),
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
                message: `Failed to create text: ${errorMessage}`,
              }),
            },
          ],
          isError: true,
        };
      }
    }
  );
} 
