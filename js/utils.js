import { elements } from './dom.js';

export function showScene(sceneId) {
    elements.scenes.forEach((scene) => {
        scene.classList.toggle("active", scene.id === sceneId);
    });
}
