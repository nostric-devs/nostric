<script lang="ts">
  import { page } from "$app/stores";
  import type { AutocompleteOption, ModalSettings } from "@skeletonlabs/skeleton";
  import {
    AppShell,
    Avatar,
    Drawer,
    getDrawerStore,
    getModalStore,
    LightSwitch,
    TabAnchor,
    TabGroup
  } from "@skeletonlabs/skeleton";
  import { Bell, Home, Mail, Plus, Search } from "svelte-feathers";
  import Navigation from "$lib/components/navigation/Navigation.svelte";
  import PopUpSearch from "$lib/components/search/PopUpSearch.svelte";
  import Logo from "$lib/components/logo/Logo.svelte";
  import { get_path, ROUTES } from "$lib/utils/routes";
  import FollowSuggest from "$lib/components/follow-suggest/FollowSuggest.svelte";
  import LogOut from "$lib/components/log-out/LogOut.svelte";
  import type { NostrUserHandler } from "$lib/nostr";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import type { PageData } from "../$types";
  import { goto } from "$app/navigation";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import { fade } from "svelte/transition";


  const drawerStore = getDrawerStore();
  const modalStore = getModalStore();

  const autocompleteOptions : AutocompleteOption[] = [
    {
      label: "Vanilla",
      value: "vanilla",
      keywords: "plain, basic",
      meta: { healthy: false },
    },
  ];
  let autocompleteInputValue : string = "";

  const postModalOptions : ModalSettings = {
    type: "component",
    title: "Create new post",
    body: "",
    valueAttr: { type: "text", minlength: 3, maxlength: 10, required: true },
    component: "createPostModal",
  };

  let userHandler : NostrUserHandler | undefined;
  let user : NDKUser | undefined;

  $: isAuthenticated = $authUser !== AuthStates.ANONYMOUS;

  function drawerOpen(): void {
    drawerStore.open({});
  }

  onMount(() => {
    if (!authUser.isAnonymous()) {
      userHandler = authUser.getNostrUserHandler();
      if (userHandler) {
        user = userHandler.getUser();
      }
    }
  });

</script>

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
  class="xl:w-[1286px] mx-auto"
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
          <div class="mx-auto w-full xl:px-4 text-center">
            <button
              type="button"
              class="btn variant-filled-tertiary font-medium w-full"
              on:click={() => modalStore.trigger(postModalOptions)}
            >
              <span>
                <Plus size="20" class="mx-auto"></Plus>
              </span>
              <span class="hidden xl:inline">New post</span>
            </button>
          </div>
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
          on:click={() => goto(get_path(ROUTES.SIGN_IN))}
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
      <PopUpSearch options={autocompleteOptions} inputValue={autocompleteInputValue}></PopUpSearch>
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
        selected={$page.url.pathname === get_path(ROUTES.SEARCH)}
        class="py-5"
      >
        <Search color="black" size="32" class="mx-auto"></Search>
      </TabAnchor>
      <TabAnchor
        href="/"
        selected={$page.url.pathname === get_path(ROUTES.NOTIFICATIONS)}
        class="py-5"
      >
        <Bell color="black" size="32" class="mx-auto"></Bell>
      </TabAnchor>
      <TabAnchor
        href="/"
        selected={$page.url.pathname === get_path(ROUTES.INBOX)}
        class="py-5"
      >
        <Mail color="black" size="32" class="mx-auto"></Mail>
      </TabAnchor>
    </TabGroup>
  </svelte:fragment>

</AppShell>
