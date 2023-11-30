import "bootstrap/dist/css/bootstrap.min.css";
import { BehaviorSubject, from, fromEvent, switchMap } from "rxjs";
import { getConfig } from "../common";

const form = document.getElementById("form") as HTMLFormElement;

const include_windows = document.getElementsByName(
    "include_windows",
) as NodeListOf<HTMLInputElement>;
const include_tabs = document.getElementsByName(
    "include_tabs",
) as NodeListOf<HTMLInputElement>;
const bypass_cache = document.getElementById(
    "bypass_cache",
) as HTMLInputElement;
const exclude_audible_tabs = document.getElementById(
    "exclude_audible_tabs",
) as HTMLInputElement;

const close = document.getElementById("close") as HTMLInputElement;
const load_default = document.getElementById("load_default") as HTMLInputElement;

const renderEvent = new BehaviorSubject<boolean>(false);

renderEvent
    .pipe(switchMap((use_default) => getConfig(use_default)))
    .subscribe((config) => {
        include_windows[config.window_type].checked = true;
        include_tabs[config.tab_type].checked = true;
        bypass_cache.checked = config.bypass_cache;
        exclude_audible_tabs.checked = config.exclude_audible_tabs;
    });

fromEvent(form, "submit")
    .pipe(
        switchMap(() => {
            const window_type = [...include_windows].findIndex(
                (element) => element.checked,
            );
            const tab_type = [...include_tabs].findIndex(
                (element) => element.checked,
            );
            return from(
                chrome.storage.local.set({
                    window_type,
                    tab_type,
                    bypass_cache: bypass_cache.checked,
                    exclude_audible_tabs: exclude_audible_tabs.checked,
                }),
            );
        }),
    )
    .subscribe();

fromEvent(close, "click").subscribe(() => {
    window.close();
});

fromEvent(load_default, "click").subscribe(() => {
    renderEvent.next(true);
});
