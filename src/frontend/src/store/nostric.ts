import { writable } from "svelte/store";
import type { Event } from "../nostric-tools";
import type { NDKUser } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";

export type NostricEvent = {
  gateway_url: string,
  canister_id: string,
  event: Event
}

function fetch_nostric_events() {
  const nostric_events = writable<NostricEvent[]>([]);
  const { subscribe, update, set } = nostric_events;

  const add = (nostric_event: NostricEvent) => update((events: NostricEvent[]) => {
    let nostric_event_id = nostric_event.event.id;
    if (!events.find((past_event : NostricEvent) => past_event.event.id === nostric_event_id)) {
      events = events.concat(nostric_event);
      events.sort((x, y) => y.event.created_at - x.event.created_at);
    }
    return events;
  });

  const find = (event_id : string) =>
    get(nostric_events).find(
      (nostric_event) => nostric_event.event.id == event_id
    );

  const clear = () => set([]);

  return {
    subscribe,
    add,
    clear,
    find,
  };
}

export const nostric_events = fetch_nostric_events();

export const nostric_relays_count = writable<number>(0);
export const nostric_relays_eose_count = writable<number>(0);

function fetch_nostric_user_encounters() {

  const users = writable<NDKUser[]>([]);
  const { subscribe, update, set } = users;

  const find_user = (hexpub: string) => {
    return get(users).find((followee : NDKUser) => followee.hexpubkey() === hexpub);
  }

  const add_user = (new_user : NDKUser) => update((nostric_users: NDKUser[]) => {
    let new_hexpubkey = new_user.hexpubkey();
    if (!nostric_users.find((user : NDKUser) => user.hexpubkey() === new_hexpubkey)) {
      nostric_users = nostric_users.concat(new_user);
    }
    return nostric_users;
  });

  const remove_user = (user: NDKUser) => update((nostric_users: NDKUser[]) => {
    let new_hexpubkey = user.hexpubkey();
    return nostric_users.filter((user : NDKUser) => user.hexpubkey() !== new_hexpubkey);
  });

  const clear = () => set([]);

  return {
    subscribe,
    find_user,
    add_user,
    remove_user,
    clear,
  };
}

export const nostric_users = fetch_nostric_user_encounters();

export enum STATUS {
  OPEN,
  CLOSED,
  ERROR
}

function fetch_nostric_relay_statuses() {

  const relays = writable([]);
  const { subscribe, update, set } = relays;

  const find = (relays : any[], gateway_url: string, canister_id : string) =>
    relays.findIndex((relay) => relay.gateway_url === gateway_url && relay.canister_id === canister_id);

  const get_status = (gateway_url: string, canister_id : string) => {
    let all_relays = get(relays);
    let index = find(all_relays, gateway_url, canister_id);
    return all_relays[index];
  }

  const set_status = (gateway_url: string, canister_id : string, status : STATUS) =>
    update((relays) => {
      let index = find(relays, gateway_url, canister_id);
      if (index !== -1) {
        relays[index].status = status;
        return relays;
      } else {
        return [...relays, {gateway_url, canister_id, status}];
      }
    }
  );

  const remove_relay = (gateway_url: string, canister_id : string) => update(
    (relays) =>
      relays.filter((relay) => relay.gateway_url !== gateway_url && relay.canister_id !== canister_id)
  );

  const clear = () => set([]);

  return {
    subscribe,
    get_status,
    set_status,
    remove_relay,
    clear,
  };
}

export const relay_statuses = fetch_nostric_relay_statuses();



