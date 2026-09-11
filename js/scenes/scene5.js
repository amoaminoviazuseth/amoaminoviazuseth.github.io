import { elements } from '../dom.js';
import {
    noise,
    tone,
    startMusicBox,
    stopMusicBox
} from '../audio.js';

let wishWasMade = false;

export function createFinalGarden() {
    const fireflyContainer = elements.fireflyContainer;

    if (!fireflyContainer) {
        console.warn(
            "No se encontró el contenedor #fireflies."
        );
        return;
    }

    fireflyContainer.innerHTML = "";

    for (let index = 0; index < 38; index += 1) {
        const light = document.createElement("span");

        light.className = "magic-light";
        light.style.left = `${Math.random() * 100}%`;
        light.style.top = `${8 + Math.random() * 76}%`;
        light.style.animationDelay =
            `${Math.random() * 4}s`;
        light.style.animationDuration =
            `${3 + Math.random() * 4}s`;

        fireflyContainer.appendChild(light);
    }
}

export function startMusicBoxScene5() {
    startMusicBox();
}

function createStarExplosion() {
    if (!elements.starDust) return;

    elements.starDust.innerHTML = "";

    for (let index = 0; index < 85; index += 1) {
        const star = document.createElement("span");

        const angle = Math.random() * Math.PI * 2;
        const distance =
            100 + Math.random() * window.innerWidth * 0.6;

        star.className = "star";
        star.textContent =
            Math.random() > 0.45 ? "✦" : "·";

        star.style.setProperty(
            "--x",
            `${Math.cos(angle) * distance}px`
        );

        star.style.setProperty(
            "--y",
            `${Math.sin(angle) * distance}px`
        );

        star.style.setProperty(
            "--rotation",
            `${Math.random() * 700 - 350}deg`
        );

        star.style.setProperty(
            "--size",
            `${8 + Math.random() * 23}px`
        );

        star.style.animationDelay =
            `${Math.random() * 0.28}s`;

        elements.starDust.appendChild(star);
    }
}

export function setupScene5() {
    if (!elements.wishButton) {
        console.warn(
            "No se encontró el botón #wishButton."
        );
        return;
    }

    elements.wishButton.addEventListener("click", () => {
        if (wishWasMade) return;

        wishWasMade = true;

        elements.wishButton.disabled = true;
        elements.wishButton.textContent =
            "Tu deseo está a salvo ♡";

        noise(0.35, 0.045, 850);
        tone(784, 0.5, "sine", 0.05);
        tone(1046, 0.8, "triangle", 0.04, 0.2);

        createStarExplosion();

        window.setTimeout(() => {
            if (!elements.letterModal) return;

            elements.letterModal.classList.add("visible");
            elements.letterModal.setAttribute(
                "aria-hidden",
                "false"
            );
        }, 1300);
    });

    if (elements.replay) {
        elements.replay.addEventListener("click", () => {
            stopMusicBox();
            window.location.reload();
        });
    }
}