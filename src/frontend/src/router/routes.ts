import Login from "../components/Login.svelte";
import Feed from "../components/Feed.svelte";
import Profile from "../components/profile/Profile.svelte";
import CreateProfile from "../components/profile/CreateProfile.svelte";
import EditProfile from "../components/profile/EditProfile.svelte";
import BasicLayout from "../layouts/BasicLayout.svelte";
import { is_registered, is_not_registered } from "../store/auth";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CREATE_PROFILE: "/create-profile",
  SETTINGS: "/settings",
  PROFILE: "/profile",
}

export const routes = [
  {
    name: ROUTES.HOME,
    component: Feed,
    layout: BasicLayout,
    // onlyIf: {
    //   guard: () => is_registered(),
    //   redirect: is_not_registered() ? ROUTES.CREATE_PROFILE : ROUTES.LOGIN,
    // }
  },
  { name: ROUTES.LOGIN, component: Login },
  {
    name: ROUTES.CREATE_PROFILE,
    component: CreateProfile,
    // onlyIf: {
    //   guard: () => is_not_registered(),
    //   redirect: is_registered() ? ROUTES.POSTS : ROUTES.LOGIN,
    // }
  },
  {
    name: ROUTES.SETTINGS,
    layout: BasicLayout,
    component: EditProfile,
    // onlyIf: {
    //   guard: () => is_registered(),
    //   redirect: is_not_registered() ? ROUTES.CREATE_PROFILE : ROUTES.LOGIN,
    // }
  },
  {
    name: ROUTES.PROFILE,
    layout: BasicLayout,
    component: Profile,
    // onlyIf: {
    //   guard: () => is_registered(),
    //   redirect: is_not_registered() ? ROUTES.CREATE_PROFILE : ROUTES.LOGIN,
    // }
  },
]
