<script>
  import { logout_from_ii } from "../store/auth";
  import { Navigate, navigateTo } from "svelte-router-spa";
  import { Route } from "svelte-router-spa";
  import { ROUTES } from "../router/routes";
  import { Icon } from "svelte-feathers";
  import Alert from "../components/utils/Alert.svelte";

  export let currentRoute;
  export let params;

</script>

<div class="w-full flex justify-center">
  <div
    class="navbar flex justify-between bg-base-200 w-3/4 rounded-lg my-12 shadow-none"
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

<div class="mx-auto mb-24">
  <div class="flex justify-center mb-24">
    <div class="join">
      <button
        class="btn btn-lg join-item rounded-l"
        class:btn-active={ currentRoute.name === ROUTES.HOME }
        on:click={ () => navigateTo(ROUTES.HOME) }
      >
        <Icon name="home" width="20" height="20"/>
        feed
      </button>
      <button
        class="btn btn-lg join-item"
        class:btn-active={ currentRoute.name === ROUTES.PROFILE }
        on:click={ () => navigateTo(ROUTES.PROFILE) }
      >
        <Icon name="user" width="20" height="20"/>
        profile
      </button>
      <button
        class="btn btn-lg join-item rounded-r"
        class:btn-active={ currentRoute.name.includes(ROUTES.SETTINGS) }
        on:click={ () => navigateTo(ROUTES.SETTINGS) }
      >
        <Icon name="settings" width="20" height="20"/>
        settings
      </button>
    </div>
  </div>
  <div class="mb-6"><Alert /></div>
  <Route {currentRoute} {params}/>
</div>

