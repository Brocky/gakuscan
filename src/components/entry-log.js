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
            box-shadow: var(--box-shadow);
            border: var(--border-style);
            padding: .2rem;
            margin-bottom: .8rem;
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.3s, color 0.3s;
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
        .gakuscan-entry-img > img {
            max-height: 20rem;
            max-width: 100%;
        }
        .gakuscan-entry-img div.gakuscan-entry-anno {
            border: 1px solid;
            position: absolute;
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

        .gakuscan-noun {
            --highlight-color: #007ACC;
        }
        .gakuscan-pronoun {
            --highlight-color: #1E90FF;
        }
        .gakuscan-verb {
            --highlight-color: #FF4500;
        }
        .gakuscan-particle {
            --highlight-color: #228B22;
        }
        .gakuscan-adjective {
            --highlight-color: #FFA500;
        }
        .gakuscan-adverb {
            --highlight-color: #FFD700;
        }
        .gakuscan-auxiliary-verb {
            --highlight-color: #800080;
        }
        .gakuscan-interjection {
            --highlight-color: #FF69B4;
        }
        [data-highlight] .gakuscan-analized {
            background: color-mix(in srgb, var(--highlight-color) 50%, transparent);
            border: .2rem solid color-mix(in srgb, var(--highlight-color) 20%, transparent);
            background-clip: content-box;
        }
        .gakuscan-analized:hover {
            text-decoration: underline;
        }
    </style>
    <div id="gakuscan-entry-log">
    </div>
    `;

    const detailTranslation = {
        名詞: 'noun',
        代名詞: 'pronoun',
        一般: 'general',
        動詞: 'verb',
        自立: 'independent',
        非自立: 'dependent',
        基本形: 'basic form',
        助詞: 'particle',
        格助詞: 'case-marking particle',
        連用形: 'continuative form',
        助動詞: 'auxiliary verb',
        連語: 'compound word',
        記号: 'sign',
        形容詞: 'adjective',
        終助詞: 'sentence ending',
        感動詞: 'interjection',
        副詞: 'adverb',
        助詞類接続: 'particle-like'
    }

    class EntryLog extends HTMLElement {
        kuromoji = null; //kuromoji tokenizer
        db       = null; //indexeddb connection
        $list    = null; //entry list container

        constructor() {
            super();
            //shadowDOM does not work with Yomitan
            //this.attachShadow({ mode: 'open', delegatesFocus: true});
        }

        connectedCallback() {
            // create element from template
            this.appendChild($logTemplate.content.cloneNode(true));
            this.$list = document.getElementById('gakuscan-entry-log');

            // request the indexedDB connection
            const dbRequest = indexedDB.open("cap2txt-local", 2);

            dbRequest.addEventListener('error', () => {
                console.error("Could not connect to IndexedDB!");
            });

            dbRequest.addEventListener('success', (event) => {
                this.db = event.target.result;

                this.db.addEventListener('error', (event) => {
                    // Generic error handler for all requests targeted at this database
                    console.error(`Database error: ${event.target.error?.message}`);
                });

                //The database is ready
                this.dispatchEvent(new CustomEvent(
                    'gakuscan-log-ready',
                    {
                        bubbles: true,
                        cancelable: true
                    }
                ));
            });

            dbRequest.addEventListener('upgradeneeded', (event) => {
                // Migrate to newest version
                const db = event.target.result;
                db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
            });
        }

        renderStoredEntries() {
            // read all entires and display them
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.openCursor().addEventListener('success', (event) => {
                let cursor = event.target.result;
                if (cursor) {
                    this.renderEntry(cursor.value);
                    cursor.continue();
                } else {
                    // emit event
                    this.dispatchEvent(new CustomEvent(
                        'gakuscan-log-loaded',
                        {
                            bubbles: true,
                            cancelable: true
                        }
                    ));
                }
            });
        }

        async setKuromoji(kuro) {
            this.kuromoji = await new Promise((resolve, reject) => {
                kuro.builder({ dicPath: "/node_modules/@sglkc/kuromoji/dict/" }).build((err, tokenizer) => {
                    if(err) {
                        reject();
                    }
                    // tokenizer is ready
                    resolve(tokenizer);
                });
            });
        }

        addEntry(entry) {
            if (entry === null || typeof entry !== 'object' || Array.isArray(entry) || !Object.hasOwn(entry, 'fullText')) {
                return;
            }

            if(!Object.hasOwn(entry, 'time')) {
                entry.time = Math.floor(Date.now() / 1000);
            }

            // save the new entry to the db and render if successful
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.add(entry).addEventListener('success', (e) => {
                entry.id = e.target.result;
                this.renderEntry(entry);
            });
        }
        
        deleteEntry(id) {
            // remove entry with given id from object store
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.delete(id).addEventListener('success', () => {
                this.removeEntry(id);
            });
        }

        removeEntry(id) {
            document.getElementById(`gakuscan-entry-${id}`).remove();
        }

        renderEntry(entry) {
            // get the needed element objects
            const $entryTmp     = $entryTemplate.content.cloneNode(true);
            const $entry        = $entryTmp.querySelector('.gakuscan-entry');
            const $entryText    = $entryTmp.querySelector('.gakuscan-entry-text');
            const $entryTime    = $entryTmp.querySelector('.gakuscan-entry-time');
            const $entryEditBtn = $entryTmp.querySelector('.gakuscan-entry-edit');
            
            // set text, time and id
            const { id, fullText, time } = entry;
            $entryTime.innerText = (new Date(time * 1000)).toLocaleString(navigator.language);
            $entry.id            = `gakuscan-entry-${id}`;

            this.renderEntryText($entryText, fullText);

            // build image + annotations
            if (Object.hasOwn(entry, 'img') && Object.hasOwn(entry, 'annotation')) {
                const $imgWrapper = $entryTmp.querySelector('.gakuscan-entry-img');
                const $img        = document.createElement('img');

                $img.src = entry.img;
                $imgWrapper.appendChild($img);

                // add annotaions after image is loaded
                $img.addEventListener('load', () => {
                    entry.annotation.forEach(annotation => {
                        const $annotation     = document.createElement('div');
                        $annotation.className = 'gakuscan-entry-anno';

                        // convert coords from px to %
                        const x = (annotation.bounds[0].x / $img.naturalWidth) * 100;
                        const y = (annotation.bounds[0].y / $img.naturalHeight) * 100;
                        const w = ((annotation.bounds[1].x - annotation.bounds[0].x) / $img.naturalWidth) * 100;
                        const h = ((annotation.bounds[2].y - annotation.bounds[0].y) / $img.naturalHeight) * 100;
    
                        // apply coords
                        $annotation.style.left   = `${x}%`;
                        $annotation.style.top    = `${y}%`;
                        $annotation.style.width  = `${w}%`;
                        $annotation.style.height = `${h}%`;

                        $annotation.title = annotation.text;
    
                        $imgWrapper.appendChild($annotation);
                    });
                });
            }

            // add handler for entry tools
            $entryTmp.querySelector('.gakuscan-entry-delete').addEventListener('click', () => {
                this.deleteEntry(id);
            });
            $entryEditBtn.addEventListener('click', () => {
                this.editEntry(entry, $entryText, $entryEditBtn);
            });

            // append the text to the top of the log
            this.$list.insertBefore($entryTmp, this.$list.firstChild);
        }

        editEntry(entry, $textContainer, $editButton) {
            // create elements for editing an entry
            const $editorWrapper = document.createElement('div'); 
            const $editor        = document.createElement('textarea');

            $editorWrapper.classList.add('gakuscan-edit-wrapper');
            $editorWrapper.dataset.replicatedValue = $textContainer.innerText
            
            $editor.classList.add('gakuscan-entry-text');
            $editor.value = $textContainer.innerText.replace(/<br\s*[\/]?>/gi, "\n");
            
            // hide original text and disable input
            $textContainer.classList.add('gakuscan-hidden');
            $editButton.disabled = true;

            // sync textarea content to wrapper data attribute
            $editor.addEventListener('input', () => {
                $editorWrapper.dataset.replicatedValue = $editor.value;
            });

            // apply changes when focus changes
            $editor.addEventListener('focusout', () => {
                $editor.disabled = true;
                entry.fullText   = $editor.value;
                
                //store in db
                const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
                store.put(entry).addEventListener('success', () => {
                    this.renderEntryText($textContainer, entry.fullText);
    
                    $editorWrapper.remove();
                    $textContainer.classList.remove('gakuscan-hidden');
                    $editButton.disabled = false;
                });

            }, false);

            // add editor to DOM
            $editorWrapper.append($editor);
            $textContainer.parentElement.insertBefore($editorWrapper, $textContainer);
            $editor.focus();
        }

        renderEntryText($textContainer, text) {
            // clear container
            $textContainer.innerHTML = '';

            if (this.kuromoji) {
                // perform morphological analysis
                const tokens = this.kuromoji.tokenize(text);
                tokens.forEach((token) => {
                    // create element for token
                    const $token     = document.createElement('span');
                    $token.innerText = token.surface_form;

                    // add details if known
                    if (token.word_type == 'KNOWN') {
                        let details = [token.basic_form]; //dictionary form

                        ['pos','pos_detail_1','pos_detail_2','pos_detail_3'].forEach((key) => {
                            let detail = token[key];
                            if (detail == '*') {
                                return;
                            }
                            
                            // try to translate details and add to list
                            if(Object.hasOwn(detailTranslation, detail)) {
                                details.push(detailTranslation[detail]);
                                $token.classList.add('gakuscan-' + detailTranslation[detail].replaceAll(' ', '-'));
                            } else {
                                details.push(detail);
                                $token.classList.add('gakuscan-' + detail.replaceAll(' ', '-'));
                            }
                        });
                        $token.classList.add('gakuscan-analized');

                        // build tooltip from details
                        $token.title = details.join(' · ');
                    }
                    // add token element to text container
                    $textContainer.appendChild($token);    
                });
            } else {
                $textContainer.innerText = text;
            }
        }
    }

    customElements.define('gakuscan-entry-log', EntryLog);
})();