import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useSceneStore } from '@/lib/store/scene-store';
import { useCanvasSettingsStore } from '@/lib/store/canvas-settings-store';
let ffmpeg = null;
export async function exportToMP4(scene, stage, settings) {
    // Store original settings
    const canvasSettings = useCanvasSettingsStore.getState();
    const originalSettings = { ...canvasSettings.settings };
    const originalSize = { width: stage.width(), height: stage.height() };
    try {
        if (!ffmpeg) {
            ffmpeg = new FFmpeg();
            await ffmpeg.load();
        }
        // Get frames from all layers
        const framesWithContent = scene.layers
            .flatMap(layer => layer.frames)
            .filter(f => f.elements.length > 0)
            .sort((a, b) => a.frameNumber - b.frameNumber);
        if (framesWithContent.length === 0) {
            throw new Error('No frames to export');
        }
        // Store original state
        const sceneStore = useSceneStore.getState();
        const originalElements = scene.layers.flatMap(layer => layer.elements);
        const originalFrame = sceneStore.currentFrame;
        // Apply export settings
        canvasSettings.updateSettings({
            showGrid: false,
            rulers: false
        });
        stage.width(settings.width);
        stage.height(settings.height);
        stage.scale({
            x: settings.width / originalSize.width,
            y: settings.height / originalSize.height
        });
        // Start from first frame
        const firstFrame = framesWithContent[0];
        sceneStore.setCurrentFrame(firstFrame.frameNumber);
        scene.layers.forEach(layer => layer.elements = [...firstFrame.elements]);
        stage.batchDraw();
        for (let i = 0; i < framesWithContent.length; i++) {
            // Update progress
            sceneStore.setExportProgress(Math.round((i / framesWithContent.length) * 100));
            // Play frame
            const frame = framesWithContent[i];
            scene.layers.forEach(layer => layer.elements = [...frame.elements]);
            stage.batchDraw();
            await new Promise(resolve => setTimeout(resolve, 50));
            // Capture frame
            const dataURL = stage.toDataURL({
                pixelRatio: settings.quality,
                mimeType: 'image/png',
                quality: 1
            });
            const response = await fetch(dataURL);
            const blob = await response.blob();
            await ffmpeg.writeFile(`frame_${i.toString().padStart(4, '0')}.png`, await fetchFile(blob));
        }
        // Restore original state
        scene.layers.forEach(layer => layer.elements = originalElements.filter(e => e.layerType === layer.type));
        sceneStore.setCurrentFrame(originalFrame);
        stage.batchDraw();
        // Restore original settings and size
        canvasSettings.updateSettings(originalSettings);
        stage.width(originalSize.width);
        stage.height(originalSize.height);
        stage.scale({ x: 1, y: 1 });
        // Generate video from frames
        await ffmpeg.exec([
            '-framerate', settings.fps.toString(),
            '-i', 'frame_%04d.png',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            'output.mp4'
        ]);
        // Read the output video
        const data = await ffmpeg.readFile('output.mp4');
        // Clean up temporary files
        for (let i = 0; i < framesWithContent.length; i++) {
            const filename = `frame_${i.toString().padStart(4, '0')}.png`;
            await ffmpeg.deleteFile(filename);
        }
        await ffmpeg.deleteFile('output.mp4');
        // Create and return download URL
        const videoBlob = new Blob([data], { type: 'video/mp4' });
        return URL.createObjectURL(videoBlob);
    }
    catch (error) {
        // Restore settings even if export fails
        useCanvasSettingsStore.getState().updateSettings(originalSettings);
        stage.width(originalSize.width);
        stage.height(originalSize.height);
        stage.scale({ x: 1, y: 1 });
        console.error('FFmpeg error:', error);
        throw error;
    }
}
