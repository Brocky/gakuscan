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
            padding: var(--medium-gab) var(--large-gab);
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
            height: 100%;
        }
        button.gs-btn-min {
            padding: var(--small-gab);
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
        static observedAttributes = ['submit','icon','title'];

        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($temp.content.cloneNode(true));
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'submit':
                    this.setType(newValue);
                    break;
                case 'title':
                    this.setTitle(newValue);
                    break;
                case 'icon':
                    this.setIcon(newValue);
                    break;
            }
        }

        setType(isSubmit) {
            const $btn = this.shadowRoot.querySelector('button');

            if (isSubmit) {
                $btn.setAttribute('type', 'submit');
                return;
            }
            $btn.setAttribute('type', 'button');
        }

        setIcon(icon) {
            let $icon = this.querySelector('gs-icon');

            if (!$icon) {
                if (this.innerText) {
                    this.append("\u00A0");
                } else {
                    this.shadowRoot.querySelector('button').classList.add('gs-btn-min');
                }
                $icon = document.createElement('gs-icon');
                $icon.classList.add('gs-btn-icon');
                this.appendChild($icon);
            }
            $icon.setAttribute('icon', icon);
        }

        setTitle(title) {
            const $btn  = this.shadowRoot.querySelector('button');
            const $icon = this.querySelector('gs-icon');

            $btn.setAttribute('title', title);
            if ($icon) {
                $icon.setAttribute('title', title);
            }
        }
    }

    customElements.define('gs-btn', GSButton);
})();