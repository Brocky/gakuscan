import { getEntryRepo } from "../modules/entry-repository.js";
import { analyzeText } from "../modules/text-analyzer.js";

(function () {
    const $loadingTemplate = document.createElement('template');
    $loadingTemplate.innerHTML = `
    <section class="gs-entry-loading">
        <gs-logo loading></gs-logo>
    </section>
    `;
    const $entryTemplate = document.createElement('template');
    $entryTemplate.innerHTML = `
    <section class="gakuscan-entry" data-highlight>
        <span class="gakuscan-entry-time"></span>
        <div class="gakuscan-entry-wrapper">
            <p class="gakuscan-entry-text"></p>
            <figure class="gs-entry-img" data-zoom="in">
                <div class="gs-entry-selection"></div>
            </figure>
        </div>
        <gs-menu class="gakuscan-entry-tools">
            <li><gs-btn icon="zoom-out" title="Toggle zoom" class="gakuscan-entry-zoom gs-hidden"></gs-btn></li>
            <li><gs-btn icon="translate" title="Translate at DeepL" class="gakuscan-entry-translate"></gs-btn></li>
            <li><gs-btn icon="copy" title="Copy to clipboard" class="gakuscan-entry-copy"></gs-btn></li>
            <li><gs-btn icon="edit" title="Edit scanned text" class="gakuscan-entry-edit"></gs-btn></li>
            <li><gs-btn icon="trash" title="Delete entry" class="gakuscan-entry-delete"></gs-btn></li>
        </gs-menu>
    </section>
    `;
    const $logTemplate = document.createElement('template');
    $logTemplate.innerHTML = `
    <style>
        p {
            margin-block-start: 0;
            margin-block-end: 0;
        }
        .gakuscan-hidden {
            display: none;
        }
        #gakuscan-entry-log {
            box-sizing: border-box;
            height: 100%;
            padding: var(--medium-gab);
            overflow-y: scroll;
            overflow-x: hidden;
        }
        #gakuscan-entry-log > section {
            display: flex;
            justify-content: center;
        }
        .gs-entry-loading {
            font-size: 5rem;
        }
        .gakuscan-entry {
            flex-direction: column;
            position: relative;
            background: color-mix(in srgb, var(--bg-plain) 70%, transparent);
            box-shadow: var(--box-shadow);
            border: var(--border-style);
            padding: var(--small-gab);
            margin-bottom: var(--large-gab);
        }
        .gakuscan-entry-text {
            flex-grow: 1;
            font-size: x-large;
            padding: 0 var(--medium-gab);
        }
        .gakuscan-entry-time {
            font-size: small;
            color: color-mix(in srgb, var(--text-color) 88%, transparent);
            align-self: flex-end;
            margin: 0 var(--medium-gab);
        }
        .gakuscan-entry-tools {
            align-self: flex-end;
            margin: 0  var(--medium-gab);
        }

        /*#gakuscan-entry-log:not([data-translate]) li:has(.gakuscan-entry-translate) {
            display: none;
        }*/

        .gakuscan-edit-wrapper {
            flex-grow: 1;
            display: grid;
        }
        .gakuscan-edit-wrapper::after {
            content: attr(data-replicated-value) " ";
            visibility: hidden;
        }
        .gakuscan-edit-wrapper > textarea {
            resize: none;
            overflow: hidden;
        }
        .gakuscan-edit-wrapper > textarea,
        .gakuscan-edit-wrapper::after {
            border: 1px solid rgba(0, 0, 0, 0.4);
            grid-area: 1 / 1 / 2 / 2;
            font-size: x-large;
            padding: 0 var(--medium-gab);
            white-space: pre-line;
        }
        .gs-entry-img {
            position: relative;
            height: fit-content;
            width: fit-content;
            max-width: 90%;
            margin: var(--medium-gab) auto;
        }
        .gs-entry-img[data-zoom="in"] > img {
            display: none;
        }
        .gs-entry-selection {
            top: 0;
            left: 0;
            transition: top, left, transform var(--transition-time);
        }
        .gs-entry-img[data-zoom="out"] .gs-entry-selection {
            position: absolute;
            top: var(--bound-y);
            left: var(--bound-x);
            width: var(--bound-w);
            height: var(--bound-h);
            border: .1rem dashed green;
        }

        .gakuscan-entry-wrapper {
            display: flex;
            flex-direction: column;
        }
        @media (orientation: portrait) {
            #gakuscan-entry-log {
                overflow-y: auto;
            }
            .gakuscan-entry-wrapper {
                display: flex;
                flex-direction: row-reverse;
            }
            .gs-entry-img {
                max-width: 30%;
                margin-right: var(--medium-gab);
            }
        }
    </style>
    <div id="gakuscan-entry-log">
    </div>
    `;

    class EntryLog extends HTMLElement {
        db       = null; //indexeddb connection
        $list    = null; //entry list container
        oldestId = null;

        constructor() {
            super();
            //shadowDOM does not work with Yomitan see (Yomitan#1044)[https://github.com/yomidevs/yomitan/issues/1044]
            //this.attachShadow({ mode: 'open', delegatesFocus: true});

            // create element from template
            this.appendChild($logTemplate.content.cloneNode(true));
            this.$list = document.getElementById('gakuscan-entry-log');

            let loading   = false;
            let allLoaded = false;

            // loading functionallity for infinite scrolling
            const loadNextBatch = async () => {
                loading = true;
                const {removeLoader} = this.showLoadingAnim(true);
                const entries = await this.db.getNextBatch(this.oldestId, 6, (entry) => {
                    this.renderEntry(entry, 'bottom');
                });
                if (entries && entries.length > 0) {
                    this.oldestId = entries[entries.length - 1].id;
                } else {
                    allLoaded = true;
                }
                removeLoader();
                loading = false;
            };

            // load when list gets scrolled in landscape
            this.$list.addEventListener('scroll', async () => {
                if (this.$list.scrollTop + this.$list.clientHeight >= this.$list.scrollHeight - (window.innerHeight * .5) && !loading && !allLoaded) {
                    await loadNextBatch();
                }
            });
            // scroll handler when in portrait
            window.addEventListener("scroll", async () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - (window.innerHeight * .5) && !loading && !allLoaded) {
                    await loadNextBatch();
                }
              });
        }

        async connectedCallback() {
            // request the indexedDB connection
            this.db = await getEntryRepo();
        }

        async renderStoredEntries() {
            const {removeLoader} = this.showLoadingAnim();

            const entries = await this.db.getNewest(6, (entry) => {
                this.renderEntry(entry, 'bottom');
            });
            if (entries) {
                this.oldestId = entries[entries.length - 1].id;
            }
            removeLoader();
        }

        showLoadingAnim(bottom = false) {
            // display loading info
            const $loader = $loadingTemplate.content.querySelector('.gs-entry-loading').cloneNode(true);
            if (bottom) {
                this.$list.append($loader);
            } else {
                this.$list.prepend($loader);
            }
            return {
                $: $loader,
                removeLoader: () => {
                    $loader.remove();
                }
            }
        }

        enableTranslation() {
            this.$list.dataset.translate = true;
        }

        disableTranslation() {
            delete this.$list.dataset.translate;
        }

        async addEntry(entry) {
            // do nothing if entry is no proper object
            if (entry === null || typeof entry !== 'object' || Array.isArray(entry) || !Object.hasOwn(entry, 'fullText')) {
                return;
            }

            // set timestamp if not present
            if(!Object.hasOwn(entry, 'time')) {
                entry.time = Math.floor(Date.now() / 1000);
            }

            // store to db and display
            entry = await this.db.add(entry);
            this.renderEntry(entry);
        }
        
        async deleteEntry(id) {
            // delete entry and remove from DOM
            await this.db.delete(id);
            document.getElementById(`gakuscan-entry-${id}`).remove();
        }

        renderEntry(entry, at='top') {
            // get the needed element objects
            const $entryTmp     = $entryTemplate.content.cloneNode(true);
            const $entry        = $entryTmp.querySelector('.gakuscan-entry');
            
            // set text, time and id
            const { id, time }                                     = entry;
            $entry.querySelector('.gakuscan-entry-time').innerText = (new Date(time * 1000)).toLocaleString(navigator.language);
            $entry.id                                              = `gakuscan-entry-${id}`;

            this.updateEntryView(entry, $entry);

            // add handler for entry tools
            const $zoomBtn = $entry.querySelector('.gakuscan-entry-zoom');
            $zoomBtn.addEventListener('click', () => {
                const $imgWrapper = $entry.querySelector('.gs-entry-img');
                if ($imgWrapper.dataset.zoom == 'in') {
                    $imgWrapper.dataset.zoom = 'out';
                    $zoomBtn.setAttribute('icon', 'zoom-in');
                } else {
                    $imgWrapper.dataset.zoom = 'in';
                    $zoomBtn.setAttribute('icon', 'zoom-out');
                }
            });
            $entry.querySelector('.gakuscan-entry-translate').addEventListener('click', () => {
                const text = $entry.querySelector('.gakuscan-entry-text').innerText;
                this.dispatchEvent(new CustomEvent(
                    'gakuscan-translation-request',
                    {
                        bubbles: true,
                        cancelable: true,
                        detail: {
                            entryId: entry.id,
                            text,
                        }
                    }
                ));
                window.open(`https://www.deepl.com/en/translator#ja/en-gb/${text}`);
            });
            $entry.querySelector('.gakuscan-entry-copy').addEventListener('click', () => {
                const text = $entry.querySelector('.gakuscan-entry-text').innerText;
                //console.log(text + 'copied to clipboard');
                navigator.clipboard.writeText(text);
            });
            $entry.querySelector('.gakuscan-entry-delete').addEventListener('click', () => {
                this.deleteEntry(id);
            });
            $entry.querySelector('.gakuscan-entry-edit').addEventListener('click', () => {
                this.editEntry(entry, $entry);
            });

            // append the new entry before any previous entries
            const $lastEntry = this.$list.querySelector('.gakuscan-entry');
            if (!$lastEntry || at == 'bottom') {
                this.$list.append($entryTmp);
                return;
            }
            this.$list.insertBefore($entryTmp, $lastEntry);
        }

        editEntry(entry, $entry) {
            const $entryText    = $entry.querySelector('.gakuscan-entry-text');
            const $entryEditBtn = $entry.querySelector('.gakuscan-entry-edit');

            // create elements for editing an entry
            const $editorWrapper = document.createElement('div'); 
            const $editor        = document.createElement('textarea');

            // the wrapper is used for proper display
            $editorWrapper.classList.add('gakuscan-edit-wrapper');
            $editorWrapper.dataset.replicatedValue = $entryText.innerText
            
            // prepare editor
            $editor.classList.add('gakuscan-entry-text');
            $editor.value = $entryText.innerText.replace(/<br\s*[\/]?>/gi, "\n");
            
            // hide original text and disable input
            $entryText.classList.add('gakuscan-hidden');
            $entryEditBtn.disabled = true;

            // sync textarea content to wrapper data attribute
            $editor.addEventListener('input', () => {
                $editorWrapper.dataset.replicatedValue = $editor.value;
            });

            // apply changes when focus changes
            $editor.addEventListener('focusout', async () => {
                $editor.disabled = true;

                // update entry with new text and re-run analysis
                entry.fullText   = $editor.value;
                analyzeText(entry);
                
                // store updated entry
                entry = await this.db.update(entry);

                // update view and remove editor
                this.updateEntryView(entry, $entry);
                $editorWrapper.remove();
                $entryText.classList.remove('gakuscan-hidden');
                $entryEditBtn.disabled = false;
            }, false);

            // add editor to DOM
            $editorWrapper.append($editor);
            $entryText.parentElement.insertBefore($editorWrapper, $entryText);
            $editor.focus();
        }

        updateEntryView(entry, $entry) {
            const $entryText        = $entry.querySelector('p.gakuscan-entry-text');
            const $imgWrapper       = $entry.querySelector('.gs-entry-img');
            const $selectionWrapper = $entry.querySelector('.gs-entry-selection');
            const $zoomBtn          = $entry.querySelector('.gakuscan-entry-zoom');
            
            let $frame = $imgWrapper.querySelector('img');

            // clear text
            $entryText.innerHTML = '';
            $zoomBtn.classList.add('gs-hidden');

            if (Object.hasOwn(entry, 'analizedText')) {
                let i = 0;
                entry.analizedText.forEach((token) => {
                    // create element for token
                    const $token     = document.createElement('span');
                    $token.innerText = token.text;

                    // add details if known
                    if (token.details) {
                        token.details.forEach(detail => {
                            $token.classList.add('gs-' + detail.replaceAll(' ', '-'));
                        });
                        $token.classList.add('gs-analized');

                        // build tooltip from details
                        $token.title = [token.basic_form, ...token.details].join(' · ');
                        $token.id    = `gs-entry-${entry.id}-token-${i}`;

                        // add handler for hover effect
                        if (token.annotations) {
                            $token.addEventListener('mouseenter', () => {
                                token.annotations.forEach((annoId) => {
                                    const $ = document.getElementById(`gs-entry-${entry.id}-anno-${annoId}`);
                                    if ($) {
                                        $.classList.add('gs-highlight');
                                    }
                                });
                            }); 
                            $token.addEventListener('mouseleave', () => {
                                token.annotations.forEach((annoId) => {
                                    const $ = document.getElementById(`gs-entry-${entry.id}-anno-${annoId}`);
                                    if ($) {
                                        $.classList.remove('gs-highlight');
                                    }
                                });
                            });
                        }
                    }
                    // add token element to text container
                    $entryText.appendChild($token);
                    i++;
                });
            } else {
                $entryText.innerText = entry.fullText;
            }
            
            // clear image
            $selectionWrapper.innerHTML = '';
            if ($frame) {
                $frame.remove();
            }

            // build image + annotations
            if (Object.hasOwn(entry, 'image') && Object.hasOwn(entry, 'annotation')) {
                const $selection = document.createElement('img');

                $selection.src = entry.image.selection.dataURL;
                $selectionWrapper.appendChild($selection);

                // convert selection bounds and assign as css variable
                const bounds = {
                    x: (entry.image.selection.bounds.x * 100) + '%',
                    y: (entry.image.selection.bounds.y * 100) + '%',
                    w: (entry.image.selection.bounds.w * 100) + '%',
                    h: (entry.image.selection.bounds.h * 100) + '%'
                }
                let styleVars = '';
                Object.keys(bounds).forEach((key) => {
                    styleVars += `--bound-${key}: ` + bounds[key] + ';';
                });
                $selectionWrapper.setAttribute('style', styleVars);

                // if frame is available enable zoom-out
                if (Object.hasOwn(entry.image, 'frame')) {
                    $frame = document.createElement('img');
                    $frame.src = entry.image.frame.dataURL;
                    $imgWrapper.insertBefore($frame, $selectionWrapper);

                    $frame.addEventListener('load', () => {
                        $zoomBtn.classList.remove('gs-hidden');
                    });
                }

                // add annotaions after image is loaded
                $selection.addEventListener('load', () => {
                    let i = 0;
                    entry.annotation.forEach(annotation => {
                        const $annotation     = document.createElement('div');
                        $annotation.className = 'gakuscan-entry-anno';

                        // apply coords
                        $annotation.style.left   = (annotation.bounds.x * 100) + '%';
                        $annotation.style.top    = (annotation.bounds.y * 100) + '%';
                        $annotation.style.width  = (annotation.bounds.w * 100) + '%';
                        $annotation.style.height = (annotation.bounds.h * 100) + '%';

                        $annotation.title = annotation.text;
                        $annotation.id    = `gs-entry-${entry.id}-anno-${i}`;

                        if(Object.hasOwn(annotation, 'tokens') && annotation.tokens) {
                            const firstTokenId = annotation.tokens[0];
                            const token = entry.analizedText[firstTokenId];

                            if(token) {
                                $annotation.title = [token.basic_form, ...token.details].join(' · ');
                                token.details.forEach(detail => {
                                    $annotation.classList.add('gs-' + detail.replaceAll(' ', '-'));
                                });

                                
                                // add handler for hover effect
                                $annotation.addEventListener('mouseenter', () => {
                                    token.annotations.forEach((annoId) => {
                                        const $ = document.getElementById(`gs-entry-${entry.id}-token-${firstTokenId}`);
                                        if ($) {
                                            $.classList.add('gs-highlight');
                                        }
                                    });
                                }); 
                                $annotation.addEventListener('mouseleave', () => {
                                    token.annotations.forEach((annoId) => {
                                        const $ = document.getElementById(`gs-entry-${entry.id}-token-${firstTokenId}`);
                                        if ($) {
                                            $.classList.remove('gs-highlight');
                                        }
                                    });
                                });
                            }
                        }
    
                        $selectionWrapper.appendChild($annotation);
                        i++;
                    });
                });
            }
        }
    }

    customElements.define('gakuscan-entry-log', EntryLog);
})();