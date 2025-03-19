import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { handleStateRequests } from './handlers/state.js';
import { handleElementRequests } from './handlers/element.js';
import { handleFrameRequests } from './handlers/frame.js';
import { handleLayerRequests } from './handlers/layer.js';
const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer);
// Configure CORS after server creation
io.engine.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}));
// Create state manager
const stateManager = {
    state: {
        currentProject: null,
        scenes: [],
        activeScene: null,
        currentFrame: 0,
        isPlaying: false,
        activeLayer: null
    },
    setState(newState) {
        this.state = { ...this.state, ...newState };
        // Broadcast state update to all clients
        io.emit('state_update', this.state);
    },
    getState() {
        return this.state;
    }
};
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Register handlers with state manager
    handleStateRequests(socket, io, stateManager);
    handleElementRequests(socket, io, stateManager);
    handleFrameRequests(socket, io, stateManager);
    handleLayerRequests(socket, io, stateManager);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 3003;
httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});
