import { localStorageStore } from "@skeletonlabs/skeleton";
import type { Writable } from "svelte/store";
import type { AuthState } from "$lib/stores/Auth";

export interface StorageAuth {
  privateKey: string;
  token: AuthState;
}

export const localAuthStorage: Writable<StorageAuth | null> = localStorageStore(
  "auth",
  null,
);

export const updateLocalAuth = (privateKey: string, token: AuthState): void => {
  localAuthStorage.update((): StorageAuth => ({ privateKey, token }));
};

export const clearLocalAuth = (): void => {
  // localAuthStorage.update((): null => null);
};
