import { elements } from '../dom.js';
import { noise, tone, startMusicBox, stopMusicBox } from '../audio.js';
import { CONFIG } from '../config.js';

export function createFinalGarden() {
    const fireflyContainer = elements.fireflyContainer;
    const flowerBed = elements.flowerBed;

    fireflyContainer.innerHTML = "";
    flowerBed.innerHTML = "";

    for (let index = 0; index < 38; index += 1) {
        const light = document.createElement("span");

        light.className = "magic-light";
        light.style.left = `${Math.random() * 100}%`;
        light.style.top = `${Math.random() * 84}%`;
        light.style.animationDelay = `${Math.random() * 4}s`;
        light.style.animationDuration = `${3 + Math.random() * 4}s`;

        fireflyContainer.appendChild(light);
    }

    const colors = [
        "#ff85b5",
        "#d9a3ff",
        "#fff08e",
        "#81dcff",
        "#ffae7a"
    ];

    for (let index = 0; index < 30; index += 1) {
        const flower = document.createElement("span");

        flower.className = "flower";
        flower.style.left = `${2 + Math.random() * 96}%`;
        flower.style.setProperty(
            "--height",
            `${55 + Math.random() * 130}px`
        );
        flower.style.setProperty(
            "--delay",
            `${Math.random() * 1.2}s`
        );
        flower.style.setProperty(
            "--color",
            colors[Math.floor(Math.random() * colors.length)]
        );

        flowerBed.appendChild(flower);
    }
}

export function startMusicBoxScene5() {
    startMusicBox();
}

function createStarExplosion() {
    elements.starDust.innerHTML = "";

    for (let index = 0; index < 85; index += 1) {
        const star = document.createElement("span");
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * window.innerWidth * 0.6;

        star.className = "star";
        star.textContent = Math.random() > 0.45 ? "✦" : "·";

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

        star.style.animationDelay = `${Math.random() * 0.28}s`;

        elements.starDust.appendChild(star);
    }
}

export function setupScene5() {
    elements.wishButton.addEventListener("click", () => {
        if (elements.candles.classList.contains("out")) return;

        elements.candles.classList.add("out");
        elements.wishButton.disabled = true;
        elements.wishButton.textContent = "Tu deseo está a salvo ♡";

        noise(0.35, 0.045, 850);
        tone(784, 0.5, "sine", 0.05);
        tone(1046, 0.8, "triangle", 0.04, 0.2);

        createStarExplosion();

        setTimeout(() => {
            elements.letterModal.classList.add("visible");
        }, 1300);
    });

    elements.replay.addEventListener("click", () => {
        stopMusicBox();
        window.location.reload();
    });
}
