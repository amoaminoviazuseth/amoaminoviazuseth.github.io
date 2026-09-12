import { elements } from '../dom.js';
import {
    metallicClack,
    noise,
    tone,
    collectSound
} from '../audio.js';
import { showScene } from '../utils.js';
import {
    createFinalGarden,
    startMusicBoxScene5
} from './scene5.js';

const MAX_DANGER = 100;
const SOUL_HOLD_TIME = 1500;

let collected = 0;
let danger = 0;
let gameRunning = false;
let dangerTimeout = null;
let dragging = false;

/*
 * Guarda el temporizador individual de cada alma.
 */
const soulHoldTimers = new Map();

export let lensX = window.innerWidth * 0.5;
export let lensY = window.innerHeight * 0.75;

/* ==================================================
   MÚSICA DEL MINIJUEGO
   ================================================== */

function startMinigameMusic() {
    const music = elements.minigameMusic;

    if (!music) {
        console.warn(
            "No se encontró el audio #minigameMusic."
        );
        return;
    }

    music.pause();
    music.currentTime = 0;
    music.volume = 0.55;

    const playPromise = music.play();

    if (playPromise) {
        playPromise.catch((error) => {
            console.warn(
                "No se pudo reproducir la música del minijuego:",
                error
            );
        });
    }
}

function playWitchLaugh() {
    const laugh = elements.witchLaugh;

    if (!laugh) {
        console.warn(
            "No se encontró el audio #witchLaugh."
        );
        return;
    }

    laugh.pause();
    laugh.currentTime = 0;
    laugh.volume = 0.85;

    const playPromise = laugh.play();

    if (playPromise) {
        playPromise.catch((error) => {
            console.warn(
                "No se pudo reproducir la risa de la bruja:",
                error
            );
        });
    }
}

function stopWitchLaugh(reset = true) {
    const laugh = elements.witchLaugh;

    if (!laugh) return;

    laugh.pause();

    if (reset) {
        laugh.currentTime = 0;
    }
}

let gamePausedByOrientation = false;


function stopMinigameMusic(reset = true) {
    const music = elements.minigameMusic;

    if (!music) return;

    music.pause();

    if (reset) {
        music.currentTime = 0;
    }
}

/* ==================================================
   POSICIÓN DEL TALISMÁN
   ================================================== */

export function positionTalisman(x, y) {
    if (!elements.room) return;

    const roomRect = elements.room.getBoundingClientRect();

    lensX = Math.max(0, Math.min(roomRect.width, x));
    lensY = Math.max(0, Math.min(roomRect.height, y));

    elements.lens.style.left = `${lensX}px`;
    elements.lens.style.top = `${lensY}px`;

    elements.dragTalisman.style.left = `${lensX}px`;
    elements.dragTalisman.style.top = `${lensY}px`;

    elements.room.style.setProperty(
        "--lens-x",
        `${lensX}px`
    );

    elements.room.style.setProperty(
        "--lens-y",
        `${lensY}px`
    );

    revealNearbyButtons();
}

/* ==================================================
   RECOLECCIÓN DE ALMAS
   ================================================== */

function cancelSoulHold(button) {
    const timer = soulHoldTimers.get(button);

    if (timer !== undefined) {
        window.clearTimeout(timer);
        soulHoldTimers.delete(button);
    }

    button.classList.remove("charging");
}

function cancelAllSoulHolds() {
    soulHoldTimers.forEach((timer, button) => {
        window.clearTimeout(timer);
        button.classList.remove("charging");
    });

    soulHoldTimers.clear();
}

function beginSoulHold(button) {
    if (!gameRunning) return;
    if (!button.classList.contains("revealed")) return;
    if (button.classList.contains("collected")) return;
    if (soulHoldTimers.has(button)) return;

    /*
     * Activa el indicador visual de 1.5 segundos.
     */
    button.classList.add("charging");

    const timer = window.setTimeout(() => {
        soulHoldTimers.delete(button);
        button.classList.remove("charging");

        /*
         * Solo se recoge si todavía está dentro
         * del área del talismán.
         */
        if (!gameRunning) return;
        if (!button.classList.contains("revealed")) return;
        if (button.classList.contains("collected")) return;

        collectSoul(button);
    }, SOUL_HOLD_TIME);

    soulHoldTimers.set(button, timer);
}

