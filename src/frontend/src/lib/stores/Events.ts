import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";

function getEvents() {
  const events: Writable<NDKEvent[]> = writable<NDKEvent[]>([]);
  const { subscribe, update, set } = events;

  const add = (event: NDKEvent) =>
    update((events: NDKEvent[]) => {
      if (
        !events.find(
          (past_event: NDKEvent): boolean => past_event.id === event.id,
        )
      ) {
        events = events.concat(event);
        events.sort((x: NDKEvent, y: NDKEvent) => y.created_at - x.created_at);
      }
      return events;
    });

  const filterTextEventsByPublicKey = (publicKey: string): NDKEvent[] => {
    return get(events).filter(
      (event: NDKEvent): boolean =>
        event.kind === NDKKind.Text && event.pubkey === publicKey,
    );
  };

  const getEventReactions = (mainEvent: NDKEvent): NDKEvent[] => {
    return get(events)
      .filter(
        (event: NDKEvent): boolean =>
          event.kind === NDKKind.Reaction &&
          event.tags.find(
            (tag: NDKTag) => tag[0] === "e" && tag[1] === mainEvent.id,
          ) !== undefined,
      )
      .sort((x: NDKEvent, y: NDKEvent) => y.created_at - x.created_at);
  };

  const clear = () => set([]);

  return {
    subscribe,
    add,
    filterTextEventsByPublicKey,
    getEventReactions,
    clear,
  };
}

export const events = getEvents();
