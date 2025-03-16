# Ainimate Development Workspace

This is the development workspace for Ainimate, containing all the necessary services for the animation platform.

## Services

- **WebSocket Server** (Port 3003): Handles state synchronization between services
- **MCP Server** (Port 3001): Main Control Program server
- **Next.js App** (Port 3000): Web application interface

## Development Setup

1. Install dependencies for all services:
```bash
yarn install
```

2. Start all services in development mode:
```bash
yarn dev
```

This will start the services in the following order:
1. WebSocket Server (waits until port 3003 is available)
2. MCP Server (waits until port 3001 is available)

Each service's output will be color-coded in the console for easy identification:
- WebSocket Server: Cyan
- MCP Server: Magenta

## Available Scripts

- `yarn dev`: Start all services in development mode
- `yarn build`: Build all services
- `yarn websocket`: Start only the WebSocket server
- `yarn mcp`: Start only the MCP server

## Development Notes

- The development script ensures services start in the correct order and wait for dependencies to be available
- All services run in watch mode, automatically recompiling on changes
- Press Ctrl+C to stop all services 
