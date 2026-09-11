import { elements } from '../dom.js';
import { swish, tone, speakWhisper } from '../audio.js';
import { showScene } from '../utils.js';
import { tunnelExtended } from '../gif.js';
import { beginWebieScene } from './scene3.js';

let tunnelClicks = 0;

export function setupScene2() {
    elements.scene2.addEventListener("click", () => {
        if (!elements.scene2.classList.contains("active")) return;
        if (!tunnelExtended) return;
        if (tunnelClicks >= 10) return;

        tunnelClicks += 1;
        swish();

        const tunel = elements.scene2.querySelector(".tunnel-lastframe");
        if (!tunel) return;

        tunel.style.backgroundSize = `${100 + tunnelClicks * 5}%`;

        const activeHand = tunnelClicks % 2 === 1 ? elements.leftHand : elements.rightHand;

        activeHand.classList.remove("pull");
        void activeHand.offsetWidth;
        activeHand.classList.add("pull");

        elements.tunnelProgress.style.width = `${tunnelClicks * 10}%`;

        if (tunnelClicks === 4 || tunnelClicks === 8) {
            elements.whisper.classList.remove("speaking");
            void elements.whisper.offsetWidth;
            elements.whisper.classList.add("speaking");
            speakWhisper();
        }

        if (tunnelClicks === 10) {
            tone(90, 1.2, "sine", 0.08);

            if (elements.audioSusurros) {
                elements.audioSusurros.pause();
                elements.audioSusurros.currentTime = 0;
            }

            setTimeout(() => {
                showScene("scene3");
                beginWebieScene();
            }, 850);
        }
    });
}
