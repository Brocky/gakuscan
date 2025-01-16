(function () {
    const $temp = document.createElement('template');
    $temp.innerHTML = `
    <style>
        button {
            align-items: center;
            background: linear-gradient(to right, rgba(247, 247, 247, 0.22), rgba(134, 134, 134, 0.11));
            border: var(--border-style);
            border-radius: .2rem;
            box-shadow: var(--box-shadow);
            box-sizing: border-box;
            color: var(--text-color);
            cursor: pointer;
            display: inline-flex;
            font-size: 1.1rem;
            justify-content: center;
            margin: 0;
            padding: .4rem;
            position: relative;
            text-decoration: none;
            transition: all var(--transition-time);
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
            vertical-align: baseline;
            width: auto;
            min-width: 2.3rem;
            min-height: 2.3rem;
        }

        button:hover,
        button:focus {
            border-color: color-mix(in srgb, var(--text-color) 80%, transparent);
            box-shadow: var(--box-shadow);
            color: color-mix(in srgb, var(--text-color) 80%, transparent);
        }

        button:hover {
            transform: translateY(-.1rem);
        }

        button:active {
            background: linear-gradient(to right, rgba(247, 247, 247, 0.33), rgba(134, 134, 134, 0.22));
            border-color: color-mix(in srgb, var(--text-color) 80%, transparent);
            box-shadow: var(--box-shadow-highlight);
            transform: translateY(0);
        }
    </style>
    <button type="button"><slot></slot></button>
    `;

    class GSButton extends HTMLElement {
        icon= null
        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($temp.content.cloneNode(true));
        }
        connectedCallback() {
            const icon   = this.getAttribute('icon');
            const submit = this.getAttribute('submit');

            if (icon) {
                const $icon = document.createElement('gs-icon');
                $icon.setAttribute('icon', icon);
                if (this.innerHTML) {
                    this.append("\u00A0");
                }
                this.appendChild($icon);
            }
            if (submit != null) {
                this.shadowRoot.querySelector('button').setAttribute('type', 'submit');
            }
        }
    }

    customElements.define('gs-btn', GSButton);
})();