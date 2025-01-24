import { getSettingsStore } from "../modules/settings-store.js";

(function () {
    const $dialogTemplate = document.createElement('template');
    $dialogTemplate.innerHTML = `
    <style>
        form {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        fieldset > div {
            display: grid;
        }
        fieldset label {
            grid-column-start: 1;
        }
        fieldset input {
            grid-column-start: 2;
        }
    </style>
    <gs-dialog>
        <form method="dialog">
            <fieldset>
                <legend>API Keys</legend>

                <div>
                    <label for="gcloud-vision-key">Google Cloud Vision API:</label>
                    <input type="password" id="gcloud-vision-key" name="gcloud-vision-key" required>

                </div>
            </fieldset>

            <fieldset>
                <legend>Looks</legend>
                <div>
                    <label for="dark-theme">Dark mode:</label>
                    <input type="checkbox" id="dark-theme" name="dark-theme">
                </div>
            </fieldset>
        </form>

        <gs-menu slot="action-menu">
            <li><gs-btn value="cancel">Cancel</gs-btn></li>
            <li><gs-btn submit>Save</gs-btn></li>
        </gs-menu>
    </gs-dialog>
    `;

    const settings = getSettingsStore();

    class GSSettings extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open'});
            this.shadowRoot.appendChild($dialogTemplate.content.cloneNode(true));

            this.$dialog = this.shadowRoot.querySelector('gs-dialog');

            this.shadowRoot.querySelector('gs-btn[value=cancel]').addEventListener('click', () => {
                this.$dialog.close();
            });
            this.shadowRoot.querySelector('gs-btn[submit]').addEventListener('click', (e) => {
                e.preventDefault();

                //store settings
                const input = {
                    'gcloud-vision-key': this.shadowRoot.querySelector('[id="gcloud-vision-key"]').value,
                    'theme': this.shadowRoot.querySelector('[id="dark-theme"]').checked ? 'dark' : 'light'
                };
                for (const [key, value] of Object.entries(input)) {
                    settings.set(key, value);
                }

                this.$dialog.close();
                
                this.dispatchEvent(new CustomEvent(
                    'gs-settings-applied',
                    {
                        bubbles: true,
                        cancelable: true,
                        detail: input
                    }
                ));
            });
        }

        open() {
            this.shadowRoot.querySelector('[id="gcloud-vision-key"]').value = settings.get('gcloud-vision-key');
            this.shadowRoot.querySelector('[id="dark-theme"]').checked      = (settings.get('theme') == 'dark');

            this.$dialog.open();
        }
    }

    customElements.define('gs-settings', GSSettings);
})();