import { writable } from "svelte/store";
import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";


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


function fetch_nostr_followees() {
  const followees = writable<NDKUser[]>([]);
  const { subscribe, update, set } = followees;

  const init = (followees: NDKUser[]) => set(followees);

  const find_user = (npub: string) => {
    return get(followees).find((followee : NDKUser) => followee.hexpubkey() === npub);
  }

  const search_match = (query : string) => {
    return get(followees).filter((followee : NDKUser) =>
      followee.hexpubkey().includes(query) ||
      (followee.profile?.name || "").includes(query) ||
      (followee.profile?.displayName || "").includes(query)
    );
  }

  const add_user = (new_user: NDKUser) => update((followees: NDKUser[]) => {
    let new_hexpubkey = new_user.hexpubkey();
    if (!followees.find((followee : NDKUser) => followee.hexpubkey() === new_hexpubkey)) {
      followees = followees.concat(new_user);
    }
    return followees;
  });

  const remove_user = (user: NDKUser) => update((followees: NDKUser[]) => {
    let new_hexpubkey = user.hexpubkey();
    return followees.filter((followee : NDKUser) => followee.hexpubkey() !== new_hexpubkey);
  });

  const clear = () => set([]);

  return {
    subscribe,
    init,
    find_user,
    add_user,
    remove_user,
    clear,
    search_match,
  };

}

export const nostr_followees = fetch_nostr_followees();
