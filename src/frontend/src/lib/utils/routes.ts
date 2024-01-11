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
  FOLLOWING: "following"
};

export const getPath = (...names: string[]): string => {
  return `/${names.join("/")}`;
};

export const isPathProtected = (url: string): boolean => {
  return (
    url !== getPath(ROUTES.HOMEPAGE) &&
    !url.startsWith(getPath(ROUTES.EXPLORE)) &&
    !url.startsWith(getPath(ROUTES.POST)) &&
    !url.startsWith(getPath(ROUTES.USER)) &&
    !url.startsWith(getPath(ROUTES.SIGN_IN))
  );
};
