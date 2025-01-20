import { getEntryRepo } from "../modules/entry-repository.js";
import { analyzeText } from "../modules/text-analyzer.js";

(function () {
    const $entryTemplate = document.createElement('template');
    $entryTemplate.innerHTML = `
    <section class="gakuscan-entry" data-highlight>
        <span class="gakuscan-entry-time"></span>
        <div class="gakuscan-entry-wrapper">
            <p class="gakuscan-entry-text"></p>
            <figure class="gakuscan-entry-img"></figure>
        </div>
        <gs-menu class="gakuscan-entry-tools">
            <li><gs-btn icon="copy" class="gakuscan-entry-copy"></gs-btn></li>
            <li><gs-btn icon="edit" class="gakuscan-entry-edit"></gs-btn></li>
            <li><gs-btn icon="trash" class="gakuscan-entry-delete"></gs-btn></li>
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
        .gakuscan-entry {
            position: relative;
            background: color-mix(in srgb, var(--bg-plain) 70%, transparent);
            box-shadow: var(--box-shadow);
            border: var(--border-style);
            padding: .2rem;
            margin-bottom: .8rem;
            display: flex;
            flex-direction: column;
        }
        .gakuscan-entry-text {
            flex-grow: 1;
            font-size: x-large;
            padding: 0 .5rem;
        }
        .gakuscan-entry-time {
            font-size: small;
            color: color-mix(in srgb, var(--text-color) 88%, transparent);
            align-self: flex-end;
            margin: 0 .4rem;
        }
        .gakuscan-entry-tools {
            align-self: flex-end;
            margin: 0 .4rem;
        }
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
            padding: 0 .5rem;
            white-space: pre-line;
        }
        .gakuscan-entry-img {
            position: relative;
            height: fit-content;
            width: fit-content;
            margin: .5rem auto;
        }
        .gakuscan-entry-wrapper {
            display: flex;
            flex-direction: column;
        }
        @media (orientation: portrait) {
            .gakuscan-entry-wrapper {
                display: flex;
                flex-direction: row-reverse;
            }
            .gakuscan-entry-img {
                position: relative;
                height: fit-content;
                width: fit-content;
                margin-right: .5rem;
            }
            .gakuscan-entry-img > img {
                max-width: 20rem;
            }
        }
    </style>
    <div id="gakuscan-entry-log">
    </div>
    `;

    class EntryLog extends HTMLElement {
        db       = null; //indexeddb connection
        $list    = null; //entry list container

        constructor() {
            super();
            //shadowDOM does not work with Yomitan
            //this.attachShadow({ mode: 'open', delegatesFocus: true});
        }

        async connectedCallback() {
            // create element from template
            this.appendChild($logTemplate.content.cloneNode(true));
            this.$list = document.getElementById('gakuscan-entry-log');

            // request the indexedDB connection
            this.db = await getEntryRepo();
        }

        async renderStoredEntries() {
            const entries = await this.db.load();
            entries.forEach((entry) => {
                this.renderEntry(entry);
            });
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

        renderEntry(entry) {
            // get the needed element objects
            const $entryTmp     = $entryTemplate.content.cloneNode(true);
            const $entry        = $entryTmp.querySelector('.gakuscan-entry');
            
            // set text, time and id
            const { id, time }                                     = entry;
            $entry.querySelector('.gakuscan-entry-time').innerText = (new Date(time * 1000)).toLocaleString(navigator.language);
            $entry.id                                              = `gakuscan-entry-${id}`;

            this.updateEntryView(entry, $entry);

            // add handler for entry tools
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

            // append the text to the top of the log
            this.$list.insertBefore($entryTmp, this.$list.firstChild);
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
            const $entryText  = $entry.querySelector('p.gakuscan-entry-text');
            const $imgWrapper = $entry.querySelector('.gakuscan-entry-img');

            // clear text
            $entryText.innerHTML = '';

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
            $imgWrapper.innerHTML = '';

            // build image + annotations
            if (Object.hasOwn(entry, 'image') && Object.hasOwn(entry, 'annotation')) {
                const $img = document.createElement('img');

                $img.src = entry.image.selection.dataURL;
                $imgWrapper.appendChild($img);

                // add annotaions after image is loaded
                $img.addEventListener('load', () => {
                    let i = 0;
                    entry.annotation.forEach(annotation => {
                        const $annotation     = document.createElement('div');
                        $annotation.className = 'gakuscan-entry-anno';

                        // convert coords to %
                        const x = annotation.bounds.x * 100;
                        const y = annotation.bounds.y * 100;
                        const w = annotation.bounds.w * 100;
                        const h = annotation.bounds.h * 100;
    
                        // apply coords
                        $annotation.style.left   = `${x}%`;
                        $annotation.style.top    = `${y}%`;
                        $annotation.style.width  = `${w}%`;
                        $annotation.style.height = `${h}%`;

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
    
                        $imgWrapper.appendChild($annotation);
                        i++;
                    });
                });
            }
        }
    }

    customElements.define('gakuscan-entry-log', EntryLog);
})();