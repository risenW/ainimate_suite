import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { useSceneStore } from './lib/store/scene-store.js';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url || '', true);
        handle(req, res, parsedUrl);
    });
    // Create Socket.IO server
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    console.log('Socket.IO server initialized');
    // Subscribe to scene store changes
    useSceneStore.subscribe((state) => {
        io.emit('state_update', {
            scenes: state.scenes,
            activeScene: state.activeScene,
            currentFrame: state.currentFrame,
            isPlaying: state.isPlaying,
        });
    });
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        // Send initial state
        try {
            const state = useSceneStore.getState();
            socket.emit('state_update', {
                scenes: state.scenes,
                activeScene: state.activeScene,
                currentFrame: state.currentFrame,
                isPlaying: state.isPlaying,
            });
        }
        catch (error) {
            console.error('Error sending initial state:', error);
        }
        // Handle incoming messages
        socket.on('element_created', (data) => {
            socket.broadcast.emit('element_created', data);
        });
        socket.on('element_updated', (data) => {
            socket.broadcast.emit('element_updated', data);
        });
        socket.on('frame_captured', (data) => {
            socket.broadcast.emit('frame_captured', data);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
    server.listen(3000, () => {
        console.log('> Ready on http://localhost:3000');
    });
});
