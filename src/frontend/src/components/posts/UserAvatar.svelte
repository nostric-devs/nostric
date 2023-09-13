<script>
  export let image = "";
  export let name = "";
</script>

{#if image}
  <div class="avatar">
    <div class="w-16 rounded mr-4">
      <img src="{ image }" alt="avatar"/>
    </div>
  </div>
{:else}
  <div class="avatar placeholder">
    <div class="bg-neutral-focus text-neutral-content rounded mr-4 w-16 h-16">
      <span class="text-2xl">{ name[0] }</span>
    </div>
  </div>
{/if}
