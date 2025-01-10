import {getScanner} from './modules/gvision-scanner.js';
        
// Initiales Laden des Themes
const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme      = localStorage.getItem('theme') || (userPrefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);

document.addEventListener("DOMContentLoaded", async () => {
    const $settings = document.querySelector('gs-settings');

    $settings.addEventListener('gs-settings-applied', (e) => {
        document.documentElement.setAttribute('data-theme', e.detail.theme);
    });
    document.getElementById('gs-settings-btn').addEventListener('click', () => {
        $settings.open();
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