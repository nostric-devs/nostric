<script lang="ts">
  import { navigateTo } from "svelte-router-spa";
  import { Icon } from 'svelte-feathers';
  import { onMount } from "svelte";
  import NDKUserProfile, { NDKUser } from "@nostr-dev-kit/ndk";
  import Alert from "./Alert.svelte";
  import Spinner from "./Spinner.svelte";
  import UserPosts from "./posts/UserPosts.svelte";
  import UserAvatar from "./posts/UserAvatar.svelte";
  import FollowingSettings from "./posts/FollowingSettings.svelte";
  import { ROUTES } from "../router/routes";
  import { nostr_service } from "../store/auth";

  let user : NDKUser = null;
  let profile : NDKUserProfile = null;
  let private_key : string = "";
  let initializing : boolean = true;

  enum MENU_TOGGLE {
    MY_POSTS,
    FOLLOWING
  }

  let navigation_toggle = MENU_TOGGLE.MY_POSTS;

  export let currentRoute;
  export let params;

  onMount(async () => {
    user = await nostr_service.get_user();
    profile = user.profile;
    private_key = nostr_service.get_private_key();
    initializing = false;
  });

</script>

<div class="mt-4 mb-12">
  <Alert/>
</div>

{#if initializing}
<div class="d-flex justify-center content-center">
  <div class="text-center opacity-70">
    <Spinner width="10"/>
  </div>
</div>
{:else}
<div class="w-5/6 mx-auto text-right mt-8">
  <button class="btn" title="Settings" on:click={ () => navigateTo(ROUTES.EDIT_PROFILE) }>
    <Icon name="settings" />
  </button>
</div>
<div class="w-5/6 mx-auto mt-8">
  <div class=" flex items-center">
    <UserAvatar name={ profile?.name } image={ profile?.image }/>
    <div class="ml-4 break-all">
        <h1 class="text-xl font-bold">@{ profile?.name }</h1>
        <span class="text-gray-500" title="Your public key.">{user?.hexpubkey()}</span>
        <p class="text-sm mt-1">{ profile?.bio }</p>
    </div>
  </div>
</div>

<div class="w-5/6 mx-auto mt-12">
  <div class="divider"></div>

  <div class="text-end">
    <div class="btn-group btn-group-horizontal">
      <button
        class="btn tooltip"
        class:btn-active={ navigation_toggle === MENU_TOGGLE.MY_POSTS }
        on:click={() => navigation_toggle = MENU_TOGGLE.MY_POSTS}
        data-tip="my posts"
      >
        <Icon name="message-square"/>
      </button>
      <button
        class="btn tooltip"
        class:btn-active={ navigation_toggle === MENU_TOGGLE.FOLLOWING }
        on:click={() => navigation_toggle = MENU_TOGGLE.FOLLOWING}
        data-tip="following settings"
      >
        <Icon name="star"/>
      </button>
    </div>
  </div>
</div>

<div class="my-6 w-5/6 mx-auto">
  {#if navigation_toggle === MENU_TOGGLE.MY_POSTS }
    <UserPosts profile={ user.profile } />
  {:else}
    <FollowingSettings/>
  {/if}
</div>

{/if}


<style lang="postcss">
</style>
