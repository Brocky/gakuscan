const settingsStore = {
    keys: [
        'gcloud-vision-key',
        'deepl-key',
        'theme'
    ],
    settings: {},
    watcher: {},
    loaded: false,

    loadFromStorage: function() {
        this.keys.forEach(key => {
            this.settings[key] = localStorage.getItem(key);
        });
        this.loaded = true;
    },

    saveToStorage: function() {
        this.keys.forEach(key => {
            localStorage.setItem(key, this.settings[key]);
        });
    },

    set: function(key, val) {
        const oldValue     = this.get(key);
        this.settings[key] = val;

        localStorage.setItem(key, val);

        if (this.watcher[key]) {
            this.watcher[key].forEach(watcher => {
                watcher.call(null, {newValue: val, oldValue});
            });
        }
    },

    get: function(key) {
        if (!this.loaded) {
            this.loadFromStorage();
        }
        return this.settings[key];
    },

    watch: function(key, watcher) {
        if (!this.watcher[key]) {
            this.watcher[key] = [];
        }
        this.watcher[key].push(watcher);
    }
}

function getSettingsStore () {
    return settingsStore;
}

export {getSettingsStore};