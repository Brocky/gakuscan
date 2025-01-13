(function () {
    const $dialogTemplate = document.createElement('template');
    $dialogTemplate.innerHTML = `
    <style>
        dialog {
            background: var(--bg-gradient);
            color: var(--text-color);
            box-shadow: var(--box-shadow);
            border: var(--border-style);
            padding: 2rem;
            max-width: 30rem;
        }
    </style>
    <dialog>
        <slot>
        </slot>
        <slot name="action-menu">
            <gs-menu>
                <li><gs-btn value="close">Close</gs-btn></li>
            </gs-menu>
        </slot>
    </dialog>
    `;

    class Dialog extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($dialogTemplate.content.cloneNode(true));

            this.$dialog = this.shadowRoot.querySelector('dialog');

            const $closeButton = this.shadowRoot.querySelector('gs-btn[value=close]');
            if($closeButton) {
                $closeButton.addEventListener('click', () => {
                    this.$dialog.close();
                });
            }
        }

        open() {
            this.$dialog.showModal();
        }

        close() {
            this.$dialog.close();
        }
    }

    customElements.define('gs-dialog', Dialog);
})();