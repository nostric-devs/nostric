<script>
  import { get_path, ROUTES } from "$lib/utils/routes";
  import { relays } from "$lib/stores/Relays";
  import RelayCard from "$lib/components/relays/RelayCard.svelte";

</script>

<h3 class="h3 my-6">Relays</h3>

{#each Object.values($relays) as relay}
  <RelayCard verbose={false} {relay}/>
{/each}

<span>
  You can manage your relays in
  <a href={get_path(ROUTES.SETTINGS, ROUTES.RELAYS)} class="anchor">
    settings.
  </a>
</span>
