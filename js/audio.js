import { CONFIG } from './config.js';

let audioContext;
let musicTimer;

/*
 * Voz electrónica inspirada en código Morse.
 *
 * La función devuelve otra función que permite detener
 * inmediatamente todos los sonidos y temporizadores.
 */
export function startMorseVoice(text) {
    if (!audioContext || !text) {
        return () => {};
    }

    const normalizedText = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

    /*
     * Generamos un patrón estable a partir del texto.
     * Cada carácter produce un punto o una raya.
     * Por eso los textos más largos generan voces más largas.
     */
    const pattern = Array.from(normalizedText)
        .filter((character) => character.trim() !== "")
        .map((character) => {
            const characterCode = character.charCodeAt(0);
            return characterCode % 3 === 0 ? "-" : ".";
        });

    if (pattern.length === 0) {
        return () => {};
    }

    let stopped = false;
    let patternIndex = 0;
    let timerId = null;

    const activeOscillators = new Set();

    function playPulse(symbol) {
        if (stopped || !audioContext) return;

        const now = audioContext.currentTime;

        /* Punto corto, raya más larga */
        const duration = symbol === "-" ? 0.13 : 0.055;

        /*
         * Pequeñas variaciones de frecuencia para evitar
         * que todos los sonidos sean idénticos.
         */
        const frequencies = [480, 540, 620, 700];
        const frequency =
            frequencies[patternIndex % frequencies.length];

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(
            0.035,
            now + 0.008
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        activeOscillators.add(oscillator);

        oscillator.addEventListener("ended", () => {
            activeOscillators.delete(oscillator);
            oscillator.disconnect();
            gain.disconnect();
        });

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }

    function playNextPulse() {
        if (stopped) return;

        const symbol = pattern[patternIndex % pattern.length];

        playPulse(symbol);

        patternIndex += 1;

        /*
         * Las rayas dejan un espacio ligeramente mayor.
         */
        const nextDelay = symbol === "-" ? 175 : 95;

        timerId = window.setTimeout(
            playNextPulse,
            nextDelay
        );
    }

    playNextPulse();

    /*
     * Esta función se ejecutará cuando termine el texto.
     */
    return function stopMorseVoice() {
        if (stopped) return;

        stopped = true;

        if (timerId !== null) {
            window.clearTimeout(timerId);
            timerId = null;
        }

        /*
         * Detenemos incluso el tono que se encuentra
         * reproduciéndose en ese preciso momento.
         */
        activeOscillators.forEach((oscillator) => {
            try {
                oscillator.stop();
            } catch {
                /* El oscilador posiblemente ya terminó. */
            }
        });

        activeOscillators.clear();
    };
}

export function initializeAudio() {
    if (!audioContext) {
        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}

export function tone(
    frequency = 440,
    duration = 0.1,
    type = "sine",
    volume = 0.06,
    delay = 0
) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + delay;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
}

export function noise(duration = 0.25, volume = 0.06, filterFrequency = 900) {
    if (!audioContext) return;

    const frameCount = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(
        1,
        frameCount,
        audioContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
        data[index] = Math.random() * 2 - 1;
    }

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = filterFrequency;

    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    source.start();
}

export function mouseSteps() {
    for (let index = 0; index < 10; index += 1) {
        const delay = index * 0.16;

        tone(
            index % 2 === 0 ? 620 : 760,
            0.045,
            "triangle",
            0.025,
            delay
        );
    }
}

export function doorCreak() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(115, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        48,
        audioContext.currentTime + 1.1
    );

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(
        0.045,
        audioContext.currentTime + 0.18
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 1.15
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.2);
}

export function swish() {
    noise(0.34, 0.09, 540);
    tone(110, 0.26, "sine", 0.03);
}

export function metallicClack() {
    tone(230, 0.06, "square", 0.035);
    tone(930, 0.04, "triangle", 0.025, 0.025);
}

export function collectSound() {
    tone(470, 0.12, "sine", 0.08);
    tone(710, 0.16, "sine", 0.07, 0.08);
    tone(1040, 0.25, "triangle", 0.05, 0.17);
}

export function startMusicBox() {
    clearInterval(musicTimer);

    const notes = [523, 659, 784, 659, 880, 784, 659, 587];
    let noteIndex = 0;

    musicTimer = setInterval(() => {
        tone(notes[noteIndex], 0.48, "sine", 0.035);
        tone(notes[noteIndex] * 2, 0.25, "triangle", 0.012);

        noteIndex = (noteIndex + 1) % notes.length;
    }, 460);
}

export function stopMusicBox() {
    clearInterval(musicTimer);
}
