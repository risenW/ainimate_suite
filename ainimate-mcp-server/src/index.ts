import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getWebSocketClient } from "./utils/websocket.js";

// Import tool registrations
import { registerProjectTools } from "./tools/project.js";
import { registerSceneTools } from "./tools/scene.js";
import { registerElementTools } from "./tools/element.js";
import { registerAnimationTools } from "./tools/animation.js";

// Import prompt registrations
import { registerPrompts } from "./prompts/index.js";

// Initialize WebSocket connection
getWebSocketClient();

// Create MCP server instance
const server = new McpServer({
  name: "ainimate-mcp",
  version: "1.0.0",
});

// Register all tools and prompts
registerProjectTools(server);
registerSceneTools(server);
registerElementTools(server);
registerAnimationTools(server);
registerPrompts(server);

// Connect to stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch((error: Error) => {
  console.error("Failed to connect to transport:", error);
  process.exit(1);
}); 
