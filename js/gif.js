export var tunnelExtended = false; // exported state for scene2

const GIF_URL = "./media/img/tunnel_last_anim.webp";

let gifPlayed = false;

export async function playGifOnce() {
    if (gifPlayed) return;
    gifPlayed = true;

    if (!("ImageDecoder" in window)) {
        // Navegador sin soporte: se queda el fondo tal cual.
        return;
    }

    try {
        const response = await fetch(GIF_URL);
        const buffer = await response.arrayBuffer();

        const decoder = new ImageDecoder({
            data: buffer,
            type: "image/webp"
        });

        await decoder.tracks.ready;
        await decoder.completed;

        const track = decoder.tracks.selectedTrack;
        const frameCount = track.frameCount;

        const frames = [];

        for (let index = 0; index < frameCount; index += 1) {
            const { image } = await decoder.decode({
                frameIndex: index,
                completeFramesOnly: true
            });

            const bitmap = await createImageBitmap(image);
            const duration = (image.duration || 100000) / 1000;

            frames.push({ bitmap, duration });
            image.close();
        }

        const tunnel = document.querySelector(".tunnel") || document.querySelector(".tunnel-lastframe");
        if (!tunnel) return;

        const canvas = document.createElement("canvas");
        canvas.className = "tunnel-canvas";
        tunnel.appendChild(canvas);

        const context = canvas.getContext("2d");

        function fitCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        fitCanvas();

        const first = frames[0];
        const aspect = first.bitmap.width / first.bitmap.height;

        function drawCover(bitmap) {
            const canvasRatio = canvas.width / canvas.height;
            let width;
            let height;

            if (canvasRatio > aspect) {
                width = canvas.width;
                height = canvas.width / aspect;
            } else {
                height = canvas.height;
                width = canvas.height * aspect;
            }

            context.drawImage(
                bitmap,
                (canvas.width - width) / 2,
                (canvas.height - height) / 2,
                width,
                height
            );
        }

        let frameIndex = 0;
        let lastTime = performance.now();
        let elapsed = 0;

        function renderLoop(now) {
            const frame = frames[frameIndex];

            elapsed += now - lastTime;
            lastTime = now;

            if (elapsed >= frame.duration) {
                elapsed -= frame.duration;

                if (frameIndex < frames.length - 1) {
                    frameIndex += 1;
                } else {
                    drawCover(frames[frames.length - 1].bitmap);
                    return;
                }
            }

            drawCover(frames[frameIndex].bitmap);
            requestAnimationFrame(renderLoop);
        }

        drawCover(first.bitmap);
        requestAnimationFrame(renderLoop);

        window.addEventListener("resize", () => {
            fitCanvas();
            drawCover(frames[frameIndex].bitmap);
        });
    } catch (error) {
        console.error("No se pudo reproducir la animación:", error);
    }
}

export function setTunnelExtended(val) {
    tunnelExtended = val;
}
