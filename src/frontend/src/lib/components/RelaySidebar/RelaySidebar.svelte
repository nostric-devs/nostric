<script>
    import { Server } from "svelte-feathers";
</script>

<h3 class="h3 my-6">Relays</h3>
<ul class="list mb-4">
  <!-- Load relays from store once ready -->
  {#each [1, 2, 3, 5] as relay, index}
    <li class="p-4 variant-glass-tertiary">
      <!-- <span><Server /></span> -->
      <span><Server /></span>
      <span class="flex-auto">wss://relay.com</span>
      <span class="badge variant-filled-success">Connected</span>
    </li>
  {/each}
</ul>
<span
  >You can manage your relays in <a href="/settings/relays" class="anchor"
    >settings.</a
  ></span
>