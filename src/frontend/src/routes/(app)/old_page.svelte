<script lang="ts">

  import { Settings } from "svelte-feathers";
  import { AppShell, Avatar, LightSwitch } from "@skeletonlabs/skeleton";
  import PopUpSearch from "$lib/components/Search/PopUpSearch.svelte";

  import { getDrawerStore } from '@skeletonlabs/skeleton';
  const drawerStore = getDrawerStore();

  function drawerOpen(): void {
    drawerStore.open({});
  }

</script>


<AppShell
  slotPageHeader="border flex justify-between items-center pl-3 pr-4 py-3"
>
  <svelte:fragment slot="pageHeader">
    <Avatar
      src="invalid-image.jpg"
      initials="AB"
      cursor="cursor-pointer"
      class="lg:hidden"
      on:click={drawerOpen}
    />
    <LightSwitch />
    <!-- <Settings color="black" size="26"></Settings> -->
  </svelte:fragment>
  <h1 class="h1">Feed</h1>
</AppShell>
