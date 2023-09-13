import { writable } from "svelte/store";
import type { NDKEvent } from "@nostr-dev-kit/ndk";


function fetch_nostr_events() {
  const { subscribe, update, set } = writable<NDKEvent[]>([]);

  const add = (event: NDKEvent) => update((events: NDKEvent[]) => {
    if (!events.find((past_event : NDKEvent) => past_event.id === event.id)) {
      events = events.concat(event);
      events.sort((x, y) => y.created_at - x.created_at);
    }
    return events;
  });

  const clear = () => set([]);

  return {
    subscribe,
    add,
    clear,
  };
}

export const nostr_events = fetch_nostr_events();
