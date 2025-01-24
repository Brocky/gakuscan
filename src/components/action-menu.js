(function () {
    const $temp = document.createElement('template');
    $temp.innerHTML = `
    <style>
        menu {
            all: unset;
            display: flex;
            justify-content: flex-end;
        }
        menu[data-left] {
            justify-content: flex-start;
        }
        ::slotted(li) {
            all: unset;
            margin: var(--small-gab);
        }
    </style>
    <menu>
        <slot></slot>
    </menu>
    `;

    class ActionMenu extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            const align = this.getAttribute('button-align');
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($temp.content.cloneNode(true));

            if(align) {
                this.shadowRoot.querySelector('menu').setAttribute(`data-${align}`, true);
            }
        }
    }

    customElements.define('gs-menu', ActionMenu);
})();