import { useCallback, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { useSceneStore, type SceneElement } from '@/lib/store/scene-store';
import { useToolStore } from '@/lib/store/tool-store';
import { generateId } from '@/lib/utils';

export function useCanvasHandlers() {
    const isDrawing = useRef(false);
    const currentLine = useRef<{ points: number[]; id: string } | null>(null);
    const { activeTool } = useToolStore();
    const { activeScene, addElement, updateElement, setSelectedElement } = useSceneStore();

    const handleStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        e.evt.preventDefault();

        if (activeTool !== 'pencil' ) {
            if (activeTool === 'select') {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) {
                    setSelectedElement(null);
                }
            }
            return;
        }

        const stage = e.target.getStage();
        if (!stage || !activeScene) return;

        // Find first unlocked visible layer
        const layer = activeScene.layers.find(l => !l.locked && l.visible);
        if (!layer) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        // Convert position to account for stage scale and position
        const x = (pos.x - stage.x()) / stage.scaleX();
        const y = (pos.y - stage.y()) / stage.scaleY();

        isDrawing.current = true;
        const elementId = generateId();

        // Create new line element
        const newLine = {
            id: elementId,
            type: "drawing",
            layerType: layer.type,
            position: { x: 0, y: 0 },
            rotation: 0,
            scale: { x: 1, y: 1 },
            properties: {
                points: [x, y],
                stroke: "#000000",
                strokeWidth: 2,
                tension: 0.5,
                lineCap: "round",
                lineJoin: "round"
            }
        } as SceneElement;

        addElement(activeScene.id, layer.id, newLine);
        currentLine.current = { points: [x, y], id: elementId };
    }, [activeTool, activeScene, addElement, setSelectedElement]);

    const handleStageMouseMove = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isDrawing.current || !currentLine.current || !activeScene || activeTool !== 'pencil') return;

        e.evt.preventDefault();
        
        const stage = e.target.getStage();
        if (!stage) return;

        const layer = activeScene.layers.find(l => !l.locked && l.visible);
        if (!layer) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        // Convert position to account for stage scale and position
        const x = (pos.x - stage.x()) / stage.scaleX();
        const y = (pos.y - stage.y()) / stage.scaleY();

        // Add new point
        const newPoints = [...currentLine.current.points, x, y];
        currentLine.current.points = newPoints;

        // Update the line element with new points
        updateElement(activeScene.id, layer.id, currentLine.current.id, {
            properties: {
                points: newPoints,
                stroke: "#000000",
                strokeWidth: 2,
                tension: 0.5,
                lineCap: "round",
                lineJoin: "round"
            }
        });
    }, [activeScene, updateElement, activeTool]);

    const handleStageMouseUp = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isDrawing.current || !currentLine.current || !activeScene) return;

        e.evt.preventDefault();

        const layer = activeScene.layers.find(l => !l.locked && l.visible);
        if (!layer) return;

        // Ensure the final state of the line is saved
        if (currentLine.current.points.length > 2) {
            updateElement(activeScene.id, layer.id, currentLine.current.id, {
                properties: {
                    points: currentLine.current.points,
                    stroke: "#000000",
                    strokeWidth: 2,
                    tension: 0.5,
                    lineCap: "round",
                    lineJoin: "round"
                }
            });
        }

        isDrawing.current = false;
        currentLine.current = null;
    }, [activeScene, updateElement]);

    return {
        handleStageMouseDown,
        handleStageMouseMove,
        handleStageMouseUp
    };
} 
