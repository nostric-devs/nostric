<script lang="ts">
  import { page } from "$app/stores";

  import { AppShell, LightSwitch } from "@skeletonlabs/skeleton";
  import { TabGroup, TabAnchor } from "@skeletonlabs/skeleton";

  import { Home, Search, Bell, Mail } from "svelte-feathers";

  import { Avatar } from "@skeletonlabs/skeleton";
  import { Drawer } from "@skeletonlabs/skeleton";

  import { initializeStores } from "@skeletonlabs/skeleton";
  initializeStores();

  import Navigation from "$lib/components/Navigation/Navigation.svelte";
  import PopUpSearch from "$lib/components/Search/PopUpSearch.svelte";
  import Logo from "$lib/components/Logo/Logo.svelte";
  import { getDrawerStore } from "@skeletonlabs/skeleton";
  import { get_path, ROUTES } from "$lib/utils/routes";
    import FollowSuggest from "$lib/components/FollowSuggest/FollowSuggest.svelte";

  const drawerStore = getDrawerStore();

  const options = [
    {
      label: "Vanilla",
      value: "vanilla",
      keywords: "plain, basic",
      meta: { healthy: false },
    },
  ];
  let inputValue = "";

  function drawerOpen(): void {
    drawerStore.open({});
  }
</script>

<Drawer width="w-9/12">
  <div class="px-4 py-4">
    <Avatar src="invalid-image.jpg" initials="AB" cursor="cursor-pointer" />
  </div>
  <Navigation />
</Drawer>

<AppShell
  class="xl:w-[1286px] mx-auto"
  slotSidebarLeft="bg-surface-500/5 w-0 lg:w-16 xl:w-72"
  slotSidebarRight="bg-surface-500/5 w-0 lg:w-96 lg:px-4 lg:py-4"
  slotFooter="lg:hidden"
  slotPageHeader="lg:hidden border flex justify-between items-center pl-3 pr-4 py-3"
>
  <svelte:fragment slot="pageHeader">
    <Avatar
      src="invalid-image.jpg"
      initials="AB"
      cursor="cursor-pointer"
      class="lg:hidden"
      on:click={drawerOpen}
    />
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <div class="flex flex-col h-screen">
      <div class="mb-auto">
        <Logo />
        <Navigation />
      </div>
      <div class="flex-grow"></div>
      <div class="flex justify-center">
        <LightSwitch class="mb-12" />
      </div>
    </div>
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="sidebarRight">
    <PopUpSearch {options} {inputValue}></PopUpSearch>
    <FollowSuggest />
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
