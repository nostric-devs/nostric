import type { AuthState } from "$lib/stores/Auth";
import { AuthStates } from "$lib/stores/Auth";

export const ROUTES = {
  HOMEPAGE: "",
  FEED: "feed",
  EXPLORE: "explore",
  NOTIFICATIONS: "notifications",
  PROFILE: "profile",
  BOOKMARKS: "bookmarks",
  SETTINGS: "settings",
  RELAYS: "relays",
  PRO: "pro",
  SIGN_IN: "sign-in",
  USER: "user",
  POST: "post",
  INBOX: "inbox",
  SEARCH: "search",
  IMAGES: "images",
  REGISTER_ANONYMOUS: "register-anonymous",
  REGISTER_IDENTITY: "register-identity",
  FOLLOWERS: "followers",
  FOLLOWING: "following",
};

export const getPath = (...names: string[]): string => {
  return `/${names.join("/")}`;
};

export const isPathAccessible = (url: string, status: AuthState): boolean => {
  const freelyAccessible: string[] = [
    ROUTES.EXPLORE,
    ROUTES.POST,
    ROUTES.USER,
    ROUTES.SIGN_IN,
  ];
  const identityAccessible: string[] = [ROUTES.IMAGES, ROUTES.BOOKMARKS];

  if (status >= AuthStates.IDENTITY_AUTHENTICATED) {
    return true;
  }
  if (status >= AuthStates.NOSTR_AUTHENTICATED) {
    return !identityAccessible.find((path: string) =>
      url.startsWith(getPath(path)),
    );
  }

  return !!freelyAccessible.find((path: string) =>
    url.startsWith(getPath(path)),
  );
};
