import { spawn } from 'child_process';
import waitOn from 'wait-on';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

// Colors for console output
const colors = {
    websocket: '\x1b[36m', // Cyan
    mcp: '\x1b[35m',       // Magenta
    app: '\x1b[32m',       // Green
    reset: '\x1b[0m'
};

function prefixOutput(prefix, color) {
    return (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log(`${color}[${prefix}]${colors.reset} ${line}`);
            }
        });
    };
}

async function startService(name, command, args = [], waitForPort = null) {
    console.log(`\n${colors[name]}Starting ${name} service...${colors.reset}`);

    const process = spawn(command, args, {
        cwd: ROOT_DIR,
        shell: true,
        stdio: 'pipe'
    });

    process.stdout.on('data', prefixOutput(name, colors[name]));
    process.stderr.on('data', prefixOutput(name, colors[name]));

    if (waitForPort) {
        try {
            await waitOn({
                resources: [`tcp:${waitForPort}`],
                timeout: 30000,
                interval: 100,
            });
            console.log(`${colors[name]}${name} is ready on port ${waitForPort}${colors.reset}`);
        } catch (error) {
            console.error(`${colors[name]}Failed to start ${name}: ${error.message}${colors.reset}`);
            process.kill();
            throw error;
        }
    }

    return process;
}

async function main() {
    try {
        // Start WebSocket server first
        await startService('websocket', 'yarn', ['websocket'], 3003);

        // Start MCP server without waiting for a port since it uses stdio
        await startService('mcp', 'yarn', ['mcp']);

        // Start Next.js app last
        await startService('app', 'yarn', ['app'], 3000);

        console.log('\n🚀 All services are running!\n');
        console.log('Access points:');
        console.log('- Next.js App: http://localhost:3000');
        console.log('- WebSocket Server: ws://localhost:3003');

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\nShutting down all services...');
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start services:', error);
        process.exit(1);
    }
}

main(); 
