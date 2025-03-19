# Ainimate MCP WebSocket Server

This is the WebSocket server that handles state synchronization between the Ainimate MCP and Next.js application.

## Setup

1. Install dependencies:
```bash
yarn
```

2. Build the TypeScript code:
```bash
yarn build
```

3. Start the server:
```bash
yarn start
```

For development with hot reloading:
```bash
yarn dev
```

## WebSocket Events

### Client -> Server
- `request_state`: Request the current state
- `update_state`: Update the current state with new data

### Server -> Client
- `state_update`: Emitted when state changes or when requested

## State Structure

The state includes:
- Current project information
- List of scenes
- Active scene
- Current frame number
- Playback status

## Default Configuration

- Server runs on port 3003 (configurable via PORT environment variable)
- CORS enabled for:
  - Next.js app (localhost:3000)
  - MCP server (localhost:3001)
- WebSocket transport only 
