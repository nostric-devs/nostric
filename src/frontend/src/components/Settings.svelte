<script lang="ts">
  import { ROUTES } from "../router/routes";
  import NostrFollowing from "./nostr/NostrFollowing.svelte";
  import EditProfile from "./profile/EditProfile.svelte";
  import Pro from "./settings/Pro.svelte";

  export let currentRoute;
  export let params;

</script>
<div class="w-full lg:w-3/4 flex flex-col lg:flex-row justify-center mx-auto relative">
  <div class="w-full lg:absolute lg:left-0 lg:w-1/4 pb-4 lg:pb-0">
    <ul class="menu bg-base-200 w-56 rounded-box h-min">
      <li><a class:active={ currentRoute.name.includes(ROUTES.FOLLOWING) || currentRoute.name===ROUTES.SETTINGS }
          href="{ROUTES.SETTINGS + ROUTES.FOLLOWING}">Following</a></li>
      <li><a class:active={ currentRoute.name.includes(ROUTES.EDIT_PROFILE) }
          href="{ROUTES.SETTINGS + ROUTES.EDIT_PROFILE}">Profile</a></li>
      <li><a class:btn-active={ currentRoute.name.includes(ROUTES.RELAYS) }
          href="{ROUTES.SETTINGS + ROUTES.RELAYS}">Relays</a></li>
      <li><a class:btn-active={ currentRoute.name.includes(ROUTES.NOSTRIC_PRO) }
          href="{ROUTES.SETTINGS + ROUTES.NOSTRIC_PRO}">Nostric Pro</a></li>
    </ul>
  </div>
  <div class="w-full lg:w-[672px] flex justify-center items-center mt-4 lg:mt-0">
    <div class="">
      {#if currentRoute.name.includes(ROUTES.EDIT_PROFILE)}
        <EditProfile />
      {:else if  currentRoute.name.includes(ROUTES.NOSTRIC_PRO)}
        <Pro />
      {:else if  currentRoute.name.includes(ROUTES.RELAYS)}
        <div>relays</div>
      {:else}
        <NostrFollowing />
      {/if}
    </div>
  </div>
</div>
