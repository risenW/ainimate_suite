# Ainimate MCP Server

This is a Model Context Protocol (MCP) server for the Ainimate 2D animation app. It allows LLM clients to create and control 2D animations using the functions available in the Ainimate app.

## Features

- Project management (create, update, delete)
- Scene management
- Element creation (shapes, text, drawings)
- Animation tools (keyframes, playback)
- Predefined prompts for common animation tasks

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd ainimate-mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

## Usage

### Running the server

```bash
npm start
```

### Testing the server

```bash
npm test
```

### Connecting to Claude for Desktop

1. Open Claude for Desktop
2. Create or edit the configuration file at:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. You can use the provided `claude_desktop_config.json` file as a template:

```bash
# Copy the configuration file
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json  # macOS
# or
cp claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json  # Windows
```

4. Edit the configuration file to replace `REPLACE_WITH_ABSOLUTE_PATH` with the absolute path to the server directory.

5. Restart Claude for Desktop

## Available Tools

### Project Management

- `create-project`: Create a new animation project
  - Parameters: name, width, height, fps (optional)

### Scene Management

- `create-scene`: Create a new scene
  - Parameters: name

### Element Creation

- `create-shape`: Create a shape element
  - Parameters: sceneId, layerId, shapeType, x, y, width, height, radius, fill, stroke, strokeWidth
  - Supported shapes: rectangle, circle, ellipse, line

- `create-text`: Create a text element
  - Parameters: sceneId, layerId, text, x, y, fontSize, fontFamily, fill

### Animation Tools

- `capture-frame`: Capture the current state as a keyframe
  - Parameters: sceneId, frameNumber (optional)

## Available Prompts

- `create-stick-figure`: Creates a basic stick figure
  - Parameters: sceneId, layerId

- `create-bouncing-ball`: Creates a bouncing ball animation
  - Parameters: sceneId, layerId

## Example Usage with Claude

Once connected to Claude for Desktop, you can use the MCP server to create animations. Here are some example prompts:

### Creating a Simple Animation

```
Create a new animation project called "Bouncing Ball" with a canvas size of 800x600 pixels.
Then create a scene called "Main Scene" and add a red circle at position (400, 300) with a radius of 50 pixels.
Finally, capture frame 0 to start the animation.
```

### Creating a Stick Figure

```
Create a stick figure using the create-stick-figure prompt. First create a project called "Stick Figure" with a canvas size of 800x600 pixels, then create a scene called "Main Scene".
```

## Development

### Future Enhancements

See the [ROADMAP.md](ROADMAP.md) file for planned future enhancements.

### Building from source

```bash
npm run build
```

## License

MIT 
