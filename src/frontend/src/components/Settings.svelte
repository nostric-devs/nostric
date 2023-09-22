<script lang="ts">
  import { ROUTES } from "../router/routes";
  import { navigateTo } from "svelte-router-spa";
  import NostrFollowing from "./nostr/NostrFollowing.svelte";
  import NostrRelays from "./nostr/NostrRelays.svelte";

  export let currentRoute;
  export let params;

</script>

<div class="w-3/4 flex mx-auto">
  <div class="join join-vertical mr-12">
    <button
      class="btn join-item"
      class:btn-active={ currentRoute.name.includes(ROUTES.FOLLOWING) || currentRoute.name === ROUTES.SETTINGS }
      on:click={ () => navigateTo(ROUTES.SETTINGS + ROUTES.FOLLOWING) }
    >
      <span class="mr-auto">Following</span>
    </button>
    <button
      class="btn join-item"
      class:btn-active={ currentRoute.name.includes(ROUTES.EDIT_PROFILE) }
      on:click={ () => navigateTo(ROUTES.SETTINGS + ROUTES.EDIT_PROFILE) }
    >
      <span class="mr-auto">Edit profile</span>
    </button>
    <button
      class="btn join-item"
      class:btn-active={ currentRoute.name.includes(ROUTES.RELAYS) }
      on:click={ () => navigateTo(ROUTES.SETTINGS + ROUTES.RELAYS) }
    >
      <span class="mr-auto">Relays</span>
    </button>
    <button
      class="btn join-item"
      class:btn-active={ currentRoute.name.includes(ROUTES.NOSTRIC_PRO) }
      on:click={ () => navigateTo(ROUTES.SETTINGS + ROUTES.NOSTRIC_PRO) }
    >
      <span class="mr-auto">Nostric pro</span>
    </button>
  </div>

  <div class="flex-grow">
    {#if currentRoute.name.includes(ROUTES.EDIT_PROFILE)}
      <div>edit profile</div>
    {:else if  currentRoute.name.includes(ROUTES.NOSTRIC_PRO)}
      <div>pro</div>
    {:else if  currentRoute.name.includes(ROUTES.RELAYS)}
      <NostrRelays />
    {:else}
      <NostrFollowing />
    {/if}
  </div>

</div>
