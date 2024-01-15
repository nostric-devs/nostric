import { localAuthStorage } from "$lib/stores/LocalStorage";
import type { StorageAuth } from "$lib/stores/LocalStorage";
import { get } from "svelte/store";
import { authUser, AuthStates } from "$lib/stores/Auth";
import { getPath, ROUTES } from "$lib/utils/routes";
import { redirect } from "@sveltejs/kit";

const storageAuth: StorageAuth | null = get(localAuthStorage);

// on forced, if the user was logged in, data should be in storageAuth,
// and it should be possible to log in again automatically. This does not
// substitute authentication, paths are protected through server hooks and cookies.
if (storageAuth && storageAuth.privateKey) {
  authUser.setLoading(true);
  try {
    if (storageAuth.token === AuthStates.NOSTR_AUTHENTICATED) {
      await authUser.logInAnonymously(undefined, storageAuth.privateKey);
    } else if (storageAuth.token >= AuthStates.IDENTITY_AUTHENTICATED) {
      await authUser.logInWithIdentity();
    } else {
      // even if we are not to be logged in, we at least check if there is an
      // active Internet Identity at the page, and if there is, we set it in auth user
      // for future use. It is needed for attempting registering with Identity
      // straight through the register route, without going through the homepage Identity register button
      await authUser.checkIdentityActiveOnPage();
    }
    authUser.setLoading(false);
  } catch (error) {
    console.error(error);
    authUser.logOut();
    redirect(303, getPath(ROUTES.HOMEPAGE));
  } finally {
    authUser.setLoading(false);
  }
} else {
  authUser.logOut();
  redirect(303, getPath(ROUTES.HOMEPAGE));
}

export async function handleError({ error, event, status, message }) {
  console.error(error, event, status, message);
}
