const entryRepo = {
    db: null,
    tokenizer: null,
    connect: function () {
        return new Promise((resolve, reject) => {
            // request the indexedDB connection
            const dbRequest = indexedDB.open("gakuscan-data", 1);
    
            dbRequest.addEventListener('error', () => {
                // todo error handling
                console.error("Could not connect to IndexedDB!");
                reject();
            });
    
            dbRequest.addEventListener('success', (event) => {
                this.db = event.target.result;
    
                this.db.addEventListener('error', (event) => {
                    // Generic error handler for all requests targeted at this database
                    console.error(`Database error: ${event.target.error?.message}`);
                });

                resolve(this);
            });
    
            // Migrate to newest version
            dbRequest.addEventListener('upgradeneeded', (event) => {
                const db = event.target.result;
                const upgradeTransaction = event.target.transaction;
                let store;
                
                if (!db.objectStoreNames.contains("entries")) {
                  store = db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
                } else {
                  store = upgradeTransaction.objectStore('entries');
                }
            
                if (!store.indexNames.contains("id")) {
                    store.createIndex("id", "id", { unique: true });
                }
                if (!store.indexNames.contains("time")) {
                    store.createIndex("time", "time", { unique: false });
                }
            });
        });
    },

    getNewest: function (batch = 6, entryHandler) {
        const store  = this.db.transaction(["entries"], "readonly").objectStore('entries');
        const cursor = store.index('id').openCursor(null, 'prev');

        return new Promise((resolve) => {
            let loaded  = 0;
            let entries = [];

            cursor.addEventListener('success', (e) => {
                const result = e.target.result;

                if (result && loaded < batch) {
                    entries.push(result.value);
                    loaded++;
                    if (typeof entryHandler === 'function') {
                        entryHandler(result.value);
                    }
                    result.continue();
                    return;
                }
                resolve(entries);
            });
        });
    },

    getNextBatch: function (oldestId, batch = 6, entryHandler) {
        const store  = this.db.transaction(["entries"], "readonly").objectStore('entries');
        const range  = IDBKeyRange.upperBound(oldestId, true);
        const cursor = store.index('id').openCursor(range, 'prev');

        return new Promise((resolve) => {
            let loaded  = 0;
            let entries = [];

            cursor.addEventListener('success', (e) => {
                const result = e.target.result;

                if (result && loaded < batch) {
                    entries.push(result.value);
                    loaded++;
                    if (typeof entryHandler === 'function') {
                        entryHandler(result.value);
                    }
                    result.continue();
                    return;
                }
                resolve(entries);
            });
        });
    },
        
    add: function(entry) {
        return new Promise((resolve, reject) => {
            // save the new entry to the db
            console.log(entry);
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.add(entry).addEventListener('success', (e) => {
                entry.id = e.target.result;
                resolve(entry);
            });
        });
    },
        
    delete: function(id) {
        return new Promise((resolve, reject) => {
            // remove entry with given id from object store
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.delete(id).addEventListener('success', () => {
                resolve();
            });
        });
    },

    update: function(entry) {
        return new Promise((resolve, reject) => {
            // save updated entry to db
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.put(entry).addEventListener('success', () => {
                resolve(entry);
            });
        });
    }

    
};
let connection = null;

async function getEntryRepo() {
    if(!connection) {
        connection = await entryRepo.connect();
    }
    return connection;
}

async function setKuromoji(kuro) {
    entryRepo.tokenizer = await new Promise((resolve, reject) => {
        kuro.builder({ dicPath: "/node_modules/@sglkc/kuromoji/dict/" }).build((err, tokenizer) => {
            if(err) {
                reject();
            }
            // tokenizer is ready
            resolve(tokenizer);
        });
    });
}

export {getEntryRepo, setKuromoji};