<script>
  import { AuthStates, authUser } from "$lib/stores/Auth";
</script>

<div class="grid grid-cols-8 gap-5 mb-4">
  <div class="col-span-1 placeholder-circle w-16 animate-pulse"></div>
  <div class="col-span-5 flex flex-col justify-center">
    <div class="grid grid-cols-3">
      <div class="col-span-1 mb-1">
        <div class="placeholder animate-pulse" />
      </div>
    </div>
    <div class="placeholder animate-pulse" />
  </div>
  {#if $authUser.authState !== AuthStates.ANONYMOUS}
    <div class="col-span-2 flex flex-col justify-center">
      <div class="col-span-2 placeholder animate-pulse py-5 max-w-[150px] rounded"></div>
    </div>
  {/if}
</div>
