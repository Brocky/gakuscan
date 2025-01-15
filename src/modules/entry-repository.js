const entryRepo = {
    db: null,
    tokenizer: null,
    connect: function () {
        return new Promise((resolve, reject) => {
            // request the indexedDB connection
            const dbRequest = indexedDB.open("gakuscan-log", 1);
    
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
    
            dbRequest.addEventListener('upgradeneeded', (event) => {
                // Migrate to newest version
                const db = event.target.result;
                db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
            });
        });
    },

    load: function () {
        return new Promise((resolve, reject) => {
            // read all entires
            let entries = [];
            const store = this.db.transaction(["entries"], "readwrite").objectStore('entries');
            store.openCursor().addEventListener('success', (event) => {
                let cursor = event.target.result;
                if (cursor) {
                    entries.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(entries);
                }
            });
        });
    },
        
    add: function(entry) {
        return new Promise((resolve, reject) => {
            // save the new entry to the db
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