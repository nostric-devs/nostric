import { localKeyStorage } from "$lib/stores/LocalStorage";
import { get } from "svelte/store";
import { NostrUserHandler } from "$lib/nostr";
import { authUser } from "$lib/stores/Auth";

const privateKey : string | null = get(localKeyStorage);

if (privateKey) {
  let nostrUser : NostrUserHandler = NostrUserHandler.getInstance(privateKey);
  await nostrUser.initExistingUser();
  authUser.setNostrUserHandler(nostrUser);
  authUser.setNostrAuthenticated();
}
