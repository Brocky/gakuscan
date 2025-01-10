(function () {
    const $temp = document.createElement('template');
    $temp.innerHTML = `
    <style>
        button {
            display: inline-block;
            padding: .4rem;
            font-size: 1.1rem;
            color: var(--text-color);
            background: linear-gradient(to right, rgba(247, 247, 247, 0.22), rgba(121, 121, 121, 0.11));
            border: var(--border-style);
            border-radius: .2rem;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }
        button:hover {
            transform: scale(1.05);
        }
        button:active {
            transform: scale(0.95);
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
            const submit = this.getAttribute('submit')

            console.log(submit);

            if (icon) {
                const $icon = document.createElement('gs-icon');
                $icon.setAttribute('icon', icon);
                this.appendChild($icon);
            }
            if (submit != null) {
                this.shadowRoot.querySelector('button').setAttribute('type', 'submit');
            }
        }
    }

    customElements.define('gs-btn', GSButton);
})();