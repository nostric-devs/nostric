<script lang="ts">
  import "../app.postcss";
  import { page } from "$app/stores";

  import { AppShell } from "@skeletonlabs/skeleton";
  import { TabGroup, TabAnchor } from '@skeletonlabs/skeleton';

  import { Home, Search, Bell, Mail } from "svelte-feathers";

  import { Avatar } from '@skeletonlabs/skeleton';
  import { Drawer } from '@skeletonlabs/skeleton';

  import { initializeStores } from '@skeletonlabs/skeleton';
  initializeStores();

  import Navigation from '$lib/Navigation/Navigation.svelte';
  import PopUpSearch from "$lib/Search/PopUpSearch.svelte";

  const options = [
    { label: "Vanilla", value: "vanilla", keywords: "plain, basic", meta: { healthy: false } },
  ]
  let inputValue = "";


</script>


<Drawer width="w-9/12">
  <div class="px-4 py-4">
    <Avatar
      src="invalid-image.jpg"
      initials="AB"
      cursor="cursor-pointer"
    />
  </div>
  <Navigation />
</Drawer>

<AppShell
  class="lg-container mx-auto"
  slotSidebarLeft="bg-surface-500/5 w-0 lg:w-16 xl:w-72"
  slotSidebarRight="bg-surface-500/5 w-0 lg:w-96 lg:px-4 lg:py-4"
  slotFooter="lg:hidden"
  slotPageHeader="border flex justify-between items-center pl-3 pr-4 py-3"
>

  <svelte:fragment slot="sidebarLeft">
    <Navigation />
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="sidebarRight">
    <PopUpSearch {options} {inputValue}></PopUpSearch>
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
      <TabAnchor href="/" selected={$page.url.pathname === "/search"} class="py-5">
        <Search color="black" size="32" class="mx-auto"></Search>
      </TabAnchor>
      <TabAnchor href="/" selected={$page.url.pathname === "/notifications"} class="py-5">
        <Bell color="black" size="32" class="mx-auto"></Bell>
      </TabAnchor>
      <TabAnchor href="/" selected={$page.url.pathname === "/inbox"} class="py-5">
        <Mail color="black" size="32" class="mx-auto"></Mail>
      </TabAnchor>
    </TabGroup>
  </svelte:fragment>

</AppShell>

