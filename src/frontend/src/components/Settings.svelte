<script lang="ts">
  import { ROUTES } from "../router/routes";
  import NostrFollowing from "./settings/NostrFollowing.svelte";
  import NostrRelays from "./settings/NostrRelays.svelte";
  import EditProfile from "./settings/EditProfile.svelte";
  import Pro from "./settings/Pro.svelte";

  export let currentRoute;
  export let params;

</script>
<div class="w-full lg:w-3/4 flex flex-col lg:flex-row justify-between mx-auto relative">
  <div>
    <ul class="menu bg-base-200 rounded-box h-min w-56">
      <li class="mb-2">
        <a
          class:active={ currentRoute.name.includes(ROUTES.FOLLOWING) || currentRoute.name === ROUTES.SETTINGS }
          href="{ROUTES.SETTINGS + ROUTES.FOLLOWING}"
        >
          Nostr Following
        </a>
      </li>
      <li class="mb-2">
        <a
          class:active={ currentRoute.name.includes(ROUTES.EDIT_PROFILE) }
          href="{ROUTES.SETTINGS + ROUTES.EDIT_PROFILE}"
        >
          Edit Nostr Profile
        </a>
      </li>
      <li class="mb-2">
        <a
          class:btn-active={ currentRoute.name.includes(ROUTES.RELAYS) }
          href="{ ROUTES.SETTINGS + ROUTES.RELAYS}"
        >
          Relays
        </a>
      </li>
      <li>
        <a
          class:btn-active={ currentRoute.name.includes(ROUTES.NOSTRIC_PRO) }
          href="{ ROUTES.SETTINGS + ROUTES.NOSTRIC_PRO}"
        >
          Nostric PRO
        </a>
      </li>
    </ul>
  </div>
  <div class="w-full lg:pl-7 pt-1">
    {#if currentRoute.name.includes(ROUTES.EDIT_PROFILE)}
      <EditProfile />
    {:else if  currentRoute.name.includes(ROUTES.NOSTRIC_PRO)}
      <Pro />
    {:else if  currentRoute.name.includes(ROUTES.RELAYS)}
      <NostrRelays />
    {:else}
      <NostrFollowing />
    {/if}
  </div>
</div>
