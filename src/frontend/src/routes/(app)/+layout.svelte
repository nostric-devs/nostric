<script lang="ts">
  import { page } from "$app/stores";
  import type { AutocompleteOption } from "@skeletonlabs/skeleton";
  import {
    AppShell,
    Avatar,
    Drawer,
    getDrawerStore,
    LightSwitch,
    TabAnchor,
    TabGroup,
    Modal,
  } from "@skeletonlabs/skeleton";
  import { Bell, Home, Mail, Search } from "svelte-feathers";
  import Navigation from "$lib/components/navigation/Navigation.svelte";
  import PopUpSearch from "$lib/components/search/PopUpSearch.svelte";
  import Logo from "$lib/components/logo/Logo.svelte";
  import { getPath, ROUTES } from "$lib/utils/routes";
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

  const drawerStore = getDrawerStore();

  const autocompleteOptions: AutocompleteOption[] = [
    {
      label: "Vanilla",
      value: "vanilla",
      keywords: "plain, basic",
      meta: { healthy: false },
    },
  ];
  let autocompleteInputValue: string = "";

  let user: NDKUser | undefined;

  $: isAuthenticated =
    !$authUser.loading && $authUser.authState !== AuthStates.ANONYMOUS;

  function drawerOpen(): void {
    drawerStore.open({});
  }

  onMount(() => {
    if ($authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr) {
      user = $authUser.nostr.getUser();
    }
  });
</script>

{#if $authUser.loading}
  <div class="w-full h-screen flex items-center justify-center">
    <Circle size="200" color="white" unit="px" duration="2s" />
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
  class="xl:w-[1286px] mx-auto {$authUser.loading ? 'hidden' : ''}"
  slotSidebarLeft="bg-surface-500/5 w-0 lg:w-16 xl:w-72"
  slotSidebarRight="bg-surface-500/5 w-0 lg:w-96 lg:px-4 lg:py-4"
  slotFooter="{isAuthenticated ? 'hidden' : ''} lg:hidden"
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
        <LightSwitch class="mb-4" />
      </div>
      {#if isAuthenticated}
        <LogOut />
      {:else}
        <button
          type="button"
          on:click={() => goto(getPath(ROUTES.SIGN_IN))}
          class="btn variant-filled-warning my-8 mx-4 font-medium"
        >
          Log in
        </button>
      {/if}
    </div>
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="sidebarRight">
    {#if isAuthenticated}
      <PopUpSearch
        options={autocompleteOptions}
        inputValue={autocompleteInputValue}
      ></PopUpSearch>
      <FollowSuggest />
      <RelaySidebar />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer">
    <TabGroup
      justify="justify-between"
      active="variant-filled-primary"
      hover="hover:variant-soft-primary"
      flex="flex-1"
      border="border-t-2 border-slate-200"
      class="w-full"
    >
      <TabAnchor href="/" selected={$page.url.pathname === "/"} class="py-5">
        <Home color="black" size="32" class="mx-auto"></Home>
      </TabAnchor>
      <TabAnchor
        href="/"
        selected={$page.url.pathname === getPath(ROUTES.SEARCH)}
        class="py-5"
      >
        <Search color="black" size="32" class="mx-auto"></Search>
      </TabAnchor>
      <TabAnchor
        href="/"
        selected={$page.url.pathname === getPath(ROUTES.NOTIFICATIONS)}
        class="py-5"
      >
        <Bell color="black" size="32" class="mx-auto"></Bell>
      </TabAnchor>
      <TabAnchor
        href="/"
        selected={$page.url.pathname === getPath(ROUTES.INBOX)}
        class="py-5"
      >
        <Mail color="black" size="32" class="mx-auto"></Mail>
      </TabAnchor>
    </TabGroup>
  </svelte:fragment>
</AppShell>

<style>
  body {
    height: 100%;
    overflow: hidden;
  }
</style>
