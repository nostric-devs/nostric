import { writable, type Writable } from "svelte/store";

function getFiles() {
  const files: Writable<string[]> = writable<string[]>([]);
  const { subscribe, update, set } = files;

  const filePathToUrl = (path: string, host: string): string => {
    return process.env.DFX_NETWORK === "ic"
      ? `https://${process.env.STORAGE_CANISTER_ID}.raw.icp0.io/${path}`
      : `${host}/?canisterId=${process.env.STORAGE_CANISTER_ID}${path}`;
  };

  const fill = (urls: string[], host?: string): void => {
    let parsedUrls: string = urls;
    if (host) {
      parsedUrls = urls.map((path: string): string =>
        filePathToUrl(path, host),
      );
    }
    set(parsedUrls);
  };

  const add = (url: string, host?: string): void =>
    update((urls: string[]) => {
      let parsedUrl: string = url;
      if (host) {
        parsedUrl = filePathToUrl(url, host);
      }
      return [parsedUrl, ...urls];
    });

  const remove = (path: string): void =>
    update((urls: string[]) =>
      urls.filter((url: string): boolean => url !== path),
    );

  const clear = () => set([]);

  return {
    subscribe,
    fill,
    clear,
    add,
    remove,
  };
}

export const files = getFiles();
