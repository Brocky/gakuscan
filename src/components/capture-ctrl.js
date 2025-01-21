(function() {
const $template = document.createElement('template');
    $template.innerHTML = `
    <style>
        :host {
            width:100%;
            height:100%;
        }
        button#gakuscan-capture-start {
            cursor: pointer;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            color: color-mix(in srgb, var(--text-color) 22%, transparent);
            border: .5rem dashed currentColor;
            background: none;
            font-size: 20rem;
            transition: all var(--transition-time);
        }
        button#gakuscan-capture-start:active {
            transform: scale(.98);
            color: color-mix(in srgb, var(--text-color) 33%, transparent);
        }
        .gakuscan-capture-wrapper {
            position: relative;
            width: fit-content;
            height: fit-content;
            max-height: 100%;
            margin: auto;
        }
        video#gakuscan-capture-vid {
            width: 100%;
            max-height: 100%;
        }
        canvas#gakuscan-capture-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: crosshair;
        }
        .gakuscan-hidden {
            display: none;
        }
    </style>
    <button id="gakuscan-capture-start"><gs-icon icon="capture" /></button>
    <div class="gakuscan-capture-wrapper">
        <video id="gakuscan-capture-vid" class="gakuscan-hidden" autoplay muted></video>
        <canvas id="gakuscan-capture-canvas" class="gakuscan-hidden"></canvas>
    </div>
    `;

    class CaptureCtrl extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.selectionCanvasContext = null;
            this.scale = 1;
            this.selection = {
                active: false,
                start: {x:0, y:0},
                end: {x:0, y:0},
                ctrl: this,
                getRect: function({width, height}) {
                    // clone coords
                    let start  = {...this.start};
                    let end    = {...this.end};

                    // fix coord order
                    if (end.x < start.x) {
                        let x   = end.x;
                        end.x   = start.x;
                        start.x = x;
                    }
                    if (end.y < start.y) {
                        let y   = end.y;
                        end.y   = start.y;
                        this.start.y = y;
                    }

                    return {
                        x: start.x * width,
                        y: start.y * height,
                        width: (end.x - start.x) * width,
                        height: (end.y - start.y) * height
                    };
                },
                draw: function (ctx) {
                    let dashOffset = 0;
                    const drawFrame = () => {
                        const {x, y, width, height} = this.getRect(ctx.canvas);
                        // clear canvas
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                        // fill background
                        ctx.fillStyle = "rgba(34, 34, 34, 0.4)";
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                        // clear selection
                        ctx.clearRect(x, y, width, height);
    
                        // draw selection rectangle
                        ctx.beginPath();
                        ctx.setLineDash([10 * this.ctrl.scale, 5 * this.ctrl.scale]);
                        ctx.lineDashOffset = dashOffset;
                        ctx.strokeStyle = "green";
                        ctx.lineWidth = 2 * this.ctrl.scale;
                        ctx.strokeRect(x, y, width, height);
                        ctx.closePath();

                        if(this.active) {
                            dashOffset -= 1 * this.ctrl.scale;
                            requestAnimationFrame(drawFrame);
                        } else {
                            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        }
                    };
                    requestAnimationFrame(drawFrame);
                },
                getSelection: function ($video) {
                    const $copyCanvas = document.createElement('canvas');
                    const {x, y, width, height} = this.getRect({
                        width: $video.videoWidth,
                        height: $video.videoHeight
                    });

                    $copyCanvas.width  = $video.videoWidth;
                    $copyCanvas.height = $video.videoHeight;
                    let copyCtx        = $copyCanvas.getContext('2d');
                    copyCtx.drawImage($video, 0, 0);

                    const frameDataURL = $copyCanvas.toDataURL('image/png');

                    $copyCanvas.width  = width;
                    $copyCanvas.height = height;
                    
                    copyCtx.drawImage($video, x, y, width, height, 0, 0, width, height);
                    
                    return {
                        selection: {
                            dataURL: $copyCanvas.toDataURL('image/png'),
                            width,
                            height,
                            bounds: {
                                x: x / $video.videoWidth,
                                y: y / $video.videoHeight,
                                w: width / $video.videoWidth,
                                h: height / $video.videoHeight
                            }
                        },
                        frame: {
                            dataURL: frameDataURL,
                            width: $video.videoWidth,
                            height: $video.videoHeight
                        }
                    };
                }
            };
        }

        connectedCallback() {
            this.shadowRoot.appendChild($template.content.cloneNode(true));
            
            const $startButton = this.shadowRoot.getElementById('gakuscan-capture-start');
            const $video       = this.shadowRoot.getElementById('gakuscan-capture-vid');
            const $canvas      = this.shadowRoot.getElementById('gakuscan-capture-canvas');

            // start selection 
            $canvas.onmousedown = ({offsetX, offsetY, button}) => {
                if (button != 0 || !this.canvasContext) {
                    return;
                }
                this.selection.active  = true;
                this.selection.start.x = this.selection.end.x = offsetX / $canvas.offsetWidth;
                this.selection.start.y = this.selection.end.y = offsetY / $canvas.offsetHeight;

                this.selection.draw(this.canvasContext);
            };
            // update selection
            $canvas.onmousemove = ({offsetX, offsetY}) => {
                if(!this.selection.active || !this.canvasContext) {
                    return;
                }
                this.selection.end.x = offsetX / $canvas.offsetWidth;
                this.selection.end.y = offsetY / $canvas.offsetHeight;
            };
            // apply selection
            $canvas.onmouseup = ({offsetX, offsetY, button}) => {
                if (button != 0 || !this.canvasContext) {
                    return;
                }
                this.selection.end.x = offsetX / $canvas.offsetWidth;
                this.selection.end.y = offsetY / $canvas.offsetHeight;
                this.selection.active = false;

                // emit event
                this.dispatchEvent(new CustomEvent(
                    'gakuscan-capture-selected',
                    {
                        bubbles: true,
                        cancelable: true,
                        detail: this.selection.getSelection($video)
                    }
                ));
            }

            // update canvas context when stream resizes
            $video.addEventListener('resize', () => {
                $canvas.width       = $video.videoWidth;
                $canvas.height      = $video.videoHeight;
                this.canvasContext  = $canvas.getContext('2d');

                const scale = [
                    $canvas.width / $canvas.offsetWidth,
                    $canvas.height / $canvas.offsetHeight
                ];
                this.scale = (scale[0] + scale[1]) / 2;
            }, false);

            // start capturing media
            $startButton.onclick = async () => {
                try {
                    const captureOptions = {
                        video: true,
                        audio: true,
                        surfaceSwitching: "include",
                        selfBrowserSurface: "exclude",
                        systemAudio: "exclude",
                    };
                    const captureStream = await navigator.mediaDevices.getDisplayMedia(captureOptions);

                    $video.srcObject = captureStream;
                    $video.classList.remove('gakuscan-hidden');
                    $canvas.classList.remove('gakuscan-hidden');
                    $startButton.classList.add('gakuscan-hidden');

                    captureStream.addEventListener('inactive', () => {
                        $video.classList.add('gakuscan-hidden');
                        $canvas.classList.add('gakuscan-hidden');
                        $startButton.classList.remove('gakuscan-hidden');
                    });

                } catch (err) {
                    console.error("Error: " + err);
                }
            };
        }
    }

    customElements.define('gakuscan-capture-ctrl', CaptureCtrl);
})();