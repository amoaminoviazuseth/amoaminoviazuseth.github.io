import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { setupScene1 } from './scenes/scene1.js';
import { setupScene2 } from './scenes/scene2.js';
import { setupScene3 } from './scenes/scene3.js';
import { setupScene4 } from './scenes/scene4.js';
import { setupScene5 } from './scenes/scene5.js';

function insertPhoto(containerId, source) {
    if (!source) return;

    const container = document.querySelector(containerId);
    if (!container) return;
    
    const image = document.createElement("img");

    image.src = source;
    image.alt = "Un recuerdo de nosotros";

    container.textContent = "";
    container.appendChild(image);
}

function applyCustomization() {
    document.querySelectorAll("[data-girlfriend-name]").forEach((element) => {
        element.textContent = CONFIG.girlfriendName;
    });

    if (elements.letterText) {
        elements.letterText.textContent = CONFIG.letter;
    }
    if (elements.signature) {
        elements.signature.textContent = CONFIG.signature;
    }

    insertPhoto("#photoOne", CONFIG.photoOne);
    insertPhoto("#photoTwo", CONFIG.photoTwo);
}

document.addEventListener('DOMContentLoaded', () => {
    applyCustomization();
    
    setupScene1();
    setupScene2();
    setupScene3();
    setupScene4();
    setupScene5();
});
