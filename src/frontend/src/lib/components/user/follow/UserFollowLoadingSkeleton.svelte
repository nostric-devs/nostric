<script>
  import { AuthStates, authUser } from "$lib/stores/Auth";
</script>

<div class="flex my-3">
  <div class="grid">
    <div class="placeholder-circle w-12 animate-pulse"></div>
  </div>
  <div class="grid grow mx-5">
    <div class="grid grid-cols-3">
      <div class="col-span-1">
        <div class="placeholder animate-pulse" />
      </div>
    </div>
    <div class="placeholder animate-pulse" />
  </div>
  {#if $authUser.authState !== AuthStates.ANONYMOUS}
    <div class="grid items-center pt-1">
      <div class="placeholder animate-pulse rounded w-28 pb-4 pt-5"></div>
    </div>
  {/if}
</div>
