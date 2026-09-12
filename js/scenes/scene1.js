import { elements } from '../dom.js';
import {
    initializeAudio,
    mouseSteps,
    tone,
    doorCreak
} from '../audio.js';
import { showScene } from '../utils.js';
import { setTunnelExtended } from '../gif.js';
import {
    requestImmersiveMode
} from '../orientation.js';


let menuMusicIsPlaying = false;

function playMenuMusic() {
    if (!elements.audioMenu) {
        console.warn("No se encontró #audioMenu.");
        return;
    }

    elements.audioMenu.volume = 0.45;

    const playPromise = elements.audioMenu.play();

    if (playPromise) {
        playPromise
            .then(() => {
                menuMusicIsPlaying = true;

                if (elements.enableMenuMusic) {
                    elements.enableMenuMusic.classList.add("playing");
                    elements.enableMenuMusic.textContent =
                        "♫ Música activada";
                }
            })
            .catch((error) => {
                console.warn(
                    "El navegador bloqueó la música del menú:",
                    error
                );
            });
    }
}

function toggleMenuMusic() {
    initializeAudio();

    elements.startExperience.addEventListener(
        "click",
        async () => {
            initializeAudio();

            /*
             * Debe ejecutarse directamente desde el clic.
             * De lo contrario el navegador puede rechazarlo.
             */
            await requestImmersiveMode();

            if (elements.musicaFondo) {
                elements.musicaFondo
                    .play()
                    .catch((error) => {
                        console.log(
                            "Audio bloqueado:",
                            error
                        );
                    });
            }

            elements.soundGate.classList.add("closed");
            elements.mouseTracks.classList.add("walking");

            mouseSteps();

            window.setTimeout(() => {
                elements.invitation.classList.add(
                    "visible"
                );

                elements.doorHint.classList.add(
                    "visible"
                );
            }, 1450);
        }
    );

    if (!elements.audioMenu) return;

    if (menuMusicIsPlaying) {
        elements.audioMenu.pause();
        menuMusicIsPlaying = false;

        elements.enableMenuMusic?.classList.remove("playing");

        if (elements.enableMenuMusic) {
            elements.enableMenuMusic.textContent =
                "♫ Activar música";
        }

        return;
    }

    playMenuMusic();
}

function stopMenuMusic() {
    if (!elements.audioMenu) return;

    elements.audioMenu.pause();
    elements.audioMenu.currentTime = 0;
    menuMusicIsPlaying = false;
}

function startSceneOneMusic() {
    if (!elements.musicaFondo) return;

    elements.musicaFondo.volume = 0.5;
    elements.musicaFondo.currentTime = 0;

    elements.musicaFondo.play().catch((error) => {
        console.warn(
            "No se pudo reproducir la música de la escena 1:",
            error
        );
    });
}

function startTunnelAmbience() {
    if (!elements.audioSusurros) {
        console.warn("No se encontró #audioSusurros.");
        return;
    }

    elements.audioSusurros.volume = 0.3;
    elements.audioSusurros.currentTime = 0;

    elements.audioSusurros.play().catch((error) => {
        console.warn(
            "No se pudo reproducir el audio del túnel:",
            error
        );
    });
}

export function setupScene1() {
    /*
     * Intentamos reproducir la canción del menú.
     * En algunos navegadores funcionará; en otros será
     * necesario presionar "Activar música".
     */
    if (elements.audioMenu) {
        elements.audioMenu.volume = 0.45;

        elements.audioMenu.play()
            .then(() => {
                menuMusicIsPlaying = true;

                if (elements.enableMenuMusic) {
                    elements.enableMenuMusic.classList.add("playing");
                    elements.enableMenuMusic.textContent =
                        "♫ Música activada";
                }
            })
            .catch(() => {
                /*
                 * Es normal que falle por las políticas
                 * de reproducción automática.
                 */
            });

        elements.audioMenu.addEventListener("error", () => {
            console.error(
                "Error cargando la música del menú:",
                elements.audioMenu.currentSrc,
                elements.audioMenu.error
            );
        });
    }

    elements.enableMenuMusic?.addEventListener(
        "click",
        toggleMenuMusic
    );

    elements.startExperience.addEventListener("click", () => {
        initializeAudio();

        stopMenuMusic();
        startSceneOneMusic();

        elements.soundGate.classList.add("closed");
        elements.mouseTracks.classList.add("walking");

        mouseSteps();

        window.setTimeout(() => {
            elements.invitation.classList.add("visible");
            elements.doorHint.classList.add("visible");
        }, 1450);
    });

    elements.littleDoor.addEventListener("click", () => {
        if (
            elements.littleDoor.classList.contains("open")
        ) {
            return;
        }

        initializeAudio();

        elements.littleDoor.classList.add("open");
        elements.doorHint.classList.remove("visible");

        tone(690, 0.08, "triangle", 0.08);
        tone(510, 0.14, "sine", 0.05, 0.12);
        doorCreak();

        window.setTimeout(() => {
            if (elements.musicaFondo) {
                elements.musicaFondo.pause();
                elements.musicaFondo.currentTime = 0;
            }

            /*
             * Iniciar los susurros antes de mostrar
             * la escena 2. Sigue siendo consecuencia
             * directa del clic sobre la puerta.
             */
            startTunnelAmbience();

            showScene("scene2");

            window.setTimeout(() => {
                const tunnel = elements.scene2.querySelector(
                    ".tunnel"
                );

                const instruction =
                    elements.scene2.querySelector(
                        ".tunnel-instruction"
                    );

                const progressTrack =
                    elements.scene2.querySelector(
                        ".progress-track"
                    );

                if (
                    !tunnel ||
                    !instruction ||
                    !progressTrack
                ) {
                    return;
                }

                instruction.classList.add("visible");
                progressTrack.classList.add("visible");

                tunnel.classList.add("tunnel-lastframe");
                tunnel.classList.remove("tunnel");

                setTunnelExtended(true);
            }, 3950);
        }, 1300);
    });
}