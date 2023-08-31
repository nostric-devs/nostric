import { writable } from "svelte/store";
import type { Event } from "nostr-tools/lib/event";


type NostrEvent = Event & { created_at_time: string };

function fetch_nostr_events() {
  const { subscribe, update } = writable<NostrEvent[]>([]);

  const add = (event: NostrEvent) => update((events: NostrEvent[]) => {
    if (!events.find((past_event : NostrEvent) => past_event.id === event.id)) {
      events = events.concat({
        ...event,
        created_at_time: new Date(event.created_at * 1000).toLocaleString()
      });
      events.sort((x, y) => y.created_at - x.created_at);
    }
    return events;
  });

  return {
    subscribe,
    add
  };
}

export const nostr_events = fetch_nostr_events();
