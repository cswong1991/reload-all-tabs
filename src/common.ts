import { from, of, type Observable } from "rxjs";

export function getConfig(
    use_default = false,
    default_config = {
        window_type: 0,
        tab_type: 0,
        bypass_cache: true,
        exclude_audible_tabs: true,
    },
): Observable<{
    window_type: number;
    tab_type: number;
    bypass_cache: boolean;
    exclude_audible_tabs: boolean;
}> {
    if (use_default) {
        return of(default_config);
    } else {
        return from(chrome.storage.local.get(default_config)) as Observable<{
            window_type: number;
            tab_type: number;
            bypass_cache: boolean;
            exclude_audible_tabs: boolean;
        }>;
    }
}
