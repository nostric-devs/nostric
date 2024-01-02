import { localStorageStore } from "@skeletonlabs/skeleton";
import type { Writable } from "svelte/store";

export const localKeyStorage : Writable<string | null> = localStorageStore("privateKey", null);

