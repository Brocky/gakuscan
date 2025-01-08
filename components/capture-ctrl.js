(function() {
const $template = document.createElement('template');
    $template.innerHTML = `
    <style>
        :host {
            width:100%
        }
        button {
            cursor: pointer;
        }
        button#gakuscan-capture-start {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            color: #c2c2c2;
            border: .5rem dashed currentColor;
            background: none;
            font-size: 20rem;
        }
        .gakuscan-capture-wrapper {
            position: relative;
            width: fit-content;
            height: fit-content;
            margin: auto;
        }
        video#gakuscan-capture-vid {
            width: 100%;
            max-height: 100vh;
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
    <button id="gakuscan-capture-start"><gakuscan-icon icon="capture" /></button>
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
            this.selection = {
                active: false,
                start:  {x:0, y:0},
                end:    {x:0, y:0},
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
                    const {x, y, width, height} = this.getRect(ctx.canvas);

                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    // draw rectangle
                    ctx.strokeStyle = "green";
                    ctx.strokeRect(x, y, width, height);
                },
                getSelection: function ($video) {
                    const $copyCanvas = document.createElement('canvas');
                    const {x, y, width, height} = this.getRect({
                        width: $video.videoWidth,
                        height: $video.videoHeight
                    });

                    $copyCanvas.width  = width;
                    $copyCanvas.height = height;
                    
                    const copyCtx = $copyCanvas.getContext('2d');
                    copyCtx.drawImage($video, x, y, width, height, 0, 0, width, height);
                    
                    return {
                        selected: $copyCanvas.toDataURL('image/png')
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
            };
            // update selection
            $canvas.onmousemove = ({offsetX, offsetY}) => {
                if(!this.selection.active || !this.canvasContext) {
                    return;
                }
                this.selection.end.x = offsetX / $canvas.offsetWidth;
                this.selection.end.y = offsetY / $canvas.offsetHeight;
                this.selection.draw(this.canvasContext);
            };
            // apply selection
            $canvas.onmouseup = ({offsetX, offsetY, button}) => {
                if (button != 0 || !this.canvasContext) {
                    return;
                }
                this.selection.end.x = offsetX / $canvas.offsetWidth;
                this.selection.end.y = offsetY / $canvas.offsetHeight;
                this.selection.active = false;
                this.selection.draw(this.canvasContext);

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