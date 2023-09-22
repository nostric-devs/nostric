import { writable } from "svelte/store";
import type { Event } from "../nostric-tools";


function fetch_nostric_events() {
  const { subscribe, update, set } = writable<Event[]>([]);

  const add = (event: Event) => update((events: Event[]) => {
    if (!events.find((past_event : Event) => past_event.id === event.id)) {
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

export const nostric_events = fetch_nostric_events();

