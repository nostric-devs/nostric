<script lang="ts">

  export let profile;
  export let size;

</script>

{#if profile?.avatar_url}
  <div class="avatar">
    <div class="rounded mr-4 w-{size}">
      <img src="{ profile?.avatar_url }" alt="avatar"/>
    </div>
  </div>
{:else}
  <div class="avatar placeholder">
    <div class="bg-neutral-focus text-neutral-content rounded mr-4 w-{size} h-{size}">
      <span class="text-2xl">{ profile?.username ? profile.username[0] : "" }</span>
    </div>
  </div>
{/if}
