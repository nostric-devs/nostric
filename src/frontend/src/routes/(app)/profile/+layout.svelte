<script>
import { AppShell, Avatar } from "@skeletonlabs/skeleton";
</script>

<!-- <AppShell
  slotPageHeader="border flex justify-between items-center pl-3 pr-4 py-3"
  slotSidebarRight="bg-surface-500/5 w-0 lg:w-96 lg:px-4 lg:py-4"
>
  <svelte:fragment slot="pageHeader">
    <Avatar
      src="invalid-image.jpg"
      initials="AB"
      cursor="cursor-pointer"
      class="lg:hidden"
    />
  </svelte:fragment>
  <slot />
</AppShell> -->
<slot />