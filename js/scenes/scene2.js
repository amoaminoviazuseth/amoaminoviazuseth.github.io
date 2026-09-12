import { elements } from '../dom.js';
import { swish, tone } from '../audio.js';
import { showScene } from '../utils.js';
import { tunnelExtended } from '../gif.js';
import { beginWebieScene } from './scene3.js';

const MAX_TUNNEL_CLICKS = 10;
const FIRST_WITCH_CLICK = 2;
const SECOND_WITCH_CLICK = 7;

let tunnelClicks = 0;
let scene2WasSetup = false;
let witchIsSpeaking = false;
let tunnelIsFinishing = false;

let firstWitchAudioPlayed = false;
let secondWitchAudioPlayed = false;
let activeWitchAudio = null;

function showWitchMessage(message) {
    if (!elements.whisper) return;

    elements.whisper.textContent = message;
    elements.whisper.classList.remove("speaking");

    void elements.whisper.offsetWidth;

    elements.whisper.classList.add("speaking");
}

function restoreTunnelAmbience() {
    if (!elements.audioSusurros) return;

    elements.audioSusurros.volume = 0.3;
}

function stopWitchAudio() {
    if (activeWitchAudio) {
        activeWitchAudio.pause();
        activeWitchAudio.currentTime = 0;
        activeWitchAudio = null;
    }

    witchIsSpeaking = false;

    elements.whisper?.classList.remove("speaking");

    restoreTunnelAmbience();
}

function playWitchAudio(audioElement, message) {
    if (!audioElement) {
        console.error(
            "No se encontró el audio de la bruja."
        );

        return;
    }

    witchIsSpeaking = true;
    activeWitchAudio = audioElement;

    /*
     * Bajar los susurros para que la voz destaque.
     */
    if (elements.audioSusurros) {
        elements.audioSusurros.volume = 0.08;
    }

    showWitchMessage(message);

    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement.volume = 1;

    const finishVoice = () => {
        if (activeWitchAudio === audioElement) {
            activeWitchAudio = null;
        }

        witchIsSpeaking = false;
        elements.whisper?.classList.remove("speaking");
        restoreTunnelAmbience();
    };

    audioElement.onended = finishVoice;

    audioElement.onerror = () => {
        console.error(
            "Error reproduciendo el audio:",
            audioElement.currentSrc,
            audioElement.error
        );

        finishVoice();
    };

    const playPromise = audioElement.play();

    if (playPromise) {
        playPromise.catch((error) => {
            console.error(
                "El navegador rechazó el audio de la bruja:",
                error,
                "Ruta:",
                audioElement.currentSrc
            );

            finishVoice();
        });
    }
}

function handleWitchVoices() {
    if (
        tunnelClicks === FIRST_WITCH_CLICK &&
        !firstWitchAudioPlayed
    ) {
        firstWitchAudioPlayed = true;

        playWitchAudio(
            elements.audioBruja0,
            "Así que… has vuelto."
        );

        return;
    }

    if (
        tunnelClicks === SECOND_WITCH_CLICK &&
        !secondWitchAudioPlayed
    ) {
        secondWitchAudioPlayed = true;

        playWitchAudio(
            elements.audioBruja1,
            "Tú sabes… que te quiero mucho."
        );
    }
}

function finishTunnel() {
    if (tunnelIsFinishing) return;

    tunnelIsFinishing = true;

    if (elements.audioSusurros) {
        elements.audioSusurros.pause();
        elements.audioSusurros.currentTime = 0;
    }

    stopWitchAudio();

    tone(90, 1.2, "sine", 0.08);

    window.setTimeout(() => {
        showScene("scene3");
        beginWebieScene();
    }, 850);
}

function advanceTunnel() {
    if (!elements.scene2?.classList.contains("active")) {
        return;
    }

    if (!tunnelExtended) return;
    if (tunnelIsFinishing) return;

    /*
     * Evita que el usuario corte la frase avanzando
     * demasiado rápido.
     */
    if (witchIsSpeaking) return;

    if (tunnelClicks >= MAX_TUNNEL_CLICKS) return;

    tunnelClicks += 1;

    swish();

    const tunnel = elements.scene2.querySelector(
        ".tunnel-lastframe"
    );

    if (tunnel) {
        tunnel.style.backgroundSize =
            `${100 + tunnelClicks * 5}%`;
    }

    const activeHand =
        tunnelClicks % 2 === 1
            ? elements.leftHand
            : elements.rightHand;

    if (activeHand) {
        activeHand.classList.remove("pull");
        void activeHand.offsetWidth;
        activeHand.classList.add("pull");
    }

    if (elements.tunnelProgress) {
        elements.tunnelProgress.style.width =
            `${tunnelClicks * 10}%`;
    }

    handleWitchVoices();

    if (tunnelClicks === MAX_TUNNEL_CLICKS) {
        finishTunnel();
    }
}

function prepareWitchAudio(audioElement, name) {
    if (!audioElement) {
        console.error(
            `No se encontró el elemento de audio ${name}.`
        );

        return;
    }

    audioElement.preload = "auto";
    audioElement.load();

    audioElement.addEventListener("loadeddata", () => {
        console.log(
            `${name} cargado correctamente:`,
            audioElement.currentSrc
        );
    });

    audioElement.addEventListener("error", () => {
        console.error(
            `No se pudo cargar ${name}:`,
            audioElement.currentSrc,
            audioElement.error
        );
    });
}

export function setupScene2() {
    if (scene2WasSetup) return;

    scene2WasSetup = true;

    prepareWitchAudio(
        elements.audioBruja0,
        "audioBruja0"
    );

    prepareWitchAudio(
        elements.audioBruja1,
        "audioBruja1"
    );

    elements.scene2.addEventListener(
        "click",
        advanceTunnel
    );
}