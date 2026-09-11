import { elements } from '../dom.js';
import {
    noise,
    tone,
    startMorseVoice
} from '../audio.js';
import { showScene } from '../utils.js';
import { startButtonGame } from './scene4.js';

const TYPING_SPEED = 35;

let dialogueIndex = 0;
let dialogueIsTyping = false;
let typingTimer = null;
let stopCurrentMorseVoice = null;

const dialogues = [
    `¡¿Q-que haces aqui!? ¡¿Estas loca!?`,
    `E-ella esta observando... ¡Ella lo sabra! ¡Llegara aqui en cualquier momento!`,
    `...Aunque...Ella escondió algo por aqui... Algo valioso...`,
    `Toma esto, parece importante, yo no se que hacer con él...`,
    `Me dijeron que ayuda a ver lo que los ojos no pueden...suerte`
];

/*
 * Detiene la escritura, el sonido y la animación.
 * Al quitar "speaking" aparece automáticamente
 * el PNG de Webie con la boca cerrada.
 */
function stopWebieSpeaking() {
    dialogueIsTyping = false;

    if (typingTimer !== null) {
        window.clearInterval(typingTimer);
        typingTimer = null;
    }

    if (stopCurrentMorseVoice) {
        stopCurrentMorseVoice();
        stopCurrentMorseVoice = null;
    }

    elements.rider.classList.remove("speaking");

    const head = elements.scene3.querySelector(".webie-head");

    if (head) {
        head.classList.remove("tilt");
    }
}

function typeDialogue(text) {
    /*
     * Evita que el sonido o el temporizador anterior
     * continúen al iniciar otro diálogo.
     */
    stopWebieSpeaking();

    dialogueIsTyping = true;
    elements.dialogueText.textContent = "";

    /*
     * Mostrar el cuerpo y la cabeza que hablan.
     */
    elements.rider.classList.add("speaking");

    /*
     * Iniciar el sonido Morse.
     * Se detendrá cuando termine de aparecer el texto.
     */
    stopCurrentMorseVoice = startMorseVoice(text);

    let characterIndex = 0;

    typingTimer = window.setInterval(() => {
        elements.dialogueText.textContent +=
            text[characterIndex] ?? "";

        characterIndex += 1;

        if (characterIndex >= text.length) {
            /*
             * Asegura que el texto quede completo.
             */
            elements.dialogueText.textContent = text;

            /*
             * Detiene:
             * - sonido Morse;
             * - animación vertical;
             * - imagen con boca abierta.
             *
             * Después aparece el PNG cerrado.
             */
            stopWebieSpeaking();
        }
    }, TYPING_SPEED);
}

export function beginWebieScene() {
    stopWebieSpeaking();

    dialogueIndex = 0;

    elements.dialogueText.textContent = "";
    elements.rider.classList.remove("arrived", "speaking");
    elements.mask.classList.remove("lifted");

    /*
     * Reiniciar el botón si la escena vuelve a comenzar.
     */
    elements.dialogueNext.disabled = false;
    elements.dialogueNext.textContent = "Continuar ▸";

    /*
     * Reiniciar el talismán si la escena se repite.
     */
    elements.thrownTalisman.classList.remove("throw");

    noise(0.7, 0.08, 700);
    tone(75, 1, "sawtooth", 0.04);

    window.setTimeout(() => {
        elements.rider.classList.add("arrived");

        window.setTimeout(() => {
            elements.mask.classList.add("lifted");
            typeDialogue(dialogues[0]);
        }, 1150);
    }, 250);
}

export function setupScene3() {
    elements.dialogueNext.addEventListener("click", () => {
        /*
         * No permite continuar mientras Webie habla.
         */
        if (dialogueIsTyping) return;

        dialogueIndex += 1;

        if (dialogueIndex < dialogues.length) {
            typeDialogue(dialogues[dialogueIndex]);
            return;
        }

        stopWebieSpeaking();

        elements.dialogueNext.disabled = true;
        elements.dialogueNext.textContent = "Atrápalo…";

        elements.thrownTalisman.classList.add("throw");

        tone(310, 0.8, "sine", 0.05);
        noise(0.5, 0.04, 1300);

        window.setTimeout(() => {
            elements.rider.classList.remove("arrived");
        }, 700);

        window.setTimeout(() => {
            showScene("scene4");
            startButtonGame();
        }, 1500);
    });
}