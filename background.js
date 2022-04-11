chrome.runtime.onInstalled.addListener(function () {
    loadSettings(createContextmenus);
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (changes['bypass_cache'] || changes['exclude_audible']) {
        loadSettings(createContextmenus);
    }
});

chrome.action.onClicked.addListener(function (tab) {
    loadSettings(requestReload);
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case 'all_windows': loadSettings((settings) => { settings['target_windows'] = 'all_windows'; requestReload(settings); }); break;
        case 'this_window': loadSettings((settings) => { settings['target_windows'] = 'this_window'; requestReload(settings); }); break;
        case 'pinned_tabs': loadSettings((settings) => { settings['target_tabs'] = 'pinned_tabs'; requestReload(settings); }); break;
        case 'unpinned_tabs': loadSettings((settings) => { settings['target_tabs'] = 'unpinned_tabs'; requestReload(settings); }); break;
        case 'bypass_cache': chrome.storage.local.set({ bypass_cache: info.checked }); break;
        case 'exclude_audible': chrome.storage.local.set({ exclude_audible: info.checked }); break;
    }
});

function loadSettings(callback) {
    chrome.storage.local.get(['target_windows', 'target_tabs', 'bypass_cache', 'exclude_audible', 'exclude_urls'], function (data) {
        let settings = JSON.parse(JSON.stringify(data));
        settings['target_windows'] = settings['target_windows'] ?? 'all_windows';
        settings['target_tabs'] = settings['target_tabs'] ?? 'all_tabs';
        settings['bypass_cache'] = settings['bypass_cache'] ?? false;
        settings['exclude_audible'] = settings['exclude_audible'] ?? false;
        settings['exclude_urls'] = settings['exclude_urls'] ?? [];
        if (callback) {
            callback(settings);
        }
    });
}

function createContextmenus(settings) {
    chrome.contextMenus.removeAll(() => {
        let all_windows = {
            id: 'all_windows',
            title: 'Reload All Windows',
            type: 'normal',
            contexts: ['action']
        }
        let this_window = {
            id: 'this_window',
            title: 'Reload This Window',
            type: 'normal',
            contexts: ['action']
        }
        let pinned_tabs = {
            id: 'pinned_tabs',
            title: 'Reload Pinned Tabs',
            type: 'normal',
            contexts: ['action']
        }
        let unpinned_tabs = {
            id: 'unpinned_tabs',
            title: 'Reload Unpinned Tabs',
            type: 'normal',
            contexts: ['action']
        }
        let bypass_cache = {
            id: 'bypass_cache',
            title: 'Bypass Cache',
            type: 'checkbox',
            checked: settings['bypass_cache'],
            contexts: ['action']
        }
        let exclude_audible = {
            id: 'exclude_audible',
            title: 'Exclude Audible',
            type: 'checkbox',
            checked: settings['exclude_audible'],
            contexts: ['action']
        }
        chrome.contextMenus.create(all_windows);
        chrome.contextMenus.create(this_window);
        chrome.contextMenus.create(pinned_tabs);
        chrome.contextMenus.create(unpinned_tabs);
        chrome.contextMenus.create(bypass_cache);
        chrome.contextMenus.create(exclude_audible);
    });
}

async function requestReload(settings) {
    let queryInfo = {};
    let exclude_tabs = [];
    let exclude_tabIDs = [];

    if (settings['target_windows'] === 'this_window') {
        queryInfo['currentWindow'] = true;
    }
    if (['pinned_tabs', 'unpinned_tabs'].includes(settings['target_tabs'])) {
        queryInfo['pinned'] = (settings['target_tabs'] === 'pinned_tabs');
    }
    if (settings['exclude_audible']) {
        queryInfo['audible'] = false;
    }
    if (settings['exclude_urls'].length > 0) {
        exclude_tabs = await chrome.tabs.query({ url: settings['exclude_urls'] });
        exclude_tabIDs = exclude_tabs.map(e1 => e1['id']);
    }

    chrome.tabs.query(queryInfo, function (tabs) {
        tabs.forEach(thisTab => {
            if (exclude_tabIDs.includes(thisTab['id'])) {
                return;
            }
            chrome.tabs.reload(thisTab['id'], { bypassCache: settings['bypass_cache'] });
        });
    })
}