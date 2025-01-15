import { getScanner } from './modules/gvision-scanner.js';
import { getSettingsStore } from './modules/settings-store.js';
import { analyzeText, setTokenizer } from './modules/text-analyzer.js';

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
        document.getElementById('gs-about').open();
    });
    document.getElementById('gs-imprint-btn').addEventListener('click', () => {
        document.getElementById('gs-imprint').open();
    });
    document.getElementById('gs-privacy-btn').addEventListener('click', () => {
        document.getElementById('gs-privacy').open();
    });

    // prepare OCR scanner
    let gcloud_key = settings.get('gcloud-vision-key');
    let scanner    = getScanner(gcloud_key);

    if (!gcloud_key) {
        //todo lock down application and show hint
    }

    setTokenizer(await new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: "/node_modules/@sglkc/kuromoji/dict/" }).build((err, tokenizer) => {
            if(err) {
                reject();
            }
            // tokenizer is ready
            resolve(tokenizer);
        });
    }));
    const $log = document.querySelector('#gakuscan-log > gakuscan-entry-log');

    document.getElementById('gakuscan-capture').addEventListener('gakuscan-capture-selected', async ({detail}) => {
        const entry = await scanner.scan(detail);
        analyzeText(entry);
        $log.addEntry(entry);
    });

    $log.renderStoredEntries();
});