import { elements } from '../dom.js';
import { metallicClack, noise, tone, collectSound } from '../audio.js';
import { showScene } from '../utils.js';
import { createFinalGarden, startMusicBoxScene5 } from './scene5.js';

let collected = 0;
let danger = 0;
let gameRunning = false;
let dangerTimeout;
let dragging = false;
export let lensX = window.innerWidth * 0.5;
export let lensY = window.innerHeight * 0.75;

export function positionTalisman(x, y) {
    const roomRect = elements.room.getBoundingClientRect();

    lensX = Math.max(0, Math.min(roomRect.width, x));
    lensY = Math.max(0, Math.min(roomRect.height, y));

    elements.lens.style.left = `${lensX}px`;
    elements.lens.style.top = `${lensY}px`;

    elements.dragTalisman.style.left = `${lensX}px`;
    elements.dragTalisman.style.top = `${lensY}px`;

    revealNearbyButtons();
}

function revealNearbyButtons() {
    const roomRect = elements.room.getBoundingClientRect();
    const radius = window.innerWidth <= 720 ? 86 : 105;

    elements.hiddenButtons.forEach((button) => {
        if (button.classList.contains("collected")) return;

        const rect = button.getBoundingClientRect();
        const centerX = rect.left - roomRect.left + rect.width / 2;
        const centerY = rect.top - roomRect.top + rect.height / 2;

        const distance = Math.hypot(
            centerX - lensX,
            centerY - lensY
        );

        button.classList.toggle("revealed", distance < radius);
    });
}

export function startButtonGame() {
    collected = 0;
    danger = 7;
    gameRunning = true;

    elements.buttonCount.textContent = "0";
    elements.gameOver.classList.add("hidden");

    elements.hiddenButtons.forEach((button) => {
        button.classList.remove("collected", "revealed");
        button.disabled = false;
    });

    positionTalisman(
        elements.room.clientWidth * 0.5,
        elements.room.clientHeight * 0.75
    );

    updateDanger();
    scheduleDangerTick();
}

function scheduleDangerTick() {
    clearTimeout(dangerTimeout);

    if (!gameRunning) return;

    const delay = Math.max(250, 920 - danger * 6);

    dangerTimeout = setTimeout(() => {
        danger = Math.min(100, danger + 2.1);
        updateDanger();
        metallicClack();

        if (danger >= 100) {
            loseGame();
        } else {
            scheduleDangerTick();
        }
    }, delay);
}

function updateDanger() {
    document.documentElement.style.setProperty("--danger", danger);
    elements.dangerBar.style.width = `${danger}%`;
}

function loseGame() {
    gameRunning = false;
    clearTimeout(dangerTimeout);

    noise(1, 0.18, 450);
    tone(53, 1.3, "sawtooth", 0.08);

    elements.gameOver.classList.remove("hidden");
}

export function setupScene4() {
    elements.dragTalisman.addEventListener("pointerdown", (event) => {
        if (!gameRunning) return;
        dragging = true;
        elements.dragTalisman.setPointerCapture(event.pointerId);
    });

    elements.dragTalisman.addEventListener("pointermove", (event) => {
        if (!dragging || !gameRunning) return;

        const roomRect = elements.room.getBoundingClientRect();

        positionTalisman(
            event.clientX - roomRect.left,
            event.clientY - roomRect.top
        );
    });

    elements.dragTalisman.addEventListener("pointerup", (event) => {
        dragging = false;
        if (elements.dragTalisman.hasPointerCapture(event.pointerId)) {
            elements.dragTalisman.releasePointerCapture(event.pointerId);
        }
    });

    elements.dragTalisman.addEventListener("pointercancel", () => {
        dragging = false;
    });

    elements.hiddenButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (!gameRunning) return;
            if (!button.classList.contains("revealed")) return;
            if (button.classList.contains("collected")) return;

            button.classList.add("collected");
            button.classList.remove("revealed");
            button.disabled = true;

            collected += 1;
            elements.buttonCount.textContent = collected;

            danger = Math.max(0, danger - 27);
            updateDanger();
            collectSound();

            if (collected === 3) {
                winButtonGame();
            }
        });
    });

    elements.retryGame.addEventListener("click", startButtonGame);

    window.addEventListener("resize", () => {
        if (elements.scene4.classList.contains("active")) {
            positionTalisman(
                Math.min(lensX, elements.room.clientWidth),
                Math.min(lensY, elements.room.clientHeight)
            );
        }
    });
}

function winButtonGame() {
    gameRunning = false;
    clearTimeout(dangerTimeout);

    danger = 0;
    updateDanger();

    noise(0.9, 0.12, 1200);
    tone(120, 0.7, "sawtooth", 0.05);
    tone(55, 1.4, "sine", 0.06);

    elements.whiteFlash.classList.remove("flash");
    void elements.whiteFlash.offsetWidth;
    elements.whiteFlash.classList.add("flash");

    setTimeout(() => {
        showScene("scene5");
        createFinalGarden();
        startMusicBoxScene5();
    }, 650);
}
