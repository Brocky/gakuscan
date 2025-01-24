import { getScanner } from './modules/gvision-scanner.js';
import { getTranslator } from './modules/deepl-translator.js';
import { getSettingsStore } from './modules/settings-store.js';
import { analyzeText, setTokenizer } from './modules/text-analyzer.js';

const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const settings        = getSettingsStore();

let OCRScanner = null;
let translator = null;

// Initiales Laden des Themes
document.documentElement.setAttribute('data-theme', settings.get('theme') || (userPrefersDark ? 'dark' : 'light'));
settings.watch('theme', ({newValue}) => {
    document.documentElement.setAttribute('data-theme', newValue);
});


// Setup functionality after page is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    const $log     = document.querySelector('#gakuscan-log > gakuscan-entry-log');
    const $capture = document.querySelector('#gakuscan-capture > gakuscan-capture-ctrl');

    const showCaptureCtrl = () => {
        OCRScanner = getScanner(settings.get('gcloud-vision-key'));
        document.getElementById('gs-apikey-hint').classList.add('gs-hidden');
        $capture.classList.remove('gs-hidden');
    };
    const enableTranslation = () => {
        translator = getTranslator(settings.get('deepl-key'));
        $log.enableTranslation();
    }

    // show capture control if api key is already set
    if (settings.get('gcloud-vision-key')) {
        showCaptureCtrl();
    }
    // if api key is changed..
    settings.watch('gcloud-vision-key', ({newValue}) => {
        // ...hide capture control if empty...
        if(!newValue) {
            OCRScanner = null;
            document.getElementById('gs-apikey-hint').classList.remove('gs-hidden');
            $capture.classList.add('gs-hidden');
            return;
        }
        // ...or show capture control
        showCaptureCtrl();
    });
    
    if (settings.get('deepl-key')) {
        enableTranslation();
    }
    settings.watch('deepl-key', ({newValue}) => {
        if (!newValue) {
            translator = null;
            $log.disableTranslation();
            return;
        }
        enableTranslation();
    });

    // prepare dialog opener
    document.getElementById('gs-settings-btn').addEventListener('click', () => {
        document.querySelector('gs-settings').open();
    });
    document.querySelector('a[href="#settings"]').addEventListener('click', (e) => {
        e.preventDefault();
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

    // initialize kuromoji tokenizer
    setTokenizer(await new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: "/node_modules/@sglkc/kuromoji/dict/" }).build((err, tokenizer) => {
            if(err) {
                reject();
            }
            // tokenizer is ready
            resolve(tokenizer);
        });
    }));

    // add analysation after OCR scan
    document.getElementById('gakuscan-capture').addEventListener('gakuscan-capture-selected', async ({detail}) => {
        const {removeLoader} = $log.showLoadingAnim();
        const entry = await OCRScanner.scan(detail);
        analyzeText(entry);
        removeLoader();
        $log.addEntry(entry);
    });

    $log.addEventListener('gakuscan-translation-request', async ({detail}) => {
        if (!translator) {
            return;
        }

        const translation = await translator.translate(detail.text);
    });

    // load and display stored entries
    $log.renderStoredEntries();
});