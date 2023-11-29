import { Subject, concatMap, from, mergeMap, of, switchMap } from "rxjs";
import { getConfig } from "../common";

const createContextMenusEvent = new Subject<void>();

createContextMenusEvent
    .pipe(switchMap(() => getConfig()))
    .subscribe((config) => {
        const reload_all_windows: chrome.contextMenus.CreateProperties = {
            id: "reload_all_windows",
            title: "Reload all windows",
            type: "normal",
            contexts: ["action"],
        };
        const reload_this_window: chrome.contextMenus.CreateProperties = {
            id: "reload_this_window",
            title: "Reload this window",
            type: "normal",
            contexts: ["action"],
        };
        const reload_pinned_tabs: chrome.contextMenus.CreateProperties = {
            id: "reload_pinned_tabs",
            title: "Reload pinned tabs",
            type: "normal",
            contexts: ["action"],
        };
        const reload_unpinned_tabs: chrome.contextMenus.CreateProperties = {
            id: "reload_unpinned_tabs",
            title: "Reload unpinned tabs",
            type: "normal",
            contexts: ["action"],
        };
        const bypass_cache: chrome.contextMenus.CreateProperties = {
            id: "bypass_cache",
            title: "Bypass cache",
            type: "checkbox",
            checked: config.bypass_cache,
            contexts: ["action"],
        };
        const exclude_audible_tabs: chrome.contextMenus.CreateProperties = {
            id: "exclude_audible_tabs",
            title: "Exclude audible tabs",
            type: "checkbox",
            checked: config.exclude_audible_tabs,
            contexts: ["action"],
        };
        chrome.contextMenus.create(reload_all_windows);
        chrome.contextMenus.create(reload_this_window);
        chrome.contextMenus.create(reload_pinned_tabs);
        chrome.contextMenus.create(reload_unpinned_tabs);
        chrome.contextMenus.create(bypass_cache);
        chrome.contextMenus.create(exclude_audible_tabs);
    });

const reloadTabEvent = new Subject<{
    window_type: number;
    tab_type: number;
    bypass_cache: boolean;
    exclude_audible_tabs: boolean;
}>();

reloadTabEvent
    .pipe(
        switchMap((config) =>
            from(
                chrome.tabs.query({
                    currentWindow: config.window_type === 0 ? undefined : true,
                    pinned:
                        config.tab_type === 0
                            ? undefined
                            : config.tab_type === 1,
                    audible: config.exclude_audible_tabs ? false : undefined,
                }),
            ).pipe(
                mergeMap((tabs) => from(tabs)),
                concatMap((tab) => {
                    if (tab.id != null) {
                        return from(
                            chrome.tabs.reload(tab.id, {
                                bypassCache: config.bypass_cache,
                            }),
                        );
                    } else {
                        return of(undefined);
                    }
                }),
            ),
        ),
    )
    .subscribe();

chrome.runtime.onInstalled.addListener(function () {
    createContextMenusEvent.next();
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
    chrome.contextMenus.removeAll(() => {
        createContextMenusEvent.next();
    });
});

chrome.action.onClicked.addListener(function (tab) {
    getConfig().subscribe((config) => {
        reloadTabEvent.next(config);
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    getConfig().subscribe((config) => {
        switch (info.menuItemId) {
            case "reload_all_windows":
                reloadTabEvent.next({
                    window_type: 0,
                    tab_type: 0,
                    bypass_cache: config.bypass_cache,
                    exclude_audible_tabs: config.exclude_audible_tabs,
                });
                return;
            case "reload_this_window":
                reloadTabEvent.next({
                    window_type: 1,
                    tab_type: 0,
                    bypass_cache: config.bypass_cache,
                    exclude_audible_tabs: config.exclude_audible_tabs,
                });
                return;
            case "reload_pinned_tabs":
                reloadTabEvent.next({
                    window_type: 0,
                    tab_type: 1,
                    bypass_cache: config.bypass_cache,
                    exclude_audible_tabs: config.exclude_audible_tabs,
                });
                return;
            case "reload_unpinned_tabs":
                reloadTabEvent.next({
                    window_type: 0,
                    tab_type: 2,
                    bypass_cache: config.bypass_cache,
                    exclude_audible_tabs: config.exclude_audible_tabs,
                });
                return;
            case "bypass_cache":
                void chrome.storage.local.set({ bypass_cache: info.checked });
                return;
            case "exclude_audible_tabs":
                void chrome.storage.local.set({
                    exclude_audible_tabs: info.checked,
                });
        }
    });
});
