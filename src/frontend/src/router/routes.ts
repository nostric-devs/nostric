import Posts from "../components/Posts.svelte";
import Login from "../components/Login.svelte";
import CreateProfile from "../components/CreateProfile.svelte";
import BasicLayout from "../layouts/BasicLayout.svelte";
import { auth_state, AuthStates } from "../store/auth";
import { get } from "svelte/store";

export const routes = [
  {
    name: "/",
    component: Posts,
    layout: BasicLayout,
    onlyIf: {
      guard: () => get(auth_state) === AuthStates.REGISTERED,
      redirect: get(auth_state) === AuthStates.NOT_YET_REGISTERED ? "/create-profile" : "/login",
    }
  },
  { name: "/login", component: Login },
  {
    name: "/create-profile",
    component: CreateProfile,
    onlyIf: {
      guard: () => get(auth_state) === AuthStates.NOT_YET_REGISTERED,
      redirect: get(auth_state) === AuthStates.REGISTERED ? "/posts" : "/login",
    }
  },
]
