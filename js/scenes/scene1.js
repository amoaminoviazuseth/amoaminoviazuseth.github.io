import { elements } from '../dom.js';
import { initializeAudio, mouseSteps, tone, doorCreak } from '../audio.js';
import { showScene } from '../utils.js';
import { playGifOnce, setTunnelExtended } from '../gif.js';

export function setupScene1() {
    if (elements.musicaFondo) {
        elements.musicaFondo.volume = 0.5;
    }

    elements.startExperience.addEventListener("click", () => {
        initializeAudio();

        if (elements.musicaFondo) {
            elements.musicaFondo.play().catch(error => console.log("Audio bloqueado:", error));
        }

        elements.soundGate.classList.add("closed");
        elements.mouseTracks.classList.add("walking");
        mouseSteps();

        setTimeout(() => {
            elements.invitation.classList.add("visible");
            elements.doorHint.classList.add("visible");
        }, 1450);
    });

    elements.littleDoor.addEventListener("click", () => {
        if (elements.littleDoor.classList.contains("open")) return;

        initializeAudio();
        elements.littleDoor.classList.add("open");
        elements.doorHint.classList.remove("visible");

        tone(690, 0.08, "triangle", 0.08);
        tone(510, 0.14, "sine", 0.05, 0.12);
        doorCreak();

        setTimeout(() => {
            if (elements.musicaFondo) {
                elements.musicaFondo.pause();
                elements.musicaFondo.currentTime = 0;
            }

            if (elements.audioSusurros) {
                elements.audioSusurros.volume = 0.5;
                elements.audioSusurros.play().catch(error => console.log("Audio bloqueado:", error));
            }

            showScene("scene2");
            // playGifOnce();

            setTimeout(() => {
                const tunel = elements.scene2.querySelector(".tunnel");
                const instruction = elements.scene2.querySelector(".tunnel-instruction");
                const progressTrack = elements.scene2.querySelector(".progress-track");

                if (!tunel || !instruction || !progressTrack) return;

                instruction.classList.add("visible");
                progressTrack.classList.add("visible");

                tunel.classList.add("tunnel-lastframe");
                tunel.classList.remove("tunnel");

                setTunnelExtended(true);
            }, 3950);
        }, 1300);
    });
}
