<script lang="ts">
  import { logout_from_ii } from "../store/auth";
  import { Navigate } from "svelte-router-spa";
  import { Route } from "svelte-router-spa";
  import { ROUTES } from "../router/routes";
  import { Icon } from "svelte-feathers";
  import Alert from "../components/utils/Alert.svelte";
  import Spinner from "../components/utils/Spinner.svelte";

  let logging_out : boolean = false;

  const logout = async () => {
    logging_out = true;
    await logout_from_ii();
    logging_out = false;
  }

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
      <button
        on:click={ async () => await logout() }
        class="btn btn-ghost btn-circle"
        disabled={ logging_out }
      >
        {#if !logging_out}
          <Icon name="log-out" class="cursor-pointer hover:scale-110"></Icon>
        {:else}
          <Spinner width="4"/>
        {/if}
      </button>
    </div>
  </div>
</div>

<div class="mx-auto mb-24">
  <div class="flex justify-center mb-24">
    <ul class="menu menu-horizontal bg-base-200 grid grid-cols-3 rounded-box">
      <li class="mr-2">
        <a
          href="{ROUTES.HOME}"
          class:active={ currentRoute.name === ROUTES.HOME }
        >
          <Icon name="home" width="20" height="20"/>
          Feed
        </a>
      </li>
      <li>
        <a
          href="{ROUTES.PROFILE}"
          class:active={ currentRoute.name === ROUTES.PROFILE }
        >
          <Icon name="user" width="20" height="20"/>
          Profile
        </a>
      </li>
      <li class="ml-2">
        <a
          href={ROUTES.SETTINGS}
          class:active={ currentRoute.name.includes(ROUTES.SETTINGS) }
        >
          <Icon name="settings" width="20" height="20"/>
          Settings
        </a>
      </li>
    </ul>
  </div>
  <div class="mb-6">
    <Alert />
  </div>
  <Route {currentRoute} {params}/>
</div>