function collectSoul(button) {
    if (!gameRunning) return;
    if (button.classList.contains("collected")) return;
    if (!button.classList.contains("revealed")) return;

    cancelSoulHold(button);

    button.classList.add("collected");
    button.classList.remove("revealed", "charging");
    button.disabled = true;

    collected += 1;
    elements.buttonCount.textContent = collected;

    /*
     * Recoger un alma reduce el peligro.
     */
    danger = Math.max(0, danger - 27);

    updateDanger();
    collectSound();

    if (collected === elements.hiddenButtons.length) {
        winButtonGame();
    }
}

function revealNearbyButtons() {
    if (!elements.room) return;

    const roomRect = elements.room.getBoundingClientRect();

    /*
     * Área en la que el talismán revela las almas.
     */
    const radius = getLensRadius();


    elements.hiddenButtons.forEach((button) => {
        if (button.classList.contains("collected")) {
            cancelSoulHold(button);
            return;
        }

        const rect = button.getBoundingClientRect();

        const centerX =
            rect.left -
            roomRect.left +
            rect.width / 2;

        const centerY =
            rect.top -
            roomRect.top +
            rect.height / 2;

        const distance = Math.hypot(
            centerX - lensX,
            centerY - lensY
        );

        const isRevealed = distance < radius;

        button.classList.toggle(
            "revealed",
            isRevealed
        );

        /*
         * Si el talismán permanece sobre el alma,
         * comienza la cuenta de 1.5 segundos.
         */
        if (isRevealed) {
            beginSoulHold(button);
        } else {
            cancelSoulHold(button);
        }
    });
}

/* ==================================================
   PELIGRO
   ================================================== */

function updateDanger() {
    const normalizedDanger = Math.max(
        0,
        Math.min(MAX_DANGER, danger)
    );

    /*
     * Esta variable sigue controlando la mano.
     */
    document.documentElement.style.setProperty(
        "--danger",
        normalizedDanger
    );

    /*
     * Intensidad máxima del filtro rojo: 0.72.
     */
    const redIntensity =
        normalizedDanger / MAX_DANGER * 0.72;

    elements.scene4.style.setProperty(
        "--danger-red",
        redIntensity.toFixed(3)
    );

    elements.dangerBar.style.width =
        `${normalizedDanger}%`;

    elements.scene4.classList.toggle(
        "high-danger",
        normalizedDanger >= 65
    );

    elements.scene4.classList.toggle(
        "critical-danger",
        normalizedDanger >= 85
    );
}

function scheduleDangerTick() {
    window.clearTimeout(dangerTimeout);

    if (!gameRunning) return;
    if (gamePausedByOrientation) return;

    const delay = Math.max(
        250,
        920 - danger * 6
    );

    dangerTimeout = window.setTimeout(() => {
        if (!gameRunning) return;
        if (gamePausedByOrientation) return;

        danger = Math.min(100, danger + 2.1);

        updateDanger();
        metallicClack();

        if (danger >= 100) {
            loseGame();
            return;
        }

        scheduleDangerTick();
    }, delay);
}

/* ==================================================
   INICIAR, PERDER Y GANAR
   ================================================== */

export function startButtonGame() {
    window.clearTimeout(dangerTimeout);
    cancelAllSoulHolds();
    stopWitchLaugh();

    collected = 0;
    danger = 7;
    dragging = false;
    gameRunning = true;
    gamePausedByOrientation = false;

    elements.buttonCount.textContent = "0";
    elements.gameOver.classList.add("hidden");

    elements.hiddenButtons.forEach((button) => {
        button.classList.remove(
            "collected",
            "revealed",
            "charging"
        );

        button.disabled = false;
    });

    positionTalisman(
        elements.room.clientWidth * 0.5,
        elements.room.clientHeight * 0.75
    );

    startMinigameMusic();
    updateDanger();
    scheduleDangerTick();
}

function loseGame() {
    if (!gameRunning) return;

    gameRunning = false;
    dragging = false;

    window.clearTimeout(dangerTimeout);
    cancelAllSoulHolds();
    stopMinigameMusic();

    /*
     * Display the death screen first.
     */
    elements.gameOver.classList.remove("hidden");

    /*
     * Death effects and witch laugh.
     */
    noise(1, 0.18, 450);
    tone(53, 1.3, "sawtooth", 0.08);
    playWitchLaugh();
}

