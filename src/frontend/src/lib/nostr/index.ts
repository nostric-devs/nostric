import type { NDKUser } from "@nostr-dev-kit/ndk";

export { nostrHandler, NostrHandler } from "$lib/nostr/NostrHandler";
export { NostrUserHandler } from "$lib/nostr/NostrUserHandler";

export interface UsersObject {
  [x: string]: NDKUser;
}

export enum Reactions {
  LIKE = "+",
  DISLIKE = "-",
}
