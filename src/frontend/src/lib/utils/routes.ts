export const ROUTES = {
  FEED: "feed",
  EXPLORE: "explore",
  NOTIFICATIONS: "notifications",
  PROFILE: "profile",
  BOOKMARKS: "bookmarks",
  SETTINGS: "settings",
  RELAYS: "relays",
  PRO: "pro",
  SIGN_UP: "sign_up",
  USER: "user",
  POST: "post",
  INBOX: "inbox",
  SEARCH: "search",
  IMAGES: "images"
}

export const get_path = (...names : string[]) : string => {
  return `/${names.join("/")}`
}