function winButtonGame() {
    if (!gameRunning) return;

    gameRunning = false;
    dragging = false;

    window.clearTimeout(dangerTimeout);
    cancelAllSoulHolds();
    stopMinigameMusic();

    danger = 0;
    updateDanger();

    noise(0.9, 0.12, 1200);
    tone(120, 0.7, "sawtooth", 0.05);
    tone(55, 1.4, "sine", 0.06);

    elements.whiteFlash.classList.remove("flash");

    void elements.whiteFlash.offsetWidth;

    elements.whiteFlash.classList.add("flash");

    window.setTimeout(() => {
        showScene("scene5");
        createFinalGarden();
        startMusicBoxScene5();
    }, 650);
}

/* ==================================================
   EVENTOS
   ================================================== */

export function setupScene4() {
    elements.dragTalisman.addEventListener(
        "pointerdown",
        (event) => {
            if (!gameRunning) return;

            dragging = true;

            elements.dragTalisman.setPointerCapture(
                event.pointerId
            );
        }
    );
    window.addEventListener(
        "orientationgate:blocked",
        () => {
            if (!gameRunning) return;

            gamePausedByOrientation = true;
            dragging = false;

            window.clearTimeout(dangerTimeout);

            /*
             * orientation.js ya pausa automáticamente
             * la música HTML que se esté reproduciendo.
             */
        }
    );

    window.addEventListener(
        "orientationgate:released",
        () => {
            if (
                !gameRunning ||
                !gamePausedByOrientation
            ) {
                return;
            }

            gamePausedByOrientation = false;

            /*
             * Continúa el peligro desde el porcentaje
             * donde estaba antes de girar el teléfono.
             */
            scheduleDangerTick();

            /*
             * Recalcula la posición porque el viewport cambió.
             */
            positionTalisman(
                Math.min(
                    lensX,
                    elements.room.clientWidth
                ),
                Math.min(
                    lensY,
                    elements.room.clientHeight
                )
            );
        }
    );

    window.addEventListener("pointerup", () => {
        dragging = false;
    });
    window.addEventListener("blur", () => {
        dragging = false;
    });



    elements.dragTalisman.addEventListener(
        "pointermove",
        (event) => {
            if (!dragging || !gameRunning) return;

            const roomRect =
                elements.room.getBoundingClientRect();

            positionTalisman(
                event.clientX - roomRect.left,
                event.clientY - roomRect.top
            );
        }
    );

    elements.dragTalisman.addEventListener(
        "pointerup",
        (event) => {
            dragging = false;

            if (
                elements.dragTalisman.hasPointerCapture(
                    event.pointerId
                )
            ) {
                elements.dragTalisman.releasePointerCapture(
                    event.pointerId
                );
            }
        }
    );

    elements.dragTalisman.addEventListener(
        "pointercancel",
        () => {
            dragging = false;
        }
    );

    elements.hiddenButtons.forEach((button) => {
        /*
         * También funciona si el usuario deja el cursor
         * directamente sobre un alma visible.
         */
        button.addEventListener("pointerenter", () => {
            beginSoulHold(button);
        });

        button.addEventListener("pointerleave", () => {
            /*
             * Solo cancelamos si el talismán ya no la
             * está revelando.
             */
            if (!button.classList.contains("revealed")) {
                cancelSoulHold(button);
            }
        });

        /*
         * Se conserva la opción de recoger con clic.
         */
        button.addEventListener("click", () => {
            collectSoul(button);
        });
    });

    elements.retryGame.addEventListener(
        "click",
        startButtonGame
    );

    window.addEventListener("resize", () => {
        if (
            elements.scene4.classList.contains("active")
        ) {
            positionTalisman(
                Math.min(
                    lensX,
                    elements.room.clientWidth
                ),
                Math.min(
                    lensY,
                    elements.room.clientHeight
                )
            );
        }
    });
}

function getLensRadius() {
    if (window.innerHeight <= 520 && window.innerWidth > window.innerHeight) {
        return 65;
    }

    if (window.innerWidth <= 380) {
        return 71;
    }

    if (window.innerWidth <= 768) {
        return 80;
    }

    return 105;
}