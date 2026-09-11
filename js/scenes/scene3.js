import { elements } from '../dom.js';
import { noise, tone } from '../audio.js';
import { showScene } from '../utils.js';
import { startButtonGame } from './scene4.js';

let dialogueIndex = 0;
let dialogueIsTyping = false;

const dialogues = [
    `¡¿Q-que haces aqui!? ¡¿Estas loca!?`,
    `E-ella esta observando... ¡Ella lo sabra! ¡Llegara aqui en cualquier momento!`,
    `...Aunque...Ella escondió algo por aqui... Algo valioso...`, 
    `Toma esto, parece importante, yo no se que hacer con él jeje...`,
    `Me dijeron que ayuda a ver lo que los ojos no pueden...suerte`
];

export function beginWebieScene() {
    dialogueIndex = 0;
    elements.dialogueText.textContent = "";
    elements.rider.classList.remove("arrived");
    elements.mask.classList.remove("lifted");

    noise(0.7, 0.08, 700);
    tone(75, 1, "sawtooth", 0.04);

    setTimeout(() => {
        elements.rider.classList.add("arrived");

        setTimeout(() => {
            elements.mask.classList.add("lifted");
            typeDialogue(dialogues[0]);
            moveHead(dialogues[0]);
        }, 1150);
    }, 250);
}

function typeDialogue(text) {
    dialogueIsTyping = true;
    elements.dialogueText.textContent = "";
    let index = 0;

    const typing = setInterval(() => {
        elements.dialogueText.textContent += text[index] || "";
        index += 1;

        if (index >= text.length) {
            dialogueIsTyping = false;
            clearInterval(typing);
        }
    }, 20);
}

function moveHead(text) {
    let index = 0;

    const headInterval = setInterval(() => {
        index += 10;
        elements.scene3.querySelector(".webie-head").classList.toggle("tilt");

        if (index >= text.length) {
            clearInterval(headInterval);
        }
    }, 200);
}

export function setupScene3() {
    elements.dialogueNext.addEventListener("click", () => {
        if (dialogueIsTyping) return;

        dialogueIndex += 1;

        if (dialogueIndex < dialogues.length) {
            typeDialogue(dialogues[dialogueIndex]);
            moveHead(dialogues[dialogueIndex]);
            return;
        }

        elements.dialogueNext.disabled = true;
        elements.dialogueNext.textContent = "Atrápalo…";

        elements.thrownTalisman.classList.add("throw");
        tone(310, 0.8, "sine", 0.05);
        noise(0.5, 0.04, 1300);

        setTimeout(() => {
            elements.rider.classList.remove("arrived");
        }, 700);

        setTimeout(() => {
            showScene("scene4");
            startButtonGame();
        }, 1500);
    });
}
