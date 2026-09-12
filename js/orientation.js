const pausedMedia = new Set();

let orientationGate = null;
let requestLandscapeButton = null;
let orientationStatus = null;
let orientationIsBlocked = false;

function isTouchDevice() {
    return (
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
    );
}

function isMobileDevice() {
    const smallestScreenSide = Math.min(
        window.screen.width,
        window.screen.height
    );

    return (
        isTouchDevice() &&
        smallestScreenSide <= 1024
    );
}

function isPortrait() {
    return window.innerHeight > window.innerWidth;
}

function shouldBlockOrientation() {
    return isMobileDevice() && isPortrait();
}

function pausePlayingMedia() {
    pausedMedia.clear();

    document
        .querySelectorAll("audio, video")
        .forEach((mediaElement) => {
            if (
                mediaElement.paused ||
                mediaElement.ended
            ) {
                return;
            }

            pausedMedia.add(mediaElement);
            mediaElement.pause();
        });
}

function resumePausedMedia() {
    pausedMedia.forEach((mediaElement) => {
        if (!document.contains(mediaElement)) return;

        mediaElement
            .play()
            .catch(() => {
                /*
                 * Algunos navegadores exigen otra
                 * interacción antes de reanudar.
                 */
            });
    });

    pausedMedia.clear();
}

function blockOrientation() {
    if (!orientationGate) return;

    orientationGate.classList.add("is-visible");
    orientationGate.setAttribute(
        "aria-hidden",
        "false"
    );

    document.documentElement.classList.add(
        "orientation-blocked"
    );

    if (orientationIsBlocked) return;

    orientationIsBlocked = true;

    pausePlayingMedia();

    window.dispatchEvent(
        new CustomEvent(
            "orientationgate:blocked"
        )
    );
}

function releaseOrientation() {
    if (!orientationGate) return;

    orientationGate.classList.remove("is-visible");
    orientationGate.setAttribute(
        "aria-hidden",
        "true"
    );

    document.documentElement.classList.remove(
        "orientation-blocked"
    );

    if (!orientationIsBlocked) return;

    orientationIsBlocked = false;

    resumePausedMedia();

    window.dispatchEvent(
        new CustomEvent(
            "orientationgate:released"
        )
    );
}

function updateOrientationGate() {
    if (shouldBlockOrientation()) {
        blockOrientation();
        return;
    }

    releaseOrientation();
}

async function enterFullscreen() {
    if (document.fullscreenElement) {
        return true;
    }

    const root = document.documentElement;

    const requestFullscreen =
        root.requestFullscreen ||
        root.webkitRequestFullscreen ||
        root.msRequestFullscreen;

    if (!requestFullscreen) {
        return false;
    }

    try {
        await requestFullscreen.call(root, {
            navigationUI: "hide"
        });

        return true;
    } catch (error) {
        console.warn(
            "No se pudo activar pantalla completa:",
            error
        );

        return false;
    }
}

async function lockLandscape() {
    if (
        !window.screen.orientation ||
        typeof window.screen.orientation.lock !==
            "function"
    ) {
        return false;
    }

    try {
        await window.screen.orientation.lock(
            "landscape"
        );

        return true;
    } catch (error) {
        console.warn(
            "No se pudo bloquear la orientación:",
            error
        );

        return false;
    }
}

async function activateImmersiveMode() {
    if (orientationStatus) {
        orientationStatus.textContent =
            "Activando modo inmersivo…";
    }

    const fullscreenEnabled =
        await enterFullscreen();

    const landscapeLocked =
        await lockLandscape();

    if (
        fullscreenEnabled &&
        landscapeLocked
    ) {
        if (orientationStatus) {
            orientationStatus.textContent =
                "Modo horizontal activado";
        }
    } else if (fullscreenEnabled) {
        if (orientationStatus) {
            orientationStatus.textContent =
                "Ahora gira físicamente el teléfono";
        }
    } else {
        if (orientationStatus) {
            orientationStatus.textContent =
                "Gira físicamente el teléfono para continuar";
        }
    }

    window.setTimeout(
        updateOrientationGate,
        250
    );
}

/*
 * Permite llamar al modo inmersivo desde otros botones,
 * por ejemplo desde "Entrar con sonido".
 */
export async function requestImmersiveMode() {
    if (!isMobileDevice()) return;

    await enterFullscreen();
    await lockLandscape();
}

export function setupOrientationGate() {
    orientationGate =
        document.getElementById(
            "orientationGate"
        );

    requestLandscapeButton =
        document.getElementById(
            "requestLandscape"
        );

    orientationStatus =
        document.getElementById(
            "orientationStatus"
        );

    if (!orientationGate) {
        console.warn(
            "No se encontró #orientationGate"
        );

        return;
    }

    requestLandscapeButton?.addEventListener(
        "click",
        activateImmersiveMode
    );

    window.addEventListener(
        "resize",
        updateOrientationGate
    );

    window.addEventListener(
        "orientationchange",
        () => {
            window.setTimeout(
                updateOrientationGate,
                200
            );
        }
    );

    if (window.screen.orientation) {
        window.screen.orientation.addEventListener?.(
            "change",
            updateOrientationGate
        );
    }

    document.addEventListener(
        "fullscreenchange",
        updateOrientationGate
    );

    document.addEventListener(
        "webkitfullscreenchange",
        updateOrientationGate
    );

    updateOrientationGate();
}