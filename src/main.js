import { getScanner } from './modules/gvision-scanner.js';
import { getSettingsStore } from './modules/settings-store.js';

const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const settings        = getSettingsStore();

// Initiales Laden des Themes
document.documentElement.setAttribute('data-theme', settings.get('theme') || (userPrefersDark ? 'dark' : 'light'));
settings.watch('theme', ({newValue}) => {
    document.documentElement.setAttribute('data-theme', newValue);
});

document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById('gs-settings-btn').addEventListener('click', () => {
        document.querySelector('gs-settings').open();
    });
    document.getElementById('gs-about-btn').addEventListener('click', () => {
        document.querySelector('gs-about').open();
    });

    // prepare OCR scanner
    let gcloud_key = localStorage.getItem('gcloud-vision-key');
    let scanner    = getScanner(gcloud_key);

    if (!gcloud_key) {
        //todo lock down application and show hint
    }

    const $log    = document.querySelector('#gakuscan-log > gakuscan-entry-log');

    document.getElementById('gakuscan-capture').addEventListener('gakuscan-capture-selected', async ({detail}) => {
        const {selected} = detail;
        const result = await scanner.scan(selected);
        $log.addEntry(result);
    });

    await $log.setKuromoji(kuromoji);
    $log.renderStoredEntries();
});