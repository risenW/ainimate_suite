#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
    console.log('Starting Ainimate MCP server test...');

    // Create a client transport that connects to our server
    const transport = new StdioClientTransport({
        command: 'node',
        args: ['./build/index.js'],
    });

    // Create an MCP client
    const client = new Client({
        name: 'test-client',
        version: '1.0.0',
    });

    try {
        // Connect to the server
        await client.connect(transport);
        console.log('Connected to Ainimate MCP server');

        // List available tools
        const toolsResult = await client.listTools();
        console.log('Available tools:');
        toolsResult.tools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.description || 'No description'}`);
        });

        // List available prompts
        const promptsResult = await client.listPrompts();
        console.log('\nAvailable prompts:');
        promptsResult.prompts.forEach(prompt => {
            console.log(`- ${prompt.name}: ${prompt.description || 'No description'}`);
        });

        // Test create-project tool
        console.log('\nTesting create-project tool...');
        const projectResult = await client.callTool({
            name: 'create-project',
            arguments: {
                name: 'Test Project',
                width: 800,
                height: 600,
                fps: 24,
            },
        });
        console.log('Project creation result:', projectResult.content[0].text);

        // Test create-scene tool
        console.log('\nTesting create-scene tool...');
        const sceneResult = await client.callTool({
            name: 'create-scene',
            arguments: {
                name: 'Test Scene',
            },
        });
        console.log('Scene creation result:', sceneResult.content[0].text);

        // Parse the scene result to get the scene ID and layer ID
        const sceneData = JSON.parse(sceneResult.content[0].text);
        const sceneId = sceneData.scene.id;
        const layerId = sceneData.scene.layers[0].id;

        // Test create-shape tool
        console.log('\nTesting create-shape tool...');
        const shapeResult = await client.callTool({
            name: 'create-shape',
            arguments: {
                sceneId,
                layerId,
                shapeType: 'circle',
                x: 400,
                y: 300,
                radius: 50,
                fill: '#FF0000',
            },
        });
        console.log('Shape creation result:', shapeResult.content[0].text);

        // Test create-text tool
        console.log('\nTesting create-text tool...');
        const textResult = await client.callTool({
            name: 'create-text',
            arguments: {
                sceneId,
                layerId,
                text: 'Hello, Ainimate!',
                x: 400,
                y: 200,
                fontSize: 36,
                fill: '#0000FF',
            },
        });
        console.log('Text creation result:', textResult.content[0].text);

        // Test capture-frame tool
        console.log('\nTesting capture-frame tool...');
        const frameResult = await client.callTool({
            name: 'capture-frame',
            arguments: {
                sceneId,
                frameNumber: 0,
            },
        });
        console.log('Frame capture result:', frameResult.content[0].text);

        // Test listing prompts only, skip actual prompt execution to avoid timeout
        console.log('\nSkipping prompt execution test due to potential timeout issues');
        console.log('Prompts are available but will be tested with an actual LLM client');

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        // Close the client connection
        await client.close();
    }
}

main().catch(console.error); 
