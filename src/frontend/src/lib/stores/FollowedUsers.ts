import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { NDKUser } from "@nostr-dev-kit/ndk";

function getFollowedUsers() {
  const users: Writable<NDKUser[]> = writable<NDKUser[]>([]);
  const { subscribe, update, set } = users;

  const init = (users: NDKUser[]) => set(users);

  const add = (newUser: NDKUser) =>
    update((users: NDKUser[]) => {
      if (!find(newUser)) {
        users = users.concat(newUser);
      }
      return users;
    });

  const remove = (removeUser: NDKUser) => {
    update((users: NDKUser[]) => {
      return users.filter(
        (user: NDKUser): boolean => user.pubkey !== removeUser.pubkey,
      );
    });
  };

  const find = (newUser: NDKUser): NDKUser | undefined => {
    return get(users).find(
      (user: NDKUser): boolean => user.pubkey === newUser.pubkey,
    );
  };
  const clear = () => set([]);

  return {
    subscribe,
    add,
    remove,
    find,
    clear,
    init,
  };
}

export const followedUsers = getFollowedUsers();
