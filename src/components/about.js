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

        menu {
            margin: 0;
            display: flex;
            justify-content: flex-end;
        }
        button {
            cursor: pointer;
        }
    </style>
    <dialog>
        <form method="dialog">
            <section>
                <p>
                Immersion is one of the most effective ways to learn a language. GakuScan empowers you to dive into authentic Japanese content without getting overwhelmed. By providing instant support for text recognition and grammar, it helps you focus on enjoying the material while steadily building your skills.
                </p>
                <p>
                View the application code and find help at <a href="https://github.com/Brocky/gakuscan">GitHub</a>
                </p>
                <p>
                Vectors and icons by <a href="https://github.com/instructure/instructure-ui?ref=svgrepo.com" target="_blank">Instructure Ui</a> in MIT License via <a href="https://www.svgrepo.com/" target="_blank">SVG Repo</a>
                </p>
            </section>
            <menu>
                <button value="close" type="button">Close</button>
            </menu>
        </form>
    </dialog>
    `;

    class About extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($dialogTemplate.content.cloneNode(true));

            this.$dialog = this.shadowRoot.querySelector('dialog');

            this.shadowRoot.querySelector('button[value=close]').addEventListener('click', () => {
                this.$dialog.close();
            });
        }

        open() {
            this.$dialog.showModal();
        }
    }

    customElements.define('gs-about', About);
})();