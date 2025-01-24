(function () {
    const $dialogTemplate = document.createElement('template');
    $dialogTemplate.innerHTML = `
    <style>
        dialog {
            box-sizing: border-box;
            background: var(--bg-gradient);
            color: var(--text-color);
            box-shadow: var(--box-shadow);
            border: var(--border-style);
            width: 45rem;
            max-width: 95vw;
            padding: var(--medium-gab);
        }
        dialog > section {
            display: flex;
            flex-direction: column;
            padding: var(--large-gab);
            max-height: 80vh;
        }
        dialog > section > main {
            margin-bottom: var(--large-gab);
            flex-shrink: 1;
            overflow: auto;
        }
    </style>
    <dialog>
        <section>
            <main>
                <slot>
                </slot>
            </main>
            <slot name="action-menu">
                <gs-menu>
                    <li><gs-btn value="close">Close</gs-btn></li>
                </gs-menu>
            </slot>
        </section>
    </dialog>
    `;

    class GSDialog extends HTMLElement {
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

    customElements.define('gs-dialog', GSDialog);
})();