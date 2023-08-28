import Posts from "../components/Posts.svelte";
import Login from "../components/Login.svelte";
import CreateProfile from "../components/CreateProfile.svelte";
import EditProfile from "../components/EditProfile.svelte";
import BasicLayout from "../layouts/BasicLayout.svelte";
import { is_registered, is_not_registered } from "../store/auth";

export const ROUTES = {
  POSTS: "/",
  LOGIN: "/login",
  CREATE_PROFILE: "/create-profile",
  EDIT_PROFILE: "/edit-profile",
}

export const routes = [
  {
    name: ROUTES.POSTS,
    component: Posts,
    layout: BasicLayout,
    onlyIf: {
      guard: () => is_registered(),
      redirect: is_not_registered() ? ROUTES.CREATE_PROFILE : ROUTES.LOGIN,
    }
  },
  { name: ROUTES.LOGIN, component: Login },
  {
    name: ROUTES.CREATE_PROFILE,
    component: CreateProfile,
    onlyIf: {
      guard: () => is_not_registered(),
      redirect: is_registered() ? ROUTES.POSTS : ROUTES.LOGIN,
    }
  },
  {
    name: "/edit-profile",
    layout: BasicLayout,
    component: EditProfile,
    onlyIf: {
      guard: () => is_registered(),
      redirect: is_not_registered() ? ROUTES.CREATE_PROFILE : ROUTES.LOGIN,
    }
  },
]
