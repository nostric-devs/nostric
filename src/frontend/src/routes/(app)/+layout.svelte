<script lang="ts">
  import { page } from "$app/stores";
  // import type { AutocompleteOption } from "@skeletonlabs/skeleton";
  import {
    AppShell,
    Avatar,
    Drawer,
    getDrawerStore,
    LightSwitch,
    Modal,
  } from "@skeletonlabs/skeleton";
  //import { Bell, Home, Mail, Search } from "svelte-feathers";
  import Navigation from "$lib/components/navigation/Navigation.svelte";
  //import PopUpSearch from "$lib/components/search/PopUpSearch.svelte";
  import Logo from "$lib/components/logo/Logo.svelte";
  import FollowSuggest from "$lib/components/follow-suggest/FollowSuggest.svelte";
  import LogOut from "$lib/components/log-out/LogOut.svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import { fade } from "svelte/transition";
  import CreatePostTrigger from "$lib/components/modals/create-post/CreatePostTrigger.svelte";
  import RelaySidebar from "$lib/components/relays/RelaySidebar.svelte";
  import { Circle } from "svelte-loading-spinners";
  import { localAuthStorage } from "$lib/stores/LocalStorage";
  import { get } from "svelte/store";

  const drawerStore = getDrawerStore();

  // const autocompleteOptions: AutocompleteOption[] = [
  //   {
  //     label: "Vanilla",
  //     value: "vanilla",
  //     keywords: "plain, basic",
  //     meta: { healthy: false },
  //   },
  // ];
  // let autocompleteInputValue: string = "";

  let user: NDKUser | undefined;
  let loading: boolean = true;

  $: isAuthenticated = !loading && $authUser.authState !== AuthStates.ANONYMOUS;

  function drawerOpen(): void {
    drawerStore.open({});
  }

  const storageAuth = get(localAuthStorage);

  onMount(async () => {
    // on forced, if the user was logged in, data should be in storageAuth,
    // and it should be possible to log in again automatically.
    if (
      storageAuth &&
      storageAuth.privateKey &&
      $page.data.user !== undefined
    ) {
      try {
        if ($page.data.user === AuthStates.NOSTR_AUTHENTICATED) {
          await authUser.logInAnonymously(undefined, storageAuth.privateKey);
        } else if ($page.data.user >= AuthStates.IDENTITY_AUTHENTICATED) {
          await authUser.logInWithIdentity();
        } else {
          // even if we are not to be logged in, we at least check if there is an
          // active Internet Identity at the page, and if there is, we set it in auth user
          // for future use. It is needed for attempting registering with Identity
          // straight through the register route, without going through the homepage Identity register button
          await authUser.checkIdentityActiveOnPage();
        }
      } catch (error) {
        await authUser.logOut();
        await goto("/#signup");
      }
      user = $authUser.nostr.getUser();
    }
    loading = false;
  });
</script>

{#if loading}
  <div class="w-full h-screen flex items-center justify-center">
    <Circle size="160" unit="px" color="gray"></Circle>
  </div>
{/if}

<Drawer width="w-9/12">
  <div class="px-4 py-4">
    <Avatar profile={user?.profile} />
  </div>
  <Navigation />
</Drawer>

<Modal
  transitionIn={fade}
  transitionInParams={{ duration: 200 }}
  transitionOut={fade}
  transitionOutParams={{ duration: 200 }}
/>

<AppShell
  class="xl:w-[1286px] mx-auto {loading ? 'hidden' : ''}"
  slotSidebarLeft="bg-surface-500/5 w-0 lg:w-16 xl:w-72"
  slotSidebarRight="bg-surface-500/5 w-0 lg:w-96 lg:px-4 lg:py-4"
  slotPageHeader="lg:hidden border flex justify-between items-center pl-3 pr-4 py-3"
>
  <svelte:fragment slot="pageHeader">
    <button class="lg:hidden" on:click={drawerOpen}>
      <Avatar profile={user?.profile} />
    </button>
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <div class="flex flex-col h-screen">
      <div class="mb-auto">
        <Logo />
        {#if isAuthenticated}
          <Navigation />
          <CreatePostTrigger />
        {/if}
      </div>
      <div class="flex-grow"></div>
      <div class="flex justify-center">
        <LightSwitch class="my-4" rounded="rounded-2xl" />
      </div>
      {#if isAuthenticated}
        <LogOut />
      {:else}
        <button
          type="button"
          on:click={() => goto("/#signup")}
          class="btn variant-filled-warning my-8 mx-4 font-medium"
        >
          Log in
        </button>
      {/if}
    </div>
  </svelte:fragment>

  {#key $page.url}
    <slot />
  {/key}

  <svelte:fragment slot="sidebarRight">
    {#if isAuthenticated}
      <!--      <PopUpSearch-->
      <!--        options={autocompleteOptions}-->
      <!--        inputValue={autocompleteInputValue}-->
      <!--      ></PopUpSearch>-->
      <FollowSuggest />
      <RelaySidebar />
    {/if}
  </svelte:fragment>
</AppShell>
