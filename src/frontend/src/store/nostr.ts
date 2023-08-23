import { writable } from "svelte/store";
import type { Event } from "nostr-tools/lib/event";

export const nostr_events = writable<Event[]>([]);

