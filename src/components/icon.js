/**
 * Icons from Asoka at (svgrepo)[https://www.svgrepo.com/collection/asoka-interface-icons/] under CC0
 */
(function() {
    const $template = document.createElement('template');
    $template.innerHTML = `
    <style>
        svg.gs-icon {
            position: relative;
            top: .125rem;
            fill: currentColor;
            stroke: currentColor;
            height: 1.6em;
            width: 1.6em;
        }
    </style>
    <svg class="gs-icon" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
    </svg>
    `;

    const $icons = document.createElement('div');
    $icons.innerHTML = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
        <symbol id="gs-icon-capture" viewBox="0 0 24 24">
            <title>Screen Capture</title>
            <path d="M8 4H5C4.44772 4 4 4.44772 4 5V8M16 4H19C19.5523 4 20 4.44772 20 5V8M4 16V19C4 19.5523 4.44772 20 5 20H8M20 16V19C20 19.5523 19.5523 20 19 20H16M6 12C6 12 7.71429 8 12 8C16.2857 8 18 12 18 12C18 12 16.2857 16 12 16C7.71429 16 6 12 6 12ZM14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-edit" viewBox="0 0 24 24">
            <title>Edit</title>
            <path d="M12.2424 20H17.5758M4.48485 16.5L15.8242 5.25607C16.5395 4.54674 17.6798 4.5061 18.4438 5.16268V5.16268C19.2877 5.8879 19.3462 7.17421 18.5716 7.97301L7.39394 19.5L4 20L4.48485 16.5Z" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-trash" viewBox="0 0 24 24">
            <title>Delete</title>
            <path d="M5 6.77273H9.2M19 6.77273H14.8M9.2 6.77273V5.5C9.2 4.94772 9.64772 4.5 10.2 4.5H13.8C14.3523 4.5 14.8 4.94772 14.8 5.5V6.77273M9.2 6.77273H14.8M6.4 8.59091V15.8636C6.4 17.5778 6.4 18.4349 6.94673 18.9675C7.49347 19.5 8.37342 19.5 10.1333 19.5H13.8667C15.6266 19.5 16.5065 19.5 17.0533 18.9675C17.6 18.4349 17.6 17.5778 17.6 15.8636V8.59091M9.2 10.4091V15.8636M12 10.4091V15.8636M14.8 10.4091V15.8636" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-copy" viewBox="0 0 24 24">
            <title>Copy</title>
            <path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-about" viewBox="0 0 24 24">
            <title>About</title>
            <path d="M14.5776 14.5419C15.5805 13.53 16.2 12.1373 16.2 10.6C16.2 7.50721 13.6928 5 10.6 5C7.50721 5 5 7.50721 5 10.6C5 13.6928 7.50721 16.2 10.6 16.2C12.1555 16.2 13.5628 15.5658 14.5776 14.5419ZM14.5776 14.5419L19 19M10.25 14.0167V14.25M10.25 12.6167C10.25 11.912 10.7096 11.2784 11.4106 11.0167L11.5 10.9833C12.255 10.7015 12.75 10.019 12.75 9.26013V9.11667C12.75 8.08574 11.8546 7.25 10.75 7.25C9.64543 7.25 8.75 8.08574 8.75 9.11667" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-settings" viewBox="0 0 24 24">
            <title>Setting</title>
            <path d="M10.4 5.6C10.4 4.84575 10.4 4.46863 10.6343 4.23431C10.8686 4 11.2458 4 12 4C12.7542 4 13.1314 4 13.3657 4.23431C13.6 4.46863 13.6 4.84575 13.6 5.6V6.6319C13.9725 6.74275 14.3287 6.8913 14.6642 7.07314L15.3942 6.34315C15.9275 5.80982 16.1942 5.54315 16.5256 5.54315C16.8569 5.54315 17.1236 5.80982 17.6569 6.34315C18.1903 6.87649 18.4569 7.14315 18.4569 7.47452C18.4569 7.80589 18.1903 8.07256 17.6569 8.60589L16.9269 9.33591C17.1087 9.67142 17.2573 10.0276 17.3681 10.4H18.4C19.1542 10.4 19.5314 10.4 19.7657 10.6343C20 10.8686 20 11.2458 20 12C20 12.7542 20 13.1314 19.7657 13.3657C19.5314 13.6 19.1542 13.6 18.4 13.6H17.3681C17.2573 13.9724 17.1087 14.3286 16.9269 14.6641L17.6569 15.3941C18.1902 15.9275 18.4569 16.1941 18.4569 16.5255C18.4569 16.8569 18.1902 17.1235 17.6569 17.6569C17.1236 18.1902 16.8569 18.4569 16.5255 18.4569C16.1942 18.4569 15.9275 18.1902 15.3942 17.6569L14.6642 16.9269C14.3286 17.1087 13.9724 17.2573 13.6 17.3681V18.4C13.6 19.1542 13.6 19.5314 13.3657 19.7657C13.1314 20 12.7542 20 12 20C11.2458 20 10.8686 20 10.6343 19.7657C10.4 19.5314 10.4 19.1542 10.4 18.4V17.3681C10.0276 17.2573 9.67142 17.1087 9.33591 16.9269L8.60598 17.6569C8.07265 18.1902 7.80598 18.4569 7.47461 18.4569C7.14324 18.4569 6.87657 18.1902 6.34324 17.6569C5.80991 17.1235 5.54324 16.8569 5.54324 16.5255C5.54324 16.1941 5.80991 15.9275 6.34324 15.3941L7.07314 14.6642C6.8913 14.3287 6.74275 13.9725 6.6319 13.6H5.6C4.84575 13.6 4.46863 13.6 4.23431 13.3657C4 13.1314 4 12.7542 4 12C4 11.2458 4 10.8686 4.23431 10.6343C4.46863 10.4 4.84575 10.4 5.6 10.4H6.6319C6.74275 10.0276 6.8913 9.67135 7.07312 9.33581L6.3432 8.60589C5.80987 8.07256 5.5432 7.80589 5.5432 7.47452C5.5432 7.14315 5.80987 6.87648 6.3432 6.34315C6.87654 5.80982 7.1432 5.54315 7.47457 5.54315C7.80594 5.54315 8.07261 5.80982 8.60594 6.34315L9.33588 7.07308C9.6714 6.89128 10.0276 6.74274 10.4 6.6319V5.6Z" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.4 12C14.4 13.3255 13.3255 14.4 12 14.4C10.6745 14.4 9.6 13.3255 9.6 12C9.6 10.6745 10.6745 9.6 12 9.6C13.3255 9.6 14.4 10.6745 14.4 12Z" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-zoom-in" viewBox="0 0 24 24">
            <title>Zoom in</title>
            <path d="M14.5776 14.5419C15.5805 13.53 16.2 12.1373 16.2 10.6C16.2 7.50721 13.6928 5 10.6 5C7.50721 5 5 7.50721 5 10.6C5 13.6928 7.50721 16.2 10.6 16.2C12.1555 16.2 13.5628 15.5658 14.5776 14.5419ZM14.5776 14.5419L19 19M7.8 10.6H13.4M10.6 7.8V13.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        <symbol id="gs-icon-zoom-out" viewBox="0 0 24 24">
            <title>Zoom out</title>
            <path d="M14.5776 14.5419C15.5805 13.53 16.2 12.1373 16.2 10.6C16.2 7.50721 13.6928 5 10.6 5C7.50721 5 5 7.50721 5 10.6C5 13.6928 7.50721 16.2 10.6 16.2C12.1555 16.2 13.5628 15.5658 14.5776 14.5419ZM14.5776 14.5419L19 19M7.8 10.6H13.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
    <svg>
    `;

    class GSIcon extends HTMLElement {
        static observedAttributes = ['icon', 'title'];

        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($template.content.cloneNode(true));
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch(name) {
                case 'icon':
                    this.setIcon(newValue);
                    break;
                case 'title':
                    this.setTitle(newValue);
                    break;
            }
        }

        setIcon(icon) {
            if (!icon) {
                return;
            }
            
            const $svg = this.shadowRoot.querySelector('svg.gs-icon');
            const $icon = $icons.querySelector(`#gs-icon-${icon}`);

            $svg.innerHTML = $icon.innerHTML;
            $svg.setAttribute('viewBox', $icon.getAttribute('viewBox'));
        }

        setTitle(title) {
            const $title = this.shadowRoot.querySelector('svg title');

            if (!$title) {
                return;
            }

            $title.innerHTML = title;
        }
    }

    customElements.define('gs-icon', GSIcon);
})();
