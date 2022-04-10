class OptionsController {
    constructor() {
        document.getElementById('save').addEventListener('click', () => this.requestSave());
        document.getElementById('cancel').addEventListener('click', () => this.cancel());
        document.getElementById('load_default').addEventListener('click', () => this.loadDefault());
        this.errors = {};
    }

    loadSettings() {
        chrome.storage.local.get(['target_windows', 'target_tabs', 'bypass_cache', 'exclude_audible', 'exclude_urls'], function (data) {
            document.getElementById(data['target_windows'] ?? 'all_windows').checked = true;
            document.getElementById(data['target_tabs'] ?? 'all_tabs').checked = true;
            document.getElementById('bypass_cache').checked = data['bypass_cache'] ?? false;
            document.getElementById('exclude_audible').checked = data['exclude_audible'] ?? false;
            document.getElementById('exclude_urls').value = data['exclude_urls'] ? data['exclude_urls'].join('\n') : '';
        });
    }

    requestSave() {
        let target_windows = [].slice.call(document.getElementsByName('target_windows'), 0).filter(e1 => e1.checked)[0].value;
        let target_tabs = [].slice.call(document.getElementsByName('target_tabs'), 0).filter(e1 => e1.checked)[0].value;
        let bypass_cache = document.getElementById('bypass_cache').checked;
        let exclude_audible = document.getElementById('exclude_audible').checked;
        let exclude_urls = document.getElementById('exclude_urls').value;

        this.validateSave(target_windows, target_tabs, bypass_cache, exclude_audible, exclude_urls).then(validateResult => {
            if (validateResult) {
                this.save(target_windows, target_tabs, bypass_cache, exclude_audible, exclude_urls);
            }
            document.getElementById('msg').innerHTML = JSON.stringify(this.errors);
        });
    }

    async validateSave(target_windows, target_tabs, bypass_cache, exclude_audible, exclude_urls) {
        this.errors = {};
        if (!['all_windows', 'this_window'].includes(target_windows)) {
            this.errors['target_windows'] = 'Invalid target_windows';
        }
        if (!['all_tabs', 'pinned_tabs', 'unpinned_tabs'].includes(target_tabs)) {
            this.errors['target_tabs'] = 'Invalid target_tabs';
        }
        if (typeof bypass_cache !== 'boolean') {
            this.errors['bypass_cache'] = 'Invalid bypass_cache';
        }
        if (typeof exclude_audible !== 'boolean') {
            this.errors['exclude_audible'] = 'Invalid exclude_audible';
        }
        // Must be an array with min length of 1
        let urls_inArr = exclude_urls.split('\n');
        if (exclude_urls.length > 0) {
            if (urls_inArr.some(e1 => e1.trim() === '')) {
                this.errors['exclude_urls'] = 'Contain empty lines';
            } else if (new Set(urls_inArr).size !== urls_inArr.length) {
                this.errors['exclude_urls'] = 'Contain identical urls or domains';
            } else {
                try {
                    await chrome.tabs.query({ url: urls_inArr });
                } catch {
                    this.errors['exclude_urls'] = 'Invalid URLs';
                }
            }
        }
        return Object.keys(this.errors).length === 0;
    }

    save(target_windows, target_tabs, bypass_cache, exclude_audible, exclude_urls) {
        chrome.storage.local.set({
            target_windows: target_windows,
            target_tabs: target_tabs,
            bypass_cache: bypass_cache,
            exclude_audible: exclude_audible,
            exclude_urls: (exclude_urls.length === 0) ? [] : exclude_urls.split('\n')
        }, function () {
            window.close();
        });
    }

    cancel() {
        window.close();
    }

    loadDefault() {
        document.getElementById('all_windows').checked = true;
        document.getElementById('all_tabs').checked = true;
        document.getElementById('bypass_cache').checked = false;
        document.getElementById('exclude_audible').checked = false;
        document.getElementById('exclude_urls').value = '';
    }
}

let main = new OptionsController();
main.loadSettings();

