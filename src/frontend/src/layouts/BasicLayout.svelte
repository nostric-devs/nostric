<script>
  import { logout_from_ii } from "../store/auth";
  import { Navigate } from "svelte-router-spa";
  import { Route } from "svelte-router-spa";
  import { ROUTES } from "../router/routes";
  import { Icon } from "svelte-feathers";
  import Alert from "../components/utils/Alert.svelte";

  export let currentRoute;
  export let params;

</script>

<div class="w-100 flex justify-center">
  <div
    class="navbar flex justify-between bg-base-200 md:w-3/4 rounded-lg mx-5 my-12 shadow-none"
  >
    <div class="navbar-start">
      <div class="btn btn-ghost normal-case text-3xl text-white font-bold">
        <Navigate to={ ROUTES.HOME }>
          Nostr<span class="text-primary">ic</span>
        </Navigate>
      </div>
    </div>
    <div class="flex-none">
      <button on:click={async () => await logout_from_ii()} class="btn btn-ghost btn-circle">
        <Icon name="x" class="cursor-pointer hover:scale-110"></Icon>
      </button>
    </div>
  </div>
</div>

<div class="container mx-auto mb-24">
  <div class="flex justify-center">
    <div class="menu menu-horizontal bg-base-200 capitalize rounded-lg">
      <div
        class="flex px-4 py-3 mr-2 cursor-pointer hover:bg-neutral rounded"
        class:bg-neutral={currentRoute.name === ROUTES.HOME}
      >
        <div class="mr-2"><Icon name="home" width="20" height="20"/></div>
        <Navigate to={ ROUTES.HOME }>feed</Navigate>
      </div>
      <div
        class="flex px-4 py-3 cursor-pointer hover:bg-neutral rounded"
        class:bg-neutral={currentRoute.name === ROUTES.PROFILE}
      >
        <div class="mr-2"><Icon name="home" width="20" height="20"/></div>
        <Navigate to={ ROUTES.PROFILE }>profile</Navigate>
      </div>
      <div
        class="flex px-4 py-3 cursor-pointer hover:bg-neutral rounded"
        class:bg-neutral={currentRoute.name === ROUTES.SETTINGS}
      >
        <div class="mr-2"><Icon name="home" width="20" height="20"/></div>
        <Navigate to={ ROUTES.SETTINGS }>settings</Navigate>
      </div>

    </div>
  </div>
  <div class="my-6"><Alert /></div>
  <Route {currentRoute} {params}/>
</div>

